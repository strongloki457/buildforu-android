import { ArrowUpRight, Bell, Building2, CreditCard, Globe, Pencil, Shield, Trash2, Users2 } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiRequest } from "../api/client";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { useAppData } from "../hooks/useAppData";
import { useAuth } from "../hooks/useAuth";
import { useI18n } from "../hooks/useI18n";

function resizeImageToBase64(file, maxSize = 160) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(maxSize / img.width, maxSize / img.height, 1);
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function SettingsPage() {
  const { company, user, updateUser, logout } = useAuth();
  const { workers } = useAppData();
  const { t } = useI18n();
  const fileInputRef = useRef(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState("");
  const [toggles, setToggles] = useState(() => {
    try {
      const stored = JSON.parse(window.localStorage.getItem("buildforu-settings-toggles") || "null");
      if (stored && typeof stored === "object") return stored;
    } catch {}
    return { alerts: true, summaries: true, privacy: false };
  });
  const adminCount = user?.role === "admin" ? 1 : 0;
  const employeeCount = workers.filter((worker) => worker.hasLinkedLogin).length;
  const isAdmin = user?.role === "admin";

  const toggle = (key) => setToggles((current) => {
    const next = { ...current, [key]: !current[key] };
    try { window.localStorage.setItem("buildforu-settings-toggles", JSON.stringify(next)); } catch {}
    return next;
  });

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarError("");
    if (!file.type.startsWith("image/")) {
      setAvatarError(t("settings.avatarInvalidType", "Please select an image file."));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setAvatarError(t("settings.avatarTooLarge", "File is too large. Max 5 MB."));
      return;
    }
    setAvatarUploading(true);
    try {
      const avatarUrl = await resizeImageToBase64(file);
      const { user: updated } = await apiRequest("/api/auth/me/avatar", {
        method: "PATCH",
        body: { avatarUrl }
      });
      updateUser({ avatarUrl: updated.avatarUrl });
    } catch {
      setAvatarError(t("settings.avatarUploadError", "Upload failed. Please try again."));
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  const handleDeactivateAccount = async () => {
    setDeactivating(true);
    setDeactivateError("");
    try {
      await apiRequest("/api/auth/me", { method: "DELETE" });
      logout();
    } catch {
      setDeactivateError(t("settings.deactivateError", "Failed to deactivate account. Please try again."));
      setDeactivating(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError("");
    setAvatarUploading(true);
    try {
      await apiRequest("/api/auth/me/avatar", {
        method: "PATCH",
        body: { avatarUrl: null }
      });
      updateUser({ avatarUrl: null });
    } catch {
      setAvatarError(t("settings.avatarUploadError", "Upload failed. Please try again."));
    } finally {
      setAvatarUploading(false);
    }
  };

  const settingsItems = [
    { key: "alerts", title: t("settings.alertsTitle"), description: t("settings.alertsDescription"), icon: Bell },
    { key: "summaries", title: t("settings.summariesTitle"), description: t("settings.summariesDescription"), icon: Globe },
    { key: "privacy", title: t("settings.privacyTitle"), description: t("settings.privacyDescription"), icon: Shield }
  ];

  return (
    <Card>
      <SectionHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      {/* Avatar */}
      <div className="mb-6 rounded-[28px] bg-white/80 p-5">
        <p className="mb-4 text-base text-slate-900">{t("settings.profilePhoto", "Profile photo")}</p>
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-500 text-2xl text-white">
              {user?.avatarUrl
                ? <img src={user.avatarUrl} alt={user?.name} className="h-full w-full object-cover" />
                : user?.avatar}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-white shadow transition hover:bg-brand-500 disabled:opacity-60"
            >
              <Pencil size={12} />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              {avatarUploading
                ? t("common.loading", "Loading…")
                : t("settings.uploadPhoto", "Upload photo")}
            </button>
            {user?.avatarUrl ? (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={avatarUploading}
                className="text-left text-sm text-rose-500 transition hover:text-rose-600 disabled:opacity-60"
              >
                {t("settings.removePhoto", "Remove photo")}
              </button>
            ) : null}
            <p className="text-xs text-slate-400">{t("settings.avatarHint", "JPG, PNG or WebP · max 5 MB")}</p>
            {avatarError ? <p className="text-xs text-rose-500">{avatarError}</p> : null}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {settingsItems.map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.key} className="rounded-[28px] bg-white/80 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-base text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm text-slate-500">{item.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggle(item.key)}
                  className={`relative h-8 w-14 rounded-full transition ${
                    toggles[item.key] ? "bg-brand-600" : "bg-slate-200"
                  }`}
                >
                  <span
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white transition ${
                      toggles[item.key] ? "left-7" : "left-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-[28px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-6 text-white">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/10 p-3">
              <Building2 size={18} />
            </div>
            <div>
              <p className="text-lg">{company?.name || t("settings.workspaceSaved")}</p>
              <p className="text-sm text-white/70">
                {company
                  ? t(
                      "settings.workspaceAccessHint",
                      {
                        plan: t(`plans.${company.plan}`, company.plan)
                      },
                      "Company workspace, subscription plan and seat structure for {{plan}}."
                    )
                  : t("settings.workspaceSavedDetail")}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[22px] bg-white/10 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">{t("settings.planLabel", "Plan")}</p>
              <p className="mt-2 text-sm text-white">{company ? t(`plans.${company.plan}`, company.plan) : "-"}</p>
            </div>
            {isAdmin ? (
              <>
                <div className="rounded-[22px] bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">{t("roles.admin", "Admin")}</p>
                  <p className="mt-2 text-sm text-white">{adminCount}</p>
                </div>
                <div className="rounded-[22px] bg-white/10 px-4 py-3">
                  <div className="flex items-center gap-2 text-white/60">
                    <Users2 size={14} />
                    <p className="text-xs uppercase tracking-[0.18em]">{t("roles.employee", "Employee")}</p>
                  </div>
                  <p className="mt-2 text-sm text-white">{employeeCount}</p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-[22px] bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">{t("common.account")}</p>
                  <p className="mt-2 text-sm text-white">{t(`roles.${user?.role}`, user?.role)}</p>
                </div>
                <div className="rounded-[22px] bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/60">{t("login.email")}</p>
                  <p className="mt-2 truncate text-sm text-white">{user?.email || "-"}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {isAdmin ? (
        <div className="mt-6 rounded-[28px] bg-white/82 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
                <CreditCard size={18} />
              </div>
              <div>
                <p className="text-lg text-slate-900">{t("settings.billingTitle")}</p>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">{t("settings.billingDescription")}</p>
              </div>
            </div>

            <Link
              to="/settings/billing"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-brand-700 px-4 py-3 text-sm text-white transition hover:bg-brand-600"
            >
              {t("settings.manageBilling")}
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      ) : null}

      <div className="mt-6 rounded-[28px] border border-red-100 bg-red-50/60 p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-red-100 p-3 text-red-600">
              <Trash2 size={18} />
            </div>
            <div>
              <p className="text-base font-medium text-red-900">{t("settings.deactivateTitle", "Deactivate account")}</p>
              <p className="mt-1 max-w-xl text-sm text-red-700">
                {user?.role === "admin"
                  ? t("settings.deactivateHintAdmin", "Your login will be permanently removed. Company data and workers will be preserved.")
                  : t("settings.deactivateHint", "Your login will be permanently removed. Your work history will be preserved.")}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { setDeactivateError(""); setShowDeactivateModal(true); }}
            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-2xl border border-red-200 bg-white px-4 py-2.5 text-sm text-red-700 transition hover:bg-red-50"
          >
            <Trash2 size={15} />
            {t("settings.deactivateButton", "Deactivate account")}
          </button>
        </div>
      </div>

      {showDeactivateModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-[28px] bg-white p-6 shadow-xl">
            <h2 className="text-lg font-medium text-slate-900">{t("settings.deactivateConfirmTitle", "Deactivate your account?")}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {user?.role === "admin"
                ? t("settings.deactivateConfirmBodyAdmin", "This will permanently remove your admin login. Company data and all workers will remain. This cannot be undone.")
                : t("settings.deactivateConfirmBody", "This will permanently remove your login. Your work history will remain. This cannot be undone.")}
            </p>
            {deactivateError ? <p className="mt-3 text-sm text-red-600">{deactivateError}</p> : null}
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowDeactivateModal(false)}
                disabled={deactivating}
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {t("common.cancel")}
              </button>
              <button
                type="button"
                onClick={handleDeactivateAccount}
                disabled={deactivating}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-sm text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                <Trash2 size={15} />
                {deactivating ? t("common.loading", "Loading…") : t("settings.deactivateConfirm", "Yes, deactivate")}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </Card>
  );
}
