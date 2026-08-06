import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  addToCart,
  clearCart as clearCartRequest,
  getCart,
  removeCartItem,
  updateCart,
} from "../../api/cartApi";

const getErrorPayload = (error, fallbackMessage) => ({
  message: error?.response?.data?.message ?? error?.message ?? fallbackMessage,
  errors: error?.response?.data?.errors ?? null,
  status: error?.response?.status ?? null,
});

export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getCart();

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Sepet yüklenemedi."));
    }
  },
);

export const addCartItem = createAsyncThunk(
  "cart/addCartItem",
  async ({ productId, quantity = 1 }, { dispatch, rejectWithValue }) => {
    try {
      const response = await addToCart({
        product_id: productId,
        quantity,
      });

      await dispatch(fetchCart()).unwrap();

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Ürün sepete eklenemedi."));
    }
  },
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ cartItemId, quantity }, { dispatch, rejectWithValue }) => {
    try {
      const response = await updateCart(cartItemId, {
        quantity,
      });

      await dispatch(fetchCart()).unwrap();

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Sepet güncellenemedi."));
    }
  },
);

export const deleteCartItem = createAsyncThunk(
  "cart/deleteCartItem",
  async (cartItemId, { dispatch, rejectWithValue }) => {
    try {
      const response = await removeCartItem(cartItemId);

      await dispatch(fetchCart()).unwrap();

      return response.data;
    } catch (error) {
      return rejectWithValue(
        getErrorPayload(error, "Ürün sepetten kaldırılamadı."),
      );
    }
  },
);

export const deleteAllCartItems = createAsyncThunk(
  "cart/deleteAllCartItems",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const response = await clearCartRequest();

      await dispatch(fetchCart()).unwrap();

      return response.data;
    } catch (error) {
      return rejectWithValue(getErrorPayload(error, "Sepet temizlenemedi."));
    }
  },
);
