import unittest
from app.services.ocr.medical_parser import parse_ocr_text_to_medicines, group_prescription_lines_into_blocks


class TestMultilinePrescriptionParser(unittest.TestCase):
    def test_multiline_calpol_block_merging(self):
        """Verify 4-line prescription block merges into 1 medicine with exact metadata."""
        multiline_text = (
            "Tab Calpol\n"
            "500 mg\n"
            "1-0-1\n"
            "5 Days\n"
        )
        blocks = group_prescription_lines_into_blocks(multiline_text)
        self.assertEqual(len(blocks), 1)
        self.assertIn("Calpol", blocks[0])
        self.assertIn("500 mg", blocks[0])
        self.assertIn("1-0-1", blocks[0])
        self.assertIn("5 Days", blocks[0])

        meds = parse_ocr_text_to_medicines(multiline_text)
        self.assertEqual(len(meds), 1)
        med = meds[0]
        self.assertEqual(med.medicine_name, "Paracetamol")
        self.assertEqual(med.dosage, "500 mg")
        self.assertEqual(med.frequency, "Twice daily")
        self.assertEqual(med.duration, "5 Days")

    def test_bullet_style_multiline_prescriptions(self):
        """Verify bullet points (1., 2.) with multi-line dosages and frequencies parse cleanly."""
        bullet_text = (
            "1. Tab Calpol\n"
            "   500 mg\n"
            "   1-0-1 x 5 Days\n"
            "\n"
            "2. Syp Levolin\n"
            "   3 ml\n"
            "   TDS x 5 d\n"
        )
        meds = parse_ocr_text_to_medicines(bullet_text)
        self.assertEqual(len(meds), 2)

        names = [m.medicine_name for m in meds]
        self.assertIn("Paracetamol", names)
        self.assertIn("Levosalbutamol", names)

        m1 = next(m for m in meds if m.medicine_name == "Paracetamol")
        self.assertEqual(m1.dosage, "500 mg")
        self.assertEqual(m1.frequency, "Twice daily")
        self.assertEqual(m1.duration, "5 Days")

        m2 = next(m for m in meds if m.medicine_name == "Levosalbutamol")
        self.assertEqual(m2.dosage, "3 ml")
        self.assertEqual(m2.frequency, "Three times daily")
        self.assertEqual(m2.duration, "5 d")


if __name__ == "__main__":
    unittest.main()
