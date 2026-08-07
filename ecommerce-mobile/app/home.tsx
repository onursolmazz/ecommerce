import axios from "axios";
import { useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { logout } from "../src/api/authApi";
import { getProducts } from "../src/api/productApi";
import ProductCard from "../src/components/ProductCard";
import { clearAuth } from "../src/utils/storage";

import type {
  ApiErrorResponse,
  Product,
  ProductsResponse,
} from "../src/types";

const extractProducts = (
  response: ProductsResponse,
): Product[] => {
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.products)) {
    return response.products;
  }

  return [];
};

const getRequestErrorMessage = (
  error: unknown,
  fallbackMessage: string,
): string => {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      error.message ??
      fallbackMessage
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
};

const Home = () => {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [initialLoading, setInitialLoading] =
    useState<boolean>(true);
  const [refreshing, setRefreshing] =
    useState<boolean>(false);
  const [error, setError] =
    useState<string | null>(null);
  const [logoutLoading, setLogoutLoading] =
    useState<boolean>(false);

  const requestProducts = useCallback(
    async (): Promise<Product[]> => {
      const response = await getProducts({
        status: 1,
        per_page: 30,
      });

      return extractProducts(response.data);
    },
    [],
  );

  useEffect(() => {
    let mounted = true;

    const loadInitialProducts =
      async (): Promise<void> => {
        try {
          const result = await requestProducts();

          if (!mounted) {
            return;
          }

          setProducts(result);
          setError(null);
        } catch (requestError: unknown) {
          if (!mounted) {
            return;
          }

          console.error(
            "Ürün listeleme hatası:",
            axios.isAxiosError(requestError)
              ? requestError.response?.data ??
                  requestError.message
              : requestError,
          );

          setProducts([]);
          setError(
            getRequestErrorMessage(
              requestError,
              "Ürünler yüklenemedi.",
            ),
          );
        } finally {
          if (mounted) {
            setInitialLoading(false);
          }
        }
      };

    void loadInitialProducts();

    return () => {
      mounted = false;
    };
  }, [requestProducts]);

  const handleRefresh = async (): Promise<void> => {
    if (refreshing) {
      return;
    }

    setRefreshing(true);

    try {
      const result = await requestProducts();

      setProducts(result);
      setError(null);
    } catch (requestError: unknown) {
      setError(
        getRequestErrorMessage(
          requestError,
          "Ürünler yenilenemedi.",
        ),
      );
    } finally {
      setRefreshing(false);
    }
  };

  const handleRetry = async (): Promise<void> => {
    setInitialLoading(true);

    try {
      const result = await requestProducts();

      setProducts(result);
      setError(null);
    } catch (requestError: unknown) {
      setProducts([]);
      setError(
        getRequestErrorMessage(
          requestError,
          "Ürünler yüklenemedi.",
        ),
      );
    } finally {
      setInitialLoading(false);
    }
  };

  const handleLogout = async (): Promise<void> => {
    if (logoutLoading) {
      return;
    }

    setLogoutLoading(true);

    try {
      await logout();
    } catch (requestError: unknown) {
      console.error(
        "Çıkış API hatası:",
        requestError,
      );
    } finally {
      await clearAuth();

      setLogoutLoading(false);

      router.replace("/login");
    }
  };

  const confirmLogout = (): void => {
    Alert.alert(
      "Çıkış yap",
      "Hesabınızdan çıkmak istiyor musunuz?",
      [
        {
          text: "Vazgeç",
          style: "cancel",
        },
        {
          text: "Çıkış yap",
          style: "destructive",
          onPress: () => {
            void handleLogout();
          },
        },
      ],
    );
  };

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#f97316"
          />

          <Text style={styles.loadingText}>
            Ürünler yükleniyor...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList<Product>
        data={products}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              void handleRefresh();
            }}
            tintColor="#f97316"
            colors={["#f97316"]}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.eyebrow}>
                E-COMMERCE
              </Text>

              <Text style={styles.title}>
                Ürünler
              </Text>

              <Text style={styles.description}>
                Laravel API’den gelen güncel ürünler.
              </Text>
            </View>

            <Pressable
              onPress={confirmLogout}
              disabled={logoutLoading}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed &&
                  !logoutLoading &&
                  styles.logoutButtonPressed,
                logoutLoading &&
                  styles.logoutButtonDisabled,
              ]}
            >
              {logoutLoading ? (
                <ActivityIndicator
                  size="small"
                  color="#f97316"
                />
              ) : (
                <Text style={styles.logoutText}>
                  Çıkış
                </Text>
              )}
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>
              □
            </Text>

            <Text style={styles.emptyTitle}>
              {error
                ? "Ürünler yüklenemedi"
                : "Ürün bulunamadı"}
            </Text>

            <Text style={styles.emptyDescription}>
              {error ??
                "API henüz gösterilecek ürün döndürmüyor."}
            </Text>

            <Pressable
              onPress={() => {
                void handleRetry();
              }}
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
            >
              <Text style={styles.retryText}>
                Tekrar Dene
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <ProductCard product={item} />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 14,
  },

  loadingText: {
    color: "#6b7280",
    fontSize: 14,
  },

  listContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 30,
  },

  columnWrapper: {
    gap: 12,
  },

  cardWrapper: {
    flex: 1,
    maxWidth: "50%",
    marginBottom: 12,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 22,
    paddingTop: 8,
  },

  headerText: {
    flex: 1,
  },

  eyebrow: {
    marginBottom: 5,
    color: "#f97316",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1,
  },

  title: {
    color: "#111827",
    fontSize: 29,
    fontWeight: "800",
  },

  description: {
    marginTop: 7,
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 19,
  },

  logoutButton: {
    minWidth: 70,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#f97316",
    borderRadius: 11,
    backgroundColor: "#ffffff",
  },

  logoutButtonPressed: {
    opacity: 0.7,
  },

  logoutButtonDisabled: {
    opacity: 0.55,
  },

  logoutText: {
    color: "#f97316",
    fontSize: 13,
    fontWeight: "700",
  },

  empty: {
    flex: 1,
    minHeight: 430,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  emptyIcon: {
    marginBottom: 14,
    color: "#f97316",
    fontSize: 48,
  },

  emptyTitle: {
    color: "#111827",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },

  emptyDescription: {
    marginTop: 10,
    color: "#6b7280",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
  },

  retryButton: {
    minWidth: 130,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    borderRadius: 12,
    backgroundColor: "#f97316",
  },

  retryButtonPressed: {
    opacity: 0.8,
  },

  retryText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default Home;