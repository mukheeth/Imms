import os
import re
import json
import logging
import asyncio
from datetime import datetime
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager
from enum import Enum
 
from fastapi import FastAPI, HTTPException, status, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, field_validator, validator
import httpx
import uvicorn
 
# Configure logging with UTF-8 encoding for Windows compatibility
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.FileHandler("discharge_planning.log", encoding="utf-8"),
        logging.StreamHandler()
    ],
)
logger = logging.getLogger(__name__)
 
# Fix console encoding for Windows
import sys
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding="utf-8")
 
 
# ======================== Configuration ========================
 
class Config:
    """Application configuration with direct API key integration"""
    # ============ CONFIGURE YOUR API KEY HERE ============
    # Replace with your actual Google Gemini API key
    GEMINI_API_KEY: str = "AIzaSyCCCXqd0ARQCC6jL_oLnqc7aLiEF3JT_7o"  # <-- PUT YOUR API KEY HERE
    # =====================================================
 
    # Google Gemini Configuration
    LLM_MODEL: str = "gemini-2.5-flash"    # Using Gemini 2.5 Flash
    LLM_API_URL: str = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    LLM_TIMEOUT: int = 30
    LLM_MAX_RETRIES: int = 3
 
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 5051
 
    # Backend Integration
    BACKEND_URL: str = "http://localhost:8082"
 
    # CORS Configuration
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:8082", "http://localhost:5050"]
 
    # Feature Flags
    ENABLE_MOCK_MODE: bool = False  # Set to True for testing without API calls
 
 
config = Config()
 
 
# ======================== Data Models (Request + Strict Response Schema) ========================
 
class DischargePlanRequest(BaseModel):
    """Request model for discharge planning generation"""
    patient_id: str = Field(..., description="Patient identifier")
    icd_code: str = Field(..., description="Primary ICD-10 code for the diagnosis", pattern=r"^[A-Z][0-9]{2}(\.[0-9]{1,4})?$")
    secondary_diagnoses: Optional[List[str]] = Field(default_factory=list, description="Secondary ICD-10 codes")
    current_functional_status: Optional[str] = Field(None, description="Patient's current functional status")
    social_support: Optional[str] = Field(None, description="Available social/family support")
    insurance_type: Optional[str] = Field(None, description="Type of insurance coverage")
 
    @field_validator("icd_code", mode="before")
    @classmethod
    def validate_icd_code(cls, v):
        if isinstance(v, str):
            return v.upper().strip()
        return v
 
    @field_validator("secondary_diagnoses", mode="before")
    @classmethod
    def validate_secondary_diagnoses(cls, v):
        if v and isinstance(v, list):
            return [code.upper().strip() for code in v if isinstance(code, str)]
        return v or []
 
 
# Response models aligned to the frontend DischargePlanning.tsx schema the user provided
class DischargeSummaryModel(BaseModel):
    primary_diagnosis: str = Field("", description="Primary diagnosis text")
    secondary_diagnoses: List[str] = Field(default_factory=list)
    treatment_summary: str = Field("", description="Treatment summary")
    discharge_date: Optional[str] = Field(None, description="YYYY-MM-DD")
    discharge_disposition: str = Field("", description="Home/Rehab/Family etc")
 
    @validator("discharge_date")
    def validate_date_format(cls, v):
        if v in (None, ""):
            return v
        # basic YYYY-MM-DD validation
        try:
            datetime.fromisoformat(v)
            return v
        except Exception:
            raise ValueError("discharge_date must be ISO YYYY-MM-DD")
 
 
class DeviceModel(BaseModel):
    name: str = Field(...)
    code: Optional[str] = Field(None)
    cost: Optional[str] = Field(None)
    approval_status: str = Field("Pending")  # Approved/Pending/Rejected
 
 
class AssistiveDevicesModel(BaseModel):
    devices: List[DeviceModel] = Field(default_factory=list)
    total_equipment_cost: Optional[str] = Field(None)
 
 
class RehabilitationPlanModel(BaseModel):
    therapy_types: List[str] = Field(default_factory=list)
    therapy_goals: str = Field("", description="Therapy goals text")
    provider: Optional[str] = Field(None)
    start_date: Optional[str] = Field(None)
 
    @validator("start_date")
    def validate_start_date(cls, v):
        if v in (None, ""):
            return v
        try:
            datetime.fromisoformat(v)
            return v
        except Exception:
            raise ValueError("start_date must be ISO YYYY-MM-DD")
 
 
class CaregiverReferralModel(BaseModel):
    caregiver_requirement: str = Field("none")  # full-time/part-time/visiting/none
    duration_weeks: Optional[int] = Field(None)
    care_requirements: List[str] = Field(default_factory=list)
    special_instructions: Optional[str] = Field(None)
 
 
class DischargePlanResponse(BaseModel):
    discharge_summary: DischargeSummaryModel
    assistive_devices: AssistiveDevicesModel
    rehabilitation_plan: RehabilitationPlanModel
    caregiver_referral: CaregiverReferralModel
    generated_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    patient_id: str = Field(...)
 
 
# ======================== LLM Integration (Gemini) ========================
 
class GeminiService:
    """Service for Google Gemini API interactions with robust prompt + parsing"""
 
    def __init__(self):
        self.api_key = config.GEMINI_API_KEY
        self.model = config.LLM_MODEL
        self.timeout = config.LLM_TIMEOUT
        self.max_retries = config.LLM_MAX_RETRIES
 
        if not self.api_key or self.api_key == "YOUR-GEMINI-API-KEY-HERE":
            logger.warning("GEMINI API KEY NOT CONFIGURED! Running in MOCK MODE.")
            config.ENABLE_MOCK_MODE = True
 
    def _get_system_prompt(self) -> str:
        """System prompt for Gemini to understand discharge planning context"""
        return (
            "You are a clinical discharge planning assistant. "
            "Produce EXACTLY one JSON object matching the schema provided in the user prompt. "
            "Do NOT include any explanations, commentary, or markdown. "
            "Always include all top-level keys. Use concise plain text values. "
            "Confidence_score is not required in this schema; do not add extra fields."
        )
 
    def _build_prompt(self, patient_id: str, icd_code: str, context: Dict[str, Any]) -> str:
        """Build detailed prompt specifying the exact JSON schema required by the frontend"""
        # Provide the schema example the model must match precisely
        schema_example = {
            "discharge_summary": {
                "primary_diagnosis": "string",
                "secondary_diagnoses": ["string"],
                "treatment_summary": "string",
                "discharge_date": "YYYY-MM-DD or null",
                "discharge_disposition": "string"
            },
            "assistive_devices": {
                "devices": [
                    {"name": "string", "code": "string", "cost": "string", "approval_status": "Approved|Pending|Rejected"}
                ],
                "total_equipment_cost": "string"
            },
            "rehabilitation_plan": {
                "therapy_types": ["string"],
                "therapy_goals": "string",
                "provider": "string",
                "start_date": "YYYY-MM-DD or null"
            },
            "caregiver_referral": {
                "caregiver_requirement": "full-time|part-time|visiting|none",
                "duration_weeks": 0,
                "care_requirements": ["string"],
                "special_instructions": "string or null"
            },
            "generated_at": "ISO timestamp",
            "patient_id": "string"
        }
 
        # Use the provided context and instruct the model to fill fields accordingly
        prompt = (
            f"{self._get_system_prompt()}\n\n"
            f"Input patient data:\n"
            f"patient_id: {patient_id}\n"
            f"primary_icd: {icd_code}\n"
            f"secondary_diagnoses: {json.dumps(context.get('secondary_diagnoses', []))}\n"
            f"current_functional_status: {context.get('current_functional_status', 'Not specified')}\n"
            f"social_support: {context.get('social_support', 'Not specified')}\n"
            f"insurance_type: {context.get('insurance_type', 'Not specified')}\n\n"
            "Output requirements:\n"
            "1. Return ONLY a single JSON object that matches the schema exactly (example schema below). "
            "2. Do NOT include additional keys or commentary. "
            "3. Use ISO date format YYYY-MM-DD for dates or null when unknown. "
            "4. For costs use strings (e.g., 'R 12,000').\n\n"
            f"SCHEMA_EXAMPLE = {json.dumps(schema_example, indent=2)}\n\n"
            "Now generate the JSON object for this patient based on the inputs above."
        )
 
        return prompt
 
    async def generate_discharge_plan(self, patient_id: str, icd_code: str, context: Dict[str, Any]) -> Dict[str, Any]:
        if config.ENABLE_MOCK_MODE:
            return self._get_mock_response(patient_id, icd_code)
 
        prompt = self._build_prompt(patient_id, icd_code, context)
 
        for attempt in range(self.max_retries):
            try:
                api_url = config.LLM_API_URL.format(model=self.model) + f"?key={self.api_key}"
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        api_url,
                        headers={"Content-Type": "application/json"},
                        json={
                            "contents": [{
                                "parts": [{
                                    "text": prompt
                                }]
                            }],
                            "generationConfig": {
                                "temperature": 0.2,
                                "maxOutputTokens": 2000,
                                "topP": 0.9,
                                "topK": 40,
                                "responseMimeType": "application/json"
                            }
                        }
                    )
 
                    if response.status_code == 200:
                        result = response.json()
                        return self._parse_gemini_response(result, patient_id)
                    else:
                        logger.error(f"Gemini API error: {response.status_code} - {response.text}")
 
            except httpx.TimeoutException:
                logger.warning(f"Gemini API timeout on attempt {attempt + 1}")
            except Exception as e:
                logger.error(f"Gemini API error on attempt {attempt + 1}: {str(e)}")
 
            if attempt < self.max_retries - 1:
                await asyncio.sleep(2 ** attempt)
 
        # fallback deterministic response
        return self._get_fallback_response(patient_id, icd_code)
 
    # --- Robust JSON extraction helpers ---
    def _extract_json_object(self, text: str) -> Optional[str]:
        """
        Attempt to extract the first top-level JSON object from a string.
        Strategy:
         - Find the first '{' and then scan forward balancing braces to the matching '}'.
         - If that fails, try a regex fallback to capture {...}
        """
        if not text or "{" not in text:
            return None
        start = text.find("{")
        stack = []
        for i in range(start, len(text)):
            ch = text[i]
            if ch == "{":
                stack.append(i)
            elif ch == "}":
                stack.pop()
                if not stack:
                    candidate = text[start:i + 1]
                    return candidate
        # fallback regex (non-greedy)
        m = re.search(r"(\{.*\})", text, flags=re.DOTALL)
        if m:
            return m.group(1)
        return None
 
    def _clean_code_fences(self, s: str) -> str:
        # remove triple backticks and language hints
        s = re.sub(r"^```(?:json)?\s*", "", s)
        s = re.sub(r"\s*```$", "", s)
        return s.strip()
 
    def _parse_gemini_response(self, gemini_response: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
        """
        Parse and validate the Gemini API response.
        Uses extraction heuristics + JSON load + schema enforcement.
        """
        try:
            candidates = gemini_response.get("candidates", [])
            if not candidates:
                logger.error("No candidates in Gemini response")
                return self._get_fallback_response(patient_id, "")
 
            content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "{}")
            if not isinstance(content, str):
                content = str(content)
 
            content = content.strip()
            content = self._clean_code_fences(content)
 
            # Extract the JSON substring
            json_text = self._extract_json_object(content)
            if not json_text:
                logger.warning("Could not extract JSON object from model output; returning fallback.")
                return self._get_fallback_response(patient_id, "")
 
            # Try multiple recovery attempts if minor trailing/leading chars exist
            parsed = None
            try:
                parsed = json.loads(json_text)
            except json.JSONDecodeError as e:
                # Try common fixes: replace trailing commas, remove control chars
                candidate = re.sub(r",\s*}", "}", json_text)
                candidate = re.sub(r",\s*]", "]", candidate)
                candidate = candidate.replace("\x0b", "").replace("\x0c", "")
                try:
                    parsed = json.loads(candidate)
                except Exception as e2:
                    logger.warning(f"JSON decoding failed after heuristics: {str(e2)}")
                    parsed = None
 
            if not parsed or not isinstance(parsed, dict):
                logger.error("Parsed JSON is invalid or not a dict; returning fallback.")
                return self._get_fallback_response(patient_id, "")
 
            # Enforce the schema and set defaults where needed
            validated = self._enforce_schema(parsed, patient_id)
            return validated
 
        except Exception as e:
            logger.error(f"Error parsing Gemini response: {str(e)}")
            return self._get_fallback_response(patient_id, "")
 
    def _enforce_schema(self, parsed: Dict[str, Any], patient_id: str) -> Dict[str, Any]:
        """
        Ensure parsed JSON conforms to our expected schema.
        Fill missing keys with sensible defaults and coerce types where possible.
        """
        # Top-level defaults
        discharge_summary = parsed.get("discharge_summary", {}) or {}
        assistive_devices = parsed.get("assistive_devices", {}) or {}
        rehabilitation_plan = parsed.get("rehabilitation_plan", {}) or {}
        caregiver_referral = parsed.get("caregiver_referral", {}) or {}
 
        # Discharge summary subfields
        ds = {
            "primary_diagnosis": str(discharge_summary.get("primary_diagnosis", "")),
            "secondary_diagnoses": discharge_summary.get("secondary_diagnoses", []) or [],
            "treatment_summary": str(discharge_summary.get("treatment_summary", "")),
            "discharge_date": discharge_summary.get("discharge_date", None),
            "discharge_disposition": str(discharge_summary.get("discharge_disposition", "Home"))
        }
        # Validate/normalize date
        if ds["discharge_date"] in ("", None):
            ds["discharge_date"] = None
        else:
            try:
                # attempt to parse and reformat
                _d = datetime.fromisoformat(ds["discharge_date"])
                ds["discharge_date"] = _d.date().isoformat()
            except Exception:
                ds["discharge_date"] = None
 
        # Assistive devices list
        devices_raw = assistive_devices.get("devices", []) or []
        devices: List[Dict[str, Any]] = []
        for d in devices_raw:
            try:
                name = d.get("name") if isinstance(d, dict) else str(d)
                code = d.get("code") if isinstance(d, dict) else None
                cost = d.get("cost") if isinstance(d, dict) else None
                approval_status = d.get("approval_status") if isinstance(d, dict) else "Pending"
                devices.append({
                    "name": str(name),
                    "code": str(code) if code is not None else None,
                    "cost": str(cost) if cost is not None else None,
                    "approval_status": str(approval_status)
                })
            except Exception:
                continue
 
        total_cost = assistive_devices.get("total_equipment_cost")
        if total_cost is None:
            # try to compute a naive sum if cost strings available
            total_val = None
            numeric_sum = 0
            found_any = False
            for d in devices:
                c = d.get("cost")
                if c:
                    # extract numbers
                    m = re.search(r"([\d,\.]+)", c.replace(" ", ""))
                    if m:
                        num_str = m.group(1).replace(",", "")
                        try:
                            numeric_sum += float(num_str)
                            found_any = True
                        except Exception:
                            pass
            if found_any:
                # format back to currency-like string with no decimals if integer
                if numeric_sum.is_integer():
                    total_cost = f"R {int(numeric_sum):,}".replace(",", ",")
                else:
                    total_cost = f"R {numeric_sum:,.2f}"
            else:
                total_cost = None
 
        # Rehabilitation plan
        rehab = {
            "therapy_types": rehabilitation_plan.get("therapy_types", []) or [],
            "therapy_goals": str(rehabilitation_plan.get("therapy_goals", "")),
            "provider": str(rehabilitation_plan.get("provider")) if rehabilitation_plan.get("provider") else None,
            "start_date": rehabilitation_plan.get("start_date", None)
        }
        if rehab["start_date"] in ("", None):
            rehab["start_date"] = None
        else:
            try:
                _d = datetime.fromisoformat(rehab["start_date"])
                rehab["start_date"] = _d.date().isoformat()
            except Exception:
                rehab["start_date"] = None
 
        # Caregiver referral
        caregiver = {
            "caregiver_requirement": str(caregiver_referral.get("caregiver_requirement", "none")),
            "duration_weeks": None,
            "care_requirements": caregiver_referral.get("care_requirements", []) or [],
            "special_instructions": caregiver_referral.get("special_instructions", None)
        }
        # duration coercion
        if caregiver_referral.get("duration_weeks") is not None:
            try:
                caregiver["duration_weeks"] = int(caregiver_referral.get("duration_weeks"))
            except Exception:
                caregiver["duration_weeks"] = None
 
        final = {
            "discharge_summary": ds,
            "assistive_devices": {"devices": devices, "total_equipment_cost": total_cost},
            "rehabilitation_plan": rehab,
            "caregiver_referral": caregiver,
            "generated_at": datetime.now().isoformat(),
            "patient_id": patient_id
        }
 
        # Validate through Pydantic model to ensure consistency and types
        try:
            validated = DischargePlanResponse(**final)
            # return dict form suitable for downstream usage
            return validated.dict()
        except Exception as e:
            logger.warning(f"Schema validation failed: {str(e)}; returning fallback.")
            return self._get_fallback_response(patient_id, "")
 
    def _get_mock_response(self, patient_id: str, icd_code: str) -> Dict[str, Any]:
        """Mock response matching the strict frontend schema"""
        mock = {
            "discharge_summary": {
                "primary_diagnosis": "Mock Diagnosis",
                "secondary_diagnoses": ["E11.9"],
                "treatment_summary": "Mock treatment summary for testing.",
                "discharge_date": None,
                "discharge_disposition": "Home with family"
            },
            "assistive_devices": {
                "devices": [
                    {"name": "Wheelchair", "code": "E1130", "cost": "R 4,500", "approval_status": "Approved"},
                    {"name": "Walker", "code": "E0143", "cost": "R 850", "approval_status": "Approved"}
                ],
                "total_equipment_cost": "R 5,350"
            },
            "rehabilitation_plan": {
                "therapy_types": ["Physical Therapy - 3x/week for 12 weeks"],
                "therapy_goals": "Improve mobility and gait.",
                "provider": "Life Rehabilitation Centre",
                "start_date": None
            },
            "caregiver_referral": {
                "caregiver_requirement": "part-time",
                "duration_weeks": 8,
                "care_requirements": ["Medication management", "Mobility assistance"],
                "special_instructions": "Assist with ADLs, monitor wound site."
            },
            "generated_at": datetime.now().isoformat(),
            "patient_id": patient_id
        }
        return mock
 
    def _get_fallback_response(self, patient_id: str, icd_code: str) -> Dict[str, Any]:
        """Deterministic fallback response aligned to frontend schema"""
        fallback = {
            "discharge_summary": {
                "primary_diagnosis": "Medical condition requiring discharge planning",
                "secondary_diagnoses": [],
                "treatment_summary": "Standard discharge plan. Please review manually.",
                "discharge_date": None,
                "discharge_disposition": "Home"
            },
            "assistive_devices": {
                "devices": [],
                "total_equipment_cost": None
            },
            "rehabilitation_plan": {
                "therapy_types": [],
                "therapy_goals": "",
                "provider": None,
                "start_date": None
            },
            "caregiver_referral": {
                "caregiver_requirement": "none",
                "duration_weeks": None,
                "care_requirements": [],
                "special_instructions": None
            },
            "generated_at": datetime.now().isoformat(),
            "patient_id": patient_id
        }
        return fallback
 
 
# ======================== Request Logging ========================
 
class RequestLogger:
    """Centralized logging for all requests and responses"""
 
    @staticmethod
    def log_request(request_id: str, endpoint: str, data: Dict[str, Any]):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "endpoint": endpoint,
            "request_data": data,
            "type": "REQUEST"
        }
        logger.info(f"Request: {json.dumps(log_entry)}")
        with open("discharge_requests.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
 
    @staticmethod
    def log_response(request_id: str, endpoint: str, data: Dict[str, Any], status_code: int):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "endpoint": endpoint,
            "response_data": data,
            "status_code": status_code,
            "type": "RESPONSE"
        }
        logger.info(f"Response: {json.dumps(log_entry)}")
        with open("discharge_responses.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
 
    @staticmethod
    def log_error(request_id: str, endpoint: str, error: str):
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request_id,
            "endpoint": endpoint,
            "error": error,
            "type": "ERROR"
        }
        logger.error(f"Error: {json.dumps(log_entry)}")
        with open("discharge_errors.jsonl", "a", encoding="utf-8") as f:
            f.write(json.dumps(log_entry) + "\n")
 
 
# ======================== Backend Integration ========================
 
class BackendIntegration:
    """Service for integrating with the existing Percert backend"""
 
    @staticmethod
    async def fetch_patient_data(patient_id: str) -> Optional[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{config.BACKEND_URL}/patient/{patient_id}")
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            logger.warning(f"Could not fetch patient data: {str(e)}")
        return None
 
    @staticmethod
    async def fetch_authorization_data(patient_id: str) -> Optional[Dict[str, Any]]:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                response = await client.get(f"{config.BACKEND_URL}/authorizations?patient_id={patient_id}")
                if response.status_code == 200:
                    return response.json()
        except Exception as e:
            logger.warning(f"Could not fetch authorization data: {str(e)}")
        return None
 
 
# ======================== FastAPI App ========================
 
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info(f"Starting Discharge Planning Service on {config.HOST}:{config.PORT}")
    logger.info(f"Backend integration URL: {config.BACKEND_URL}")
    logger.info(f"Using Google Gemini {config.LLM_MODEL}")
    logger.info(f"Mode: {'MOCK' if config.ENABLE_MOCK_MODE else 'LIVE'}")
    yield
    logger.info("Shutting down Discharge Planning Service")
 
 
app = FastAPI(
    title="Discharge Planning Intelligence Service",
    description="AI-powered discharge planning for hospital case management",
    version="1.0.0",
    lifespan=lifespan
)
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
gemini_service = GeminiService()
request_logger = RequestLogger()
backend_integration = BackendIntegration()
 
 
@app.get("/")
async def root():
    return {
        "service": "Discharge Planning Intelligence",
        "status": "operational",
        "version": "1.0.0",
        "endpoints": {
            "discharge_plan": "/generate-discharge-plan",
            "health": "/health",
            "docs": "/docs"
        }
    }
 
 
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "configuration": {
            "llm_configured": bool(config.GEMINI_API_KEY),
            "mock_mode": config.ENABLE_MOCK_MODE,
            "backend_url": config.BACKEND_URL
        }
    }
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            response = await client.get(f"{config.BACKEND_URL}/")
            health_status["backend_connectivity"] = response.status_code < 500
    except Exception:
        health_status["backend_connectivity"] = False
    return health_status
 
 
@app.post("/generate-discharge-plan", response_model=DischargePlanResponse)
async def generate_discharge_plan(
    request: DischargePlanRequest,
    req: Request,
    background_tasks: BackgroundTasks
):
    request_id = f"req_{datetime.now().strftime('%Y%m%d%H%M%S')}_{os.urandom(4).hex()}"
    request_logger.log_request(request_id, "/generate-discharge-plan", request.dict())
 
    try:
        if not request.patient_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Patient ID is required")
        if not request.icd_code:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="ICD code is required")
 
        patient_data = None
        authorization_data = None
        if not config.ENABLE_MOCK_MODE:
            patient_data = await backend_integration.fetch_patient_data(request.patient_id)
            authorization_data = await backend_integration.fetch_authorization_data(request.patient_id)
 
        context = {
            "secondary_diagnoses": request.secondary_diagnoses,
            "current_functional_status": request.current_functional_status,
            "social_support": request.social_support,
            "insurance_type": request.insurance_type,
            "patient_data": patient_data,
            "authorization_data": authorization_data
        }
 
        llm_response = await gemini_service.generate_discharge_plan(
            request.patient_id,
            request.icd_code,
            context
        )
 
        # Validate/construct response with Pydantic model
        response_model = DischargePlanResponse(**llm_response)
 
        request_logger.log_response(request_id, "/generate-discharge-plan", response_model.dict(), 200)
        return response_model
 
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Error generating discharge plan: {str(e)}"
        request_logger.log_error(request_id, "/generate-discharge-plan", error_msg)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error_msg)
 
 
@app.post("/batch-discharge-plans")
async def batch_discharge_plans(patient_ids: List[str], icd_code: str):
    if not patient_ids:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one patient ID is required")
    if len(patient_ids) > 10:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Maximum 10 patients allowed per batch")
 
    tasks = []
    for patient_id in patient_ids:
        request_obj = DischargePlanRequest(
            patient_id=patient_id,
            icd_code=icd_code
        )
        # call internal function directly
        tasks.append(
            generate_discharge_plan(
                request_obj,
                Request({"type": "http", "headers": [], "method": "POST"}),
                BackgroundTasks()
            )
        )
 
    results = await asyncio.gather(*tasks, return_exceptions=True)
    batch_results = []
    for patient_id, result in zip(patient_ids, results):
        if isinstance(result, Exception):
            batch_results.append({
                "patient_id": patient_id,
                "status": "error",
                "error": str(result)
            })
        else:
            batch_results.append({
                "patient_id": patient_id,
                "status": "success",
                "data": result.dict()
            })
 
    return {"batch_results": batch_results}
 
 
@app.get("/device-catalog")
async def get_device_catalog():
    device_catalog = {
        "mobility_aids": {
            "wheelchair": "For patients with limited or no ambulation ability",
            "walker": "For patients requiring stability during ambulation",
            "cane": "For patients with mild balance or stability issues",
            "crutches": "For non-weight bearing or partial weight bearing"
        },
        "respiratory_equipment": {
            "oxygen_concentrator": "For chronic oxygen therapy needs",
            "cpap_machine": "For sleep apnea management",
            "nebulizer": "For respiratory medication delivery"
        },
        "monitoring_devices": {
            "blood_glucose_monitor": "For diabetes management",
            "blood_pressure_monitor": "For hypertension monitoring"
        },
        "specialized_equipment": {
            "hospital_bed": "For patients requiring positioning assistance",
            "wound_vac": "For complex wound management",
            "feeding_tube_supplies": "For enteral nutrition needs"
        }
    }
    return device_catalog
 
 
@app.get("/facility-types")
async def get_facility_types():
    facility_info = {
        "sub_acute": {
            "name": "Sub-Acute Recovery Center",
            "description": "Short-term intensive rehabilitation",
            "typical_stay": "1-4 weeks",
            "services": ["Physical therapy", "Occupational therapy", "Speech therapy", "Nursing care"]
        },
        "skilled_nursing": {
            "name": "Skilled Nursing Facility",
            "description": "24-hour nursing care with rehabilitation services",
            "typical_stay": "2-12 weeks",
            "services": ["Skilled nursing", "Rehabilitation", "Medical management", "Wound care"]
        },
        "inpatient_rehab": {
            "name": "Inpatient Rehabilitation Center",
            "description": "Intensive therapy for complex conditions",
            "typical_stay": "1-3 weeks",
            "services": ["Intensive PT/OT", "Physiatry", "Psychology", "Case management"]
        },
        "ltach": {
            "name": "Long-Term Acute Care Hospital",
            "description": "Extended acute care for complex medical conditions",
            "typical_stay": "3-6 weeks",
            "services": ["Ventilator weaning", "Complex wound care", "IV therapy", "Dialysis"]
        }
    }
    return facility_info
 
 
# ======================== Error Handlers ========================
 
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
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
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"error": "Internal server error", "status_code": 500, "timestamp": datetime.now().isoformat()}
    )
 
 
# ======================== Main Entry Point ========================
 
if __name__ == "__main__":
    uvicorn.run("discharge_planning_service:app", host=config.HOST, port=config.PORT, reload=True, log_level="info")
 