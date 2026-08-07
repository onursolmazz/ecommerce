import api from "./axios";

import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  MeResponse,
} from "../types";

export const login = (data: LoginPayload) => {
  return api.post<LoginResponse>("/auth/login", data);
};

export const getMe = () => {
  return api.get<MeResponse>("/auth/me");
};

export const logout = () => {
  return api.post<LogoutResponse>("/auth/logout");
};