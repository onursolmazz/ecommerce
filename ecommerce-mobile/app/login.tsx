import axios from "axios";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { login } from "../src/api/authApi";
import { saveAuth } from "../src/utils/storage";

import type {
  ApiErrorResponse,
  LoginPayload,
} from "../src/types";

const Login = () => {
  const router = useRouter();

  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const [loading, setLoading] =
    useState<boolean>(false);

  const [showPassword, setShowPassword] =
    useState<boolean>(false);

  const updateForm = (
    field: keyof LoginPayload,
    value: string,
  ): void => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLogin = async (): Promise<void> => {
    const email = form.email.trim();
    const password = form.password;

    if (!email || !password) {
      Alert.alert(
        "Eksik bilgi",
        "E-posta ve şifre alanlarını doldurun.",
      );

      return;
    }

    if (loading) {
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email,
        password,
      });

      const body = response.data;

      if (!body.token) {
        throw new Error(
          "Sunucu tarafından giriş tokenı döndürülmedi.",
        );
      }

      await saveAuth({
        token: body.token,
        user: body.user ?? null,
      });

      router.replace("/home");
    } catch (error: unknown) {
      console.error(
        "Giriş hatası:",
        axios.isAxiosError(error)
          ? error.response?.data ?? error.message
          : error,
      );

      let message = "Giriş işlemi başarısız oldu.";

      if (axios.isAxiosError<ApiErrorResponse>(error)) {
        message =
          error.response?.data?.message ??
          error.message ??
          message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      Alert.alert(
        "Giriş başarısız",
        message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>E</Text>
            </View>

            <Text style={styles.title}>
              Hoş geldiniz
            </Text>

            <Text style={styles.description}>
              Ürünleri görüntülemek için hesabınıza
              giriş yapın.
            </Text>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  E-posta
                </Text>

                <TextInput
                  value={form.email}
                  onChangeText={(value) =>
                    updateForm("email", value)
                  }
                  placeholder="ornek@mail.com"
                  placeholderTextColor="#9ca3af"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  editable={!loading}
                  style={styles.input}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Şifre
                </Text>

                <View style={styles.passwordWrapper}>
                  <TextInput
                    value={form.password}
                    onChangeText={(value) =>
                      updateForm("password", value)
                    }
                    placeholder="Şifreniz"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    textContentType="password"
                    editable={!loading}
                    style={styles.passwordInput}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      void handleLogin();
                    }}
                  />

                  <Pressable
                    onPress={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    disabled={loading}
                    style={styles.passwordButton}
                  >
                    <Text
                      style={styles.passwordButtonText}
                    >
                      {showPassword
                        ? "Gizle"
                        : "Göster"}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Pressable
                onPress={() => {
                  void handleLogin();
                }}
                disabled={loading}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed &&
                    !loading &&
                    styles.loginButtonPressed,
                  loading &&
                    styles.loginButtonDisabled,
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.loginButtonText}>
                    Giriş Yap
                  </Text>
                )}
              </Pressable>
            </View>

            <Text style={styles.footer}>
              Laravel API + Expo React Native
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7fb",
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
  },

  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  logo: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 24,
    borderRadius: 22,
    backgroundColor: "#f97316",
    shadowColor: "#f97316",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 6,
  },

  logoText: {
    color: "#ffffff",
    fontSize: 34,
    fontWeight: "800",
  },

  title: {
    color: "#111827",
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
  },

  description: {
    marginTop: 10,
    marginBottom: 32,
    color: "#6b7280",
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },

  form: {
    gap: 18,
  },

  inputGroup: {
    gap: 8,
  },

  label: {
    color: "#374151",
    fontSize: 14,
    fontWeight: "600",
  },

  input: {
    height: 54,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#ffffff",
    color: "#111827",
    fontSize: 16,
  },

  passwordWrapper: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },

  passwordInput: {
    flex: 1,
    height: "100%",
    paddingLeft: 16,
    paddingRight: 8,
    color: "#111827",
    fontSize: 16,
  },

  passwordButton: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 15,
  },

  passwordButtonText: {
    color: "#f97316",
    fontSize: 13,
    fontWeight: "700",
  },

  loginButton: {
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    borderRadius: 14,
    backgroundColor: "#f97316",
  },

  loginButtonPressed: {
    opacity: 0.82,
  },

  loginButtonDisabled: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },

  footer: {
    marginTop: 30,
    color: "#9ca3af",
    fontSize: 12,
    textAlign: "center",
  },
});

export default Login;