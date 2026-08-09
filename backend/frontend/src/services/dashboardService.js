import axios from "axios";

const DASHBOARD_URL = "http://127.0.0.1:8000/api/dashboard/";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getDashboard = async () => {
  const response = await axios.get(
    DASHBOARD_URL,
    getAuthHeader()
  );

  return response.data;
};