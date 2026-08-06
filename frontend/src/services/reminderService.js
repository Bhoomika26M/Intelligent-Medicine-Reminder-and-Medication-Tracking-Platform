import api from "./api";

export const getReminders = async () => {
  const response = await api.get("/reminders/");
  return response.data;
};

export const addReminder = async (reminder) => {
  const response = await api.post("/reminders/", reminder);
  return response.data;
};

export const updateReminder = async (id, reminder) => {
  const response = await api.put(`/reminders/${id}/`, reminder);
  return response.data;
};

export const deleteReminder = async (id) => {
  const response = await api.delete(`/reminders/${id}/`);
  return response.data;
};

export const actionReminder = async (id, action, snoozeMinutes) => {
  const payload = { action };
  if (snoozeMinutes !== undefined) {
    payload.snooze_minutes = snoozeMinutes;
  }
  const response = await api.post(`/reminders/${id}/action/`, payload);
  return response.data;
};

export const getReminderHistory = async (period = "daily") => {
  const response = await api.get(`/reminders/history/?period=${period}`);
  return response.data;
};

export const getReminderDashboard = async () => {
  const response = await api.get(`/reminders/dashboard/`);
  return response.data;
};

export const getReminderAnalytics = async () => {
  const response = await api.get(`/reminders/analytics/`);
  return response.data;
};

export const sendTestEmail = async () => {
  const response = await api.post(`/reminders/test_email/`);
  return response.data;
};
