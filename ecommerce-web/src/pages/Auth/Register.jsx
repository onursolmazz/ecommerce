import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  IoEyeOffOutline,
  IoEyeOutline,
  IoLockClosedOutline,
  IoMailOutline,
  IoPersonAddOutline,
  IoPersonOutline,
} from "react-icons/io5";
import { toast } from "react-toastify";
import { registerUser } from "../../store/auth/authThunk";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Ad soyad zorunludur.")
      .min(3, "Ad soyad en az 3 karakter olmalıdır.")
      .max(100, "Ad soyad en fazla 100 karakter olabilir."),
    email: z
      .string()
      .trim()
      .min(1, "E-posta adresi zorunludur.")
      .email("Geçerli bir e-posta adresi girin."),
    password: z
      .string()
      .min(1, "Şifre zorunludur.")
      .min(8, "Şifre en az 8 karakter olmalıdır.")
      .regex(/[A-Z]/, "Şifre en az bir büyük harf içermelidir.")
      .regex(/[a-z]/, "Şifre en az bir küçük harf içermelidir.")
      .regex(/[0-9]/, "Şifre en az bir rakam içermelidir."),
    password_confirmation: z.string().min(1, "Şifre tekrarı zorunludur."),
    terms: z.literal(true, {
      errorMap: () => ({
        message: "Kullanım koşullarını kabul etmelisiniz.",
      }),
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler birbiriyle eşleşmiyor.",
    path: ["password_confirmation"],
  });

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const authState = useSelector((state) => state.auth);
  const loading =
    authState?.loading ??
    authState?.isLoading ??
    authState?.status === "loading";

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] =
    useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      terms: false,
    },
  });

  const onSubmit = async (formData) => {
    try {
      await dispatch(
        registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          password_confirmation: formData.password_confirmation,
          role_id: 1,
        }),
      ).unwrap();

      toast.success("Hesabınız başarıyla oluşturuldu.");
      navigate("/", { replace: true });
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

      toast.error(
        error?.message ??
          error?.response?.data?.message ??
          "Kayıt işlemi başarısız oldu.",
      );
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-register">
        <div className="auth-header">
          <div className="auth-icon">
            <IoPersonAddOutline />
          </div>

          <h1>Hesap Oluştur</h1>

          <p>Yeni bir hesap oluşturarak alışverişe başla.</p>
        </div>

        <form
          className="auth-form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
        >
          <Input
            label="Ad Soyad"
            type="text"
            placeholder="Adınızı ve soyadınızı girin"
            icon={<IoPersonOutline />}
            error={errors.name?.message}
            autoComplete="name"
            required
            {...register("name")}
          />

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
              helperText="En az 8 karakter, büyük harf, küçük harf ve rakam."
              autoComplete="new-password"
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

          <div className="auth-password-field">
            <Input
              label="Şifre Tekrar"
              type={showPasswordConfirmation ? "text" : "password"}
              placeholder="Şifrenizi tekrar girin"
              icon={<IoLockClosedOutline />}
              error={errors.password_confirmation?.message}
              autoComplete="new-password"
              required
              {...register("password_confirmation")}
            />

            <button
              type="button"
              className="auth-password-toggle"
              onClick={() =>
                setShowPasswordConfirmation((previousValue) => !previousValue)
              }
              aria-label={
                showPasswordConfirmation
                  ? "Şifre tekrarını gizle"
                  : "Şifre tekrarını göster"
              }
            >
              {showPasswordConfirmation ? (
                <IoEyeOffOutline />
              ) : (
                <IoEyeOutline />
              )}
            </button>
          </div>

          <div className="auth-terms">
            <label>
              <input type="checkbox" {...register("terms")} />

              <span>
                <Link to="/terms">Kullanım koşullarını</Link> ve{" "}
                <Link to="/privacy">gizlilik politikasını</Link> kabul ediyorum.
              </span>
            </label>

            {errors.terms?.message && (
              <div className="invalid-feedback d-block">
                {errors.terms.message}
              </div>
            )}
          </div>

          <Button
            type="submit"
            fullWidth
            loading={loading}
            disabled={loading}
            icon={<IoPersonAddOutline />}
          >
            Kayıt Ol
          </Button>
        </form>

        <div className="auth-footer">
          <span>Zaten hesabın var mı?</span>

          <Link to="/login">Giriş Yap</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
