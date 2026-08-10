import unittest
import asyncio
from unittest.mock import patch, MagicMock
from fastapi import HTTPException
from app.services.ocr.ai_ocr_engine import (
    run_gemini_vision_verification,
    convert_gemini_response_to_medicines,
    get_known_medicine_candidates,
    select_relevant_medicine_candidates
)
from app.services.ocr.knowledge_base import match_medicine_rapidfuzz
from app.services.ocr_service import extract_prescription_data, evaluate_gemini_trigger
from app.schemas.ocr_schema import OCRExtractResponse, ExtractedMedicine, FieldConfidence
from app.routes.ocr_routes import validate_and_read_image


class TestGeminiOCRPipeline(unittest.TestCase):

    def test_in_memory_candidate_cache(self):
        """Task 1: Verify candidate list is cached in memory and reused."""
        cands1 = get_known_medicine_candidates()
        cands2 = get_known_medicine_candidates()
        self.assertIs(cands1, cands2)
        self.assertTrue(len(cands1) > 0)

    def test_select_relevant_medicine_candidates(self):
        """Task 2: Verify RapidFuzz selects Top 20-30 relevant medicine candidates based on OCR text."""
        ocr_text = "Rx: Paracetamol 500mg, Calpol tab, Dolo"
        relevant = select_relevant_medicine_candidates(ocr_text, top_k=25)
        self.assertLessEqual(len(relevant), 25)
        self.assertTrue(any("Paracetamol" in c or "Calpol" in c or "Dolo" in c for c in relevant))

    def test_no_invented_defaults(self):
        """Task 3: Verify missing fields (dosage, frequency, duration, quantity) are NOT fabricated with invented defaults."""
        sample_gemini_data = {
            "patient_name": "Jane Doe",
            "doctor_name": "Dr. Smith",
            "date": "2026-08-08",
            "medicines": [
                {
                    "name": "Amoxicillin",
                    "dosage": "",  # missing dosage
                    "frequency": None,  # missing frequency
                    "duration": "",  # missing duration
                    "quantity": None, # missing quantity
                    "instructions": ""
                }
            ]
        }

        meds = convert_gemini_response_to_medicines(sample_gemini_data)
        self.assertEqual(len(meds), 1)
        self.assertEqual(meds[0].medicine_name, "Amoxicillin")
        self.assertEqual(meds[0].dosage, "")
        self.assertIsNone(meds[0].quantity)  # quantity is None, not invented 30
        self.assertEqual(meds[0].frequency, "")
        self.assertEqual(meds[0].duration, "")
        # Essential fields missing -> needs_review MUST be True
        self.assertTrue(meds[0].needs_review)

    def test_evaluate_gemini_trigger_conditions(self):
        """Task 4: Verify multi-condition trigger logic with configurable thresholds (default 75.0%)."""
        # 1. High confidence (90%), valid fields -> trigger False
        valid_med = ExtractedMedicine(
            medicine_name="Amoxicillin",
            dosage="500mg",
            quantity=30,
            frequency="Daily",
            duration="7 days",
            confidence=0.95,
            field_confidence=FieldConfidence(name_confidence=95, dosage_confidence=95, frequency_confidence=90, duration_confidence=95),
            needs_review=False
        )
        should_trigger, reason = evaluate_gemini_trigger(ocr_conf=90.0, medicines=[valid_med])
        self.assertFalse(should_trigger)

        # 2. OCR confidence below threshold (65% < 75%) -> trigger True
        should_trigger_low_conf, _ = evaluate_gemini_trigger(ocr_conf=65.0, medicines=[valid_med])
        self.assertTrue(should_trigger_low_conf)

        # 3. Needs review flag -> trigger True
        review_med = ExtractedMedicine(
            medicine_name="Amoxicillin",
            dosage="500mg",
            quantity=30,
            frequency="Daily",
            duration="7 days",
            confidence=0.75,
            field_confidence=FieldConfidence(name_confidence=75, dosage_confidence=75, frequency_confidence=70, duration_confidence=75),
            needs_review=True
        )
        should_trigger_review, _ = evaluate_gemini_trigger(ocr_conf=90.0, medicines=[review_med])
        self.assertTrue(should_trigger_review)

    @patch("app.services.ocr.providers.vision_provider_factory.VisionProviderFactory.get_provider")
    @patch("app.services.ocr_service.run_ocr_ensemble_mode")
    @patch("app.services.ocr_service.process_image_adaptive")
    @patch("app.services.ocr_service.run_gemini_vision_verification")
    def test_pipeline_with_gemini_trigger(self, mock_gemini, mock_adaptive, mock_ensemble, mock_provider_factory):
        mock_adaptive.return_value = ([("variant1", MagicMock())], {})
        mock_ensemble.return_value = ("Amox 500", "variant1", 65.0, [])  # low confidence -> triggers Gemini
        
        mock_prov = MagicMock()
        mock_prov.initialize.return_value = True
        mock_prov.extract_prescription.return_value = ([ExtractedMedicine(medicine_name="Amoxicillin", dosage="500mg", frequency="Twice daily", duration="5 days")], 95.0, 100.0)
        mock_provider_factory.return_value = mock_prov

        mock_gemini.return_value = {
            "success": True,
            "data": {
                "patient_name": "Test Patient",
                "doctor_name": "Dr. House",
                "date": "2026-08-08",
                "medicines": [
                    {
                        "name": "Amoxicillin",
                        "dosage": "500mg",
                        "frequency": "Twice daily",
                        "duration": "5 days",
                        "instructions": "Take with water"
                    }
                ]
            }
        }

        dummy_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\x1fIDATx\x9cc\xf8\xff\xff?\x03\x00\x05\xfe\x02\xfe\xdc\xcc\x59\xe7\x00\x00\x00\x00IEND\xaeB`\x82"

        response = extract_prescription_data(dummy_bytes)
        self.assertIsInstance(response, OCRExtractResponse)
        self.assertTrue(response.success)
        self.assertTrue(len(response.medicines) > 0)
        self.assertEqual(response.medicines[0].medicine_name, "Amoxicillin")

    @patch("app.services.ocr.providers.vision_provider_factory.VisionProviderFactory.get_provider")
    @patch("app.services.ocr_service.run_ocr_ensemble_mode")
    @patch("app.services.ocr_service.process_image_adaptive")
    @patch("app.services.ocr_service.run_gemini_vision_verification")
    def test_gemini_failure_fallback(self, mock_gemini, mock_adaptive, mock_ensemble, mock_provider_factory):
        mock_adaptive.return_value = ([("variant1", MagicMock())], {})
        mock_ensemble.return_value = ("UnknownDrugX", "variant1", 60.0, [])
        
        mock_prov = MagicMock()
        mock_prov.initialize.return_value = False
        mock_provider_factory.return_value = mock_prov

        mock_gemini.return_value = {
            "success": False,
            "error": "GEMINI_API_KEY environment variable is not set.",
            "data": None
        }

        dummy_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\x1fIDATx\x9cc\xf8\xff\xff?\x03\x00\x05\xfe\x02\xfe\xdc\xcc\x59\xe7\x00\x00\x00\x00IEND\xaeB`\x82"

        response = extract_prescription_data(dummy_bytes)
        self.assertIsInstance(response, OCRExtractResponse)
        self.assertTrue(response.success)
        self.assertTrue(all(m.needs_review for m in response.medicines))

    @patch("app.services.ocr_service.run_ocr_ensemble_mode")
    @patch("app.services.ocr_service.process_image_adaptive")
    @patch("app.services.ocr_service.run_gemini_vision_verification")
    def test_no_fake_fallback_medicine(self, mock_gemini, mock_adaptive, mock_ensemble):
        """Task 1: Verify no fake Amoxicillin fallback medicine is returned when OCR fails completely."""
        mock_adaptive.return_value = ([("variant1", MagicMock())], {})
        mock_ensemble.return_value = ("", "variant1", 0.0, [])  # Complete OCR failure
        mock_gemini.return_value = {"success": False, "error": "Unrecognized image", "data": None}

        dummy_bytes = b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\rIDATx\x9cc\xf8\xff\xff?\x03\x00\x05\xfe\x02\xfe\xdc\xcc\x59\xe7\x00\x00\x00\x00IEND\xaeB`\x82"

        response = extract_prescription_data(dummy_bytes)
        self.assertIsInstance(response, OCRExtractResponse)
        self.assertFalse(response.success)
        self.assertEqual(len(response.medicines), 0)
        self.assertIn("Unable to recognize", response.message)

    def test_upload_validation_empty_file(self):
        """Task 12: Verify upload validation raises 400 for empty image bytes."""
        mock_file = MagicMock()
        mock_file.filename = "empty.png"
        mock_file.content_type = "image/png"
        
        async def mock_read():
            return b""
        
        mock_file.read = mock_read
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(validate_and_read_image(mock_file))
        self.assertEqual(cm.exception.status_code, 400)

    def test_upload_validation_large_file(self):
        """Task 12: Verify upload validation raises 413 for image > 10MB."""
        mock_file = MagicMock()
        mock_file.filename = "large.png"
        mock_file.content_type = "image/png"

        async def mock_read():
            return b"0" * (11 * 1024 * 1024)

        mock_file.read = mock_read
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(validate_and_read_image(mock_file))
        self.assertEqual(cm.exception.status_code, 413)

    def test_upload_validation_unsupported_media_type(self):
        """Task 12: Verify upload validation raises 415 for non-image MIME types."""
        mock_file = MagicMock()
        mock_file.filename = "doc.pdf"
        mock_file.content_type = "application/pdf"

        async def mock_read():
            return b"%PDF-1.4..."

        mock_file.read = mock_read
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(validate_and_read_image(mock_file))
        self.assertEqual(cm.exception.status_code, 415)

    def test_upload_validation_corrupt_image(self):
        """Task 12: Verify upload validation raises 422 for corrupt image stream."""
        mock_file = MagicMock()
        mock_file.filename = "corrupt.png"
        mock_file.content_type = "image/png"

        async def mock_read():
            return b"CORRUPTED_STREAM_DATA_STRING"

        mock_file.read = mock_read
        with self.assertRaises(HTTPException) as cm:
            asyncio.run(validate_and_read_image(mock_file))
        self.assertEqual(cm.exception.status_code, 422)

    def test_rapidfuzz_normalization(self):
        """Task 12: Verify RapidFuzz corrects OCR typos like 'Paracetaml' -> 'Paracetamol'."""
        res = match_medicine_rapidfuzz("Paracetaml")
        self.assertTrue(res["is_known"])
        self.assertEqual(res["matched_name"], "Paracetamol")

    def test_header_filtering_and_candidate_parsing(self):
        """Verify non-prescription headers are ignored and all prescription lines parsed."""
        from app.services.ocr.medical_parser import parse_ocr_text_to_medicines
        sample_ocr = (
            "Gu. mic and standard: 70008,5\n"
            "MBBS (Govt. Medical College, Thrissur)\n"
            "Ph: 8086993168\n"
            "Date: 20-9-2022\n"
            "Name: ASHVIKA Weight: 13.25 kg\n"
            "Clinical Description: URTI\n"
            "Advice:\n"
            "Syp CALPOL (250/5) 4 mL Q6H x 3 d\n"
            "Syp DELCON 3 mL TDS x 5 d\n"
            "Syp LEVOLIN 3 mL TDS x 5 d\n"
            "Syp MEFTAL-P (100/5) 3 mL SOS\n"
        )
        meds = parse_ocr_text_to_medicines(sample_ocr)
        med_names = [m.medicine_name for m in meds]
        self.assertEqual(len(meds), 4)
        self.assertIn("Paracetamol", med_names)
        self.assertTrue("Phenylephrine + Chlorpheniramine" in med_names or "Delcon" in med_names)
        self.assertTrue("Levosalbutamol" in med_names or "Levolin" in med_names)
        self.assertTrue("Mefenamic Acid" in med_names or "Meftal-p" in med_names)


if __name__ == "__main__":
    unittest.main()
