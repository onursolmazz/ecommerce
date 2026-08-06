import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  unreadCount: 0,
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload.items;
      state.unreadCount = action.payload.unreadCount;
    },

    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
