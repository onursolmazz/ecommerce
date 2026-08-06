import { createAsyncThunk } from "@reduxjs/toolkit";
import { login, register, logout, me } from "../../api";
import TokenService from "../../services/TokenService";

const getErrorPayload = (error, fallbackMessage) => {
  return {
    message:
      error?.response?.data?.message ?? error?.message ?? fallbackMessage,
    errors: error?.response?.data?.errors ?? null,
  };
};

export const loginUser = createAsyncThunk(
  "auth/login",
  async (data, { rejectWithValue }) => {
    try {
      const response = await login(data);

      const token = response?.data?.token ?? response?.token;

      const user = response?.data?.user ?? response?.user;

      if (!token) {
        return rejectWithValue({
          message: "Giriş başarılı ancak token alınamadı.",
          errors: null,
        });
      }

      TokenService.set(token);

      return {
        message: response?.message ?? "Giriş başarılı.",
        token,
        user,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Giriş işlemi başarısız oldu."),
      );
    }
  },
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await register(data);

      const token = response?.data?.token ?? response?.token;

      const user = response?.data?.user ?? response?.user;

      if (!token) {
        return rejectWithValue({
          message: "Kayıt başarılı ancak token alınamadı.",
          errors: null,
        });
      }

      TokenService.set(token);

      return {
        message: response?.message ?? "Kayıt başarılı.",
        token,
        user,
      };
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Kayıt işlemi başarısız oldu."),
      );
    }
  },
);

export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await logout();

      TokenService.remove();

      return {
        message: response?.message ?? "Çıkış yapıldı.",
      };
    } catch (error) {
      TokenService.remove();

      return rejectWithValue(
        getErrorPayload(error, "Çıkış işlemi başarısız oldu."),
      );
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await me();

      const user =
        response?.data?.user ?? response?.data ?? response?.user ?? response;

      return user;
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Kullanıcı bilgileri alınamadı."),
      );
    }
  },
);
