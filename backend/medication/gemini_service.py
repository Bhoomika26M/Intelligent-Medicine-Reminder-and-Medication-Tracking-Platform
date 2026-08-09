import os
import json

from google import genai
from google.genai import types


# ==========================================
# GEMINI CLIENT
# ==========================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# ==========================================
# MEDICINE VALIDATION
# ==========================================

def validate_medicine(medicine_name):
    """
    Validate whether the medicine name is real.
    """

    prompt = f"""
You are an experienced pharmacist.

Determine whether the following is a real medicine name.

Medicine:
{medicine_name}

Instructions:
- Reply with ONLY one word.
- If it is a genuine medicine, generic medicine,
  or genuine medicine brand name, reply:
VALID
- If it is random text, meaningless text,
  or clearly not a medicine, reply:
INVALID
- Do not explain.
- Do not add punctuation.
- Do not use markdown.
"""

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0
            ),
        )

        result = response.text.strip().upper()

        print("========== MEDICINE VALIDATION ==========")
        print("Medicine:", medicine_name)
        print("Raw Response:", repr(result))
        print("=========================================")

        # Normalize Gemini response
        result = (
            result
            .replace("\n", "")
            .replace("\r", "")
            .strip()
        )

        if result == "VALID":
            return "VALID"

        if result == "INVALID":
            return "INVALID"

        print(
            "Unexpected Gemini medicine response:",
            result
        )

        return "ERROR"

    except Exception as e:
        print(
            "========== GEMINI MEDICINE ERROR =========="
        )
        print(type(e).__name__)
        print(str(e))
        print(
            "==========================================="
        )

        # TEMPORARY DEMO FALLBACK
        # If Gemini quota is exhausted,
        # don't block the medicine update.
        if "RESOURCE_EXHAUSTED" in str(e):
            print(
                "Gemini quota exhausted - "
                "medicine validation bypassed."
            )
            return "ERROR"

        return "ERROR"


# ==========================================
# PRESCRIPTION TEXT EXTRACTION
# ==========================================

def extract_prescription_details(text):
    """
    Extract disease and medicines from OCR text.
    """

    prompt = f"""
You are an expert doctor.

Read the prescription text provided below.

Extract:
- Disease or medical condition
- Medicine name
- Dosage

Return ONLY valid JSON.

Example:

{{
    "disease": "Fever",
    "medicines": [
        {{
            "medicine_name": "Paracetamol",
            "dosage": "500 mg"
        }}
    ]
}}

Prescription:

{text}
"""

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0
            ),
        )

        result = response.text.strip()

        print("========== GEMINI OCR ==========")
        print(result)
        print("================================")

        # Remove Markdown JSON formatting
        if result.startswith("```json"):
            result = result.replace(
                "```json",
                "",
                1
            )
            result = result.replace(
                "```",
                ""
            ).strip()

        elif result.startswith("```"):
            result = result.replace(
                "```",
                ""
            ).strip()

        return json.loads(result)

    except Exception as e:
        print("========== GEMINI OCR ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("======================================")

        raise


# ==========================================
# DISEASE VALIDATION
# ==========================================

def validate_disease(disease_name):
    """
    Validate whether the disease name or
    medical condition is real.
    """

    prompt = f"""
You are an experienced medical professional.

Determine whether the following is a real
disease, disorder, syndrome, infection,
medical condition, or recognized diagnosis.

Disease / Condition:
{disease_name}

Instructions:
- Reply with ONLY one word.
- If it is a genuine disease or medical
  condition, reply:
VALID
- If it is random text, meaningless text,
  or clearly not a medical condition, reply:
INVALID
- Do not explain.
- Do not add punctuation.
- Do not use markdown.
"""

    try:
        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0
            ),
        )

        result = response.text.strip().upper()

        print("========== DISEASE VALIDATION ==========")
        print("Disease:", disease_name)
        print("Raw Response:", repr(result))
        print("========================================")

        # Normalize Gemini response
        result = (
            result
            .replace("\n", "")
            .replace("\r", "")
            .strip()
        )

        if result == "VALID":
            return "VALID"

        if result == "INVALID":
            return "INVALID"

        print(
            "Unexpected Gemini disease response:",
            result
        )

        return "ERROR"

    except Exception as e:
        print(
            "========== GEMINI DISEASE ERROR =========="
        )
        print(type(e).__name__)
        print(str(e))
        print(
            "=========================================="
        )

        # TEMPORARY DEMO FALLBACK
        # If Gemini quota is exhausted,
        # don't block the disease update.
        if "RESOURCE_EXHAUSTED" in str(e):
            print(
                "Gemini quota exhausted - "
                "disease validation bypassed."
            )
            return "ERROR"

        return "ERROR"