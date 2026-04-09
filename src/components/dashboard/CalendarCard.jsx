import { CalendarDays } from "lucide-react";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getCalendarCells(tasks) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const offset = (firstDay.getDay() + 6) % 7;
  const totalDays = new Date(year, month + 1, 0).getDate();

  const cells = [];

  for (let index = 0; index < offset; index += 1) {
    cells.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    const isoDate = new Date(year, month, day).toISOString().slice(0, 10);
    const matches = tasks.filter((task) => task.date === isoDate);
    cells.push({ day, matches });
  }

  return cells;
}

export default function CalendarCard({ title, subtitle, tasks }) {
  const cells = getCalendarCells(tasks);

  return (
    <Card>
      <SectionHeader
        eyebrow="Monthly"
        title={title}
        subtitle={subtitle}
        action={
          <div className="rounded-2xl bg-brand-50 p-3 text-brand-700">
            <CalendarDays size={18} />
          </div>
        }
      />

      <div className="grid grid-cols-7 gap-2">
        {dayLabels.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-xs uppercase tracking-[0.2em] text-slate-400">
            {day}
          </div>
        ))}

        {cells.map((cell, index) => (
          <div
            key={`${cell?.day ?? "empty"}-${index}`}
            className={`min-h-[88px] rounded-3xl border p-3 ${
              cell ? "border-white/70 bg-white/70" : "border-transparent bg-transparent"
            }`}
          >
            {cell ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">{cell.day}</span>
                  {cell.matches.length ? (
                    <span className="rounded-full bg-brand-100 px-2 py-1 text-[10px] text-brand-700">
                      {cell.matches.length}
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 space-y-2">
                  {cell.matches.slice(0, 2).map((task) => (
                    <div key={task.id} className="rounded-2xl bg-brand-50 px-2 py-1 text-xs text-brand-700">
                      {task.title}
                    </div>
                  ))}
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
