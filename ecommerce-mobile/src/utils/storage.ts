import * as SecureStore from "expo-secure-store";

import type { User } from "../types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

type SaveAuthParams = {
  token: string;
  user: User | null;
};

export const saveAuth = async ({
  token,
  user,
}: SaveAuthParams): Promise<void> => {
  await SecureStore.setItemAsync(TOKEN_KEY, token);

  if (user) {
    await SecureStore.setItemAsync(
      USER_KEY,
      JSON.stringify(user),
    );
  } else {
    await SecureStore.deleteItemAsync(USER_KEY);
  }
};

export const getToken = async (): Promise<string | null> => {
  return SecureStore.getItemAsync(TOKEN_KEY);
};

export const getUser = async (): Promise<User | null> => {
  const storedUser = await SecureStore.getItemAsync(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    return JSON.parse(storedUser) as User;
  } catch {
    await SecureStore.deleteItemAsync(USER_KEY);

    return null;
  }
};

export const clearAuth = async (): Promise<void> => {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
};