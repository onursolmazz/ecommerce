import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const favoriteSlice = createSlice({
  name: "favorite",
  initialState,
  reducers: {
    setFavorites: (state, action) => {
      state.items = action.payload;
    },

    clearFavorites: (state) => {
      state.items = [];
    },
  },
});

export const { setFavorites, clearFavorites } = favoriteSlice.actions;

export default favoriteSlice.reducer;
