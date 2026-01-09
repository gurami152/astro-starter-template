import ua from "../i18n/ua.json";
import en from "../i18n/en.json";

const translations = {
  ua,
  en,
};

export type Language = keyof typeof translations;
export const LANGUAGES: Language[] = ["ua", "en"];
export const DEFAULT_LANG: Language = "ua";

export function getI18n(lang: string | undefined) {
  const currentLang =
    lang && LANGUAGES.includes(lang as Language)
      ? (lang as Language)
      : DEFAULT_LANG;

  return {
    lang: currentLang,
    t: translations[currentLang],
  };
}
