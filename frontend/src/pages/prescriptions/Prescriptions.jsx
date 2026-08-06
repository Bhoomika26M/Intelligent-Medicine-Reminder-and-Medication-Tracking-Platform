import { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import UploadPrescriptionModal from "../../components/prescription/UploadPrescriptionModal";
import { deletePrescription, getPrescriptions, uploadPrescription } from "../../services/prescriptionService";

export default function Prescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    setLoading(true);
    try {
      const data = await getPrescriptions();
      setPrescriptions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (formData) => {
    try {
      await uploadPrescription(formData);
      setShowModal(false);
      loadPrescriptions();
    } catch (err) {
      console.error("Upload prescription error:", err?.response?.status, err?.response?.data || err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePrescription(id);
      loadPrescriptions();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <MainLayout>
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white">Prescriptions</h1>
          <p className="mt-2 text-slate-400">Upload and manage prescription documents.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="rounded-xl bg-emerald-500 px-6 py-3 font-semibold text-white">
          + Upload Prescription
        </button>
      </div>

      {loading ? (
        <div className="rounded-3xl bg-[#111827] p-8 text-slate-300">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/20 bg-[#111827] p-10 text-center text-slate-400">
          No prescriptions uploaded yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {prescriptions.map((prescription) => (
            <div key={prescription.id} className="rounded-3xl border border-white/10 bg-[#111827] p-5 text-white">
              <p className="text-lg font-semibold">{prescription.doctor_name}</p>
              <p className="mt-1 text-sm text-slate-400">{prescription.hospital_name}</p>
              <p className="mt-2 text-sm text-slate-300">Date: {prescription.prescription_date}</p>
              {prescription.prescription_image && (() => {
                const imageUrl = prescription.prescription_image.startsWith("http")
                  ? prescription.prescription_image
                  : `http://127.0.0.1:8000${prescription.prescription_image}`;
                return (
                  <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-block text-emerald-400">
                    View File
                  </a>
                );
              })()}
              <div className="mt-4">
                <button onClick={() => handleDelete(prescription.id)} className="rounded-xl bg-rose-600 px-4 py-2">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <UploadPrescriptionModal onClose={() => setShowModal(false)} onUpload={handleUpload} />}
    </MainLayout>
  );
}
