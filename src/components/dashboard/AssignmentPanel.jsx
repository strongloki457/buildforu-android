import { useEffect, useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import { getLocalDateKey } from "../../utils/date";
import { getWorkerPosition } from "../../utils/localizedValue";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function AssignmentPanel({
  title,
  subtitle,
  workers,
  onAssign,
  initialDate = getLocalDateKey(),
  embedded = false
}) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    employeeId: workers[0]?.id ?? "",
    title: "",
    location: "",
    date: initialDate
  });

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    setForm((current) => ({
      ...current,
      employeeId: workers.some((worker) => worker.id === current.employeeId) ? current.employeeId : workers[0]?.id ?? ""
    }));
  }, [workers]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const title = form.title.trim();
    const location = form.location.trim();

    if (!form.employeeId || !title || !location || !form.date) {
      return;
    }

    const assignee = workers.find((worker) => worker.id === form.employeeId);

    onAssign({
      ...form,
      title,
      location,
      assignee: assignee?.name ?? t("calendar.unknownWorker")
    });

    setForm((current) => ({
      ...current,
      title: "",
      location: ""
    }));
  };

  const content = (
    <>
      {title ? <SectionHeader title={title} subtitle={subtitle} /> : null}

      <form onSubmit={handleSubmit} className="grid gap-4">
        <select
          value={form.employeeId}
          onChange={(event) => handleChange("employeeId", event.target.value)}
          disabled={!workers.length}
          className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
        >
          {workers.length ? (
            workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.name} - {getWorkerPosition(t, worker)}
              </option>
            ))
          ) : (
            <option value="">{t("calendar.emptyWorker")}</option>
          )}
        </select>

        <input
          value={form.title}
          onChange={(event) => handleChange("title", event.target.value)}
          placeholder={t("calendar.taskTitle")}
          required
          className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <input
          value={form.location}
          onChange={(event) => handleChange("location", event.target.value)}
          placeholder={t("calendar.taskLocation")}
          required
          className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <input
          type="date"
          value={form.date}
          onChange={(event) => handleChange("date", event.target.value)}
          required
          className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <Button type="submit" className="w-full disabled:cursor-not-allowed disabled:opacity-60" disabled={!workers.length}>
          {t("calendar.assignTaskButton")}
        </Button>
      </form>
    </>
  );

  return embedded ? content : <Card>{content}</Card>;
}
