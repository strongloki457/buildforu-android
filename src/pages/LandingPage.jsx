import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Map,
  MapPin,
  MessageSquare,
  Search,
  Users2
} from "lucide-react";
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

const workerPreview = [
  { name: "Alex Novak", role: "Site Supervisor", status: "On Site" },
  { name: "Mia Berger", role: "Electrician", status: "Off Site" },
  { name: "Luca Moretti", role: "Plumbing Lead", status: "On Site" }
];

const schedulePreview = [
  { title: "Concrete slab inspection", time: "09:30", site: "North River Residences" },
  { title: "Safety briefing", time: "12:00", site: "BuildForU HQ" },
  { title: "Facade delivery check", time: "16:30", site: "Skyline Offices" }
];

const chatPreview = [
  { author: "Sophie", text: "Please confirm the slab inspection notes after the walkthrough.", tone: "muted" },
  { author: "Alex", text: "Confirmed. I will upload the update before noon.", tone: "accent" }
];

const marketPreview = [
  { store: "Nordic Build Store", price: "$86", meta: "Facade panels - 3.1 km" },
  { store: "Voltix Supply Hub", price: "$42", meta: "Cabling - 5.4 km" }
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
          <div className="rounded-[30px] border border-slate-200/80 bg-slate-950 p-4 text-white sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-brand-300">Product preview</p>
                <h2 className="mt-2 text-2xl">A closer look at how teams use BuildForU</h2>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2 text-xs text-white/70">Live product modules</div>
            </div>

            <div className="mt-5 rounded-[24px] bg-gradient-to-r from-brand-800 via-brand-700 to-brand-500 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/60">Today at a glance</p>
                  <p className="mt-2 text-lg">Workforce, planning, chat and sourcing in one operational view.</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-white/15 px-3 py-1.5">18 active workers</span>
                  <span className="rounded-full bg-white/15 px-3 py-1.5">12 tasks today</span>
                  <span className="rounded-full bg-white/15 px-3 py-1.5">4 live threads</span>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                      <Users2 size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Workers</p>
                      <p className="text-base">Crew status</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300">Live sync</span>
                </div>

                <div className="mt-4 space-y-3">
                  {workerPreview.map((worker) => (
                    <div key={worker.name} className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-3">
                      <div>
                        <p className="text-sm">{worker.name}</p>
                        <p className="mt-1 text-xs text-white/45">{worker.role}</p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${
                          worker.status === "On Site"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-slate-500/20 text-slate-300"
                        }`}
                      >
                        {worker.status}
                      </span>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                    <CalendarDays size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Calendar</p>
                    <p className="text-base">Today's schedule</p>
                  </div>
                </div>

                <div className="mt-4 space-y-3">
                  {schedulePreview.map((item) => (
                    <div key={`${item.title}-${item.time}`} className="rounded-2xl bg-white/5 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm">{item.title}</p>
                        <div className="inline-flex items-center gap-1.5 text-xs text-brand-300">
                          <Clock3 size={12} />
                          {item.time}
                        </div>
                      </div>
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/45">
                        <MapPin size={12} />
                        {item.site}
                      </div>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                      <MessageSquare size={18} />
                    </div>
                    <div>
                      <p className="text-sm text-white/60">Chat</p>
                      <p className="text-base">Office to field updates</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/60">2 unread</span>
                </div>

                <div className="mt-4 space-y-3">
                  {chatPreview.map((message) => (
                    <div
                      key={`${message.author}-${message.text}`}
                      className={`rounded-2xl px-3 py-3 text-sm ${
                        message.tone === "accent" ? "bg-brand-500/15 text-white" : "bg-white/5 text-white/75"
                      }`}
                    >
                      <p className="text-xs uppercase tracking-[0.18em] text-white/45">{message.author}</p>
                      <p className="mt-2 leading-6">{message.text}</p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-[26px] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-brand-500/15 p-2.5 text-brand-300">
                    <Map size={18} />
                  </div>
                  <div>
                    <p className="text-sm text-white/60">Market Map</p>
                    <p className="text-base">Nearby supply search</p>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl bg-white/5 px-3 py-3">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Search size={14} />
                    <span>Search: facade panels</span>
                  </div>
                </div>

                <div className="mt-3 space-y-3">
                  {marketPreview.map((result, index) => (
                    <div key={result.store} className="rounded-2xl bg-white/5 px-3 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm">{result.store}</p>
                        <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
                          <CheckCircle2 size={12} />
                          {index === 0 ? "Best price" : "In stock"}
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-white/45">
                        <span>{result.meta}</span>
                        <span>{result.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </article>
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
