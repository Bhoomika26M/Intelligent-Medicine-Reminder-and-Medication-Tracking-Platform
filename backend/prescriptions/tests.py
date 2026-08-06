from django.test import SimpleTestCase

from prescriptions.ocr_service import extract_medication_details


class OCRServiceTests(SimpleTestCase):
    def test_extract_medication_details_from_printed_text(self):
        text = "Aspirin 100 mg\nTake 1 tablet twice daily\nFor 7 days"

        result = extract_medication_details(text, source="printed")

        self.assertEqual(result["medicine_name"], "Aspirin")
        self.assertEqual(result["dosage"], "100 mg")
        self.assertEqual(result["frequency"], "Twice daily")
        self.assertEqual(result["duration"], "7 days")
