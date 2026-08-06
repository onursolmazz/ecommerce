import { configureStore } from "@reduxjs/toolkit";

import authReducer from "./auth/authSlice";
import cartReducer from "./cart/cartSlice";
import favoriteReducer from "./favorite/favoriteSlice";
import notificationReducer from "./notification/notificationSlice";
import themeReducer from "./theme/themeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    favorite: favoriteReducer,
    notification: notificationReducer,
    theme: themeReducer,
  },
});
