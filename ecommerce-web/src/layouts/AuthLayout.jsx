import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="container py-5">
      <Outlet />
    </div>
  );
}

export default AuthLayout;
