import unittest
import numpy as np
import cv2
import time
from app.services.ocr.block_segmenter import segment_prescription_blocks


def create_synthetic_prescription_image(lines: list, is_handwritten: bool = False, bg_color: int = 245) -> np.ndarray:
    """Helper to synthesize test prescription images with text lines."""
    img = np.full((800, 600), bg_color, dtype=np.uint8)
    # Header letterhead noise at top
    cv2.putText(img, "DR. NITHIN NARAYANAN MBBS MD", (30, 40), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 50, 1)
    cv2.putText(img, "Reg No: 52547 Ph: 8086993168", (30, 65), cv2.FONT_HERSHEY_SIMPLEX, 0.5, 50, 1)
    cv2.line(img, (20, 80), (580, 80), 100, 1)

    y = 140
    font = cv2.FONT_HERSHEY_SIMPLEX if not is_handwritten else cv2.FONT_HERSHEY_SCRIPT_SIMPLEX
    scale = 0.65 if not is_handwritten else 0.75

    for line in lines:
        if line.strip():
            cv2.putText(img, line, (50, y), font, scale, 20, 2)
        y += 45

    # Footer signature noise at bottom
    cv2.putText(img, "Doctor Signature / Stamp", (380, 750), cv2.FONT_HERSHEY_SIMPLEX, 0.5, 80, 1)
    return img


class TestMedicineBlockSegmenter(unittest.TestCase):

    def test_printed_prescription(self):
        """Test block segmentation on a clean printed prescription."""
        lines = [
            "Tab Calpol 500mg 1-0-1 5 Days",
            "Syp Levolin 3ml TDS x 5d",
            "Cap Amoxicillin 500mg BD x 7d"
        ]
        img = create_synthetic_prescription_image(lines, is_handwritten=False)
        crops, meta = segment_prescription_blocks(img, debug=False)

        self.assertGreater(meta["block_count"], 0)
        self.assertFalse(meta["fallback_used"])
        self.assertLess(meta["execution_time_ms"], 150.0)

    def test_handwritten_prescription(self):
        """Test block segmentation on a handwritten prescription."""
        lines = [
            "Syp CALPOL (250/5) 4 mL Q6H",
            "Syp DELCON 3 mL TDS",
            "Syp LEVOLIN 3 mL TDS"
        ]
        img = create_synthetic_prescription_image(lines, is_handwritten=True)
        crops, meta = segment_prescription_blocks(img, debug=False)

        self.assertGreater(meta["block_count"], 0)
        self.assertLess(meta["execution_time_ms"], 150.0)

    def test_single_medicine(self):
        """Test segmentation when prescription contains only a single medicine."""
        lines = ["Tab Dolo 650mg 1-0-1 for 3 days"]
        img = create_synthetic_prescription_image(lines)
        crops, meta = segment_prescription_blocks(img)

        self.assertGreaterEqual(meta["block_count"], 1)
        self.assertFalse(meta["fallback_used"])

    def test_multiple_medicines(self):
        """Test segmentation with multiple distinct medicine blocks."""
        lines = [
            "1. Tab Calpol 500mg",
            "2. Syp Levolin 3ml",
            "3. Tab Meftal-P 500mg",
            "4. Cap Amoxicillin 500mg"
        ]
        img = create_synthetic_prescription_image(lines)
        crops, meta = segment_prescription_blocks(img)

        self.assertGreaterEqual(meta["block_count"], 2)

    def test_bullet_prescriptions(self):
        """Test bullet style prescription text (1., 2., •)."""
        lines = [
            "1. Tab Calpol 500 mg",
            "2. Syp Levolin 3 ml",
            "3. Syp Meftal-P 3 ml"
        ]
        img = create_synthetic_prescription_image(lines)
        crops, meta = segment_prescription_blocks(img)

        self.assertGreaterEqual(meta["block_count"], 1)

    def test_multi_line_medicines(self):
        """Test merging multi-line medicine blocks (dosage & frequency on next line)."""
        lines = [
            "Tab Calpol",
            "500 mg",
            "1-0-1 x 5 Days",
            "",
            "Syp Levolin",
            "3 ml TDS"
        ]
        img = create_synthetic_prescription_image(lines)
        crops, meta = segment_prescription_blocks(img)

        self.assertGreaterEqual(meta["block_count"], 1)

    def test_blank_image_fallback(self):
        """Test fallback triggered on completely blank/empty image."""
        img = np.full((600, 600), 255, dtype=np.uint8)
        crops, meta = segment_prescription_blocks(img)

        self.assertTrue(meta["fallback_used"])
        self.assertEqual(len(crops), 1)

    def test_low_contrast(self):
        """Test robustness on low contrast prescription image."""
        img = np.full((600, 600), 200, dtype=np.uint8)
        cv2.putText(img, "Tab Calpol 500mg 1-0-1", (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 0.6, 180, 1)
        crops, meta = segment_prescription_blocks(img)

        self.assertGreater(len(crops), 0)

    def test_skewed_prescription(self):
        """Test segmentation on skewed image."""
        lines = ["Tab Calpol 500mg", "Syp Levolin 3ml"]
        base_img = create_synthetic_prescription_image(lines)
        h, w = base_img.shape
        M = cv2.getRotationMatrix2D((w // 2, h // 2), 3.0, 1.0)
        skewed_img = cv2.warpAffine(base_img, M, (w, h), borderValue=245)

        crops, meta = segment_prescription_blocks(skewed_img)
        self.assertGreater(len(crops), 0)

    def test_no_medicine_detected_fallback(self):
        """Test automatic fallback when no valid medicine blocks can be segmented."""
        img = np.full((500, 500), 255, dtype=np.uint8)
        cv2.circle(img, (250, 250), 3, 0, -1)  # Tiny dot noise only
        crops, meta = segment_prescription_blocks(img)

        self.assertTrue(meta["fallback_used"])
        self.assertEqual(len(crops), 1)

    def test_performance_benchmark(self):
        """Test that segmentation executes in under 150 ms per image."""
        lines = [
            "Syp CALPOL (250/5) 4 mL Q6H",
            "Syp DELCON 3 mL TDS",
            "Syp LEVOLIN 3 mL TDS",
            "Syp MEFTAL-P (100/5) 3 mL SOS"
        ]
        img = create_synthetic_prescription_image(lines)

        t0 = time.time()
        crops, meta = segment_prescription_blocks(img)
        t_elapsed_ms = (time.time() - t0) * 1000.0

        self.assertLess(t_elapsed_ms, 150.0, f"Segmentation took {t_elapsed_ms:.1f} ms, target < 150 ms")


if __name__ == "__main__":
    unittest.main()
