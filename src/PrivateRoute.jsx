import { useAuth } from "./context/AuthContext";
import { Navigate } from "react-router-dom";

export const PrivateRoute = ({ children }) => {
  const { isAuth, isLoading } = useAuth();

  if (isLoading) {
    return <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Загрузка...</div>; // ⏳
  }

  return isAuth ? children : <Navigate to="/login" replace />;
};