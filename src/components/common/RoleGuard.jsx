import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../hooks/useI18n";

export default function RoleGuard({ allowedRoles, children }) {
  const { user } = useAuth();
  const { t } = useI18n();

  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <p className="text-sm text-slate-500">{t("common.accessDenied", "You don't have permission to view this page.")}</p>
      </div>
    );
  }

  return children;
}
