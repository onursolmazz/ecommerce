import axios from "./axios";

export const login = async (data) => {
  const response = await axios.post("/login", data);
  return response.data;
};

export const register = async (data) => {
  const response = await axios.post("/register", data);
  return response.data;
};

export const logout = async () => {
  const response = await axios.post("/logout");
  return response.data;
};

export const me = async () => {
  const response = await axios.get("/me");
  return response.data;
};
