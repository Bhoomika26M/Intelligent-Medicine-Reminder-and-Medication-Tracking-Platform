import os
import json
from PIL import Image

from google import genai
from google.genai import types

client = genai.Client(
    api_key=os.getenv("GEMINI_API_KEY")
)


def analyze_prescription_image(image_path):
    """
    Analyze prescription image using Gemini Vision.
    """

    prompt = """
You are an experienced physician and prescription analysis expert.

Read the uploaded prescription image carefully.

The prescription may be:
- Handwritten
- Printed
- Mixed handwritten and printed

Ignore completely:
- Doctor name
- Hospital name
- Logo
- Address
- Phone numbers
- Registration number
- Patient name
- Age
- Gender
- Date
- Weight
- Blood Pressure
- Signature
- Follow-up notes
- Any unrelated information

Extract ONLY medicine details.

Return ONLY valid JSON.

Format:

{
  "disease":"Disease Name",
  "medicines":[
    {
      "medicine_name":"",
      "strength":"",
      "dosage":"",
      "frequency":"",
      "duration":"",
      "timing":"",
      "food_instruction":"",
      "reminder_time":""
    }
  ]
}

Rules:

1. Never invent medicines.

2. Read handwritten medicines carefully.

3. Read printed medicines carefully.

4. If disease is not written,
infer it only from medicines.

5. Convert:

OD -> Once Daily

BD -> Twice Daily

TDS -> Three Times Daily

QID -> Four Times Daily

HS -> Night

SOS -> As Needed

AC -> Before Food

PC -> After Food

6. Convert dosage patterns:

1-0-1 -> Twice Daily

1-1-1 -> Three Times Daily

0-1-0 -> Afternoon

0-0-1 -> Night

7. Extract medicine strength.

Examples:

500 mg

250 mg

10 mg

8. Extract duration.

Examples:

5 Days

7 Days

10 Days

1 Month

9. Extract timing.

Morning

Afternoon

Evening

Night

10. Reminder Time:

Morning -> 08:00

Afternoon -> 13:00

Evening -> 18:00

Night -> 21:00

If timing is unavailable keep reminder_time empty.

Return ONLY JSON.
"""

    # Compress image for faster upload
    image = Image.open(image_path)

    image.thumbnail((1200, 1200))

    compressed_path = image_path.replace(".jpg", "_compressed.jpg")

    image.save(
        compressed_path,
        "JPEG",
        quality=80,
        optimize=True,
    )

    with open(compressed_path, "rb") as f:
        image_bytes = f.read()

    response = client.models.generate_content(
        model="gemini-flash-latest",
        contents=[
            prompt,
            types.Part.from_bytes(
                data=image_bytes,
                mime_type="image/jpeg",
            ),
        ],
        config=types.GenerateContentConfig(
            temperature=0
        ),
    )

    text = response.text.strip()

    if text.startswith("```json"):
        text = text.replace("```json", "")
        text = text.replace("```", "").strip()

    elif text.startswith("```"):
        text = text.replace("```", "").strip()

    if os.path.exists(compressed_path):
        os.remove(compressed_path)

    return json.loads(text)