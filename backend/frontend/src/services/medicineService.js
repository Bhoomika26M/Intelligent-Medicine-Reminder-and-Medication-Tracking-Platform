import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api/medicines/";
const SCHEDULE_URL = "http://127.0.0.1:8000/api/schedules/";
const HISTORY_URL = "http://127.0.0.1:8000/api/history/";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  console.log("Medicine Token:", token);

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

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

export const getHistory = async () => {
  const response = await axios.get(
    HISTORY_URL,
    getAuthHeader()
  );
  return response.data;
};