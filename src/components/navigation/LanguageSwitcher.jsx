import { Languages } from "lucide-react";
import { useI18n } from "../../hooks/useI18n";

export default function LanguageSwitcher() {
  const { locale, setLocale, languageOptions, t } = useI18n();

  return (
    <label className="inline-flex items-center gap-2 rounded-2xl bg-white/70 px-3 py-2 text-sm text-slate-600">
      <Languages size={16} />
      <span className="sr-only">{t("common.language")}</span>
      <select
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className="max-w-[74px] bg-transparent text-sm outline-none sm:max-w-none"
      >
        {languageOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
