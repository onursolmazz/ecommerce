import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  deleteNotification,
  getNotifications,
  readAllNotifications,
  readNotification,
} from "../../api/notificationApi";

const getErrorPayload = (error, fallbackMessage) => ({
  message: error?.response?.data?.message ?? error?.message ?? fallbackMessage,
  errors: error?.response?.data?.errors ?? null,
  status: error?.response?.status ?? null,
});

export const fetchNotifications = createAsyncThunk(
  "notification/fetchNotifications",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await getNotifications(params);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Bildirimler yüklenemedi."),
      );
    }
  },
);

export const markNotificationAsRead = createAsyncThunk(
  "notification/markAsRead",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await readNotification(notificationId);

      return {
        id: notificationId,
        response: response.data,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Bildirim güncellenemedi."),
      );
    }
  },
);

export const markAllNotificationsAsRead = createAsyncThunk(
  "notification/markAllAsRead",
  async (_, { rejectWithValue }) => {
    try {
      const response = await readAllNotifications();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Bildirimler güncellenemedi."),
      );
    }
  },
);

export const removeNotificationItem = createAsyncThunk(
  "notification/remove",
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await deleteNotification(notificationId);

      return {
        id: notificationId,
        response: response.data,
      };
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Bildirim silinemedi."));
    }
  },
);
