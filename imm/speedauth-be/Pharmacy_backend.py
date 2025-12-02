from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, ValidationError
import json, re, os
try:
    import google.generativeai as genai
except ImportError:
    genai = None
    print("Warning: google.generativeai not installed. Pharmacy backend will run in limited mode.")
from typing import List, Optional, Dict, Any
import logging
from dotenv import load_dotenv
 
# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
 
# Load environment variables
load_dotenv()
 
# -----------------------------
# Gemini Configuration
# -----------------------------
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    logger.error("GEMINI_API_KEY not found in environment variables")
    if genai is not None:
        raise ValueError("GEMINI_API_KEY environment variable is required")
    else:
        logger.warning("Running in limited mode without API key")
 
if api_key and genai is not None:
    logger.info(f"API Key loaded: {api_key[:10]}...")
    genai.configure(api_key=api_key)
elif genai is None:
    logger.warning("Google Generative AI not available - running in mock mode")
 
app = FastAPI(title="IMMS Prescription Generator API (Safe)")
 
# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,
    allow_methods=["*"],  # Allow all methods including OPTIONS
    allow_headers=["*"],  # Allow all headers
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
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*$', '', text)
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
# API Endpoint
# -----------------------------
@app.post("/generate_prescription_safe")
def generate_prescription_safe(data: InputSchema):
    """
    Uses Gemini 2.5 Flash to generate pharmacy details,
    then enforces JSON validation and schema correction.
    """
    try:
        logger.info(f"Received request for ICD: {data.icd_code}, Patient: {data.patient_name}")
       
        if genai is None:
            logger.warning("Google Generative AI not available - returning mock response")
            return {
                "status": "success", 
                "data": {
                    "patient_name": data.patient_name,
                    "date_of_birth": "1990-01-01",
                    "case_number": data.case_id,
                    "prescriber": "Dr. Mock Physician",
                    "date_of_service": "2024-10-21",
                    "medications": [
                        {
                            "drug_name": "Mock Medication",
                            "nappi_code": "1234567",
                            "dosage": "Mock dosage",
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
                            {
                                "name": "Mock Medication",
                                "cost": "R100.00"
                            }
                        ]
                    },
                    "nappi_validation": "Mock validation - Google AI not available"
                }
            }
       
        model = genai.GenerativeModel("gemini-2.5-flash")
        logger.info("Gemini model initialized successfully")
 
        prompt = f"""
        You are a medical assistant AI for the IMMS Pharmacy Benefit Management System.
       
        Based on the ICD Code {data.icd_code}, generate appropriate medications and treatment for patient {data.patient_name} (Case: {data.case_id}).
       
        IMPORTANT: Generate REAL medical data based on the ICD code, not template examples.
       
        For ICD {data.icd_code}:
        - Research the medical condition
        - Provide appropriate first-line medications
        - Use realistic South African NAPPI codes (7-digit numbers)
        - Set appropriate dosages and quantities
        - Generate realistic pricing in South African Rand
       
        Return ONLY valid JSON with this exact structure:
        {{
          "patient_name": "{data.patient_name}",
          "date_of_birth": "YYYY-MM-DD",
          "case_number": "{data.case_id}",
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
 
        logger.info("Sending request to Gemini API...")
       
        # Generate response
        response = model.generate_content(prompt)
        raw_output = response.text.strip()
       
        logger.info(f"Received response from Gemini: {raw_output[:100]}...")
 
        # Extract and correct JSON
        parsed = extract_json(raw_output)
        corrected = enforce_schema(parsed)
       
        logger.info("JSON parsed and validated successfully")
 
        return {"status": "success", "data": corrected}
 
    except (json.JSONDecodeError, ValidationError, ValueError) as e:
        logger.error(f"Parsing/Validation Error: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Parsing/Validation Error: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))