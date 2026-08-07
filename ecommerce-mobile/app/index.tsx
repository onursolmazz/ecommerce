import { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { getToken } from "../src/utils/storage";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuthentication = async (): Promise<void> => {
      try {
        const token = await getToken();

        if (!mounted) {
          return;
        }

        if (token) {
          router.replace("/home");
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error(
          "Token kontrol hatası:",
          error,
        );

        if (mounted) {
          router.replace("/login");
        }
      }
    };

    void checkAuthentication();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator
        size="large"
        color="#f97316"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f6f7fb",
  },
});

export default Index;