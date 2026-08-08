import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  FiUsers, 
  FiUser, 
  FiActivity, 
  FiClock, 
  FiPlus, 
  FiTrendingUp, 
  FiHeart, 
  FiPhone,
  FiMapPin,
  FiAlertTriangle,
  FiFileText,
  FiEdit,
  FiTrash2,
  FiAlertCircle
} from 'react-icons/fi';
import { GiPill } from 'react-icons/gi';

const CaregiverDashboard = () => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [adherenceReport, setAdherenceReport] = useState(null);
  const [refillPredictions, setRefillPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [patientLoading, setPatientLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchPatients = async () => {
    try {
      const res = await api.get('/profile/patients');
      setPatients(res.data);
      if (res.data.length > 0) {
        setSelectedPatient(res.data[0]);
      }
    } catch (err) {
      console.error("Error loading supervised patients:", err);
      setErrorMsg("Failed to load your assigned patients list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatientDetails = async (patientId) => {
    setPatientLoading(true);
    try {
      const [medsRes, historyRes, refillRes] = await Promise.all([
        api.get(`/medicines?patient_id=${patientId}`),
        api.get(`/history/report?patient_id=${patientId}`).catch(() => ({ data: null })),
        api.get(`/refill/predictions?patient_id=${patientId}`).catch(() => ({ data: [] }))
      ]);
      setMedicines(medsRes.data || []);
      setAdherenceReport(historyRes.data || null);
      setRefillPredictions(refillRes.data || []);
    } catch (err) {
      console.error("Error loading patient details:", err);
    } finally {
      setPatientLoading(false);
    }
  };

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientDetails(selectedPatient.user_id);
    } else {
      setMedicines([]);
      setAdherenceReport(null);
      setRefillPredictions([]);
    }
  }, [selectedPatient]);

  const handleDeleteMedicine = async (medId, medName) => {
    if (!window.confirm(`Are you sure you want to delete "${medName}" for this patient?`)) {
      return;
    }
    try {
      await api.delete(`/medicines/${medId}`);
      setMedicines(prev => prev.filter(m => m.id !== medId));
    } catch (err) {
      console.error("Error deleting patient medicine:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Caregiver Cockpit</h1>
          <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">Supervise medication schedules and adherence charts for your linked patients.</p>
        </div>
        {selectedPatient && (
          <div className="mt-4 md:mt-0">
            <Link
              to={`/medicines/new?patient_id=${selectedPatient.user_id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-teal-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-500/10 hover:opacity-95 transition-all cursor-pointer"
            >
              <FiPlus /> Add Patient Medicine
            </Link>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-50 p-4 text-sm text-rose-600 border border-rose-100 flex items-center gap-2">
          <FiAlertCircle className="text-lg shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {patients.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-sm max-w-xl mx-auto space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600 text-3xl">
            <FiUsers />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No linked patients found</h3>
          <p className="text-xs text-slate-400">
            To manage a patient, ask them to log in to PillSync, go to their Profile Settings, and select your name from the "Assign Caregiver" dropdown.
          </p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Patient Selector Side Panel */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Linked Patients</h3>
            <div className="space-y-2">
              {patients.map((pat) => {
                const isSelected = selectedPatient?.user_id === pat.user_id;
                return (
                  <button
                    key={pat.user_id}
                    onClick={() => setSelectedPatient(pat)}
                    className={`w-full text-left rounded-xl p-4 border transition-all flex items-center gap-3 cursor-pointer ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-200 text-blue-600 font-bold shadow-sm' 
                        : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center font-semibold shrink-0 text-slate-600 capitalize">
                      {pat.full_name?.charAt(0) || "P"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold truncate">{pat.full_name}</p>
                      <p className="text-[10px] text-slate-400 truncate">{pat.email}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Patient Workspace */}
          <div className="lg:col-span-3 space-y-6">
            {patientLoading ? (
              <div className="flex h-48 items-center justify-center rounded-2xl bg-white border border-slate-100 shadow-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
              </div>
            ) : selectedPatient ? (
              <div className="space-y-6">
                {/* Patient Health File Header Card */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm grid gap-6 md:grid-cols-3">
                  <div className="space-y-2 md:border-r border-slate-50 md:pr-6">
                    <div className="flex items-center gap-2.5">
                      <div className="h-12 w-12 bg-blue-50 text-blue-600 text-xl font-bold rounded-xl flex items-center justify-center uppercase">
                        {selectedPatient.full_name?.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">{selectedPatient.full_name}</h3>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1"><FiUser /> Patient ID: {selectedPatient.user_id}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 pt-2"><span className="font-bold text-slate-700">Email:</span> {selectedPatient.email}</p>
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Phone:</span> {selectedPatient.phone || "Not recorded"}</p>
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Address:</span> {selectedPatient.address || "Not recorded"}</p>
                  </div>

                  <div className="space-y-1.5 md:border-r border-slate-50 md:px-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FiHeart className="text-rose-500" /> Demographics & Metrics</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-1">
                      <p>Age: <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.age || "—"}</span></p>
                      <p>Gender: <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.gender || "—"}</span></p>
                      <p>Height: <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.height || "—"}</span></p>
                      <p>Weight: <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.weight || "—"}</span></p>
                      <p>Blood Group: <span className="font-bold text-slate-900 dark:text-white">{selectedPatient.blood_group || "—"}</span></p>
                    </div>
                    {selectedPatient.emergency_contact && (
                      <p className="text-xs text-slate-500 pt-2"><span className="font-bold text-slate-700">Emergency:</span> {selectedPatient.emergency_contact}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:pl-6">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1"><FiFileText className="text-blue-500" /> Clinical Notes</h4>
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Doctor:</span> {selectedPatient.doctor_name || "—"}</p>
                    <p className="text-xs text-slate-500"><span className="font-bold text-slate-700">Diseases:</span> {selectedPatient.diseases || "None recorded"}</p>
                    <p className="text-xs text-slate-500 italic max-h-16 overflow-y-auto mt-1 bg-slate-50 p-2 rounded-xl text-slate-600 leading-normal border border-slate-100">
                      {selectedPatient.medical_notes || "No extra medical notes recorded."}
                    </p>
                  </div>
                </div>

                {/* Patient Stock Depletion Alerts */}
                {refillPredictions.filter(rp => rp.low_stock_alert).length > 0 && (
                  <div className="rounded-2xl border border-rose-100 bg-rose-50/50 p-4 text-xs text-rose-800 flex items-center justify-between shadow-sm animate-pulse">
                    <div className="flex items-center gap-2 font-semibold">
                      <FiAlertTriangle className="text-rose-600 text-lg shrink-0" />
                      <span>The following patient prescriptions need restocking immediately:</span>
                    </div>
                    <div className="space-y-1 text-right font-bold text-rose-700">
                      {refillPredictions.filter(rp => rp.low_stock_alert).map(rp => (
                        <p key={rp.id}>{rp.medicine?.name} ({rp.remaining_quantity} pills left, est. {rp.days_left} days left)</p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Patient Adherence rate and statistics */}
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Adherence Compliance</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{adherenceReport?.adherence_rate || 0}%</p>
                    </div>
                    <div className="h-10 w-10 bg-teal-50 text-teal-600 rounded-lg flex items-center justify-center text-lg">
                      <FiTrendingUp />
                    </div>
                  </div>
                  
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Doses Logged</span>
                      <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                        {adherenceReport?.taken_count || 0}<span className="text-xs font-normal text-slate-400">/{adherenceReport?.total_doses || 0}</span>
                      </p>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-lg">
                      <FiActivity />
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Missed Doses</span>
                      <p className="text-2xl font-black text-rose-600 mt-1">{adherenceReport?.missed_count || 0}</p>
                    </div>
                    <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center text-lg">
                      <FiAlertTriangle />
                    </div>
                  </div>
                </div>

                {/* Patient Medication List */}
                <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
                  <h3 className="text-md font-bold text-slate-900 dark:text-white border-b border-slate-50 pb-2">Active Prescriptions</h3>
                  
                  {medicines.length === 0 ? (
                    <p className="text-xs text-slate-400 py-6 text-center">No active medications registered for this patient.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {medicines.map((med) => (
                        <div key={med.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-blue-50 text-blue-600 text-lg rounded-xl flex items-center justify-center font-bold shrink-0">
                              💊
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                                {med.name}
                                {med.disease && <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-500">{med.disease}</span>}
                              </h4>
                              <p className="text-[10px] text-slate-400 leading-normal">
                                Dosage: {med.dosage} • Type: {med.medicine_type} • Frequency: {med.frequency}
                              </p>
                              <div className="flex gap-1.5 pt-1">
                                {med.morning && <span className="text-[8px] bg-sky-50 text-sky-600 px-1 rounded">Morning</span>}
                                {med.afternoon && <span className="text-[8px] bg-amber-50 text-amber-600 px-1 rounded">Afternoon</span>}
                                {med.night && <span className="text-[8px] bg-indigo-50 text-indigo-600 px-1 rounded">Night</span>}
                                {med.before_food && <span className="text-[8px] bg-rose-50 text-rose-600 px-1 rounded">Before Food</span>}
                                {med.after_food && <span className="text-[8px] bg-teal-50 text-teal-600 px-1 rounded">After Food</span>}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right text-[10px] text-slate-400">
                              <p>Stock: <span className={`font-bold ${med.remaining_stock <= 5 ? 'text-rose-500 font-extrabold animate-pulse' : 'text-slate-600'}`}>{med.remaining_stock}</span>/{med.quantity}</p>
                              <p>Ends: {med.end_date}</p>
                            </div>
                            
                            <div className="flex gap-1.5">
                              <Link
                                to={`/medicines/edit/${med.id}`}
                                className="h-8 w-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                                title="Edit Prescription"
                              >
                                <FiEdit className="text-xs" />
                              </Link>
                              <button
                                onClick={() => handleDeleteMedicine(med.id, med.name)}
                                className="h-8 w-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors cursor-pointer"
                                title="Delete Prescription"
                              >
                                <FiTrash2 className="text-xs" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default CaregiverDashboard;
