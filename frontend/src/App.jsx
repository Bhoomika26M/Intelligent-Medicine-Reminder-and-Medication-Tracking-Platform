import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard'; // Make sure to import it
import ScanPrescription from './pages/ScanPrescription';
import Analytics from './pages/Analytics';

export default function App() {
  return (
    <Router>
      {/* Tailwind classes replacing the inline styles */}
      <div className="min-h-screen bg-gray-50 font-sans">
        <Navbar />
        <Routes>
          {/* Milestone 1: The Main Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Milestone 2: OCR Scanner */}
          <Route path="/scan" element={<ScanPrescription />} />
          
          {/* Milestone 3: Analytics & Refills */}
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </div>
    </Router>
  );
}