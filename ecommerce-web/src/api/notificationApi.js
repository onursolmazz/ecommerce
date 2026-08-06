import axios from "./axios";

export const getNotifications = () => axios.get("/notifications");

export const readNotification = (id) =>
  axios.patch(`/notifications/${id}/read`);

export const readAllNotifications = () =>
  axios.patch("/notifications/read-all");

export const deleteNotification = (id) => axios.delete(`/notifications/${id}`);
