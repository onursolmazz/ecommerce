import axios from "./axios";

export const getOrders = () => axios.get("/orders");

export const getOrder = (id) => axios.get(`/orders/${id}`);

export const createOrder = (data) => axios.post("/orders", data);

export const updateOrderStatus = (id, status) =>
  axios.patch(`/orders/${id}/status`, { status });
