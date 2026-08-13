import { ArrowRight, Bot, CheckCircle2, MessageSquare, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useI18n } from "../../hooks/useI18n";

const MESSAGE_KEYS = [
  { role: "user", key: "q1" },
  { role: "ai", key: "a1" },
  { role: "user", key: "q2" },
  { role: "ai", key: "a2" }
];

const CAPABILITIES = [
  { icon: CheckCircle2, key: "estimates" },
  { icon: CheckCircle2, key: "scheduling" },
  { icon: CheckCircle2, key: "regulations" },
  { icon: CheckCircle2, key: "materials" }
];

export default function LandingAiSection() {
  const { t } = useI18n();

  return (
    <section className="mt-16 overflow-hidden rounded-[40px] bg-gradient-to-br from-slate-950 via-slate-900 to-brand-950 px-6 py-10 sm:px-10 sm:py-12">
      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-400/30 bg-brand-500/10 px-3 py-1.5">
            <Zap size={12} className="text-brand-400" />
            <p className="text-xs uppercase tracking-[0.22em] text-brand-400">
              {t("landing.aiEyebrow", "AI Assistant — Pro feature")}
            </p>
          </div>
          <h2 className="mt-5 text-3xl text-white sm:text-4xl">
            {t("landing.aiTitle", "Your personal construction expert, available 24/7")}
          </h2>
          <p className="mt-4 text-base leading-7 text-white/65">
            {t(
              "landing.aiSubtitle",
              "Ask anything about material quantities, cost estimates, Polish building regulations or project scheduling. Gets answers in seconds, not hours."
            )}
          </p>

          <ul className="mt-6 space-y-3">
            {CAPABILITIES.map(({ icon: Icon, key }) => (
              <li key={key} className="flex items-center gap-3 text-sm text-white/75">
                <Icon size={15} className="shrink-0 text-brand-400" />
                {t(`landing.aiCapability.${key}`, key)}
              </li>
            ))}
          </ul>

          <Link
            to="/register-company"
            className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm text-slate-900 transition hover:bg-slate-100"
          >
            {t("landing.aiCta", "Try it with Pro")}
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white">
              <Bot size={16} />
            </div>
            <div>
              <p className="text-xs font-medium text-white">BuildForU AI</p>
              <p className="text-[10px] text-white/40">{t("landing.aiOnline", "Online")}</p>
            </div>
            <span className="ml-auto flex h-2 w-2 rounded-full bg-green-400" />
          </div>

          <div className="space-y-3">
            {MESSAGE_KEYS.map(({ role, key }) => (
              <div
                key={key}
                className={`flex gap-2.5 ${role === "user" ? "flex-row-reverse" : ""}`}
              >
                {role === "ai" ? (
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-brand-400">
                    <MessageSquare size={11} />
                  </div>
                ) : null}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-5 ${
                    role === "user"
                      ? "bg-brand-600 text-white"
                      : "bg-white/10 text-white/85"
                  }`}
                >
                  {t(`landing.aiDemo.${key}`)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
