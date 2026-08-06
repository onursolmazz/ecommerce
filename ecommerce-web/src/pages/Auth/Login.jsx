import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoLogInOutline,
  IoMailOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { loginUser } from "../../store/auth/authThunk";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "E-posta adresi zorunludur.")
    .email("Geçerli bir e-posta adresi girin."),
  password: z
    .string()
    .min(1, "Şifre zorunludur.")
    .min(6, "Şifre en az 6 karakter olmalıdır."),
  remember: z.boolean().optional(),
});

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const authState = useSelector((state) => state.auth);

  const loading =
    authState?.loading === true ||
    authState?.isLoading === true ||
    authState?.status === "loading";

  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const redirectPath = location.state?.from?.pathname ?? "/";

  const onSubmit = async (formData) => {
    try {
      const response = await dispatch(
        loginUser({
          email: formData.email,
          password: formData.password,
          remember: formData.remember,
        }),
      ).unwrap();

      toast.success(response?.message ?? "Giriş başarılı.");

      navigate(redirectPath, {
        replace: true,
      });
    } catch (error) {
      const validationErrors =
        error?.errors ?? error?.response?.data?.errors ?? null;

      if (validationErrors) {
        Object.entries(validationErrors).forEach(([field, messages]) => {
          setError(field, {
            type: "server",
            message: Array.isArray(messages) ? messages[0] : messages,
          });
        });
      }

      const errorMessage =
        typeof error === "string"
          ? error
          : (error?.message ??
            error?.response?.data?.message ??
            "E-posta veya şifre hatalı.");

      toast.error(errorMessage);
    }
  };

  const onInvalid = () => {
    toast.error("Lütfen form alanlarını kontrol edin.");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <IoLogInOutline />
          </div>

          <h1>Giriş Yap</h1>

          <p>Hesabına giriş yaparak alışverişe devam et.</p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit, onInvalid)}
          noValidate
        >
          <Input
            label="E-posta"
            type="email"
            placeholder="ornek@email.com"
            icon={<IoMailOutline />}
            error={errors.email?.message}
            autoComplete="email"
            required
            {...register("email")}
          />

          <div className="auth-password-field">
            <Input
              label="Şifre"
              type={showPassword ? "text" : "password"}
              placeholder="Şifrenizi girin"
              icon={<IoLockClosedOutline />}
              error={errors.password?.message}
              autoComplete="current-password"
              required
              {...register("password")}
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((previousValue) => !previousValue)}
              aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
            >
              {showPassword ? <IoEyeOffOutline /> : <IoEyeOutline />}
            </button>
          </div>

          <div className="auth-options">
            <label className="auth-remember">
              <input type="checkbox" {...register("remember")} />

              <span>Beni hatırla</span>
            </label>

            <Link to="/forgot-password" className="auth-link">
              Şifremi unuttum
            </Link>
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            icon={<IoLogInOutline />}
          >
            Giriş Yap
          </Button>
        </form>

        <div className="auth-footer">
          <span>Henüz hesabın yok mu?</span>

          <Link to="/register">Kayıt Ol</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
