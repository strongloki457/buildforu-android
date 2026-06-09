import { ArrowRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import logoFull from "../../assets/logo-full.svg";
import LanguageSwitcher from "../navigation/LanguageSwitcher";
import { useAuth } from "../../hooks/useAuth";
import { useI18n } from "../../hooks/useI18n";

export default function PublicShell({ children }) {
  const { user } = useAuth();
  const { t } = useI18n();
  const location = useLocation();
  const navItems = [
    { label: t("publicNav.home"), path: "/" },
    { label: t("publicNav.pricing"), path: "/pricing" },
    { label: t("publicNav.register"), path: "/register-company" }
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f3f7f3] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.14),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(20,83,45,0.12),transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(20,83,45,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(20,83,45,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="glass-nav rounded-[28px] px-4 py-3 sm:px-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoFull} alt={t("app.name")} className="h-10 w-auto" />
            </Link>

            <nav className="hidden items-center gap-2 md:flex">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`rounded-2xl px-4 py-2 text-sm transition ${
                      isActive ? "bg-brand-700 text-white" : "text-slate-600 hover:bg-white/75"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <Link
                to={user ? "/dashboard" : "/login"}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
              >
                {user ? t("publicNav.openDashboard") : t("login.button")}
              </Link>
              <Link
                to="/register-company"
                className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-4 py-2.5 text-sm text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition hover:bg-brand-600"
              >
                {t("publicNav.startTrial")}
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 py-8 sm:py-10">{children}</main>

        <footer className="border-t border-white/60 px-2 py-6 text-sm text-slate-500">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>{t("publicNav.footer")}</span>
            <a href="mailto:info@buildforu.eu" className="transition hover:text-brand-700">
              info@buildforu.eu
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
