import React, { useState } from 'react';
import axios from 'axios';

export default function ScanPrescription() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return alert('Please select an image first.');

    const formData = new FormData();
    formData.append('image', file);

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/ocr/scan', formData);
      // Handles both direct data objects or nested res.data.data structures safely
      const resultData = res.data.data || res.data;
      setOcrResult(resultData);
    } catch (err) {
      console.error('OCR Error Details:', err.response);
      const serverMessage = err.response?.data?.message || err.response?.data?.error;
      alert(serverMessage ? `Backend Error: ${serverMessage}` : 'Failed to scan prescription image.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h2>OCR Medicine Scanner</h2>
      <p style={{ color: '#64748b' }}>Upload a prescription image to extract dosage and frequency.</p>

      <div style={{ border: '2px dashed #cbd5e1', padding: '2rem', textAlign: 'center', borderRadius: '8px', marginBottom: '1.5rem' }}>
        <input type="file" onChange={handleFileChange} style={{ marginBottom: '1rem' }} />
        <br />
        <button
          onClick={handleUpload}
          disabled={loading}
          style={{ backgroundColor: '#0284c7', color: 'white', padding: '0.75rem 1.5rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          {loading ? 'Processing OCR...' : 'Scan Prescription'}
        </button>
      </div>

      {ocrResult && (
        <div style={{ backgroundColor: '#f1f5f9', padding: '1.5rem', borderRadius: '8px' }}>
          <h3>Scan Results</h3>
          <p><strong>Dosage:</strong> {ocrResult.dosage || 'N/A'}</p>
          <p><strong>Frequency:</strong> {ocrResult.frequency || 'N/A'}</p>
          <p><strong>Raw Text:</strong></p>
          <pre style={{ backgroundColor: '#e2e8f0', padding: '1rem', borderRadius: '4px', whiteSpace: 'pre-wrap' }}>
            {ocrResult.rawText || JSON.stringify(ocrResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}