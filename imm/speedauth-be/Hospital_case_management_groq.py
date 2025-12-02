"""
Hospital Case Management Intelligence Service - Groq Llama Edition
==================================================================
A FastAPI microservice that provides intelligent case management capabilities for hospital workflows,
including level of care assessment, length of stay prediction, and authorization requirements.

This service integrates with the existing Percert backend system to enhance hospital case management
with LLM-powered insights based on ICD codes and medical context.

Powered by Groq Llama-4 Maverick for ultra-low latency medical case analysis.
"""

import os
import json
import logging
import asyncio
import re
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from enum import Enum
import traceback

from fastapi import FastAPI, HTTPException, status, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator
import httpx
import uvicorn

# Configure logging with UTF-8 encoding for Windows compatibility
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('hospital_case_management_groq.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Fix console encoding for Windows
import sys
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')


# ======================== Configuration ========================

class Config:
    """Application configuration with direct API key integration"""

    # ============ CONFIGURE YOUR API KEY HERE ============
    # Get API key from environment variable (set in Render dashboard)
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    # =====================================================

    # Server configuration - using different port to avoid conflict
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "5052"))  # Render sets PORT automatically

    # Groq Configuration
    # Model reference: https://console.groq.com/playground?model=meta-llama/llama-4-maverick-17b-128e-instruct
    LLM_MODEL: str = "meta-llama/llama-4-maverick-17b-128e-instruct"  # Groq Llama-4 Maverick
    LLM_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    LLM_TIMEOUT: int = 30
    LLM_MAX_RETRIES: int = 3

    # Backend Integration
    BACKEND_URL: str = os.getenv("BACKEND_URL", "http://localhost:8082")

    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8082"]

    # Feature Flags
    ENABLE_MOCK_MODE: bool = False  # Set to True for testing without API calls


config = Config()


# ======================== Data Models ========================

class CareLevel(str, Enum):
    """Hospital care level classifications"""
    ICU = "Intensive Care Unit"
    STEP_DOWN = "Step-Down Unit"
    MEDICAL_SURGICAL = "Medical/Surgical Unit"
    OBSERVATION = "Observation"
    OUTPATIENT = "Outpatient"
    REHABILITATION = "Rehabilitation"
    SKILLED_NURSING = "Skilled Nursing Facility"


class CaseSummaryRequest(BaseModel):
    """Request model for generating a case summary"""
    icd_code: str = Field(..., description="ICD-10 code for the diagnosis", pattern=r"^[A-Z][0-9]{2}(\.[A-Z0-9]{1,4})?$")
    patient_name: Optional[str] = Field(None, description="Full name of the patient for display in UI")
    case_id: Optional[str] = Field(None, description="Case identifier used by the UI")

    @field_validator('icd_code', mode='before')
    @classmethod
    def validate_icd_code(cls, v):
        """Validate and normalize ICD code format"""
        if isinstance(v, str):
            code = v.upper().strip()
            import re as _re
            m_three_digits = _re.match(r"^([A-Z])(\d{3})$", code)
            if m_three_digits:
                letter, digits = m_three_digits.groups()
                return f"{letter}{digits[:2]}.{digits[2:]}"
            m_no_dot_extra = _re.match(r"^([A-Z])(\d{2})([A-Z0-9]{1,4})$", code)
            if m_no_dot_extra:
                letter, first_two, rest = m_no_dot_extra.groups()
                return f"{letter}{first_two}.{rest}"
            return code
        return v


class ProcedureInfo(BaseModel):
    """Information about required medical procedures"""
    code: str = Field(..., description="CPT or procedure code")
    description: str = Field(..., description="Procedure description")
    urgency: str = Field(..., description="Urgency level")
    estimated_duration: str = Field(..., description="Estimated procedure duration")


class TimelineEvent(BaseModel):
    """UI-friendly timeline item for the case page"""
    title: str
    description: str
    date: str
    time: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None


class CaseNote(BaseModel):
    """UI-friendly note entry for the case page"""
    title: str
    date: str
    author: str
    body: str


class CaseSummaryResponse(BaseModel):
    """Response model for case summary aligned to frontend CaseManagement.tsx"""
    # Header / UI fields
    case_id: Optional[str] = Field(None, description="UI case identifier")
    patient_name: Optional[str] = Field(None, description="Patient display name")
    admission_date: Optional[str] = Field(None, description="Admission date")

    # Primary clinical & financial
    primary_diagnosis: Optional[str] = Field(None, description="Primary diagnosis string (ICD + name)")
    facility: Optional[str] = Field(None, description="Facility name")
    total_authorized: Optional[str] = Field(None, description="Total authorized amount")
    used_amount: Optional[str] = Field(None, description="Amount used so far")
    percentage_used: Optional[str] = Field(None, description="Percentage used")

    # Key metrics (top cards)
    length_of_stay: Optional[str] = Field(None, description="Length of stay (e.g., '2 days')")
    procedures_count: Optional[int] = Field(0, description="Number of procedures")
    authorizations_count: Optional[int] = Field(0, description="Number of authorizations")
    alerts_count: Optional[int] = Field(0, description="Number of active alerts")

    # Main content & detailed analysis
    case_summary: str = Field(..., description="Comprehensive case summary")
    recommended_care_plan: str = Field(..., description="Recommended care plan details")
    expected_length_of_stay: str = Field(..., description="Expected length of hospital stay")
    required_procedures: List[ProcedureInfo] = Field(default_factory=list, description="List of required procedures")
    prosthesis_needed: Optional[str] = Field(None, description="Details of any prosthesis requirements")
    authorization_required: bool = Field(..., description="Whether prior authorization is required")
    care_level: CareLevel = Field(..., description="Recommended level of care")
    estimated_cost_range: Optional[str] = Field(None, description="Estimated cost range for treatment")
    discharge_planning_notes: Optional[str] = Field(None, description="Early discharge planning considerations")
    risk_factors: List[str] = Field(default_factory=list, description="Identified risk factors")
    clinical_pathways: List[str] = Field(default_factory=list, description="Recommended clinical pathways")
    explanation: str = Field(..., description="Detailed explanation of recommendations")
    confidence_score: float = Field(..., description="Confidence score of the assessment", ge=0.0, le=1.0)
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat(), description="Timestamp of generation")

    # UI lists
    timeline: List[TimelineEvent] = Field(default_factory=list, description="Chronological case events for UI")
    procedures: List[Dict[str, Any]] = Field(default_factory=list, description="Procedures list for UI (simple view)")
    authorizations: List[Dict[str, Any]] = Field(default_factory=list, description="Authorizations for UI")
    prosthetics: List[Dict[str, Any]] = Field(default_factory=list, description="Prosthetics items for UI")
    notes: List[CaseNote] = Field(default_factory=list, description="Recent case notes for UI")


# ======================== LLM Integration ========================

class LLMService:
    """Service for Groq Llama API interactions with retry logic and error handling"""

    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.model = config.LLM_MODEL
        self.timeout = config.LLM_TIMEOUT
        self.max_retries = config.LLM_MAX_RETRIES
        self.client = None

        # Validate API key on initialization
        placeholder_keys = ["YOUR-GROQ-API-KEY-HERE"]
        is_placeholder = (not self.api_key or
                         self.api_key in placeholder_keys or
                         len(self.api_key) < 20 or
                         not self.api_key.startswith("gsk_"))

        if is_placeholder:
            logger.warning("GROQ API KEY NOT CONFIGURED! Please set your API key in the Config class.")
            logger.warning("The service will run in MOCK MODE until a valid API key is provided.")
            config.ENABLE_MOCK_MODE = True
        else:
            logger.info(f"LLM Service initialized with API key: {self.api_key[:10]}...")
            logger.info(f"Mock mode disabled - using live Groq API with {self.model}")
            config.ENABLE_MOCK_MODE = False

    # ----------------- Prompt building -----------------
    def _get_system_prompt(self) -> str:
        """System prompt for LLM to understand hospital case management context"""
        return (
            "You are an expert medical case management system specializing in hospital workflows.\n"
            "Your role is to analyze ICD codes and provide comprehensive case management recommendations including:\n"
            "- Level of care requirements (ICU, Step-down, Medical/Surgical, etc.)\n"
            "- Expected length of stay based on diagnosis and standard protocols\n"
            "- Required procedures and interventions\n"
            "- Prosthesis or medical device requirements\n"
            "- Authorization requirements for insurance\n"
            "- Discharge planning considerations\n"
            "- Risk factors and clinical pathways\n\n"
            "IMPORTANT: OUTPUT MUST BE STRICT JSON (NO MARKDOWN, NO PREAMBLE, NO EXPLANATION TEXT OUTSIDE JSON).\n"
            "Return a single JSON object exactly matching the schema described in the user prompt."
        )

    def _build_prompt(self, icd_code: str, patient_name: Optional[str] = None, case_id: Optional[str] = None) -> str:
        """Build a detailed, schema-aligned prompt for Groq."""
        example_json = """{
            "case_id": "RAF-2025-0456",
            "patient_name": "Emma van Wyk",
            "admission_date": "2025-10-16",
            "primary_diagnosis": "C50.9 - Malignant neoplasm of breast, unspecified",
            "facility": "Netcare Pretoria East Hospital",
            "total_authorized": "R 245,000",
            "used_amount": "R 145,650",
            "percentage_used": "59%",
            "length_of_stay": "3-5 days",
            "procedures_count": 2,
            "authorizations_count": 2,
            "alerts_count": 1,
            "case_summary": "Detailed clinical summary...",
            "recommended_care_plan": "Recommended interventions...",
            "expected_length_of_stay": "5 days",
            "required_procedures": [
                {"code": "99223", "description": "Initial hospital care", "urgency": "High", "estimated_duration": "60 minutes"}
            ],
            "prosthesis_needed": null,
            "authorization_required": true,
            "care_level": "Medical/Surgical Unit",
            "estimated_cost_range": "R 15,000 - R 30,000",
            "discharge_planning_notes": "Assess readiness for discharge by Day 4",
            "risk_factors": ["Comorbidity", "Infection risk"],
            "clinical_pathways": ["Standard oncology pathway"],
            "explanation": "Recommendations derived from ICD code and clinical guidelines.",
            "confidence_score": 0.92,
            "generated_at": "2025-10-16T12:00:00",
            "timeline": [
                {"title": "Admission", "description": "Patient admitted to ward", "date": "2025-10-16"}
            ],
            "procedures": [],
            "authorizations": [],
            "prosthetics": [],
            "notes": [
                {"title": "Initial assessment", "date": "2025-10-16", "author": "Dr. Patel", "body": "Vitals stable."}
            ]
        }"""

        return f"""
    You are an expert hospital case management AI.
    Analyze the following ICD-10 code and produce a complete structured case summary
    for populating the hospital case management UI.

    ICD Code: {icd_code}
    Patient Name: {patient_name or "Unknown"}
    Case ID: {case_id or "N/A"}

    Return *ONLY* valid JSON matching this schema and structure.
    Do not include markdown, explanations, or text outside JSON.

    Example format:
    {example_json}

    Now generate the JSON specific to ICD code {icd_code} and patient {patient_name or "Unknown"}.
    """


    # ----------------- Robust JSON extraction -----------------
    def _extract_valid_json(self, raw_text: str) -> Optional[str]:
        """
        Try to extract a valid JSON substring from the model output.
        Strategies:
        - Strip markdown fences (json ... ), leading explanation lines.
        - Find the first '{' and then find the matching closing '}' using a stack to balance braces.
        - Attempt basic repairs (remove trailing commas).
        - Return a JSON string if successful, otherwise None.
        """
        if not isinstance(raw_text, str):
            return None

        content = raw_text.strip()

        # Remove common wrappers
        # Remove leading "json" or "" fence
        content = re.sub(r'^\s*(?:json)?\s*', '', content, flags=re.IGNORECASE)
        content = re.sub(r'\s*\s*$', '', content, flags=re.IGNORECASE)

        # Remove common prefaces like "Here is the JSON:" or "Output:"
        content = re.sub(r'^[\s\S]*?(\{)', r'\1', content, count=1)

        # Now find balanced JSON from first '{' to matching '}'
        start_idx = content.find('{')
        if start_idx == -1:
            return None

        stack = []
        end_idx = None
        for i in range(start_idx, len(content)):
            ch = content[i]
            if ch == '{':
                stack.append('{')
            elif ch == '}':
                if stack:
                    stack.pop()
                    if not stack:
                        end_idx = i
                        break

        if end_idx is None:
            # Could not find balanced braces; attempt to find last '}' and take substring
            last_brace = content.rfind('}')
            if last_brace == -1:
                return None
            json_candidate = content[start_idx:last_brace + 1]
        else:
            json_candidate = content[start_idx:end_idx + 1]

        json_candidate = json_candidate.strip()

        # Basic repairs:
        # 1) Remove trailing commas in objects/arrays like ... }, ]  -> remove ',\s*}' -> '}' and ',\s*]' -> ']'
        json_candidate = re.sub(r',\s*}', '}', json_candidate)
        json_candidate = re.sub(r',\s*]', ']', json_candidate)

        # 2) Replace single quotes with double quotes only when it looks like JSON-like single quotes
        # (simple heuristic: keys using single quotes)
        if re.search(r"'\s*:\s*'", json_candidate):
            json_candidate = json_candidate.replace("'", '"')

        # Final sanity check: must start with { and end with }
        if not (json_candidate.startswith('{') and json_candidate.endswith('}')):
            return None

        return json_candidate

    # ----------------- Validate & normalize parsed JSON -----------------
    def _validate_case_management_data(self, parsed: Dict[str, Any], icd_code: str,
                                       patient_name: Optional[str] = None, case_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Ensure all expected keys are present, fill defaults as needed, and coerce types to expected shapes.
        This prevents parsing failures downstream and guarantees the frontend fields exist.
        """
        defaults = {
            "case_id": case_id or parsed.get("case_id") or "CASE-ID",
            "patient_name": patient_name or parsed.get("patient_name") or "Patient",
            "admission_date": parsed.get("admission_date") or datetime.now().date().isoformat(),
            "primary_diagnosis": parsed.get("primary_diagnosis") or f"{icd_code} - Not Available",
            "facility": parsed.get("facility") or "Unknown Facility",
            "total_authorized": parsed.get("total_authorized") or None,
            "used_amount": parsed.get("used_amount") or None,
            "percentage_used": parsed.get("percentage_used") or None,
            "length_of_stay": parsed.get("length_of_stay") or parsed.get("expected_length_of_stay") or "Not Available",
            "procedures_count": parsed.get("procedures_count") if isinstance(parsed.get("procedures_count"), int) else len(parsed.get("procedures", [])) if parsed.get("procedures") else 0,
            "authorizations_count": parsed.get("authorizations_count") if isinstance(parsed.get("authorizations_count"), int) else len(parsed.get("authorizations", [])) if parsed.get("authorizations") else 0,
            "alerts_count": parsed.get("alerts_count") if isinstance(parsed.get("alerts_count"), int) else 0,

            "case_summary": parsed.get("case_summary") or "Case summary pending detailed analysis",
            "recommended_care_plan": parsed.get("recommended_care_plan") or "Standard care protocol",
            "expected_length_of_stay": parsed.get("expected_length_of_stay") or "3-5 days",
            "required_procedures": parsed.get("required_procedures") or parsed.get("requiredProcedures") or [],
            "prosthesis_needed": parsed.get("prosthesis_needed") if parsed.get("prosthesis_needed") is not None else None,
            "authorization_required": bool(parsed.get("authorization_required")) if parsed.get("authorization_required") is not None else True,
            "care_level": parsed.get("care_level") or parsed.get("careLevel") or CareLevel.MEDICAL_SURGICAL.value,
            "estimated_cost_range": parsed.get("estimated_cost_range") or None,
            "discharge_planning_notes": parsed.get("discharge_planning_notes") or None,
            "risk_factors": parsed.get("risk_factors") or [],
            "clinical_pathways": parsed.get("clinical_pathways") or [],
            "explanation": parsed.get("explanation") or "Analysis based on ICD code and clinical guidelines",
            "confidence_score": parsed.get("confidence_score") if isinstance(parsed.get("confidence_score"), (int, float)) else 0.7,
            "generated_at": parsed.get("generated_at") or datetime.now().isoformat(),

            "timeline": parsed.get("timeline") or [],
            "procedures": parsed.get("procedures") or [],
            "authorizations": parsed.get("authorizations") or [],
            "prosthetics": parsed.get("prosthetics") or [],
            "notes": parsed.get("notes") or []
        }

        # Coerce care_level to CareLevel enum if possible
        care_value = defaults["care_level"]
        if isinstance(care_value, CareLevel):
            defaults["care_level"] = care_value
        else:
            # Try to map common labels to enum
            mapped = None
            for enum_val in CareLevel:
                if str(care_value).lower() in str(enum_val.value).lower() or str(care_value).lower() in enum_val.name.lower():
                    mapped = enum_val
                    break
            defaults["care_level"] = mapped or CareLevel.MEDICAL_SURGICAL

        # Normalize required_procedures to list of ProcedureInfo-like dicts
        normalized_procs = []
        for p in defaults["required_procedures"]:
            if isinstance(p, ProcedureInfo):
                normalized_procs.append(p)
            elif isinstance(p, dict):
                normalized_procs.append({
                    "code": str(p.get("code", "N/A")),
                    "description": str(p.get("description", p.get("desc", "No description"))),
                    "urgency": str(p.get("urgency", p.get("priority", "Medium"))),
                    "estimated_duration": str(p.get("estimated_duration", p.get("duration", "Unknown")))
                })
            else:
                # Unknown format: create minimal placeholder
                normalized_procs.append({
                    "code": "N/A",
                    "description": "Procedure details not provided",
                    "urgency": "Medium",
                    "estimated_duration": "Unknown"
                })
        defaults["required_procedures"] = normalized_procs

        # Ensure timeline entries have minimal fields
        normalized_timeline = []
        for t in defaults["timeline"]:
            if isinstance(t, TimelineEvent):
                normalized_timeline.append(t)
            elif isinstance(t, dict):
                normalized_timeline.append({
                    "title": t.get("title", "Event"),
                    "description": t.get("description", t.get("details", "")),
                    "date": t.get("date", datetime.now().date().isoformat()),
                    "time": t.get("time"),
                    "type": t.get("type"),
                    "status": t.get("status")
                })
        defaults["timeline"] = normalized_timeline

        # Normalize notes
        normalized_notes = []
        for n in defaults["notes"]:
            if isinstance(n, CaseNote):
                normalized_notes.append(n)
            elif isinstance(n, dict):
                normalized_notes.append({
                    "title": n.get("title", "Note"),
                    "date": n.get("date", datetime.now().date().isoformat()),
                    "author": n.get("author", "Clinician"),
                    "body": n.get("body", "")
                })
        defaults["notes"] = normalized_notes

        # Normalize procedures (UI simple view)
        normalized_ui_procedures = []
        for p in defaults["procedures"]:
            if isinstance(p, dict):
                normalized_ui_procedures.append({
                    "code": p.get("code", "N/A"),
                    "name": p.get("name", p.get("description", "Procedure")),
                    "date": p.get("date", datetime.now().date().isoformat()),
                    "provider": p.get("provider", "Unknown"),
                    "cost": p.get("cost", None),
                    "status": p.get("status", "Pending")
                })
        defaults["procedures"] = normalized_ui_procedures

        # Normalize authorizations
        normalized_auths = []
        for a in defaults["authorizations"]:
            if isinstance(a, dict):
                normalized_auths.append({
                    "auth_id": a.get("auth_id", a.get("id", "AUTH-ID")),
                    "description": a.get("description", ""),
                    "status": a.get("status", "Pending"),
                    "authorized_amount": a.get("authorized_amount"),
                    "valid_from": a.get("valid_from"),
                    "valid_to": a.get("valid_to")
                })
        defaults["authorizations"] = normalized_auths

        # Normalize prosthetics
        normalized_prosthetics = []
        for p in defaults["prosthetics"]:
            if isinstance(p, dict):
                normalized_prosthetics.append({
                    "item": p.get("item", "Item"),
                    "quantity": p.get("quantity", "1"),
                    "cost": p.get("cost", None),
                    "status": p.get("status", "Pending")
                })
        defaults["prosthetics"] = normalized_prosthetics

        return defaults

    # ----------------- Parse Groq response -----------------
    def _parse_groq_response(self, groq_response: Dict[str, Any], icd_code: str,
                               patient_name: Optional[str] = None, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Parse and validate Groq API response with robust fallback handling"""
        try:
            # Groq uses OpenAI-compatible format: choices[0].message.content
            choices = groq_response.get("choices", [])
            if not choices:
                logger.error("No choices in Groq response")
                return self._get_fallback_response(icd_code, patient_name=patient_name, case_id=case_id)

            # 🔍 Log raw response content before parsing
            logger.info(f"🔍 DEBUG: Raw Groq response: {groq_response}")

            # Extract textual content from Groq response
            content_text = None
            first_choice = choices[0]
            
            if isinstance(first_choice, dict):
                message = first_choice.get("message", {})
                if isinstance(message, dict):
                    content_text = message.get("content")
            
            if content_text is None:
                logger.error("Could not extract content from Groq response")
                return self._get_fallback_response(icd_code, patient_name=patient_name, case_id=case_id)

            logger.info("GROQ_RAW_START\n%s\nGROQ_RAW_END", content_text)

            # Extract valid JSON substring
            json_str = self._extract_valid_json(content_text)
            if not json_str:
                logger.error("Unable to extract valid JSON from Groq response")
                # Save raw content for debugging
                try:
                    with open("groq_raw_last.json", "w", encoding="utf-8") as f:
                        f.write(content_text)
                except Exception:
                    pass
                return self._get_fallback_response(icd_code, patient_name=patient_name, case_id=case_id)

            # Attempt to parse
            try:
                parsed = json.loads(json_str)
            except Exception as e:
                # If parsing fails, log and attempt small repairs then try again
                logger.warning(f"JSON parse failed on first attempt: {e}; attempting small repairs.")
                repaired = json_str
                # remove trailing commas again
                repaired = re.sub(r',\s*}', '}', repaired)
                repaired = re.sub(r',\s*]', ']', repaired)
                try:
                    parsed = json.loads(repaired)
                except Exception as e2:
                    logger.error(f"Second parse attempt failed: {e2}")
                    try:
                        with open("groq_raw_last.json", "w", encoding="utf-8") as f:
                            f.write(content_text)
                    except Exception:
                        pass
                    return self._get_fallback_response(icd_code, patient_name=patient_name, case_id=case_id)

            # Validate and normalize to expected form
            normalized = self._validate_case_management_data(parsed, icd_code, patient_name=patient_name, case_id=case_id)
            logger.info("🔍 DEBUG: Successfully validated Groq parsed JSON keys: %s", list(normalized.keys()))
            return normalized

        except Exception as e:
            logger.error(f"🔍 DEBUG: Error parsing Groq response: {str(e)}")
            logger.error(f"🔍 DEBUG: Full traceback: {traceback.format_exc()}")
            return self._get_fallback_response(icd_code, patient_name=patient_name, case_id=case_id)


    # ----------------- LLM call + retry logic -----------------
    async def generate_case_summary(self, icd_code: str, patient_name: Optional[str] = None, case_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate case summary using Groq Llama for hospital case management.

        Args:
            icd_code: The ICD-10 code for diagnosis

        Returns:
            Structured case summary with recommendations
        """
        logger.info(f"🔍 DEBUG: Generating case summary for ICD code: {icd_code}")
        logger.info(f"🔍 DEBUG: Mock mode enabled: {config.ENABLE_MOCK_MODE}")
        logger.info(f"🔍 DEBUG: API key configured: {bool(self.api_key and self.api_key != 'YOUR-GROQ-API-KEY-HERE')}")

        if config.ENABLE_MOCK_MODE:
            logger.info("🔍 DEBUG: Using mock response due to mock mode being enabled")
            return self._get_mock_response(icd_code, patient_name=patient_name, case_id=case_id)

        logger.info("🔍 DEBUG: Attempting to use live Groq API")
        
        system_prompt = self._get_system_prompt()
        user_prompt = self._build_prompt(icd_code, patient_name=patient_name, case_id=case_id)

        for attempt in range(self.max_retries):
            try:
                logger.info(f"🔍 DEBUG: Attempt {attempt + 1}/{self.max_retries} - Calling Groq API")
                logger.info(f"🔍 DEBUG: Using model: {self.model}")

                # Build the Groq API request (OpenAI-compatible format)
                request_payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    "temperature": 0.4,
                    "max_tokens": 2500,
                    "top_p": 0.9,
                    "response_format": {"type": "json_object"}
                }

                logger.info(f"🔍 DEBUG: Prompt length: {len(system_prompt) + len(user_prompt)} characters")

                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        config.LLM_API_URL,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {self.api_key}"
                        },
                        json=request_payload
                    )

                logger.info(f"🔍 DEBUG: Groq API response status: {response.status_code}")

                if response.status_code == 200:
                    result = response.json()
                    parsed_response = self._parse_groq_response(result, icd_code, patient_name=patient_name, case_id=case_id)
                    logger.info("🔍 DEBUG: Successfully parsed Groq response")
                    return parsed_response
                else:
                    logger.error(f"🔍 DEBUG: Groq API error: {response.status_code} - {response.text}")


            except httpx.TimeoutException:
                logger.warning(f"🔍 DEBUG: Groq API timeout on attempt {attempt + 1}")

            except Exception as e:
                logger.error(f"🔍 DEBUG: Groq API error on attempt {attempt + 1}: {str(e)}")
                logger.error(f"🔍 DEBUG: Full traceback: {traceback.format_exc()}")

            if attempt < self.max_retries - 1:
                wait_time = 2 ** attempt
                logger.info(f"🔍 DEBUG: Waiting {wait_time} seconds before retry...")
                await asyncio.sleep(wait_time)  # Exponential backoff

        # Fallback to deterministic response if LLM fails
        logger.warning("🔍 DEBUG: All LLM attempts failed, falling back to deterministic response")
        return self._get_fallback_response(icd_code, patient_name=patient_name, case_id=case_id)

    # ----------------- Mock + Fallback -----------------
    def _get_mock_response(self, icd_code: str, patient_name: Optional[str] = None, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Get mock response for testing without LLM"""
        logger.info(f"🔍 DEBUG: Generating mock response for ICD code: {icd_code}")
        return {
            "case_summary": f"Mock case summary for ICD code {icd_code}. Patient requires specialized care.",
            "recommended_care_plan": "Monitor vital signs, administer prescribed medications, regular assessments",
            "expected_length_of_stay": "4-6 days",
            "required_procedures": [
                {
                    "code": "99223",
                    "description": "Initial hospital care, high complexity",
                    "urgency": "High",
                    "estimated_duration": "60 minutes"
                }
            ],
            "prosthesis_needed": None,
            "authorization_required": True,
            "care_level": CareLevel.MEDICAL_SURGICAL,
            "estimated_cost_range": "R 15,000 - R 25,000",
            "discharge_planning_notes": "Begin discharge planning on day 2",
            "risk_factors": ["Potential complications", "Comorbidity considerations"],
            "clinical_pathways": ["Standard treatment protocol", "Daily monitoring"],
            "explanation": "Mock analysis for development and testing purposes",
            "confidence_score": 0.95,
            "patient_name": patient_name or "John Doe",
            "case_id": case_id or "RAF-123456",
            "timeline": [
                {"title": "Admission to Hospital", "description": "Patient admitted for evaluation and stabilization.", "date": datetime.now().date().isoformat(), "time": "09:00", "type": "admission", "status": "Completed"},
                {"title": "Initial Assessment", "description": "Comprehensive assessment and imaging.", "date": datetime.now().date().isoformat(), "time": "11:00", "type": "assessment", "status": "Completed"}
            ],
            "notes": [
                {"title": "Patient recovering well", "date": datetime.now().date().isoformat(), "author": "A. Tshabalala", "body": "Vitals stable, pain controlled. Continue monitoring."},
                {"title": "Initial Assessment", "date": datetime.now().date().isoformat(), "author": "A. Tshabalala", "body": "Admitted post-MVA. Primary injury includes fracture."}
            ],
            # UI view lists
            "procedures": [
                {
                    "code": "27245",
                    "name": "Open Treatment Femoral Fracture",
                    "date": datetime.now().date().isoformat(),
                    "provider": "Dr. J. Smith",
                    "cost": "R 125,000",
                    "status": "Authorized"
                }
            ],
            "authorizations": [
                {
                    "auth_id": "PA-2025-1234",
                    "description": "Surgical intervention",
                    "status": "Approved",
                    "authorized_amount": "R 150,000",
                    "valid_from": datetime.now().date().isoformat(),
                    "valid_to": (datetime.now().date() + timedelta(days=14)).isoformat()
                }
            ],
            "prosthetics": [
                {"item": "Titanium Internal Fixation Plate", "quantity": "1", "cost": "R 15,000", "status": "Approved"}
            ],
            # Header & metrics
            "admission_date": datetime.now().date().isoformat(),
            "primary_diagnosis": f"{icd_code} - Mock Diagnosis",
            "facility": "Mock Hospital",
            "total_authorized": "R 245,000",
            "used_amount": "R 145,650",
            "percentage_used": "59%",
            "length_of_stay": "2 days",
            "procedures_count": 1,
            "authorizations_count": 1,
            "alerts_count": 0,
            "generated_at": datetime.now().isoformat()
        }

    def _get_fallback_response(self, icd_code: str, patient_name: Optional[str] = None, case_id: Optional[str] = None) -> Dict[str, Any]:
        """Deterministic fallback response when LLM is unavailable"""
        logger.info(f"🔍 DEBUG: Generating fallback response for ICD code: {icd_code}")

        # Map common ICD codes to basic recommendations
        icd_mappings = {
            "C50": {  # Breast cancer
                "summary": "Malignant neoplasm requiring oncological care",
                "los": "5-7 days",
                "care_level": CareLevel.MEDICAL_SURGICAL,
                "auth_required": True
            },
            "I21": {  # Acute myocardial infarction
                "summary": "Acute cardiac event requiring intensive monitoring",
                "los": "6-12 days",
                "care_level": CareLevel.ICU,
                "auth_required": True
            },
            "J44": {  # COPD
                "summary": "Chronic respiratory condition requiring pulmonary care",
                "los": "5-8 days",
                "care_level": CareLevel.MEDICAL_SURGICAL,
                "auth_required": False
            }
        }

        base_icd = icd_code[:3] if len(icd_code) >= 3 else icd_code
        mapping = icd_mappings.get(base_icd, {
            "summary": "Medical condition requiring clinical assessment",
            "los": "2-4 days",
            "care_level": CareLevel.OBSERVATION,
            "auth_required": True
        })

        return {
            "case_summary": mapping["summary"],
            "recommended_care_plan": "Standard clinical protocol with regular monitoring",
            "expected_length_of_stay": mapping["los"],
            "required_procedures": [],
            "prosthesis_needed": None,
            "authorization_required": mapping["auth_required"],
            "care_level": mapping["care_level"],
            "estimated_cost_range": None,
            "discharge_planning_notes": "Assess discharge readiness daily",
            "risk_factors": ["Monitor for complications"],
            "clinical_pathways": ["Standard care pathway"],
            "explanation": "Fallback response - LLM service temporarily unavailable",
            "confidence_score": 0.5,
            "patient_name": patient_name or "Patient",
            "case_id": case_id or "CASE-ID",
            "timeline": [
                {"title": "Admission", "description": "Patient admitted for care.", "date": datetime.now().date().isoformat(), "time": "09:00", "type": "admission", "status": "Completed"}
            ],
            "notes": [
                {"title": "Initial Note", "date": datetime.now().date().isoformat(), "author": "Clinician", "body": "Initial evaluation performed."}
            ],
            # UI lists default empty
            "procedures": [],
            "authorizations": [],
            "prosthetics": [],
            # Header & metrics
            "admission_date": datetime.now().date().isoformat(),
            "primary_diagnosis": f"{icd_code} - Not Available",
            "facility": "Unknown Facility",
            "total_authorized": None,
            "used_amount": None,
            "percentage_used": None,
            "length_of_stay": mapping["los"],
            "procedures_count": 0,
            "authorizations_count": 0,
            "alerts_count": 0,
            "generated_at": datetime.now().isoformat()
        }


# ======================== Request Logging ========================

class RequestLogger:
    """Centralized logging for all requests and responses"""

    @staticmethod
    def log_request(request_id: str, endpoint: str, data: Dict[str, Any]):
        """Log incoming request"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "endpoint": endpoint,
            "request_data": data,
            "type": "REQUEST"
        }
        logger.info(f"Request: {json.dumps(log_entry)}")

        # Also write to dedicated JSON log file
        with open("requests_groq.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")

    @staticmethod
    def log_response(request_id: str, endpoint: str, data: Dict[str, Any], status_code: int):
        """Log outgoing response"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "endpoint": endpoint,
            "response_data": data,
            "status_code": status_code,
            "type": "RESPONSE"
        }
        logger.info(f"Response: {json.dumps(log_entry)}")

        # Also write to dedicated JSON log file
        with open("responses_groq.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")

    @staticmethod
    def log_error(request_id: str, endpoint: str, error: str):
        """Log error occurrences"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "endpoint": endpoint,
            "error": error,
            "type": "ERROR"
        }
        logger.error(f"Error: {json.dumps(log_entry)}")

        # Also write to dedicated JSON log file
        with open("errors_groq.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")


# ======================== FastAPI Application ========================

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown tasks"""
    # Startup
    logger.info(f"Starting Hospital Case Management Service (Groq) on {config.HOST}:{config.PORT}")
    logger.info(f"Backend integration URL: {config.BACKEND_URL}")
    logger.info(f"Using Groq Llama-4 Maverick with OpenAI-compatible API")
    logger.info(f"Mode: {'MOCK' if config.ENABLE_MOCK_MODE else 'LIVE'}")
    
    # Log API key status
    if config.ENABLE_MOCK_MODE:
        logger.warning("⚠  Running in MOCK MODE - API key not configured or invalid")
    else:
        logger.info("✅ API key configured - Ready to use live Groq AI")

    yield

    # Shutdown
    logger.info("Shutting down Hospital Case Management Service (Groq)")


app = FastAPI(
    title="Hospital Case Management Intelligence Service - Groq Edition",
    description="AI-powered hospital case management using Groq Llama-4 Maverick for ultra-low latency",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
llm_service = LLMService()
request_logger = RequestLogger()


# ======================== API Endpoints ========================

@app.get("/")
async def root():
    """Health check and service information endpoint"""
    return {
        "service": "Hospital Case Management Intelligence - Groq Edition",
        "status": "operational",
        "version": "1.0.0",
        "llm_provider": "Groq",
        "llm_model": config.LLM_MODEL,
        "endpoints": {
            "case_summary": "/generate-case-summary",
            "health": "/health",
            "docs": "/docs"
        }
    }


@app.get("/health")
async def health_check():
    """Detailed health check endpoint"""
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "configuration": {
            "llm_provider": "Groq",
            "llm_model": config.LLM_MODEL,
            "llm_configured": bool(config.GROQ_API_KEY),
            "mock_mode": config.ENABLE_MOCK_MODE,
            "backend_url": config.BACKEND_URL
        }
    }

    # Test backend connectivity
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{config.BACKEND_URL}/authorizations")
            health_status["backend_connectivity"] = response.status_code == 200
    except:
        health_status["backend_connectivity"] = False

    return health_status


@app.post("/generate-case-summary-groq", response_model=CaseSummaryResponse)
async def generate_case_summary(request: CaseSummaryRequest, req: Request):
    """
    Generate comprehensive hospital case management summary based on ICD code using Groq Llama-4 Maverick.
    """
    # Generate unique request ID
    request_id = f"req_{datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(4).hex()}"

    # Log incoming request
    request_logger.log_request(request_id, "/generate-case-summary-groq", request.dict())

    try:
        # Validate ICD code format
        if not request.icd_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="ICD code is required"
            )

        # Generate case summary using Groq
        llm_response = await llm_service.generate_case_summary(
            request.icd_code,
            patient_name=request.patient_name,
            case_id=request.case_id
        )

        # Create response object - coerce into Pydantic models where required
        # required_procedures -> ProcedureInfo list
        proc_objs = []
        for proc in llm_response.get("required_procedures", []):
            try:
                proc_objs.append(ProcedureInfo(**proc))
            except Exception:
                # fall back to minimal mapping
                proc_objs.append(ProcedureInfo(
                    code=str(proc.get("code", "N/A")),
                    description=str(proc.get("description", proc.get("desc", "No description"))),
                    urgency=str(proc.get("urgency", "Medium")),
                    estimated_duration=str(proc.get("estimated_duration", proc.get("duration", "Unknown")))
                ))

        timeline_objs = []
        for t in llm_response.get("timeline", []):
            try:
                timeline_objs.append(TimelineEvent(**t))
            except Exception:
                timeline_objs.append(TimelineEvent(
                    title=str(t.get("title", "Event")),
                    description=str(t.get("description", t.get("details", ""))),
                    date=str(t.get("date", datetime.now().date().isoformat())),
                    time=t.get("time"),
                    type=t.get("type"),
                    status=t.get("status")
                ))

        note_objs = []
        for n in llm_response.get("notes", []):
            try:
                note_objs.append(CaseNote(**n))
            except Exception:
                note_objs.append(CaseNote(
                    title=str(n.get("title", "Note")),
                    date=str(n.get("date", datetime.now().date().isoformat())),
                    author=str(n.get("author", "Clinician")),
                    body=str(n.get("body", ""))
                ))

        # Map care_level to enum
        care_level = llm_response.get("care_level", CareLevel.MEDICAL_SURGICAL)
        if isinstance(care_level, str):
            matched = None
            for enum_val in CareLevel:
                if care_level.lower() in enum_val.value.lower() or care_level.lower() in enum_val.name.lower():
                    matched = enum_val
                    break
            care_level = matched or CareLevel.MEDICAL_SURGICAL

        response = CaseSummaryResponse(
            case_id=llm_response.get("case_id"),
            patient_name=llm_response.get("patient_name"),
            admission_date=llm_response.get("admission_date"),
            primary_diagnosis=llm_response.get("primary_diagnosis"),
            facility=llm_response.get("facility"),
            total_authorized=llm_response.get("total_authorized"),
            used_amount=llm_response.get("used_amount"),
            percentage_used=llm_response.get("percentage_used"),
            length_of_stay=llm_response.get("length_of_stay"),
            procedures_count=llm_response.get("procedures_count", 0),
            authorizations_count=llm_response.get("authorizations_count", 0),
            alerts_count=llm_response.get("alerts_count", 0),

            case_summary=llm_response.get("case_summary"),
            recommended_care_plan=llm_response.get("recommended_care_plan"),
            expected_length_of_stay=llm_response.get("expected_length_of_stay"),
            required_procedures=proc_objs,
            prosthesis_needed=llm_response.get("prosthesis_needed"),
            authorization_required=llm_response.get("authorization_required", True),
            care_level=care_level,
            estimated_cost_range=llm_response.get("estimated_cost_range"),
            discharge_planning_notes=llm_response.get("discharge_planning_notes"),
            risk_factors=llm_response.get("risk_factors", []),
            clinical_pathways=llm_response.get("clinical_pathways", []),
            explanation=llm_response.get("explanation"),
            confidence_score=float(llm_response.get("confidence_score", 0.7)),
            generated_at=llm_response.get("generated_at", datetime.now().isoformat()),
            timeline=timeline_objs,
            procedures=llm_response.get("procedures", []),
            authorizations=llm_response.get("authorizations", []),
            prosthetics=llm_response.get("prosthetics", []),
            notes=note_objs
        )

        # Log successful response
        request_logger.log_response(request_id, "/generate-case-summary", response.dict(), 200)

        return response

    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error generating case summary: {str(e)}"
        request_logger.log_error(request_id, "/generate-case-summary", error_msg)
        logger.error(f"Full traceback: {traceback.format_exc()}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_msg
        )


@app.get("/debug/config")
async def get_debug_config():
    """
    Debug endpoint to check current configuration and LLM status.
    """
    placeholder_keys = ["YOUR-GROQ-API-KEY-HERE"]
    api_key_is_placeholder = (not config.GROQ_API_KEY or
                             config.GROQ_API_KEY in placeholder_keys or
                             len(config.GROQ_API_KEY) < 20 or
                             not config.GROQ_API_KEY.startswith("gsk_"))

    return {
        "llm_provider": "Groq",
        "mock_mode_enabled": config.ENABLE_MOCK_MODE,
        "api_key_configured": bool(config.GROQ_API_KEY and not api_key_is_placeholder),
        "api_key_is_placeholder": api_key_is_placeholder,
        "api_key_preview": config.GROQ_API_KEY[:10] + "..." if config.GROQ_API_KEY else "Not set",
        "llm_model": config.LLM_MODEL,
        "llm_timeout": config.LLM_TIMEOUT,
        "max_retries": config.LLM_MAX_RETRIES,
        "backend_url": config.BACKEND_URL,
        "instructions": "To use live LLM: 1) Get API key from https://console.groq.com 2) Replace the placeholder API key in Config class 3) Restart the service"
    }


@app.post("/debug/toggle-mock")
async def toggle_mock_mode():
    """
    Debug endpoint to toggle mock mode on/off for testing.
    """
    config.ENABLE_MOCK_MODE = not config.ENABLE_MOCK_MODE
    return {
        "mock_mode_enabled": config.ENABLE_MOCK_MODE,
        "message": f"Mock mode {'enabled' if config.ENABLE_MOCK_MODE else 'disabled'}"
    }


# ======================== Error Handlers ========================

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Custom HTTP exception handler"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now().isoformat()
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """General exception handler for unexpected errors"""
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.now().isoformat()
        }
    )


# ======================== Main Entry Point ========================

if __name__ == "__main__":
    """
    Run the service directly with uvicorn.
    In production, use: uvicorn hospital_case_management_groq:app --host 0.0.0.0 --port 5052
    """
    uvicorn.run(
        "Hospital_case_management_groq:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
        log_level="info"
    )