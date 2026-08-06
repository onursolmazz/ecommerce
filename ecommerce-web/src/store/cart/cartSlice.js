import { createSlice } from "@reduxjs/toolkit";
import {
  addCartItem,
  deleteAllCartItems,
  deleteCartItem,
  fetchCart,
  updateCartItem,
} from "./cartThunk";

const initialState = {
  cart: null,
  items: [],
  totalQuantity: 0,
  uniqueItemsCount: 0,
  totalPrice: 0,
  loading: false,
  actionLoading: false,
  actionProductId: null,
  error: null,
};

const applyCartPayload = (state, payload) => {
  const cart = payload?.data ?? null;
  const meta = payload?.meta ?? {};

  state.cart = cart;
  state.items = Array.isArray(cart?.items) ? cart.items : [];

  state.totalQuantity = Number(
    meta?.items_count ??
      state.items.reduce(
        (total, item) => total + Number(item?.quantity ?? 0),
        0,
      ),
  );

  state.uniqueItemsCount = Number(
    meta?.unique_items_count ?? state.items.length,
  );

  state.totalPrice = Number(
    meta?.subtotal ??
      state.items.reduce((total, item) => {
        const price = Number(item?.product?.price ?? 0);
        const quantity = Number(item?.quantity ?? 0);

        return total + price * quantity;
      }, 0),
  );
};

const cartSlice = createSlice({
  name: "cart",
  initialState,

  reducers: {
    resetCart: () => initialState,
    clearCartError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        applyCartPayload(state, action.payload);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message ?? "Sepet yüklenemedi.";
      })

      .addCase(addCartItem.pending, (state, action) => {
        state.actionLoading = true;
        state.actionProductId = action.meta.arg?.productId ?? null;
        state.error = null;
      })
      .addCase(addCartItem.fulfilled, (state) => {
        state.actionLoading = false;
        state.actionProductId = null;
      })
      .addCase(addCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.actionProductId = null;
        state.error = action.payload?.message ?? "Ürün sepete eklenemedi.";
      })

      .addCase(updateCartItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message ?? "Sepet güncellenemedi.";
      })

      .addCase(deleteCartItem.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteCartItem.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteCartItem.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message ?? "Ürün sepetten kaldırılamadı.";
      })

      .addCase(deleteAllCartItems.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteAllCartItems.fulfilled, (state) => {
        state.actionLoading = false;
      })
      .addCase(deleteAllCartItems.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload?.message ?? "Sepet temizlenemedi.";
      });
  },
});

export const { resetCart, clearCartError } = cartSlice.actions;

export default cartSlice.reducer;
