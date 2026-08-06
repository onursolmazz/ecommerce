import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../store/auth/authThunk";
import { Navigate, Link } from "react-router-dom";

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
    <div className="row justify-content-center">
      <div className="col-lg-5">
        <div className="card shadow">
          <div className="card-body p-4">
            <h2 className="text-center mb-4">Giriş Yap</h2>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="mb-3">
                <label>Email</label>

                <input
                  className="form-control"
                  {...register("email", {
                    required: true,
                  })}
                />

                {errors.email && (
                  <small className="text-danger">Email zorunlu</small>
                )}
              </div>

              <div className="mb-4">
                <label>Şifre</label>

                <input
                  type="password"
                  className="form-control"
                  {...register("password", {
                    required: true,
                  })}
                />

                {errors.password && (
                  <small className="text-danger">Şifre zorunlu</small>
                )}
              </div>

              <button className="btn btn-dark w-100" disabled={loading}>
                {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
              </button>
            </form>

            <p className="mt-3 text-center">
              Hesabın yok mu?
              <Link to="/register" className="ms-2">
                Kayıt Ol
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
