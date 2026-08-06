import axios from "./axios";

export const getProducts = (params = {}) => axios.get("/products", { params });

export const getProduct = (id) => axios.get(`/products/${id}`);

export const createProduct = (data) =>
  axios.post("/products", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateProduct = (id, data) =>
  axios.post(`/products/${id}?_method=PUT`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteProduct = (id) => axios.delete(`/products/${id}`);

export const restoreProduct = (id) => axios.post(`/products/${id}/restore`);

export const forceDeleteProduct = (id) => axios.delete(`/products/${id}/force`);
