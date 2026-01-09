// src/utils/loadLocale.ts
export async function loadLocale(lang: string) {
  try {
    return await import(`../i18n/${lang}.json`).then((mod) => mod.default);
  } catch {
    return await import(`../i18n/uk.json`).then((mod) => mod.default); // Фолбек на українську мову
  }
}
