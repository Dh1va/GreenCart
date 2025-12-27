import { Navigate } from "react-router-dom";
import {  useAppContext } from "../../context/AppContext";

const AdminRoute = ({ children }) => {
  const { user, authChecked } = useAppContext();

  if (!authChecked) return null;

  if (!user || user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
