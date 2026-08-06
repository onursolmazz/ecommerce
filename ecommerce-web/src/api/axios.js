import axios from "axios";
import globals from "../utils/globals";

const instance = axios.create({
  baseURL: globals.apiUrl,
  timeout: globals.timeout,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url ?? "";

    const isAuthRequest =
      requestUrl.includes("/login") || requestUrl.includes("/register");

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem("token");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);

export default instance;
