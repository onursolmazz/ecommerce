import { Outlet } from "react-router-dom";

import DashboardSidebar from "../components/layout/DashboardSidebar";

function DashboardLayout() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-lg-2">
          <DashboardSidebar />
        </div>

        <div className="col-lg-10 py-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
