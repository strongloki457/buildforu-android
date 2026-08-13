import { ChevronDown, ChevronUp, Plus, Trash2, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { expensesApi } from "../../api/expenses.api";
import { projectsApi } from "../../api/projects.api";
import { useI18n } from "../../hooks/useI18n";

const CATEGORY_PRESETS = ["subcontractor", "equipment", "permits", "other"];

export default function ProjectCostingCard({ project, budgetSlot }) {
  const { t } = useI18n();
  const currency = t("finance.currency", "€");
  const [open, setOpen] = useState(false);
  const [costing, setCosting] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    category: "other",
    description: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatMoney = (value) => `${Number(value ?? 0).toFixed(2)} ${currency}`;

  const loadDetails = async () => {
    setIsLoading(true);
    try {
      const [costingRes, expensesRes] = await Promise.all([
        projectsApi.getCosting(project.id),
        expensesApi.list({ projectId: project.id, limit: 20 })
      ]);
      setCosting(costingRes.costing);
      setExpenses(expensesRes.data ?? []);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && !costing) loadDetails();
  };

  const handleAddExpense = async (event) => {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.amount || Number.isNaN(amount) || amount < 0) return;

    setIsSubmitting(true);
    try {
      await expensesApi.create({
        projectId: project.id,
        category: form.category,
        description: form.description || undefined,
        amount,
        date: form.date
      });
      setForm((current) => ({ ...current, description: "", amount: "" }));
      await loadDetails();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    await expensesApi.delete(expenseId);
    await loadDetails();
  };

  return (
    <div className="rounded-2xl bg-white/70">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="break-anywhere min-w-0 flex-1 text-sm text-slate-900">{project.name}</p>
        {budgetSlot}
        <button
          type="button"
          onClick={handleToggle}
          className="shrink-0 rounded-xl p-2 text-slate-400 transition hover:bg-slate-100"
          aria-label={t("finance.viewCosts", "View costs")}
        >
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-slate-100 px-4 py-4">
          {isLoading && !costing ? (
            <p className="text-sm text-slate-400">{t("common.loading", "Loading interface...")}</p>
          ) : costing ? (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-400">{t("finance.laborCost", "Labor")}</p>
                  <p className="text-slate-900">{formatMoney(costing.laborCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t("finance.materialsCost", "Materials")}</p>
                  <p className="text-slate-900">{formatMoney(costing.materialsCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t("finance.expensesCost", "Other expenses")}</p>
                  <p className="text-slate-900">{formatMoney(costing.expensesCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">{t("finance.totalCost", "Total cost")}</p>
                  <p className="text-slate-900">{formatMoney(costing.totalCost)}</p>
                </div>
              </div>

              {costing.budget !== null ? (
                <div
                  className={`mt-3 flex flex-wrap items-center gap-2 rounded-xl px-3 py-2 text-sm ${
                    costing.variance >= 0 ? "bg-brand-50 text-brand-700" : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {costing.variance >= 0 ? <TrendingUp size={15} /> : <TrendingDown size={15} />}
                  <span>
                    {costing.variance >= 0
                      ? t("finance.underBudget", { amount: formatMoney(costing.variance) }, "{{amount}} under budget")
                      : t("finance.overBudget", { amount: formatMoney(Math.abs(costing.variance)) }, "{{amount}} over budget")}
                  </span>
                  {costing.variancePct !== null ? (
                    <span className="text-xs opacity-70">{Math.round(costing.variancePct)}%</span>
                  ) : null}
                </div>
              ) : null}

              {costing.multiProjectWorkers?.length > 0 ? (
                <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  <TriangleAlert size={14} className="mt-0.5 shrink-0" />
                  <span>
                    {t(
                      "finance.multiProjectWarning",
                      { names: costing.multiProjectWorkers.join(", ") },
                      "{{names}} are also assigned to other projects — their full hours are counted on each."
                    )}
                  </span>
                </div>
              ) : null}

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("finance.expenses", "Expenses")}</p>
                {expenses.length ? (
                  <div className="mt-2 space-y-1.5">
                    {expenses.map((expense) => (
                      <div
                        key={expense.id}
                        className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm"
                      >
                        <div className="min-w-0">
                          <p className="break-anywhere text-slate-800">
                            {expense.description ||
                              t(`finance.category.${expense.category}`, expense.category || t("finance.category.other", "Other"))}
                          </p>
                          <p className="text-xs text-slate-400">{new Date(expense.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-slate-700">{formatMoney(expense.amount)}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                            aria-label={t("common.delete", "Delete")}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-slate-400">{t("finance.noExpenses", "No extra expenses logged yet.")}</p>
                )}
              </div>

              <form onSubmit={handleAddExpense} className="mt-4 space-y-2.5 rounded-xl border border-dashed border-slate-200 p-3">
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORY_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setForm((current) => ({ ...current, category: preset }))}
                      className={`rounded-full px-3 py-1.5 text-xs transition ${
                        form.category === preset ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {t(`finance.category.${preset}`, preset)}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  placeholder={t("finance.expenseDescriptionPlaceholder", "Description (optional)")}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    inputMode="decimal"
                    required
                    value={form.amount}
                    onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
                    placeholder={t("finance.amount", "Amount")}
                    className="w-1/2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                  <input
                    type="date"
                    value={form.date}
                    onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                    className="w-1/2 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-4 text-sm text-white transition active:bg-brand-800 disabled:opacity-60"
                >
                  <Plus size={16} />
                  {t("finance.addExpense", "Add expense")}
                </button>
              </form>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
