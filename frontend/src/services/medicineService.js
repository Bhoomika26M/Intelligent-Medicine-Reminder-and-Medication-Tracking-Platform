import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/medicines/";
const SCHEDULE_URL = "http://127.0.0.1:8000/api/schedules/";
const HISTORY_URL = "http://127.0.0.1:8000/api/history/";
const OCR_URL = "http://127.0.0.1:8000/api/ocr/";
const OCR_SAVE_URL = "http://127.0.0.1:8000/api/ocr/save/";
const MEDICINE_HISTORY_URL = "http://127.0.0.1:8000/api/medicine-history/";
const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  console.log("Medicine Token:", token);

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// ======================
// Medicines
// ======================

export const getMedicines = async () => {
  const response = await axios.get(
    API_URL,
    getAuthHeader()
  );
  return response.data;
};

export const addMedicine = async (medicineData) => {
  const response = await axios.post(
    API_URL,
    medicineData,
    getAuthHeader()
  );
  return response.data;
};

export const deleteMedicine = async (id) => {
  const response = await axios.delete(
    `${API_URL}${id}/`,
    getAuthHeader()
  );
  return response.data;
};

// ======================
// Schedules
// ======================

export const getSchedules = async () => {
  const response = await axios.get(
    SCHEDULE_URL,
    getAuthHeader()
  );
  return response.data;
};

export const updateScheduleStatus = async (id, status) => {
  const response = await axios.patch(
    `${SCHEDULE_URL}${id}/`,
    {
      status: status,
    },
    getAuthHeader()
  );
  return response.data;
};

// ======================
// History
// ======================

export const getMedicineHistory = async () => {
  const response = await axios.get(
    MEDICINE_HISTORY_URL,
    getAuthHeader()
  );
  return response.data;
};
// ======================
// OCR Upload
// ======================

export const uploadPrescription = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const token = localStorage.getItem("access_token");

  const response = await axios.post(
    OCR_URL,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data;
};

// ======================
// Save OCR Medicines
// ======================

export const saveOCRMedicines = async ({ disease, medicines }) => {
  const token = localStorage.getItem("access_token");

  const response = await axios.post(
    OCR_SAVE_URL,
    {
      disease,
      medicines,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};