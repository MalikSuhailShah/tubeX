import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute() {// component is used to prevent unauthenticated users from accessing certain pages in your TubeX frontend
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  // If there is no Redux user, the user is not authenticated in the frontend.
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />; //replace:Replace the current history entry instead of adding another one.
  }

  return <Outlet />;
}


//location.pathname is basically gives the current url at which we are 