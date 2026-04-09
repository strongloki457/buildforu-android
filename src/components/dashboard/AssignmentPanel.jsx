import { useEffect, useState } from "react";
import { useI18n } from "../../hooks/useI18n";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function AssignmentPanel({ title, subtitle, workers, onAssign, embedded = false }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    employeeId: workers[0]?.id ?? "",
    title: "",
    location: "",
    date: "2026-04-18"
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
    if (!form.employeeId) {
      return;
    }

    const assignee = workers.find((worker) => worker.id === form.employeeId);

    onAssign({
      ...form,
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
                {worker.name} - {worker.trade}
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
          className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <input
          value={form.location}
          onChange={(event) => handleChange("location", event.target.value)}
          placeholder={t("calendar.taskLocation")}
          className="rounded-2xl border border-white/70 bg-white px-4 py-3.5 text-sm outline-none"
        />

        <input
          type="date"
          value={form.date}
          onChange={(event) => handleChange("date", event.target.value)}
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
