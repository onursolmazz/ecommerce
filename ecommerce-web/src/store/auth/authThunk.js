import { createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { login, register, logout, me } from "../../api";

import TokenService from "../../services/TokenService";

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await login(data);

      TokenService.set(response.data.token);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await register(data);

      TokenService.set(response.data.token);
      toast.success(response.data.message);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Register failed",
      );
    }
  },
);

export const logoutUser = createAsyncThunk("auth/logout", async () => {
  await logout();

  TokenService.remove();
  toast.success("Çıkış yapıldı.");
  return true;
});

export const fetchMe = createAsyncThunk("auth/me", async () => {
  const response = await me();

  return response.data;
});
