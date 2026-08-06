import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../store/auth/authThunk";
import { Navigate, Link } from "react-router-dom";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
} from "react-icons/hi2";

function Register() {
  const dispatch = useDispatch();

  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = (data) => {
    dispatch(
      registerUser({
        ...data,
        role_id: 1,
      }),
    );
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Kayıt Ol</h2>
                <p className="text-muted">
                  Yeni bir hesap oluşturarak alışverişe başlayın.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-3">
                  <label className="form-label">Ad Soyad</label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <HiOutlineUser />
                    </span>

                    <input
                      type="text"
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Ad Soyad"
                      {...register("name", {
                        required: "Ad Soyad zorunludur",
                      })}
                    />
                  </div>

                  {errors.name && (
                    <div className="invalid-feedback d-block">
                      {errors.name.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <HiOutlineEnvelope />
                    </span>

                    <input
                      type="email"
                      className={`form-control ${
                        errors.email ? "is-invalid" : ""
                      }`}
                      placeholder="ornek@mail.com"
                      {...register("email", {
                        required: "Email zorunludur",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Geçerli bir email adresi giriniz.",
                        },
                      })}
                    />
                  </div>

                  {errors.email && (
                    <div className="invalid-feedback d-block">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Şifre</label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <HiOutlineLockClosed />
                    </span>

                    <input
                      type="password"
                      className={`form-control ${
                        errors.password ? "is-invalid" : ""
                      }`}
                      placeholder="********"
                      {...register("password", {
                        required: "Şifre zorunludur",
                        minLength: {
                          value: 8,
                          message: "Şifre en az 8 karakter olmalıdır.",
                        },
                      })}
                    />
                  </div>

                  {errors.password && (
                    <div className="invalid-feedback d-block">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label">Şifre Tekrar</label>

                  <div className="input-group">
                    <span className="input-group-text">
                      <HiOutlineLockClosed />
                    </span>

                    <input
                      type="password"
                      className={`form-control ${
                        errors.password_confirmation ? "is-invalid" : ""
                      }`}
                      placeholder="********"
                      {...register("password_confirmation", {
                        required: "Şifre tekrarı zorunludur",
                        validate: (value) =>
                          value === password || "Şifreler eşleşmiyor.",
                      })}
                    />
                  </div>

                  {errors.password_confirmation && (
                    <div className="invalid-feedback d-block">
                      {errors.password_confirmation.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? "Kayıt Oluşturuluyor..." : "Kayıt Ol"}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted">Zaten hesabın var mı?</span>

                <Link
                  to="/login"
                  className="text-decoration-none fw-semibold ms-2"
                >
                  Giriş Yap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
