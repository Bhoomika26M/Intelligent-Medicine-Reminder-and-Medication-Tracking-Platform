import unittest
from app.utils.medicine_validator import (
    evaluate_medicine_validation,
    validate_medicine_name,
    parse_brand_and_generic
)


class TestMedicineValidationEngine(unittest.TestCase):

    def test_1_calpol_verified(self):
        """TEST 1: 'CALPOL' brand name must be VERIFIED."""
        res = evaluate_medicine_validation("CALPOL")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])

    def test_2_calpol_paracetamol_verified(self):
        """TEST 2: 'CALPOL (Paracetamol)' brand + generic format must be VERIFIED."""
        res = evaluate_medicine_validation("CALPOL (Paracetamol)")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["brand"], "CALPOL")
        self.assertEqual(res["generic"], "Paracetamol")

    def test_3_meftal_p_verified(self):
        """TEST 3: 'MEFTAL-P' brand name must be VERIFIED."""
        res = evaluate_medicine_validation("MEFTAL-P")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])

    def test_4_meftal_p_mefenamic_acid_verified(self):
        """TEST 4: 'MEFTAL-P (Mefenamic Acid)' brand + generic format must be VERIFIED."""
        res = evaluate_medicine_validation("MEFTAL-P (Mefenamic Acid)")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])
        self.assertEqual(res["brand"], "MEFTAL-P")

    def test_5_delcon_verified(self):
        """TEST 5: 'DELCON' brand name must be VERIFIED."""
        res = evaluate_medicine_validation("DELCON")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])

    def test_6_delcon_phenylephrine_chlorpheniramine_verified(self):
        """TEST 6: 'DELCON (Phenylephrine + Chlorpheniramine)' must be VERIFIED."""
        res = evaluate_medicine_validation("DELCON (Phenylephrine + Chlorpheniramine)")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])

    def test_7_levolin_verified(self):
        """TEST 7: 'LEVOLIN' brand name must be VERIFIED."""
        res = evaluate_medicine_validation("LEVOLIN")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])

    def test_8_unknown_plausible_medicine_preserved(self):
        """TEST 8: Plausible unknown medicine 'CustomMedX 250mg' -> PLAUSIBLE_UNKNOWN (is_verified=False, is_valid=True)."""
        res = evaluate_medicine_validation("CustomMedX 250mg")
        self.assertEqual(res["status"], "PLAUSIBLE_UNKNOWN")
        self.assertFalse(res["is_verified"])
        self.assertTrue(res["is_valid"])  # Valid for medicine creation, not rejected with 400

    def test_9_m_and_fi_solution_rejected(self):
        """TEST 9: Standalone compounding phrase 'M & FI Solution' -> REJECTED."""
        res = evaluate_medicine_validation("M & FI Solution")
        self.assertEqual(res["status"], "REJECTED")
        self.assertFalse(res["is_verified"])
        self.assertFalse(res["is_valid"])

    def test_10_dd_form_1289_rejected(self):
        """TEST 10: Form header 'DD Form 1289' -> REJECTED."""
        res = evaluate_medicine_validation("DD Form 1289")
        self.assertEqual(res["status"], "REJECTED")
        self.assertFalse(res["is_verified"])
        self.assertFalse(res["is_valid"])

    def test_11_case_and_whitespace_variations(self):
        """TEST 11: Case & whitespace variations '  calpol  (paracetamol)  ' -> VERIFIED."""
        res = evaluate_medicine_validation("  calpol  (paracetamol)  ")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])

    def test_12_brand_generic_normalization(self):
        """TEST 12: Generic + Brand parenthetical format 'Paracetamol (CALPOL)' -> VERIFIED."""
        res = evaluate_medicine_validation("Paracetamol (CALPOL)")
        self.assertEqual(res["status"], "VERIFIED")
        self.assertTrue(res["is_verified"])
        self.assertTrue(res["is_valid"])


if __name__ == "__main__":
    unittest.main()
