import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const PublicRoute = ({ children }) => {
  const location = useLocation();

  let from = location.state?.from || "/inbox";
  if (location.state?.from.pathname.includes("inbox")) {
    from = "/inbox";
  }
  const isLoggedIn = useAuth();

  return !isLoggedIn ? children : <Navigate replace to={from} />;
};

export default PublicRoute;
