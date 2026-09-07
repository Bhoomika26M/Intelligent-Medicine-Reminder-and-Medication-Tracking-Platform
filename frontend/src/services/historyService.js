import API from "./api";


export const getHistory = () => {
  return API.get("history/");
};