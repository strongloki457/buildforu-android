import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import StatusBadge from "../ui/StatusBadge";

export default function ProjectsOverviewCard({ title, subtitle, projects }) {
  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      <div className="space-y-4">
        {projects.map((project) => (
          <div key={project.id} className="rounded-[24px] bg-white/80 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-base text-slate-900">{project.name}</p>
                <p className="text-sm text-slate-500">{project.phase}</p>
              </div>
              <StatusBadge value={project.health} />
            </div>

            <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-700 to-brand-500"
                style={{ width: `${project.progress}%` }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>{project.progress}% complete</span>
              <span>{project.budget}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
