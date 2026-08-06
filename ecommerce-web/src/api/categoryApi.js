import axios from "./axios";

export const getCategories = () => axios.get("/categories");

export const getCategory = (id) => axios.get(`/categories/${id}`);

export const createCategory = (data) => axios.post("/categories", data);

export const updateCategory = (id, data) =>
  axios.put(`/categories/${id}`, data);

export const deleteCategory = (id) => axios.delete(`/categories/${id}`);

export const restoreCategory = (id) => axios.post(`/categories/${id}/restore`);

export const forceDeleteCategory = (id) =>
  axios.delete(`/categories/${id}/force`);
