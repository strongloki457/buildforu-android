import { Camera, PackagePlus, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Button from "../ui/Button";
import Card from "../ui/Card";
import SectionHeader from "../ui/SectionHeader";
import { useI18n } from "../../hooks/useI18n";
import { getProjectName } from "../../utils/localizedValue";

function compressImage(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = url;
  });
}

export default function MaterialRequestForm({ projectName, projectOptions, defaultProjectId, onSubmit }) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    itemName: "",
    quantity: "",
    note: "",
    projectId: defaultProjectId ?? projectOptions[0]?.id ?? ""
  });
  const [pendingImage, setPendingImage] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);

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

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const compressed = await compressImage(file);
    setPendingImage(compressed);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const itemName = form.itemName.trim();
    const quantity = form.quantity.trim();
    const note = form.note.trim();

    if (!itemName) {
      return;
    }

    setIsSaving(true);

    try {
      const createdRequest = await onSubmit({
        itemName,
        quantity,
        note,
        imageBase64: pendingImage || undefined,
        projectId: form.projectId
      });

      if (createdRequest) {
        setForm({
          itemName: "",
          quantity: "",
          note: "",
          projectId: defaultProjectId ?? projectOptions[0]?.id ?? ""
        });
        setPendingImage(null);
      }
    } finally {
      setIsSaving(false);
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
            className="rounded-lg border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-brand-200 focus:ring-2 focus:ring-brand-100"
          >
            <option value="">{t("materials.noProjectLink", "No project link")}</option>
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

        <div className="grid gap-2">
          <span className="text-sm text-slate-600">{t("materials.photo", "Photo")}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImagePick}
          />
          {pendingImage ? (
            <div className="flex items-start gap-3">
              <div className="relative">
                <img
                  src={pendingImage}
                  alt=""
                  className="h-24 w-24 rounded-xl object-cover border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => setPendingImage(null)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-slate-700 text-white hover:bg-slate-900"
                >
                  <X size={10} />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">{t("materials.photoReady", "Photo ready to send")}</p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <Camera size={16} />
              {t("materials.addPhoto", "Take a photo or choose from gallery")}
            </button>
          )}
        </div>

        {!projectOptions.length ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500">
            <span>{t("materials.projectRequiredHint", "Project is optional; the office can link it later.")}</span>
          </div>
        ) : null}

        <Button type="submit" className="w-full justify-center gap-2" disabled={isSaving || !form.itemName.trim()}>
          <PackagePlus size={16} />
          {isSaving ? t("common.saving", "Saving...") : t("materials.submitRequest", "Submit request")}
        </Button>
      </form>
    </Card>
  );
}
