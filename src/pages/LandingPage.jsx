import { ArrowRight, CalendarDays, Map, MessageSquare, Users2 } from "lucide-react";
import { Link } from "react-router-dom";
import PublicShell from "../components/marketing/PublicShell";

const features = [
  {
    title: "Workers management",
    description: "Keep crews, supervisors and assignments visible in one operational workspace.",
    icon: Users2
  },
  {
    title: "Calendar scheduling",
    description: "Coordinate workdays, visits and shift timing with a cleaner planning view.",
    icon: CalendarDays
  },
  {
    title: "Team chat",
    description: "Reduce phone-call chaos with fast updates between office staff and field teams.",
    icon: MessageSquare
  },
  {
    title: "Market map",
    description: "Compare nearby stores and supply options before teams lose time on sourcing.",
    icon: Map
  }
];

export default function LandingPage() {
  return (
    <PublicShell>
      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">Construction operations SaaS</p>
          <h1 className="mt-6 text-5xl leading-tight text-slate-950 sm:text-6xl">
            Run crews, schedules and site communication from one BuildForU workspace.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            BuildForU helps construction companies manage workers, tasks, planning, team chat and sourcing tools with
            a polished dashboard experience for office teams and field staff.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/register-company"
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-700 px-5 py-3.5 text-sm text-white shadow-[0_18px_36px_-24px_rgba(20,83,45,0.9)] transition hover:bg-brand-600"
            >
              Start free trial
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              View pricing
            </Link>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-soft">
              <p className="text-sm text-slate-500">Built for</p>
              <p className="mt-3 text-2xl text-slate-950">Boss + Employee</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-soft">
              <p className="text-sm text-slate-500">Deployment</p>
              <p className="mt-3 text-2xl text-slate-950">Frontend-first</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-soft">
              <p className="text-sm text-slate-500">Focus</p>
              <p className="mt-3 text-2xl text-slate-950">Daily operations</p>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-[36px] p-5 sm:p-6">
          <div className="rounded-[30px] border border-slate-200/80 bg-slate-950 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-brand-300">Dashboard preview</p>
                <h2 className="mt-2 text-2xl">BuildForU Command Center</h2>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/70">Live mock</div>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-white/45">Navigation</p>
                <div className="mt-4 space-y-2 text-sm text-white/75">
                  <div className="rounded-2xl bg-brand-600 px-3 py-2 text-white">Dashboard</div>
                  <div className="rounded-2xl bg-white/5 px-3 py-2">Workers</div>
                  <div className="rounded-2xl bg-white/5 px-3 py-2">Calendar</div>
                  <div className="rounded-2xl bg-white/5 px-3 py-2">Chat</div>
                  <div className="rounded-2xl bg-white/5 px-3 py-2">Market Map</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[26px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/60">Operations overview</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-white/60">Active crews</p>
                      <p className="mt-3 text-2xl">18</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-white/60">Open tasks</p>
                      <p className="mt-3 text-2xl">42</p>
                    </div>
                    <div className="rounded-2xl bg-white/10 p-4">
                      <p className="text-sm text-white/60">Coverage</p>
                      <p className="mt-3 text-2xl">96%</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/60">Calendar</p>
                    <div className="mt-4 space-y-3 text-sm text-white/75">
                      <div className="rounded-2xl bg-white/5 px-3 py-3">Site inspection • 09:30</div>
                      <div className="rounded-2xl bg-white/5 px-3 py-3">Crew delivery check • 12:00</div>
                      <div className="rounded-2xl bg-white/5 px-3 py-3">Safety wrap-up • 16:30</div>
                    </div>
                  </div>

                  <div className="rounded-[26px] border border-white/10 bg-white/5 p-5">
                    <p className="text-sm text-white/60">Team chat</p>
                    <div className="mt-4 space-y-3 text-sm text-white/75">
                      <div className="rounded-2xl bg-white/5 px-3 py-3">Morning update from North River team</div>
                      <div className="rounded-2xl bg-brand-500/20 px-3 py-3">Electrical crew arrival confirmed</div>
                      <div className="rounded-2xl bg-white/5 px-3 py-3">Material pricing sync ready</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.28em] text-brand-700/75">Core capabilities</p>
          <h2 className="mt-4 text-3xl text-slate-950 sm:text-4xl">Built around the daily rhythm of a construction company.</h2>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="rounded-[30px] border border-white/70 bg-white/82 p-6 shadow-soft">
                <div className="inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700">
                  <Icon size={20} />
                </div>
                <h3 className="mt-5 text-xl text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-16 rounded-[36px] bg-gradient-to-r from-slate-950 via-slate-900 to-brand-900 px-6 py-8 text-white sm:px-8 sm:py-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-brand-300">Ready to launch</p>
            <h2 className="mt-4 text-3xl sm:text-4xl">Start your BuildForU trial and set up your company workspace in minutes.</h2>
            <p className="mt-4 text-base leading-7 text-white/70">
              Explore the product, preview plans, and move into the existing operations dashboard without backend setup.
            </p>
          </div>

          <Link
            to="/register-company"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm text-slate-900 transition hover:bg-slate-100"
          >
            Start free trial
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </PublicShell>
  );
}
