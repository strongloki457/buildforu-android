export default function SectionHeader({ eyebrow, title, subtitle, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs uppercase tracking-[0.25em] text-brand-600">{eyebrow}</p> : null}
        <h2 className="mt-1 text-xl text-slate-900">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-slate-500">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}
