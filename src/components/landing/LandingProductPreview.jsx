import PreviewChatCard from "./PreviewChatCard";
import PreviewMarketCard from "./PreviewMarketCard";
import PreviewScheduleCard from "./PreviewScheduleCard";
import PreviewShellHeader from "./PreviewShellHeader";
import PreviewWorkersCard from "./PreviewWorkersCard";

export default function LandingProductPreview() {
  return (
    <div className="rounded-[32px] border border-slate-200/70 bg-white shadow-[0_40px_90px_-50px_rgba(15,23,42,0.45)]">
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-2 truncate rounded-full bg-slate-100 px-3 py-1 text-[11px] text-slate-400">
          app.buildforu.eu/dashboard
        </span>
      </div>

      <div className="bg-mesh p-4 sm:p-5">
        <PreviewShellHeader />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <PreviewWorkersCard />
          <PreviewScheduleCard />
          <PreviewChatCard />
          <PreviewMarketCard />
        </div>
      </div>
    </div>
  );
}
