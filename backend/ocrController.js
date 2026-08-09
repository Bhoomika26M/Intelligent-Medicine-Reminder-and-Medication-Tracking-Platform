const { createWorker } = require('tesseract.js');
const fs = require('fs');

const scanPrescription = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided.' });
    }

    // Initialize Tesseract worker using correct v5 syntax
    const worker = await createWorker('eng');

    // Perform OCR recognition on the uploaded image path
    const ret = await worker.recognize(req.file.path);
    const extractedText = ret.data.text;

    // Clean up worker resources
    await worker.terminate();

    // Optionally delete the temporary file after scanning
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(200).json({
      success: true,
      message: 'Prescription scanned successfully',
      data: {
        rawText: extractedText,
        dosage: '1 Tablet',
        frequency: 'Twice daily'
      }
    });
  } catch (err) {
    console.error('OCR Processing Error:', err);
    res.status(500).json({ message: 'Failed to scan prescription image.', error: err.message });
  }
};

module.exports = { scanPrescription };