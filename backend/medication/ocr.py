import re
import pytesseract
from PIL import Image

# Path to Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)


def extract_text(image_path):
    """
    Extract text from image using Tesseract OCR.
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        return f"OCR Error: {str(e)}"

def extract_medicines(text):
    medicines = []

    # Detect disease once from the full prescription
    detected_disease = detect_disease(text)

    ignore_words = [
        "prescription", "patient", "doctor", "physician", "hospital",
        "clinic", "address", "phone", "email", "gender", "age",
        "date", "birth", "allergies", "condition", "purpose",
        "route", "frequency", "signature", "name",
        "registration", "reg", "pulse",
        "weight", "height"
    ]

    disease_map = {
        "dolo": "FEVER",
        "paracetamol": "FEVER",
        "crocin": "FEVER",

        "metformin": "DIABETES",
        "glycomet": "DIABETES",
        "glimepiride": "DIABETES",

        "amlodipine": "BP",
        "telmisartan": "BP",
        "losartan": "BP",

        "thyronorm": "THYROID",
        "eltroxin": "THYROID",

        "becosules": "VITAMINS",
        "revital": "VITAMINS",
        "supradyn": "VITAMINS",
    }

    lines = text.split("\n")

    for line in lines:

        line = line.strip()

        if len(line) < 5:
            continue

        lower = line.lower()

        if any(word in lower for word in ignore_words):
            continue

        if not re.search(
            r"(tablet|tablets|capsule|capsules|mg|ml|every|once|daily)",
            lower,
        ):
            continue

        dosage = ""

        dosage_match = re.search(
            r"(\d+\s*(tablet|tablets|capsule|capsules|mg|ml))",
            line,
            re.IGNORECASE,
        )

        if dosage_match:
            dosage = dosage_match.group(1)

        frequency = ""

        frequency_match = re.search(
            r"(Every\s+\d+\s+hours?|Once\s+a\s+day|Twice\s+a\s+day|Daily)",
            line,
            re.IGNORECASE,
        )

        if frequency_match:
            frequency = frequency_match.group(1)

        medicine_name = line

        if dosage:
            medicine_name = medicine_name.replace(dosage, "")

        if frequency:
            medicine_name = medicine_name.replace(frequency, "")

        medicine_name = medicine_name.replace("Oral", "")
        medicine_name = re.sub(r"\s+", " ", medicine_name).strip(" .,-")

        # Use prescription disease first
        disease = detected_disease

        # If not found, infer from medicine name
        if disease == "OTHER":
            for med, dis in disease_map.items():
                if med in medicine_name.lower():
                    disease = dis
                    break

        medicines.append({
            "medicine_name": medicine_name,
            "disease": disease,
            "dosage": dosage,
            "frequency": frequency,
        })

    return medicines
import re

def detect_disease(text):
    text = text.lower()

    disease_keywords = {

        "DIABETES": [
            "diabetes", "diabetes mellitus", "diabetic",
            "dm", "metformin", "glycomet",
            "glimepiride", "insulin"
        ],

        "BP": [
            "hypertension", "high blood pressure",
            "blood pressure", "htn",
            "amlodipine", "telmisartan",
            "losartan"
        ],

        "THYROID": [
            "thyroid", "hypothyroidism",
            "hyperthyroidism",
            "thyronorm", "eltroxin"
        ],

        "FEVER": [
            "fever", "viral fever",
            "pyrexia",
            "paracetamol", "crocin",
            "dolo"
        ],

        "COLD": [
            "cold", "cough",
            "sneezing", "runny nose",
            "cetirizine", "levocetirizine"
        ],

        "ASTHMA": [
            "asthma",
            "bronchial asthma",
            "salbutamol",
            "budesonide"
        ],

        "HEART": [
            "heart", "cardiac",
            "angina", "atorvastatin",
            "ecosprin"
        ],

        "GASTRIC": [
            "gastric",
            "acidity",
            "gastritis",
            "pantoprazole",
            "rabeprazole",
            "omeprazole"
        ],

        "PAIN": [
            "pain",
            "diclofenac",
            "aceclofenac",
            "ibuprofen"
        ],

        "INFECTION": [
            "infection",
            "amoxicillin",
            "azithromycin",
            "cefixime",
            "antibiotic"
        ],

        "VITAMINS": [
            "vitamin",
            "becosules",
            "supradyn",
            "revital",
            "vitamin deficiency",
            "b12 deficiency",
            "vitamin d deficiency"
        ]
    }

    for disease, keywords in disease_keywords.items():
        for keyword in keywords:
            if keyword in text:
                return disease

    return "OTHER"