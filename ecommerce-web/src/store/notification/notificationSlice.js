import { createSlice } from "@reduxjs/toolkit";
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeNotificationItem,
} from "./notificationThunk";

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  actionLoading: false,
  actionId: null,
  error: null,
};

const extractNotifications = (payload) => {
  const possibleValues = [
    payload?.data,
    payload?.data?.data,
    payload?.notifications,
    payload?.result,
    payload,
  ];

  return possibleValues.find((value) => Array.isArray(value)) ?? [];
};

const calculateUnreadCount = (items) =>
  items.filter(
    (notification) =>
      notification?.is_read !== true &&
      notification?.is_read !== 1 &&
      notification?.is_read !== "1",
  ).length;

const notificationSlice = createSlice({
  name: "notification",
  initialState,

  reducers: {
    setNotifications: (state, action) => {
      const items = Array.isArray(action.payload?.items)
        ? action.payload.items
        : [];

      state.items = items;
      state.unreadCount = Number(
        action.payload?.unreadCount ?? calculateUnreadCount(items),
      );
    },

    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
      state.loading = false;
      state.actionLoading = false;
      state.actionId = null;
      state.error = null;
    },

    clearNotificationError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        const items = extractNotifications(action.payload);

        state.loading = false;
        state.items = items;
        state.unreadCount = Number(
          action.payload?.meta?.unread_count ??
            action.payload?.unread_count ??
            calculateUnreadCount(items),
        );
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Bildirimler yüklenemedi.";
      })

      .addCase(markNotificationAsRead.pending, (state, action) => {
        state.actionLoading = true;
        state.actionId = action.meta.arg;
        state.error = null;
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionId = null;

        const notification = state.items.find(
          (item) => item.id === action.payload.id,
        );

        if (notification && !notification.is_read) {
          notification.is_read = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionId = null;
        state.error = action.payload?.message ?? "Bildirim güncellenemedi.";
      })

      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.actionLoading = false;

        state.items.forEach((notification) => {
          notification.is_read = true;
        });

        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message ?? "Bildirimler güncellenemedi.";
      })

      .addCase(removeNotificationItem.pending, (state, action) => {
        state.actionLoading = true;
        state.actionId = action.meta.arg;
        state.error = null;
      })
      .addCase(removeNotificationItem.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.actionId = null;

        const notification = state.items.find(
          (item) => item.id === action.payload.id,
        );

        if (notification && !notification.is_read) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }

        state.items = state.items.filter(
          (item) => item.id !== action.payload.id,
        );
      })
      .addCase(removeNotificationItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionId = null;
        state.error = action.payload?.message ?? "Bildirim silinemedi.";
      });
  },
});

export const { setNotifications, clearNotifications, clearNotificationError } =
  notificationSlice.actions;

export default notificationSlice.reducer;
