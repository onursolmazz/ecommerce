import axios from "./axios";

export const getFavorites = () => axios.get("/favorites");

export const addFavorite = (product_id) =>
  axios.post("/favorites", { product_id });

export const removeFavorite = (product_id) =>
  axios.delete(`/favorites/${product_id}`);
