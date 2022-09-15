import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const isLoggedIn = useAuth();

  return isLoggedIn ? children : <Navigate to='/' state={{ from: location }} replace />;
};

export default PrivateRoute;
