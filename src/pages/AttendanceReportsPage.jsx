import { Calendar, Clock, Download, RotateCw, Users2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Card from "../components/ui/Card";
import SectionHeader from "../components/ui/SectionHeader";
import { attendanceApi } from "../api/attendance.api";
import { useAppData } from "../hooks/useAppData";
import { useI18n } from "../hooks/useI18n";

function durationHours(startTime, endTime) {
  if (!startTime || !endTime) return null;
  const diff = new Date(endTime) - new Date(startTime);
  return diff / (1000 * 60 * 60);
}

function formatTime(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pl-PL", { hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
}

function formatDate(iso) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}

function formatHours(h) {
  if (h === null) return "—";
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return `${hrs}h ${mins}m`;
}

function exportCsv(records, t) {
  const header = [
    t("attendance.csvWorker", "Worker"),
    t("attendance.csvDate", "Date"),
    t("attendance.csvStart", "Start"),
    t("attendance.csvEnd", "End"),
    t("attendance.csvHours", "Hours")
  ].join(",");

  const rows = records.map((r) => {
    const hrs = durationHours(r.startTime, r.endTime);
    return [
      `"${r.workerName ?? ""}"`,
      formatDate(r.startTime),
      formatTime(r.startTime),
      formatTime(r.endTime),
      hrs !== null ? hrs.toFixed(2) : ""
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `attendance_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AttendanceReportsPage() {
  const { workers } = useAppData();
  const { t } = useI18n();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [workerFilter, setWorkerFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await attendanceApi.list({ limit: 500 });
      const raw = Array.isArray(res) ? res : (res?.data ?? []);
      setRecords(
        raw.map((r) => ({
          id: r.id,
          workerId: r.workerId,
          workerName: r.worker?.name ?? "",
          startTime: r.startTime,
          endTime: r.endTime
        }))
      );
    } catch {
      setError(t("common.loadError", "Could not load attendance records."));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const filtered = useMemo(() => {
    return records.filter((r) => {
      if (workerFilter !== "all" && r.workerId !== workerFilter) return false;
      if (!r.startTime) return false;
      const dateStr = r.startTime.slice(0, 10);
      if (dateFrom && dateStr < dateFrom) return false;
      if (dateTo && dateStr > dateTo) return false;
      return true;
    });
  }, [records, workerFilter, dateFrom, dateTo]);

  const totalHours = useMemo(() => {
    return filtered.reduce((sum, r) => {
      const h = durationHours(r.startTime, r.endTime);
      return h !== null ? sum + h : sum;
    }, 0);
  }, [filtered]);

  const workerSummary = useMemo(() => {
    const map = new Map();
    filtered.forEach((r) => {
      const h = durationHours(r.startTime, r.endTime) ?? 0;
      const prev = map.get(r.workerId) ?? { name: r.workerName, hours: 0, sessions: 0 };
      map.set(r.workerId, { name: r.workerName, hours: prev.hours + h, sessions: prev.sessions + 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [filtered]);

  return (
    <div className="space-y-6">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.25em] text-brand-600">{t("attendance.reportsEyebrow", "Reports")}</p>
        <h1 className="mt-2 text-2xl text-slate-950 sm:text-3xl">{t("attendance.reportsTitle", "Attendance reports")}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {t("attendance.reportsSubtitle", "View hours worked per crew member and export records for payroll.")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[20px] border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase text-slate-400">
            <Clock size={13} className="text-brand-600" />
            {t("attendance.totalHours", "Total hours")}
          </div>
          <p className="mt-3 text-2xl text-slate-950">{formatHours(totalHours)}</p>
        </div>
        <div className="rounded-[20px] border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase text-slate-400">
            <Calendar size={13} className="text-brand-600" />
            {t("attendance.totalSessions", "Sessions")}
          </div>
          <p className="mt-3 text-2xl text-slate-950">{filtered.length}</p>
        </div>
        <div className="rounded-[20px] border border-white/70 bg-white/85 px-4 py-4 shadow-sm">
          <div className="flex items-center gap-2 text-xs uppercase text-slate-400">
            <Users2 size={13} className="text-brand-600" />
            {t("attendance.uniqueWorkers", "Workers")}
          </div>
          <p className="mt-3 text-2xl text-slate-950">{workerSummary.length}</p>
        </div>
      </div>

      <Card>
        <SectionHeader
          title={t("attendance.filtersTitle", "Filter records")}
          action={
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={fetchRecords}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-white/80 px-3 py-2 text-sm text-slate-700 hover:bg-white transition"
              >
                <RotateCw size={14} />
                {t("common.retry", "Refresh")}
              </button>
              <button
                type="button"
                onClick={() => exportCsv(filtered, t)}
                disabled={!filtered.length}
                className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-brand-700 px-4 py-2 text-sm text-white hover:bg-brand-600 transition disabled:opacity-40"
              >
                <Download size={14} />
                {t("attendance.exportCsv", "Export CSV")}
              </button>
            </div>
          }
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <select
            value={workerFilter}
            onChange={(e) => setWorkerFilter(e.target.value)}
            className="min-h-10 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
          >
            <option value="all">{t("attendance.allWorkers", "All workers")}</option>
            {workers.map((w) => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="min-h-10 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="min-h-10 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{error}</div>
        ) : null}

        <div className="mt-5 overflow-hidden rounded-[20px] border border-white/60">
          <div className="hidden grid-cols-[1.8fr_1fr_1fr_1fr_1fr] bg-white/70 px-5 py-3 text-xs uppercase tracking-[0.18em] text-slate-400 sm:grid">
            <span>{t("attendance.csvWorker", "Worker")}</span>
            <span>{t("attendance.csvDate", "Date")}</span>
            <span>{t("attendance.csvStart", "Start")}</span>
            <span>{t("attendance.csvEnd", "End")}</span>
            <span>{t("attendance.csvHours", "Hours")}</span>
          </div>

          <div className="divide-y divide-white/60">
            {loading ? (
              [0, 1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-[1.8fr_1fr_1fr_1fr_1fr] bg-white/55 px-5 py-4 gap-4">
                  {[0, 1, 2, 3, 4].map((j) => (
                    <div key={j} className="h-4 animate-pulse rounded-full bg-slate-100" />
                  ))}
                </div>
              ))
            ) : filtered.length ? (
              filtered.map((r) => {
                const hrs = durationHours(r.startTime, r.endTime);
                return (
                  <div key={r.id} className="bg-white/55 px-5 py-3.5 sm:grid sm:grid-cols-[1.8fr_1fr_1fr_1fr_1fr] sm:items-center sm:gap-4">
                    <p className="text-sm text-slate-900">{r.workerName || "—"}</p>
                    <p className="mt-1 text-xs text-slate-500 sm:mt-0 sm:text-sm">{formatDate(r.startTime)}</p>
                    <p className="text-xs text-slate-500 sm:text-sm">{formatTime(r.startTime)}</p>
                    <p className="text-xs text-slate-500 sm:text-sm">{formatTime(r.endTime)}</p>
                    <p className={`text-sm font-medium ${hrs !== null ? "text-brand-700" : "text-slate-400"}`}>
                      {formatHours(hrs)}
                    </p>
                  </div>
                );
              })
            ) : (
              <div className="bg-white/55 px-5 py-12 text-center">
                <Clock size={24} className="mx-auto text-slate-300" />
                <p className="mt-3 text-sm text-slate-400">{t("attendance.noRecords", "No attendance records for this period.")}</p>
              </div>
            )}
          </div>
        </div>

        {workerSummary.length > 1 ? (
          <div className="mt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.18em] text-slate-400">{t("attendance.summaryByWorker", "Summary by worker")}</p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {workerSummary.map((ws) => (
                <div key={ws.name} className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3">
                  <div>
                    <p className="text-sm text-slate-900">{ws.name}</p>
                    <p className="text-xs text-slate-400">{ws.sessions} {t("attendance.sessions", "sessions")}</p>
                  </div>
                  <p className="text-sm font-medium text-brand-700">{formatHours(ws.hours)}</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
