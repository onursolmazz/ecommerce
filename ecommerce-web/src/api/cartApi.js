import axios from "./axios";

export const getCart = () => axios.get("/cart");

export const addToCart = (data) => axios.post("/cart", data);

export const updateCart = (id, data) => axios.put(`/cart/${id}`, data);

export const removeCartItem = (id) => axios.delete(`/cart/${id}`);

export const clearCart = () => axios.delete("/cart");
