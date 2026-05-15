export default function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-4 flex min-w-0 flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {eyebrow ? <p className="break-anywhere text-xs uppercase tracking-[0.18em] text-brand-600 sm:tracking-[0.25em]">{eyebrow}</p> : null}
        <h2 className="break-anywhere mt-1 text-lg text-slate-900 sm:text-xl">{title}</h2>
        {subtitle ? <p className="break-anywhere mt-1 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
