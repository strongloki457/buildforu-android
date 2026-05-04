import { AlertTriangle, PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName } from "../../utils/localizedValue";

export default function MaterialRequestForm({ projectName, projectOptions, defaultProjectId, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    itemName: "",
    quantity: "",
    note: "",
    projectId: defaultProjectId ?? projectOptions[0]?.id ?? ""
  });

  useEffect(() => {
    setForm((current) => ({
      ...current,
      projectId: projectOptions.some((project) => project.id === current.projectId)
        ? current.projectId
        : defaultProjectId ?? projectOptions[0]?.id ?? ""
    }));
  }, [defaultProjectId, projectOptions]);

  const handleChange = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const itemName = form.itemName.trim();
    const quantity = form.quantity.trim();
    const note = form.note.trim();

    if (!itemName || !form.projectId) {
      return;
    }

    const createdRequest = onSubmit({
      itemName,
      quantity,
      note,
      projectId: form.projectId
    });

    if (createdRequest) {
      setForm({
        itemName: "",
        quantity: "",
        note: "",
        projectId: defaultProjectId ?? projectOptions[0]?.id ?? ""
      });
    }
  };

  return (
    <Card>
      <SectionHeader
        title={t("materials.requestFormTitle", "Create a material request")}
        subtitle={t(
          "materials.requestFormSubtitle",
          "Submit what you need for work so the office can track and purchase it."
        )}
      />

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="rounded-lg bg-slate-50/90 p-4">
          <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
            {t("workers.assignedProjects", "Assigned projects")}
          </p>
          <p className="mt-3 text-sm text-slate-700">
            {projectName || t("materials.noProjectAssigned", "No project assigned right now.")}
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("common.project")}</span>
          <select
            value={form.projectId}
            onChange={(event) => handleChange("projectId", event.target.value)}
            required
            className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">{t("calendar.selectProject", "Select project")}</option>
            {projectOptions.map((project) => (
              <option key={project.id} value={project.id}>
                {getProjectName(t, project)}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("materials.itemName", "Item name")}</span>
          <input
            value={form.itemName}
            onChange={(event) => handleChange("itemName", event.target.value)}
            placeholder={t("materials.itemPlaceholder", "Paint, screws, cement, toilet, tiles...")}
            required
            className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("materials.quantity", "Quantity")}</span>
          <input
            value={form.quantity}
            onChange={(event) => handleChange("quantity", event.target.value)}
            placeholder={t("materials.quantityPlaceholder", "Optional, e.g. 20 bags or 2 boxes")}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-sm text-slate-600">{t("materials.note", "Note")}</span>
          <textarea
            value={form.note}
            onChange={(event) => handleChange("note", event.target.value)}
            placeholder={t("materials.notePlaceholder", "Optional context for the office or purchasing flow")}
            rows={4}
            className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          />
        </label>

        {!projectOptions.length ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <span>{t("materials.projectRequiredHint", "A material request must be connected to a project.")}</span>
          </div>
        ) : null}

        <Button type="submit" className="w-full justify-center gap-2" disabled={!projectOptions.length}>
          <PackagePlus size={16} />
          {t("materials.submitRequest", "Submit request")}
        </Button>
      </form>
    </Card>
  );
}
