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

# Stable Gemini model
# Used for:
# 1. Disease validation
# 2. Medicine validation
# 3. Prescription OCR extraction
MODEL_NAME = "gemini-2.5-flash-lite"


# ==========================================
# DISEASE VALIDATION
# ==========================================

def validate_disease(disease_name):
    """
    Validate whether the entered disease/medical
    condition is genuine.

    Returns:
        VALID
        INVALID

    If Gemini is temporarily unavailable,
    allow the value instead of blocking the user.
    """

    if not disease_name:
        return "INVALID"

    disease_name = disease_name.strip()

    if not disease_name:
        return "INVALID"

    prompt = f"""
You are a medical terminology validator.

Determine whether the following is a genuine
disease, illness, medical condition, symptom,
or commonly recognized health condition.

Disease/Condition:
{disease_name}

Instructions:
- Reply with ONLY one word.
- If it is a genuine medical condition, reply:
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
            model=MODEL_NAME,
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

        print("Unexpected Gemini disease response:", result)

        # Do not incorrectly reject the disease
        # if Gemini gives an unexpected response.
        return "VALID"

    except Exception as e:

        error_text = str(e).upper()

        print("========== GEMINI DISEASE ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("==========================================")

        # Gemini temporary errors should NOT
        # prevent the user from using the app.
        if (
            "503" in error_text
            or "UNAVAILABLE" in error_text
            or "RESOURCE_EXHAUSTED" in error_text
            or "429" in error_text
        ):
            print(
                "Gemini temporarily unavailable - "
                "allowing disease."
            )

        # For any unexpected Gemini error,
        # don't incorrectly reject the disease.
        return "VALID"


# ==========================================
# MEDICINE VALIDATION
# ==========================================

def validate_medicine(medicine_name):
    """
    Validate medicine name using Gemini.

    Returns:
        VALID
        INVALID

    If Gemini is temporarily unavailable,
    allow the medicine instead of incorrectly
    showing 'Invalid medicine name.'
    """

    if not medicine_name:
        return "INVALID"

    medicine_name = medicine_name.strip()

    if not medicine_name:
        return "INVALID"

    prompt = f"""
You are an experienced pharmacist.

Determine whether the following is a real
medicine name.

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
            model=MODEL_NAME,
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

        print("Unexpected Gemini medicine response:", result)

        # Do not incorrectly reject the medicine
        # because Gemini returned something unexpected.
        return "VALID"

    except Exception as e:

        error_text = str(e).upper()

        print("========== GEMINI MEDICINE ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("===========================================")

        if (
            "503" in error_text
            or "UNAVAILABLE" in error_text
            or "RESOURCE_EXHAUSTED" in error_text
            or "429" in error_text
        ):
            print(
                "Gemini temporarily unavailable - "
                "allowing medicine."
            )

        # IMPORTANT:
        # Gemini failure should NOT make a genuine
        # medicine appear as "Invalid medicine name."
        return "VALID"


# ==========================================
# PRESCRIPTION OCR
# ==========================================

def extract_prescription_details(text):
    """
    Extract disease and medicines from OCR text.

    Returns JSON in this format:

    {
        "disease": "Fever",
        "medicines": [
            {
                "medicine_name": "Paracetamol",
                "dosage": "500 mg"
            }
        ]
    }
    """

    if not text:
        return {
            "disease": "",
            "medicines": []
        }

    prompt = f"""
You are an expert medical prescription reader.

Read the prescription text provided below.

Extract:
- Disease or medical condition
- Medicine name
- Dosage

Return ONLY valid JSON.

The JSON must follow exactly this structure:

{{
    "disease": "Fever",
    "medicines": [
        {{
            "medicine_name": "Paracetamol",
            "dosage": "500 mg"
        }}
    ]
}}

If the disease is not available, use an empty string.

If no medicines are found, return:

{{
    "disease": "",
    "medicines": []
}}

Do not add explanations.
Do not use markdown.

Prescription:

{text}
"""

    try:

        response = client.models.generate_content(
            model=MODEL_NAME,
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

        data = json.loads(result)

        # Make sure the expected structure exists
        if not isinstance(data, dict):
            return {
                "disease": "",
                "medicines": []
            }

        if "disease" not in data:
            data["disease"] = ""

        if "medicines" not in data:
            data["medicines"] = []

        return data

    except Exception as e:

        error_text = str(e).upper()

        print("========== GEMINI OCR ERROR ==========")
        print(type(e).__name__)
        print(str(e))
        print("======================================")

        # IMPORTANT:
        # If Gemini is temporarily unavailable,
        # don't crash /api/ocr/ with HTTP 500.
        if (
            "503" in error_text
            or "UNAVAILABLE" in error_text
            or "RESOURCE_EXHAUSTED" in error_text
            or "429" in error_text
        ):
            print(
                "Gemini temporarily unavailable - "
                "returning empty OCR result."
            )

            return {
                "disease": "",
                "medicines": []
            }

        # For JSON parsing errors or other unexpected
        # errors, also return a safe empty result.
        return {
            "disease": "",
            "medicines": []
        }