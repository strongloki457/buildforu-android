import { Check, Star } from "lucide-react";
import { Link } from "react-router-dom";
import PublicShell from "../components/marketing/PublicShell";

const plans = [
  {
    name: "Starter",
    price: "$29",
    subtitle: "For small teams getting organized.",
    workers: "Up to 5 workers",
    features: ["Role-based login", "Task and calendar views", "Team chat", "Market map access"],
    highlighted: false
  },
  {
    name: "Pro",
    price: "$99",
    subtitle: "For active companies with multiple crews.",
    workers: "Up to 25 workers",
    features: ["Everything in Starter", "Workers management", "Admin operations dashboard", "Priority onboarding"],
    highlighted: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    subtitle: "For larger operations and custom rollout needs.",
    workers: "Unlimited workers",
    features: ["Everything in Pro", "Unlimited worker scaling", "Custom onboarding support", "Future API-ready rollout"],
    highlighted: false
  }
];

export default function PricingPage() {
  return (
    <PublicShell>
      <section className="mx-auto max-w-3xl text-center">
        <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">Pricing</p>
        <h1 className="mt-5 text-5xl leading-tight text-slate-950 sm:text-6xl">Choose the plan that fits your company stage.</h1>
        <p className="mt-5 text-lg leading-8 text-slate-600">
          Start with a simple team setup and move toward a full operational workspace as your crews and projects grow.
        </p>
      </section>

      <section className="mt-12 grid gap-5 xl:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`rounded-[34px] border p-6 shadow-soft ${
              plan.highlighted
                ? "border-brand-200 bg-gradient-to-b from-brand-50 via-white to-white"
                : "border-white/70 bg-white/86"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl text-slate-950">{plan.name}</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">{plan.subtitle}</p>
              </div>
              {plan.highlighted ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-brand-700 px-3 py-1.5 text-xs text-white">
                  <Star size={12} />
                  Most popular
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              <p className="text-4xl text-slate-950">{plan.price}</p>
              <p className="mt-2 text-sm text-slate-500">per month</p>
            </div>

            <div className="mt-6 rounded-[24px] bg-slate-50/90 px-4 py-4 text-sm text-slate-700">{plan.workers}</div>

            <div className="mt-6 space-y-3">
              {plan.features.map((feature) => (
                <div key={feature} className="flex items-start gap-3 text-sm text-slate-600">
                  <div className="mt-0.5 rounded-full bg-brand-50 p-1 text-brand-700">
                    <Check size={12} />
                  </div>
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <Link
              to="/register-company"
              state={{ plan: plan.name }}
              className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-4 py-3.5 text-sm transition ${
                plan.highlighted
                  ? "bg-brand-700 text-white hover:bg-brand-600"
                  : "border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
              }`}
            >
              Choose plan
            </Link>
          </article>
        ))}
      </section>
    </PublicShell>
  );
}
