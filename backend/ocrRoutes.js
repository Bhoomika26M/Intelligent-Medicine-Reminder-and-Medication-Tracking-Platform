const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');

// Automatically create 'uploads' folder if it doesn't exist
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const upload = multer({ dest: uploadDir });
const { scanPrescription } = require('./ocrController');

router.post('/scan', upload.single('image'), scanPrescription);

module.exports = router;