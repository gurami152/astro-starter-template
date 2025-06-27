#!/usr/bin/env node

const path = require('path');
const fs = require('fs/promises');
const { create } = require('create-create-app');

const templateRoot = path.resolve(__dirname, '..', 'templates');

// Список доступних мов
const LANGUAGES = [
  { title: 'Ukrainian', value: 'ua' },
  { title: 'English', value: 'en' },
  { title: 'Polish', value: 'pl' },
  { title: 'German', value: 'de' },
  { title: 'Spanish', value: 'es' },
];

create('create-astro-template', {
  templateRoot,
  promptForTemplate: true,
  extra: {
    selectedLangs: {
      type: 'multiselect',
      message: 'Select languages to include',
      choices: LANGUAGES,
      initial: [0, 1], // Попередньо вибрані UA та EN
      min: 1,
    },
  },
  async afterCreation(answers) {
    const { template, selectedLangs, dir } = answers;

    // --- Обробка мов ---
    const i18nDir = path.join(dir, 'i18n');
    const allLangs = LANGUAGES.map(l => l.value);

    // Видаляємо файли мов, які НЕ були обрані
    for (const lang of allLangs) {
      if (!selectedLangs.includes(lang)) {
        await fs.unlink(path.join(i18nDir, `${lang}.json`)).catch(() => {});
        // для empty шаблону
        await fs.unlink(path.join(i18nDir, `${lang}.json.empty`)).catch(() => {});
      }
    }

    // Якщо шаблон 'empty', перейменовуємо .empty файли для обраних мов
    if (template === 'empty') {
      for (const lang of selectedLangs) {
        const langPath = path.join(i18nDir, `${lang}.json`);
        // Перевіряємо, чи існує .empty файл перед перейменуванням
        try {
          await fs.access(`${langPath}.empty`);
          await fs.rename(`${langPath}.empty`, langPath);
        } catch {
          // Файл .empty не існує, нічого не робимо
        }
      }
        const pagePath = path.join(dir, 'src/pages/[lang]/index.astro');
        const headerPath = path.join(dir, 'src/layouts/Header.astro');
        try {
            await fs.access(`${pagePath}.empty`);
            await fs.rename(`${pagePath}.empty`, pagePath);
        } catch {}
        try {
            await fs.access(`${headerPath}.empty`);
            await fs.rename(`${headerPath}.empty`, headerPath);
        } catch {}
    }

    // Видаляємо всі .empty файли, що залишились, щоб уникнути сміття
    for (const lang of allLangs) {
      await fs.unlink(path.join(i18nDir, `${lang}.json.empty`)).catch(() => {});
    }
     await fs.unlink(path.join(dir, 'src/pages/[lang]/index.astro.empty')).catch(() => {});
     await fs.unlink(path.join(dir, 'src/layouts/Header.astro.empty')).catch(() => {});

    // --- Оновлення i18n.ts ---
    const i18nUtilPath = path.join(dir, 'utils/i18n.ts');
    const imports = selectedLangs.map(lang => `import ${lang} from '../i18n/${lang}.json';`).join('\n');
    const translations = `const translations = {\n  ${selectedLangs.join(',\n  ')},\n};`;
    const languagesExport = `export const LANGUAGES: Language[] = [${selectedLangs.map(l => `'${l}'`).join(', ')}];`;
    const defaultLangExport = `export const DEFAULT_LANG: Language = '${selectedLangs[0]}';`;

    const newI18nUtilContent = `
${imports}

${translations}

export type Language = keyof typeof translations;
${languagesExport}
${defaultLangExport}

export function getI18n(lang: string | undefined) {
  const currentLang = (lang && LANGUAGES.includes(lang as Language)) ? (lang as Language) : DEFAULT_LANG;
  
  return {
    lang: currentLang,
    t: translations[currentLang],
  };
}
    `;
    await fs.writeFile(i18nUtilPath, newI18nUtilContent.trim());

    console.log('\n🚀 Project created successfully!');
    console.log('To get started, run:');
    console.log(`  cd ${path.basename(dir)}`);
    console.log('  npm install');
    console.log('  npm run dev');
  }
});