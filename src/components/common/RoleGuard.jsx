import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
