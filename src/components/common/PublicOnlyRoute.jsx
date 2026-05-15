import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../hooks/useI18n";

export default function PublicOnlyRoute() {
  const { user, isBooting } = useAuth();
  const { t } = useI18n();

  if (isBooting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm text-slate-500">
        {t("app.preparing")}
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
