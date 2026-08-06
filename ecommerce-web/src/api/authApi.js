import axios from "./axios";

export const login = (data) => axios.post("/auth/login", data);

export const register = (data) => axios.post("/auth/register", data);

export const logout = () => axios.post("/auth/logout");

export const me = () => axios.get("/auth/me");

export const updateProfile = (data) => axios.put("/auth/profile", data);

export const updatePassword = (data) => axios.put("/auth/password", data);
