import { createContext, useMemo, useState } from "react";
import de from "../i18n/locales/de.json";
import en from "../i18n/locales/en.json";
import es from "../i18n/locales/es.json";
import fr from "../i18n/locales/fr.json";
import it from "../i18n/locales/it.json";
import pl from "../i18n/locales/pl.json";

export const I18nContext = createContext(null);

const STORAGE_KEY = "buildforu-locale";
const dictionaries = { en, pl, de, fr, es, it };

const languageOptions = [
  { value: "en", label: "English" },
  { value: "pl", label: "Polski" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Fran\u00e7ais" },
  { value: "es", label: "Espa\u00f1ol" },
  { value: "it", label: "Italiano" }
];

function resolvePath(object, path) {
  if (!object || typeof path !== "string" || !path.length) {
    return undefined;
  }

  return path.split(".").reduce((accumulator, segment) => accumulator?.[segment], object);
}

function interpolate(template, params) {
  if (typeof template !== "string" || !params) {
    return template;
  }

  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template
  );
}

export function I18nProvider({ children }) {
  const initialLocale = window.localStorage.getItem(STORAGE_KEY) || "en";
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = (nextLocale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  };

  const t = (key, paramsOrFallback, maybeFallback) => {
    const dictionary = dictionaries[locale] || dictionaries.en;
    const fallbackDictionaryValue = resolvePath(dictionaries.en, key);
    const params =
      paramsOrFallback && typeof paramsOrFallback === "object" && !Array.isArray(paramsOrFallback)
        ? paramsOrFallback
        : undefined;
    const fallback =
      typeof paramsOrFallback === "string"
        ? paramsOrFallback
        : typeof maybeFallback === "string"
          ? maybeFallback
          : undefined;
    const value = resolvePath(dictionary, key) ?? fallbackDictionaryValue ?? fallback ?? key;
    return interpolate(value, params);
  };

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t,
      languageOptions
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
