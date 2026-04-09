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
  { value: "fr", label: "Français" },
  { value: "es", label: "Español" },
  { value: "it", label: "Italiano" }
];

function resolvePath(object, path) {
  return path.split(".").reduce((accumulator, segment) => accumulator?.[segment], object);
}

export function I18nProvider({ children }) {
  const initialLocale = window.localStorage.getItem(STORAGE_KEY) || "en";
  const [locale, setLocaleState] = useState(initialLocale);

  const setLocale = (nextLocale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem(STORAGE_KEY, nextLocale);
  };

  const t = (key, fallback) => {
    const dictionary = dictionaries[locale] || dictionaries.en;
    return resolvePath(dictionary, key) ?? fallback ?? key;
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
