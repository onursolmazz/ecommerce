import axios from "./axios";

export const getFavorites = () => axios.get("/favorites");

export const addFavorite = (productId) =>
  axios.post("/favorites", {
    product_id: productId,
  });

export const removeFavorite = (productId) =>
  axios.delete(`/favorites/${productId}`);
