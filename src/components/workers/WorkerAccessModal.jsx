import { Share2 } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { useI18n } from "../../hooks/useI18n";
import { isNativeApp, shareText } from "../../utils/nativeMedia";

export default function WorkerAccessModal({ access, onClose }) {
  const { t } = useI18n();

  const handleShare = async () => {
    const message = t(
      "workers.employeeAccessShareMessage",
      { email: access.email, password: access.temporaryPassword },
      "BuildForU sign-in\nEmail: {{email}}\nTemporary password: {{password}}"
    );

    try {
      await shareText({ title: t("workers.employeeAccessTitle", "Employee login ready"), text: message });
    } catch {
      // user cancelled the share sheet — nothing to recover from here
    }
  };

  return (
    <Modal
      onClose={onClose}
      title={t("workers.employeeAccessTitle", "Employee login ready")}
      description={t(
        "workers.employeeAccessSubtitle",
        "Share these temporary credentials with the worker so they can sign in."
      )}
    >
      <div className="grid gap-4">
        <div className="rounded-[24px] bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">{t("login.email")}</p>
          <p className="mt-2 text-base text-slate-900">{access.email}</p>
        </div>

        <div className="rounded-[24px] bg-brand-50/80 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-brand-600">{t("login.password")}</p>
          <p className="mt-2 text-base text-slate-900">{access.temporaryPassword}</p>
        </div>

        <p className="text-sm text-slate-500">
          {t(
            "workers.employeeAccessHint",
            "This is frontend-only mock access for now, but the flow is ready to connect to backend account provisioning later."
          )}
        </p>

        <div className="mt-2 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isNativeApp ? (
            <Button variant="secondary" className="w-full sm:w-auto" onClick={handleShare}>
              <Share2 size={16} className="mr-2" />
              {t("workers.shareAccess", "Share")}
            </Button>
          ) : null}
          <Button className="w-full sm:w-auto" onClick={onClose}>
            {t("common.close")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
