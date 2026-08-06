import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../../api/favoriteApi";

const getErrorPayload = (error, fallbackMessage) => ({
  message: error?.response?.data?.message ?? error?.message ?? fallbackMessage,
  errors: error?.response?.data?.errors ?? null,
  status: error?.response?.status ?? null,
});

export const fetchFavorites = createAsyncThunk(
  "favorite/fetchFavorites",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getFavorites();

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Favoriler yüklenemedi."));
    }
  },
);

export const addFavoriteItem = createAsyncThunk(
  "favorite/addFavoriteItem",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const response = await addFavorite(productId);

      await dispatch(fetchFavorites()).unwrap();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Ürün favorilere eklenemedi."),
      );
    }
  },
);

export const deleteFavoriteItem = createAsyncThunk(
  "favorite/deleteFavoriteItem",
  async (productId, { dispatch, rejectWithValue }) => {
    try {
      const response = await removeFavorite(productId);

      await dispatch(fetchFavorites()).unwrap();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Ürün favorilerden çıkarılamadı."),
      );
    }
  },
);
