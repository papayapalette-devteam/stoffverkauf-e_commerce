import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

const ProtectedRoute = ({ adminOnly = false }: { adminOnly?: boolean }) => {
  const { user } = useAuth();

  const isAdminLoggedIn =
    localStorage.getItem("weber_admin_session") === "true";

  // 🔒 Admin route
  if (adminOnly) {
    if (!isAdminLoggedIn) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Outlet />;
  }

  // 👤 User route
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;