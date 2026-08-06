import re
from typing import Any, Dict, List, Optional

try:
    import easyocr
except ImportError:  # pragma: no cover
    easyocr = None

try:
    import numpy as np
except ImportError:  # pragma: no cover
    np = None

try:
    from PIL import Image
except ImportError:  # pragma: no cover
    Image = None

try:
    from transformers import AutoProcessor, VisionEncoderDecoderModel
except ImportError:  # pragma: no cover
    AutoProcessor = None
    VisionEncoderDecoderModel = None


def extract_medication_details(text: str, source: str = "printed") -> Dict[str, Any]:
    normalized = re.sub(r"\s+", " ", text or "").strip()
    medicines = extract_medication_items(text, source=source)

    primary = medicines[0] if medicines else {}

    medicine_name = primary.get("medicine_name") or "Unclear"
    dosage = primary.get("dosage") or ""
    frequency = primary.get("frequency") or ""
    duration = primary.get("duration") or ""

    return {
        "medicine_name": medicine_name,
        "dosage": dosage,
        "frequency": frequency,
        "duration": duration,
        "medicines": medicines,
        "ocr_text": normalized,
        "source": source,
    }


def extract_medication_items(text: str, source: str = "printed") -> List[Dict[str, Any]]:
    lines = [line.strip() for line in (text or "").splitlines() if line.strip()]
    items: List[Dict[str, Any]] = []

    for line in lines:
        lower_line = line.lower()
        if not any(
            keyword in lower_line
            for keyword in [
                "take",
                "tablet",
                "capsule",
                "mg",
                "mcg",
                "ml",
                "g",
                "od",
                "bid",
                "tid",
                "daily",
                "weekly",
                "monthly",
                "for",
                "days",
                "day",
                "week",
                "weeks",
                "month",
                "months",
            ]
        ):
            continue

        medicine_name = _extract_medicine_name(line)
        dosage = _extract_dosage(line)
        frequency = _extract_frequency(line)
        duration = _extract_duration(line)

        if not any([medicine_name, dosage, frequency, duration]):
            continue

        item = {
            "medicine_name": medicine_name or "Unclear",
            "dosage": dosage or "",
            "frequency": frequency or "",
            "duration": duration or "",
            "source": source,
            "text": line,
        }

        signature = (item["medicine_name"].lower(), item["dosage"].lower(), item["frequency"].lower())
        if any(
            (existing["medicine_name"].lower(), existing["dosage"].lower(), existing["frequency"].lower()) == signature
            for existing in items
        ):
            continue

        items.append(item)

    if not items and lines:
        items.append(
            {
                "medicine_name": _extract_medicine_name(lines[0]) or "Unclear",
                "dosage": _extract_dosage(" ".join(lines)) or "",
                "frequency": _extract_frequency(" ".join(lines)) or "",
                "duration": _extract_duration(" ".join(lines)) or "",
                "source": source,
                "text": lines[0],
            }
        )

    return _merge_related_items(items)


def _merge_related_items(items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    if not items:
        return []

    merged_items: List[Dict[str, Any]] = []
    for item in items:
        if not merged_items:
            merged_items.append(item.copy())
            continue

        current = merged_items[-1]
        if item.get("medicine_name") and item["medicine_name"] != "Unclear":
            current_medicine = (current.get("medicine_name") or "").lower()
            item_medicine = item["medicine_name"].lower()
            if not current_medicine or current_medicine == "unclear":
                current["medicine_name"] = item["medicine_name"]
            elif current_medicine != item_medicine:
                merged_items.append(item.copy())
                continue

        if not current.get("dosage") and item.get("dosage"):
            current["dosage"] = item["dosage"]
        if not current.get("frequency") and item.get("frequency"):
            current["frequency"] = item["frequency"]
        if not current.get("duration") and item.get("duration"):
            current["duration"] = item["duration"]

        if item.get("text"):
            combined_text = [current.get("text", ""), item.get("text", "")]
            current["text"] = "\n".join(part for part in combined_text if part).strip()

    return merged_items


def _extract_medicine_name(text: str) -> str:
    cleaned = text.strip()
    if not cleaned:
        return ""

    dosage_match = re.search(r"(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml))", cleaned, flags=re.IGNORECASE)
    if dosage_match:
        prefix = cleaned[: dosage_match.start()].strip()
        prefix = re.sub(r"^(take|take\s+)?", "", prefix, flags=re.IGNORECASE).strip()
        prefix = re.sub(r"\b(tablet|tablets|capsule|capsules|syrup|drops|drop|injection)\b", "", prefix, flags=re.IGNORECASE).strip()
        if prefix:
            return prefix.title()

    candidates = [part for part in re.split(r"[\n:;]", cleaned) if part.strip()]
    for candidate in candidates:
        lowered = candidate.lower()
        if any(token in lowered for token in ["take", "for", "days", "daily", "mg", "mcg", "ml", "tablet", "capsule", "syrup", "drop", "injection"]):
            continue
        if re.match(r"^[A-Za-z][A-Za-z\s-]+$", candidate.strip()):
            cleaned_name = re.sub(r"\b(take|tablet|tablets|capsule|capsules|syrup|drops|drop|injection)\b", "", candidate, flags=re.IGNORECASE).strip()
            if cleaned_name:
                return cleaned_name.title()
    return ""


def _extract_dosage(text: str) -> str:
    match = re.search(r"(\d+(?:\.\d+)?\s*(?:mg|mcg|g|ml))", text, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip()

    match = re.search(r"(\d+\s*(?:tablet|tablets|capsule|capsules|drop|drops))", text, flags=re.IGNORECASE)
    if match:
        return match.group(1).strip()
    return ""


def _extract_frequency(text: str) -> str:
    lowered = text.lower()
    if re.search(r"\b(twice|2 times|2x|bid)\b", lowered) and ("daily" in lowered or "day" in lowered):
        return "Twice daily"
    if re.search(r"\b(once|1 time|1x|od)\b", lowered) and ("daily" in lowered or "day" in lowered):
        return "Once daily"
    if re.search(r"\b(three|3 times|3x|thrice|tid)\b", lowered) and ("daily" in lowered or "day" in lowered):
        return "Three times daily"
    if re.search(r"\b(bid|twice daily)\b", lowered):
        return "Twice daily"
    if re.search(r"\b(od|once daily)\b", lowered):
        return "Once daily"
    if re.search(r"\b(tid|three times daily)\b", lowered):
        return "Three times daily"
    if "daily" in lowered:
        return "Daily"
    if "every" in lowered and "hour" in lowered:
        return text.strip()
    return ""


def _extract_duration(text: str) -> str:
    match = re.search(r"\bfor\s+(\d+)\s+(day|days|week|weeks|month|months)\b", text, flags=re.IGNORECASE)
    if match:
        return f"{match.group(1)} {match.group(2)}"
    return ""


def run_ocr(image_file, source: str = "printed") -> Dict[str, Any]:
    if source == "printed":
        result = _run_printed_ocr(image_file)
    else:
        result = _run_handwritten_ocr(image_file)

    result["ocr_available"] = bool(result.get("ocr_text"))
    return result


def _run_printed_ocr(image_file) -> Dict[str, Any]:
    if easyocr is None or np is None or Image is None:
        text = ""
    else:
        reader = easyocr.Reader(["en"], gpu=False)
        image = Image.open(image_file).convert("RGB")
        image_array = np.array(image)
        text_lines = reader.readtext(image_array, detail=0, paragraph=True)
        text = "\n".join(text_lines)
    return extract_medication_details(text, source="printed")


def _run_handwritten_ocr(image_file) -> Dict[str, Any]:
    if AutoProcessor is None or VisionEncoderDecoderModel is None or Image is None:
        text = ""
    else:
        try:
            processor = AutoProcessor.from_pretrained("microsoft/trocr-base-handwritten")
            model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")
            image = Image.open(image_file).convert("RGB")
            pixel_values = processor(images=image, return_tensors="pt").pixel_values
            generated_ids = model.generate(pixel_values)
            text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
        except Exception:
            text = ""
    return extract_medication_details(text, source="handwritten")
