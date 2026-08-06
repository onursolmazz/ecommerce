import { useEffect } from "react";
import { useDispatch } from "react-redux";

import { fetchMe } from "./store/auth/authThunk";
import TokenService from "./services/TokenService";

import { RouterProvider } from "react-router-dom";
import router from "./router";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    if (TokenService.exists()) {
      dispatch(fetchMe());
    }
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
