import API from "./api";


export const loginUser = (data) => {
  return API.post("token/", data);
};


export const registerUser = (data) => {
  return API.post("users/register/", data);
};