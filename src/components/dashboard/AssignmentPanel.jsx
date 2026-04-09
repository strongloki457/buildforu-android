import { useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";

export default function AssignmentPanel({ title, subtitle, workers, onAssign }) {
  const [form, setForm] = useState({
    employeeId: workers[0]?.id ?? "",
    title: "",
    location: "",
    date: "2026-04-18"
  });

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const assignee = workers.find((worker) => worker.id === form.employeeId);

    onAssign({
      ...form,
      assignee: assignee?.name ?? "Unknown worker"
    });

    setForm((current) => ({
      ...current,
      title: "",
      location: ""
    }));
  };

  return (
    <Card>
      <SectionHeader title={title} subtitle={subtitle} />

      <form onSubmit={handleSubmit} className="grid gap-4">
        <select
          value={form.employeeId}
          onChange={(event) => handleChange("employeeId", event.target.value)}
          className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm outline-none"
        >
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.name} · {worker.trade}
            </option>
          ))}
        </select>

        <input
          value={form.title}
          onChange={(event) => handleChange("title", event.target.value)}
          placeholder="Task title"
          className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm outline-none"
        />

        <input
          value={form.location}
          onChange={(event) => handleChange("location", event.target.value)}
          placeholder="Site location"
          className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm outline-none"
        />

        <input
          type="date"
          value={form.date}
          onChange={(event) => handleChange("date", event.target.value)}
          className="rounded-2xl border border-white/70 bg-white px-4 py-3 text-sm outline-none"
        />

        <Button type="submit" className="w-full">
          Assign task
        </Button>
      </form>
    </Card>
  );
}
