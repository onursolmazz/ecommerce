import axios from "./axios";

export const getReviews = (productId) =>
  axios.get(`/products/${productId}/reviews`);

export const createReview = (data) => axios.post("/reviews", data);

export const updateReview = (id, data) => axios.put(`/reviews/${id}`, data);

export const deleteReview = (id) => axios.delete(`/reviews/${id}`);
