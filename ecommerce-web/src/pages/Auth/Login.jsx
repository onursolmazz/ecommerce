import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/auth/authThunk";
import { Navigate, Link } from "react-router-dom";import { HiOutlineEnvelope, HiOutlineLockClosed } from "react-icons/hi2";

function Login() {
  const dispatch = useDispatch();

  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    dispatch(loginUser(data));
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center align-items-center">
        <div className="col-md-8 col-lg-5">
          <div className="card border-0 shadow-lg rounded-4">
            <div className="card-body p-5">
              <div className="text-center mb-4">
                <h2 className="fw-bold">Hoş Geldiniz 👋</h2>
                <p className="text-muted mb-0">
                  Hesabınıza giriş yaparak alışverişe devam edin.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)}>
                {/* Email */}
                <div className="mb-3">
                  <label className="form-label fw-semibold">Email Adresi</label>

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
                      })}
                    />
                  </div>

                  {errors.email && (
                    <div className="text-danger small mt-1">
                      {errors.email.message}
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="mb-4">
                  <label className="form-label fw-semibold">Şifre</label>

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
                      })}
                    />
                  </div>

                  {errors.password && (
                    <div className="text-danger small mt-1">
                      {errors.password.message}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2 fw-semibold"
                  disabled={loading}
                >
                  {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                </button>
              </form>

              <div className="text-center mt-4">
                <span className="text-muted">Hesabın yok mu?</span>

                <Link
                  to="/register"
                  className="text-decoration-none fw-semibold ms-2"
                >
                  Kayıt Ol
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
