import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute() {
  const { user, isBooting } = useAuth();
  const location = useLocation();

  if (isBooting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh px-6">
        <div className="glass-panel rounded-4xl px-8 py-6 text-sm text-slate-500">
          Preparing BuildForU...
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
