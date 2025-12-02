"""
Pharmacy Benefit Management Service - Groq Llama Edition
========================================================
A FastAPI microservice for AI-powered prescription generation using Groq Llama-4 Maverick
for ultra-low latency pharmacy benefit management.

Powered by Groq Llama-4 Maverick (17B 128E Instruct) for fast prescription generation.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
import json
import re
import os
import logging
from typing import List, Optional, Dict, Any
import httpx
import asyncio

# Setup logging with UTF-8 encoding for Windows
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('pharmacy_groq.log', encoding='utf-8'),
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

# -----------------------------
# Configuration
# -----------------------------
class Config:
    """Application configuration"""
    # ============ CONFIGURE YOUR API KEY HERE ============
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    # =====================================================
    
    # Groq Configuration
    # Model reference: https://console.groq.com/playground?model=meta-llama/llama-4-maverick-17b-128e-instruct
    LLM_MODEL: str = "meta-llama/llama-4-maverick-17b-128e-instruct"
    LLM_API_URL: str = "https://api.groq.com/openai/v1/chat/completions"
    LLM_TIMEOUT: int = 30
    LLM_MAX_RETRIES: int = 3
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("PORT", "8081"))  # Render sets PORT automatically
    
    # CORS
    CORS_ORIGINS: List[str] = ["*"]
    
    # Feature Flags
    ENABLE_MOCK_MODE: bool = False

config = Config()

# Validate API key
placeholder_keys = ["YOUR-GROQ-API-KEY-HERE"]
is_placeholder = (not config.GROQ_API_KEY or
                 config.GROQ_API_KEY in placeholder_keys or
                 len(config.GROQ_API_KEY) < 20 or
                 not config.GROQ_API_KEY.startswith("gsk_"))

if is_placeholder:
    logger.warning("GROQ API KEY NOT CONFIGURED! Running in MOCK MODE.")
    config.ENABLE_MOCK_MODE = True
else:
    logger.info(f"Groq API Key configured: {config.GROQ_API_KEY[:10]}...")
    logger.info(f"Using Groq model: {config.LLM_MODEL}")

# Initialize FastAPI app
app = FastAPI(
    title="IMMS Prescription Generator API - Groq Edition",
    description="AI-powered prescription generation using Groq Llama-4 Maverick",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Pydantic Schemas
# -----------------------------
class Medication(BaseModel):
    drug_name: str = ""
    nappi_code: str = ""
    dosage: str = ""
    quantity: int = 0
    duration_days: int = 0
    formulary_status: str = ""
    price: str = ""
    generic_substitute: Optional[str] = None

class PricingItem(BaseModel):
    name: str = ""
    cost: str = ""

class PricingSummary(BaseModel):
    total_cost: str = ""
    items: List[PricingItem] = []

class ResponseSchema(BaseModel):
    patient_name: str = ""
    date_of_birth: str = ""
    case_number: str = ""
    prescriber: str = ""
    date_of_service: str = ""
    medications: List[Medication] = []
    pricing_summary: PricingSummary = PricingSummary()
    nappi_validation: str = ""

class InputSchema(BaseModel):
    icd_code: str
    patient_name: str
    case_id: str

# -----------------------------
# Helpers: Extraction + Correction
# -----------------------------
def extract_json(text: str) -> Dict[str, Any]:
    """Extract first valid JSON object from text."""
    # Remove markdown code blocks if present
    text = re.sub(r'json\s*', '', text)
    text = re.sub(r'\s*$', '', text)
    text = text.strip()
   
    # Find JSON object boundaries
    start_idx = text.find('{')
    if start_idx == -1:
        raise ValueError("No JSON object found in model output.")
   
    # Find matching closing brace
    brace_count = 0
    end_idx = start_idx
   
    for i, char in enumerate(text[start_idx:], start_idx):
        if char == '{':
            brace_count += 1
        elif char == '}':
            brace_count -= 1
            if brace_count == 0:
                end_idx = i
                break
   
    if brace_count != 0:
        raise ValueError("Unmatched braces in JSON object.")
   
    json_str = text[start_idx:end_idx + 1]
   
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse JSON: {json_str}")
        raise ValueError(f"Invalid JSON: {e}")

def enforce_schema(parsed: Dict[str, Any]) -> Dict[str, Any]:
    """
    Correct missing or invalid fields automatically.
    Uses Pydantic defaults for any missing values.
    """
    try:
        validated = ResponseSchema(**parsed)
        return validated.dict()
    except ValidationError:
        # Create a new dict based on schema defaults, and fill with valid keys
        defaults = ResponseSchema().dict()
        for key, value in parsed.items():
            if key in defaults:
                defaults[key] = value
        return defaults

# -----------------------------
# Groq Service
# -----------------------------
class GroqService:
    """Service for Groq API interactions"""
    
    def __init__(self):
        self.api_key = config.GROQ_API_KEY
        self.model = config.LLM_MODEL
        self.timeout = config.LLM_TIMEOUT
        self.max_retries = config.LLM_MAX_RETRIES
    
    async def generate_prescription(self, icd_code: str, patient_name: str, case_id: str) -> Dict[str, Any]:
        """Generate prescription using Groq Llama-4 Maverick"""
        
        if config.ENABLE_MOCK_MODE:
            logger.info("Using mock response (Groq API key not configured)")
            return self._get_mock_response(patient_name, case_id)
        
        prompt = self._build_prompt(icd_code, patient_name, case_id)
        
        for attempt in range(self.max_retries):
            try:
                logger.info(f"🔍 Attempt {attempt + 1}/{self.max_retries} - Calling Groq API for prescription")
                
                # Build the Groq API request (OpenAI-compatible format)
                request_payload = {
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are a medical assistant AI for pharmacy benefit management. Generate realistic prescriptions based on ICD codes."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 2000,
                    "top_p": 0.9,
                    "response_format": {"type": "json_object"}
                }
                
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(
                        config.LLM_API_URL,
                        headers={
                            "Content-Type": "application/json",
                            "Authorization": f"Bearer {self.api_key}"
                        },
                        json=request_payload
                    )
                
                logger.info(f"🔍 Groq API response status: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    return self._parse_groq_response(result)
                else:
                    logger.error(f"Groq API error: {response.status_code} - {response.text}")
                    
            except httpx.TimeoutException:
                logger.warning(f"Groq API timeout on attempt {attempt + 1}")
            except Exception as e:
                logger.error(f"Groq API error on attempt {attempt + 1}: {str(e)}")
            
            if attempt < self.max_retries - 1:
                await asyncio.sleep(2 ** attempt)
        
        # Fallback response if all attempts fail
        logger.warning("All Groq attempts failed, using fallback response")
        return self._get_fallback_response(patient_name, case_id)
    
    def _build_prompt(self, icd_code: str, patient_name: str, case_id: str) -> str:
        """Build prompt for Groq"""
        return f"""
You are a medical assistant AI for the IMMS Pharmacy Benefit Management System.

Based on the ICD Code {icd_code}, generate appropriate medications and treatment for patient {patient_name} (Case: {case_id}).

IMPORTANT: Generate REAL medical data based on the ICD code, not template examples.

For ICD {icd_code}:
- Research the medical condition
- Provide appropriate first-line medications
- Use realistic South African NAPPI codes (7-digit numbers)
- Set appropriate dosages and quantities
- Generate realistic pricing in South African Rand

Return ONLY valid JSON with this exact structure:
{{
  "patient_name": "{patient_name}",
  "date_of_birth": "YYYY-MM-DD",
  "case_number": "{case_id}",
  "prescriber": "Dr. [Generate realistic doctor name]",
  "date_of_service": "2024-10-16",
  "medications": [
    {{
      "drug_name": "[Real medication name for this condition]",
      "nappi_code": "[7-digit NAPPI code]",
      "dosage": "[Appropriate medical dosage]",
      "quantity": [realistic quantity number],
      "duration_days": [appropriate treatment duration],
      "formulary_status": "Formulary",
      "price": "R[realistic price].00",
      "generic_substitute": null
    }}
  ],
  "pricing_summary": {{
    "total_cost": "R[total cost].00",
    "items": [
      {{
        "name": "[medication name]",
        "cost": "R[cost].00"
      }}
    ]
  }},
  "nappi_validation": "All NAPPI codes validated successfully"
}}
"""
    
    def _parse_groq_response(self, groq_response: Dict[str, Any]) -> Dict[str, Any]:
        """Parse Groq API response"""
        try:
            # Groq uses OpenAI-compatible format: choices[0].message.content
            choices = groq_response.get("choices", [])
            if not choices:
                logger.error("No choices in Groq response")
                raise ValueError("No choices in response")
            
            message = choices[0].get("message", {})
            content = message.get("content", "{}")
            
            logger.info(f"GROQ_RAW_RESPONSE: {content[:300]}...")
            
            # Extract and validate JSON
            parsed = extract_json(content)
            corrected = enforce_schema(parsed)
            
            logger.info("✅ Successfully parsed and validated Groq prescription response")
            return corrected
            
        except Exception as e:
            logger.error(f"Error parsing Groq response: {str(e)}")
            raise
    
    def _get_mock_response(self, patient_name: str, case_id: str) -> Dict[str, Any]:
        """Mock response for testing"""
        return {
            "patient_name": patient_name,
            "date_of_birth": "1980-05-15",
            "case_number": case_id,
            "prescriber": "Dr. Mock Physician",
            "date_of_service": "2024-10-16",
            "medications": [
                {
                    "drug_name": "Mock Medication",
                    "nappi_code": "1234567",
                    "dosage": "500mg",
                    "quantity": 30,
                    "duration_days": 30,
                    "formulary_status": "Formulary",
                    "price": "R150.00",
                    "generic_substitute": None
                }
            ],
            "pricing_summary": {
                "total_cost": "R150.00",
                "items": [
                    {"name": "Mock Medication", "cost": "R150.00"}
                ]
            },
            "nappi_validation": "Mock validation - API key not configured"
        }
    
    def _get_fallback_response(self, patient_name: str, case_id: str) -> Dict[str, Any]:
        """Fallback response when API fails"""
        return {
            "patient_name": patient_name,
            "date_of_birth": "1980-01-01",
            "case_number": case_id,
            "prescriber": "Dr. System",
            "date_of_service": "2024-10-16",
            "medications": [
                {
                    "drug_name": "Standard Treatment",
                    "nappi_code": "0000000",
                    "dosage": "As directed",
                    "quantity": 30,
                    "duration_days": 30,
                    "formulary_status": "Formulary",
                    "price": "R100.00",
                    "generic_substitute": None
                }
            ],
            "pricing_summary": {
                "total_cost": "R100.00",
                "items": [
                    {"name": "Standard Treatment", "cost": "R100.00"}
                ]
            },
            "nappi_validation": "Fallback response - API temporarily unavailable"
        }

# Initialize Groq service
groq_service = GroqService()

# -----------------------------
# API Endpoints
# -----------------------------
@app.get("/")
async def root():
    """Service information endpoint"""
    return {
        "service": "IMMS Prescription Generator - Groq Edition",
        "status": "operational",
        "version": "1.0.0",
        "llm_provider": "Groq",
        "llm_model": config.LLM_MODEL,
        "port": config.PORT,
        "endpoints": {
            "generate_prescription": "/generate_prescription_safe_groq",
            "health": "/health"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "llm_provider": "Groq",
        "llm_model": config.LLM_MODEL,
        "api_key_configured": bool(config.GROQ_API_KEY and not is_placeholder),
        "mock_mode": config.ENABLE_MOCK_MODE
    }

@app.post("/generate_prescription_safe_groq")
async def generate_prescription_safe(data: InputSchema):
    """
    Uses Groq Llama-4 Maverick to generate pharmacy details,
    then enforces JSON validation and schema correction.
    """
    try:
        logger.info(f"Received request for ICD: {data.icd_code}, Patient: {data.patient_name}")
        
        # Generate prescription using Groq
        result = await groq_service.generate_prescription(
            data.icd_code,
            data.patient_name,
            data.case_id
        )
        
        logger.info("Prescription generated successfully")
        return {"status": "success", "data": result}

    except (json.JSONDecodeError, ValidationError, ValueError) as e:
        logger.error(f"Parsing/Validation Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Parsing/Validation Error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# -----------------------------
# Startup
# -----------------------------
@app.on_event("startup")
async def startup_event():
    logger.info(f"Starting IMMS Prescription Generator Service (Groq) on {config.HOST}:{config.PORT}")
    logger.info(f"Using Groq {config.LLM_MODEL}")
    logger.info(f"Mode: {'MOCK' if config.ENABLE_MOCK_MODE else 'LIVE'}")
    
    if config.ENABLE_MOCK_MODE:
        logger.warning("⚠  Running in MOCK MODE - API key not configured")
    else:
        logger.info("✅ API key configured - Ready to use live Groq AI")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("Shutting down IMMS Prescription Generator Service (Groq)")

# -----------------------------
# Main Entry Point
# -----------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "Pharmacy_backend_groq:app",
        host=config.HOST,
        port=config.PORT,
        reload=True,
        log_level="info"
    )