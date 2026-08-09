import API from "./api";


export const getSchedules = () => {
  return API.get("schedules/");
};


export const createSchedule = (data) => {
  return API.post("schedules/", data);
};