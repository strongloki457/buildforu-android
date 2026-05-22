import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../hooks/useI18n";

export default function ProtectedRoute() {
  const { user, isBooting } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  if (isBooting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-mesh px-6">
        <div className="glass-panel rounded-4xl px-8 py-6 text-sm text-slate-500">{t("app.preparing")}</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.emailVerified === false) {
    return <Navigate to="/verify-pending" replace />;
  }

  return <Outlet />;
}
