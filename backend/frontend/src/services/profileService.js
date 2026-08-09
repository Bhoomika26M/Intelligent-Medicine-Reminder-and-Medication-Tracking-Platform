import axios from "axios";

const PROFILE_URL = "http://127.0.0.1:8000/api/users/profile/";

const getAuthHeader = () => {
  const token = localStorage.getItem("access_token");

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getProfile = async () => {
  const response = await axios.get(
    PROFILE_URL,
    getAuthHeader()
  );

  return response.data;
};

export const updateProfile = async (data) => {
  const response = await axios.put(
    PROFILE_URL,
    data,
    getAuthHeader()
  );

  return response.data;
};