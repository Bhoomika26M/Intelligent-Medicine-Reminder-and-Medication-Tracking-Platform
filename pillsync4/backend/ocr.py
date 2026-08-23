"""
Very simple OCR using pytesseract + Pillow.
Accepts an uploaded image, extracts text, and tries to guess
medicine name, dosage and quantity from the raw text.
"""
import io
import re

try:
    import pytesseract
    from PIL import Image
    OCR_AVAILABLE = True
except Exception:
    OCR_AVAILABLE = False


def extract_text(image_bytes: bytes) -> str:
    if not OCR_AVAILABLE:
        return ""
    try:
        image = Image.open(io.BytesIO(image_bytes))
        return pytesseract.image_to_string(image)
    except Exception:
        return ""


def parse_medicine_info(text: str) -> dict:
    """Best-effort parsing of raw OCR text into medicine fields."""
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    joined = " ".join(lines)

    # Dosage: look for patterns like "500 mg", "10 mg", "2 tablets"
    dosage = ""
    m = re.search(r"(\d+\s?(?:mg|ml|mcg|tablets?|capsules?))", joined, re.IGNORECASE)
    if m:
        dosage = m.group(1)

    # Quantity: look for "strip of 10", "30 tablets", "x 20"
    quantity = ""
    m = re.search(r"(\d+)\s*(?:tablets?|capsules?|pills?|strips?)", joined, re.IGNORECASE)
    if m:
        quantity = m.group(1)

    # Name: first non-numeric line that is not the dosage
    name = ""
    for line in lines:
        if not re.search(r"\d", line) and len(line) > 2:
            name = line
            break

    return {
        "name": name,
        "dosage": dosage,
        "quantity": quantity,
        "raw_text": text,
    }
