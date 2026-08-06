import { createSlice } from "@reduxjs/toolkit";
import {
  addFavoriteItem,
  deleteFavoriteItem,
  fetchFavorites,
} from "./favoriteThunk";

const initialState = {
  items: [],
  total: 0,
  loading: false,
  actionLoading: false,
  actionProductId: null,
  error: null,
};

const favoriteSlice = createSlice({
  name: "favorite",
  initialState,

  reducers: {
    resetFavorites: () => initialState,
    clearFavoriteError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchFavorites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFavorites.fulfilled, (state, action) => {
        state.loading = false;

        state.items = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];

        state.total = Number(action.payload?.meta?.total ?? state.items.length);
      })
      .addCase(fetchFavorites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Favoriler yüklenemedi.";
      })

      .addCase(addFavoriteItem.pending, (state, action) => {
        state.actionLoading = true;
        state.actionProductId = action.meta.arg;
        state.error = null;
      })
      .addCase(addFavoriteItem.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionProductId = null;
      })
      .addCase(addFavoriteItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionProductId = null;
        state.error = action.payload?.message ?? "Ürün favorilere eklenemedi.";
      })

      .addCase(deleteFavoriteItem.pending, (state, action) => {
        state.actionLoading = true;
        state.actionProductId = action.meta.arg;
        state.error = null;
      })
      .addCase(deleteFavoriteItem.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionProductId = null;
      })
      .addCase(deleteFavoriteItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionProductId = null;
        state.error =
          action.payload?.message ?? "Ürün favorilerden çıkarılamadı.";
      });
  },
});

export const { resetFavorites, clearFavoriteError } = favoriteSlice.actions;

export default favoriteSlice.reducer;
