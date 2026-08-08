import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUploadCloud, 
  FiCamera, 
  FiFileText, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiRefreshCw,
  FiArrowRight,
  FiPlus,
  FiVideo
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const Ocr = () => {
  const navigate = useNavigate();
  
  // OCR states
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [ocrText, setOcrText] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  
  // Camera refs
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  
  // Form fields for correction
  const [medForm, setMedForm] = useState({
    name: "",
    disease: "",
    disease_category: "Other",
    dosage: "",
    medicine_type: "Pill",
    morning: false,
    afternoon: false,
    night: false,
    before_food: false,
    after_food: false,
    frequency: "Daily",
    instructions: "",
    quantity: 30,
    remaining_stock: 30,
    start_date: new Date().toISOString().split('T')[0],
    end_date: (() => {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      return d.toISOString().split('T')[0];
    })(),
    reminder_time: "08:00",
    doctor_name: ""
  });

  const [savingMed, setSavingMed] = useState(false);

  // Synchronize custom reminder times based on schedule checkboxes
  useEffect(() => {
    if (!extractedData) return;
    const times = [];
    if (medForm.morning) times.push("08:00");
    if (medForm.afternoon) times.push("13:00");
    if (medForm.night) times.push("20:00");
    
    if (times.length > 0) {
      setMedForm(prev => ({ ...prev, reminder_time: times.join(", ") }));
    }
  }, [medForm.morning, medForm.afternoon, medForm.night, extractedData]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      setFile(droppedFile);
      setPreviewUrl(URL.createObjectURL(droppedFile));
      stopCamera();
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      stopCamera();
    }
  };

  // Camera Actions
  const startCamera = async () => {
    setCameraError("");
    setIsCameraActive(true);
    setPreviewUrl(null);
    setFile(null);
    
    try {
      const constraints = {
        video: { facingMode: 'environment' } // prefer back camera on mobile
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access failed:", err);
      setCameraError("Unable to access local camera stream. Please upload an image instead.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const capturedFile = new File([blob], "camera_capture.png", { type: "image/png" });
        setFile(capturedFile);
        setPreviewUrl(URL.createObjectURL(capturedFile));
        stopCamera();
        toast.success("Prescription captured successfully!");
      }, 'image/png');
    }
  };

  // OCR Processing
  const runOCR = async () => {
    if (!file) {
      toast.error("Please upload or capture a prescription first.");
      return;
    }

    setScanning(true);
    setExtractedData(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await api.post("/ocr/extract", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const { status, raw_text, extracted_data } = res.data;
      if (status === "success") {
        setOcrText(raw_text);
        setExtractedData(extracted_data);
        // Set form fields based on extraction
        setMedForm(prev => ({
          ...prev,
          ...extracted_data
        }));
        toast.success("Prescription details extracted successfully!");
      }
    } catch (err) {
      console.error("OCR scan failure:", err);
      toast.error(err.response?.data?.detail || "Failed to scan prescription. Try again.");
    } finally {
      setScanning(false);
    }
  };

  // Save parsed medication
  const handleSaveMedication = async (e) => {
    e.preventDefault();
    setSavingMed(true);
    try {
      const payload = {
        ...medForm,
        quantity: parseInt(medForm.quantity, 10),
        remaining_stock: parseInt(medForm.remaining_stock, 10),
        doctor: medForm.doctor_name // Map schema doctor field
      };

      await api.post("/medicines", payload);
      toast.success(`"${medForm.name}" added to your medication list!`);
      navigate("/medicines");
    } catch (err) {
      console.error("Save medication failure:", err);
      toast.error(err.response?.data?.detail || "Failed to save medication. Check fields.");
    } finally {
      setSavingMed(false);
    }
  };

  // Reset scanner
  const resetScanner = () => {
    setFile(null);
    setPreviewUrl(null);
    setExtractedData(null);
    setOcrText("");
    stopCamera();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white dark:text-white flex items-center gap-2">
          <FiCamera className="text-blue-600 animate-pulse" /> AI Prescription Scanner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
          Scan paper prescriptions or medicine bottle cards with Tesseract OCR to automatically add medications to your schedule.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Side: Upload & Capture Pane */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[450px]">
          
          <div className="space-y-4 flex-1 flex flex-col">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Prescription Media Input</h3>
            
            {/* Input Toggle Options */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={startCamera}
                className={`flex-1 inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold border transition-all cursor-pointer ${
                  isCameraActive 
                    ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                    : 'bg-slate-50 dark:bg-[#1E293B] border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                <FiVideo /> Use Camera
              </button>
              
              <button
                type="button"
                onClick={resetScanner}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer"
              >
                <FiRefreshCw /> Reset
              </button>
            </div>

            {/* Main Interactive Screen */}
            <div className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-center overflow-hidden min-h-[300px] relative bg-slate-50/50 dark:bg-[#0B1220]/20">
              
              {/* Camera Active View */}
              {isCameraActive && (
                <div className="absolute inset-0 flex flex-col justify-between p-4 bg-black">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="h-14 w-14 rounded-full border-4 border-white bg-red-500 shadow-lg hover:scale-105 active:scale-95 transition-transform flex items-center justify-center text-white cursor-pointer"
                      title="Capture Photo"
                    >
                      <div className="h-6 w-6 rounded-full bg-white"></div>
                    </button>
                  </div>
                </div>
              )}

              {/* Preview Uploaded / Captured Image */}
              {previewUrl && (
                <div className="absolute inset-0 bg-slate-950 flex items-center justify-center relative">
                  <img 
                    src={previewUrl} 
                    alt="Prescription preview" 
                    className="max-h-full max-w-full object-contain"
                  />
                  {scanning && (
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 to-teal-400 shadow-[0_0_15px_rgba(37,99,235,0.7)] animate-ocrScan"></div>
                  )}
                </div>
              )}

              {/* Upload Drag & Drop Prompt (Default View) */}
              {!isCameraActive && !previewUrl && (
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 cursor-pointer"
                  onClick={() => document.getElementById('ocr-file-input').click()}
                >
                  <input
                    type="file"
                    id="ocr-file-input"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <div className="h-16 w-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 text-3xl">
                    <FiUploadCloud />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Drag & Drop prescription scan here
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Supports JPG, PNG, WebP up to 10MB
                    </p>
                  </div>
                  <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1.5 rounded-xl font-bold border border-blue-100 dark:border-blue-800">
                    Browse File System
                  </span>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl border border-rose-100 dark:border-rose-800 flex items-center gap-2">
                <FiAlertCircle className="shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-50 dark:border-slate-700 mt-4 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {file ? `File: ${file.name}` : "No file uploaded or captured"}
            </div>
            
            <button
              onClick={runOCR}
              disabled={!file || scanning}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
            >
              {scanning ? (
                <>
                  <FiRefreshCw className="animate-spin" /> Scanning Prescription...
                </>
              ) : (
                <>
                  Scan with Tesseract OCR <FiArrowRight />
                </>
              )}
            </button>
          </div>

        </div>

        {/* Right Side: Extracted Results & Autofill Form */}
        <div className="bg-white dark:bg-[#1E293B] border border-slate-100 dark:border-slate-700 rounded-2xl p-6 shadow-sm min-h-[450px]">
          
          <AnimatePresence mode="wait">
            {!extractedData ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full flex flex-col items-center justify-center py-20 text-center space-y-4"
              >
                <div className="h-16 w-16 bg-slate-50 dark:bg-[#1E293B]/50 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-600 text-3xl">
                  <FiFileText />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Awaiting Scanner Data</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto leading-normal mt-1.5">
                    Upload or capture a photo of a doctor's prescription card and click the scan button to extract schedules automatically.
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-50 dark:border-slate-700 pb-3">
                  <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
                    <FiCheckCircle />
                    <span>Details Extracted</span>
                  </div>
                  <span className="text-[10px] text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded font-bold">
                    Confidence High
                  </span>
                </div>

                <form onSubmit={handleSaveMedication} className="space-y-4">
                  {/* Medicine Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      value={medForm.name}
                      onChange={(e) => setMedForm({ ...medForm, name: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>

                  {/* Doctor & Illness */}
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prescribing Doctor
                      </label>
                      <input
                        type="text"
                        value={medForm.doctor_name}
                        onChange={(e) => setMedForm({ ...medForm, doctor_name: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Illness / Disease
                      </label>
                      <input
                        type="text"
                        value={medForm.disease}
                        onChange={(e) => setMedForm({ ...medForm, disease: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Dosage & Category */}
                  <div className="grid gap-4 grid-cols-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={medForm.dosage}
                        onChange={(e) => setMedForm({ ...medForm, dosage: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Form Type
                      </label>
                      <select
                        value={medForm.medicine_type}
                        onChange={(e) => setMedForm({ ...medForm, medicine_type: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none"
                      >
                        <option value="Pill">Pill</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Injection">Injection</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Category
                      </label>
                      <select
                        value={medForm.disease_category}
                        onChange={(e) => setMedForm({ ...medForm, disease_category: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none"
                      >
                        <option value="Cardiovascular">Cardiovascular</option>
                        <option value="Diabetes">Diabetes</option>
                        <option value="Antibiotics">Antibiotics</option>
                        <option value="Vitamins">Vitamins</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Stock Pack Details */}
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Pack Size Quantity *
                      </label>
                      <input
                        type="number"
                        value={medForm.quantity}
                        onChange={(e) => setMedForm({ ...medForm, quantity: parseInt(e.target.value, 10), remaining_stock: parseInt(e.target.value, 10) })}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Initial Stock Remaining
                      </label>
                      <input
                        type="number"
                        value={medForm.remaining_stock}
                        onChange={(e) => setMedForm({ ...medForm, remaining_stock: parseInt(e.target.value, 10) })}
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Dosage Schedule Intervals */}
                  <div className="rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0B1220]/20 p-3 space-y-2">
                    <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                      Extracted Alarm Schedule
                    </label>
                    <div className="grid gap-2 grid-cols-3 sm:grid-cols-5">
                      <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={medForm.morning} 
                          onChange={(e) => setMedForm({ ...medForm, morning: e.target.checked })}
                          className="h-3.5 w-3.5 rounded text-blue-600" 
                        />
                        <span>Morning</span>
                      </label>
                      <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={medForm.afternoon} 
                          onChange={(e) => setMedForm({ ...medForm, afternoon: e.target.checked })}
                          className="h-3.5 w-3.5 rounded text-blue-600" 
                        />
                        <span>Afternoon</span>
                      </label>
                      <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-2 text-[10px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={medForm.night} 
                          onChange={(e) => setMedForm({ ...medForm, night: e.target.checked })}
                          className="h-3.5 w-3.5 rounded text-blue-600" 
                        />
                        <span>Night</span>
                      </label>
                      <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-2 text-[10px] font-semibold text-rose-600 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={medForm.before_food} 
                          onChange={(e) => setMedForm({ ...medForm, before_food: e.target.checked })}
                          className="h-3.5 w-3.5 rounded text-rose-600" 
                        />
                        <span>Before</span>
                      </label>
                      <label className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1E293B] p-2 text-[10px] font-semibold text-teal-600 cursor-pointer select-none">
                        <input 
                          type="checkbox" 
                          checked={medForm.after_food} 
                          onChange={(e) => setMedForm({ ...medForm, after_food: e.target.checked })}
                          className="h-3.5 w-3.5 rounded text-teal-600" 
                        />
                        <span>After</span>
                      </label>
                    </div>
                  </div>

                  {/* Custom Times */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Reminder Alarm Times (24h)
                    </label>
                    <input
                      type="text"
                      value={medForm.reminder_time}
                      onChange={(e) => setMedForm({ ...medForm, reminder_time: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Start / End Dates */}
                  <div className="grid gap-4 grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={medForm.start_date}
                        onChange={(e) => setMedForm({ ...medForm, start_date: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={medForm.end_date}
                        onChange={(e) => setMedForm({ ...medForm, end_date: e.target.value })}
                        required
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#1E293B] py-2 px-3 text-xs dark:text-white outline-none"
                      />
                    </div>
                  </div>

                  {/* Raw OCR Text Toggle info */}
                  {ocrText && (
                    <div className="rounded-xl border border-slate-100 dark:border-slate-700 p-3 bg-slate-50 dark:bg-[#1E293B]/50">
                      <summary className="text-[10px] font-bold text-slate-400 cursor-pointer uppercase select-none list-none flex items-center justify-between">
                        <span>Show OCR Scanned Text</span>
                        <FiFileText />
                      </summary>
                      <p className="text-[10px] text-slate-500 mt-2 font-mono whitespace-pre-line max-h-24 overflow-y-auto leading-normal">
                        {ocrText}
                      </p>
                    </div>
                  )}

                  {/* Submission and autofill redirect */}
                  <div className="flex gap-2 pt-3 border-t border-slate-50 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => {
                        navigate('/medicines/new', { state: medForm });
                        toast.success("Details copied! Fill in any extra settings.");
                      }}
                      className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      Autofill Detailed Form
                    </button>
                    
                    <button
                      type="submit"
                      disabled={savingMed}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
                    >
                      {savingMed ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                      ) : (
                        <>
                          <FiPlus /> Confirm & Save Medicine
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
};

export default Ocr;
