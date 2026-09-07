import os
import json
from PIL import Image

from google import genai
from google.genai import types


# ==========================================
# GEMINI CLIENT
# ==========================================

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


# Lightweight vision model
MODEL_NAME = "gemini-3.5-flash"


# ==========================================
# PRESCRIPTION IMAGE ANALYSIS
# ==========================================

def analyze_prescription_image(image_path):

    prompt = """
You are an expert prescription-reading assistant.

Analyze the uploaded prescription image carefully.

The prescription can be:
- handwritten
- printed
- mixed handwritten and printed

Your main task is to identify the medicines written
on the prescription.

IMPORTANT:
Do NOT return an empty medicines list if a medicine
name can reasonably be read from the image.

Ignore:
- doctor name
- hospital name
- clinic name
- address
- phone number
- patient name
- patient age
- gender
- date
- registration number
- signature
- blood pressure
- weight
- unrelated notes

Return ONLY this JSON structure:

{
    "disease": "OTHER",
    "medicines": [
        {
            "medicine_name": "",
            "strength": "",
            "dosage": "",
            "frequency": "",
            "duration": "",
            "timing": "",
            "food_instruction": "",
            "reminder_time": ""
        }
    ]
}

IMPORTANT MEDICINE RULES:

1. Extract every medicine that can be reasonably read.

2. Do NOT invent a medicine that is not present.

3. If handwriting is unclear, use the most likely
medicine name only when there is reasonable evidence.

4. If the medicine name is clearly readable,
return it exactly or with normal spelling.

5. Extract strength such as:
500 mg
250 mg
10 mg
5 ml

6. Convert frequency:

OD = Once Daily
BD = Twice Daily
TDS = Three Times Daily
QID = Four Times Daily
HS = Night
SOS = As Needed

7. Convert dosage patterns:

1-0-1 = Twice Daily
1-1-1 = Three Times Daily
0-1-0 = Afternoon
0-0-1 = Night

8. Convert timing:

Morning = 08:00
Afternoon = 13:00
Evening = 18:00
Night = 21:00

9. If the exact reminder time is not written,
use the timing conversion above.

10. If frequency is not clearly written,
use an empty string.

11. If disease is explicitly written, return it.

12. If disease is not explicitly written, infer it
from the medicines only when reasonably possible.

13. If no disease can be determined, use:
OTHER

14. Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use ```json.
Do NOT add explanations.
"""


    compressed_path = None

    try:

        # ==========================================
        # OPEN IMAGE
        # ==========================================

        image = Image.open(image_path)

        print("========== PRESCRIPTION IMAGE ==========")
        print("Original size:", image.size)
        print("Image mode:", image.mode)
        print("========================================")


        # ==========================================
        # CONVERT IMAGE TO RGB
        # ==========================================

        if image.mode != "RGB":
            image = image.convert("RGB")


        # ==========================================
        # RESIZE IMAGE
        # ==========================================

        image.thumbnail((1200, 1200))


        # ==========================================
        # CREATE COMPRESSED IMAGE
        # ==========================================

        base, extension = os.path.splitext(image_path)

        compressed_path = (
            base + "_compressed.jpg"
        )


        image.save(
            compressed_path,
            "JPEG",
            quality=80,
            optimize=True
        )


        # ==========================================
        # READ IMAGE
        # ==========================================

        with open(
            compressed_path,
            "rb"
        ) as f:

            image_bytes = f.read()


        print(
            "Compressed image size:",
            len(image_bytes),
            "bytes"
        )


        # ==========================================
        # GEMINI REQUEST
        # ==========================================

        print(
            "========== SENDING TO GEMINI =========="
        )

        print(
            "Model:",
            MODEL_NAME
        )


        response = client.models.generate_content(

            model=MODEL_NAME,

            contents=[
                types.Part.from_text(
                    text=prompt
                ),

                types.Part.from_bytes(
                    data=image_bytes,
                    mime_type="image/jpeg"
                )
            ],

            config=types.GenerateContentConfig(

                temperature=0,

                response_mime_type="application/json"
            )
        )


        # ==========================================
        # READ RESPONSE
        # ==========================================

        text = response.text.strip()


        print(
            "========== GEMINI RAW RESPONSE =========="
        )

        print(text)

        print(
            "=========================================="
        )


        # ==========================================
        # REMOVE MARKDOWN IF GEMINI ADDS IT
        # ==========================================

        if text.startswith("```json"):

            text = text[
                len("```json"):
            ].strip()

            if text.endswith("```"):

                text = text[
                    :-3
                ].strip()


        elif text.startswith("```"):

            text = text[
                3:
            ].strip()

            if text.endswith("```"):

                text = text[
                    :-3
                ].strip()


        # ==========================================
        # PARSE JSON
        # ==========================================

        result = json.loads(text)


        # ==========================================
        # VALIDATE RESULT
        # ==========================================

        if not isinstance(
            result,
            dict
        ):

            raise ValueError(
                "Gemini returned invalid JSON structure."
            )


        disease = result.get(
            "disease",
            "OTHER"
        )


        medicines = result.get(
            "medicines",
            []
        )


        if not isinstance(
            medicines,
            list
        ):

            medicines = []


        # ==========================================
        # CLEAN MEDICINES
        # ==========================================

        cleaned_medicines = []


        for medicine in medicines:

            if not isinstance(
                medicine,
                dict
            ):
                continue


            medicine_name = str(
                medicine.get(
                    "medicine_name",
                    ""
                )
            ).strip()


            # Ignore empty medicine names
            if not medicine_name:
                continue


            cleaned_medicines.append({

                "medicine_name":
                    medicine_name,

                "strength":
                    str(
                        medicine.get(
                            "strength",
                            ""
                        )
                    ).strip(),

                "dosage":
                    str(
                        medicine.get(
                            "dosage",
                            ""
                        )
                    ).strip(),

                "frequency":
                    str(
                        medicine.get(
                            "frequency",
                            ""
                        )
                    ).strip(),

                "duration":
                    str(
                        medicine.get(
                            "duration",
                            ""
                        )
                    ).strip(),

                "timing":
                    str(
                        medicine.get(
                            "timing",
                            ""
                        )
                    ).strip(),

                "food_instruction":
                    str(
                        medicine.get(
                            "food_instruction",
                            ""
                        )
                    ).strip(),

                "reminder_time":
                    str(
                        medicine.get(
                            "reminder_time",
                            ""
                        )
                    ).strip(),
            })


        # ==========================================
        # FINAL RESULT
        # ==========================================

        final_result = {

            "disease":
                disease or "OTHER",

            "medicines":
                cleaned_medicines
        }


        print(
            "========== FINAL OCR RESULT =========="
        )

        print(
            json.dumps(
                final_result,
                indent=2
            )
        )

        print(
            "======================================"
        )


        return final_result


    # ==========================================
    # ERROR HANDLING
    # ==========================================

    except Exception as e:

        print(
            "========== GEMINI VISION ERROR =========="
        )

        print(
            "Error type:",
            type(e).__name__
        )

        print(
            "Error:",
            str(e)
        )

        print(
            "=========================================="
        )


        # IMPORTANT:
        # Do NOT silently pretend that the image
        # contained no medicines.

        error_text = str(e).upper()


        if (
            "503" in error_text
            or
            "UNAVAILABLE" in error_text
            or
            "RESOURCE_EXHAUSTED" in error_text
            or
            "429" in error_text
        ):

            print(
                "Gemini is temporarily unavailable."
            )


        # Let OCRUploadView receive the error.
        # It can then return the actual error to
        # the frontend instead of falsely saying
        # "No medicines detected."

        raise


    finally:

        # ==========================================
        # DELETE TEMPORARY IMAGE
        # ==========================================

        if (
            compressed_path
            and
            os.path.exists(
                compressed_path
            )
        ):

            try:

                os.remove(
                    compressed_path
                )

            except Exception:
                pass