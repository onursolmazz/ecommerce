import axios from "./axios";

export const getCategories = (params = {}) =>
  axios.get("/categories", { params });

export const getCategory = (id) => axios.get(`/categories/${id}`);

export const createCategory = (data) =>
  axios.post("/categories", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const updateCategory = (id, data) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
  }

  return axios.post(`/categories/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteCategory = (id) => axios.delete(`/categories/${id}`);

export const restoreCategory = (id) => axios.post(`/categories/${id}/restore`);

export const forceDeleteCategory = (id) =>
  axios.delete(`/categories/${id}/force`);
