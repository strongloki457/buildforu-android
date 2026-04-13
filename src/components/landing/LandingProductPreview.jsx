import PreviewChatCard from "./PreviewChatCard";
import PreviewMarketCard from "./PreviewMarketCard";
import PreviewScheduleCard from "./PreviewScheduleCard";
import PreviewShellHeader from "./PreviewShellHeader";
import PreviewWorkersCard from "./PreviewWorkersCard";

export default function LandingProductPreview() {
  return (
    <div className="glass-panel rounded-[36px] p-5 sm:p-6">
      <div className="rounded-[30px] border border-slate-200/80 bg-slate-950 p-4 text-white sm:p-5">
        <PreviewShellHeader />

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <PreviewWorkersCard />
          <PreviewScheduleCard />
          <PreviewChatCard />
          <PreviewMarketCard />
        </div>
      </div>
    </div>
  );
}
