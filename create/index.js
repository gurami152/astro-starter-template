#!/usr/bin/env node

const path = require('path');
const fs = require('fs/promises');
const { create } = require('create-create-app');

const templateRoot = path.resolve(__dirname, '..');

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
  promptForTemplate: true, // Дозволяє нам ставити кастомні питання
  getQuestions: () => [
    {
      name: 'templateType',
      type: 'select',
      message: 'Choose a template type',
      choices: [
        { title: 'Default (with example content)', value: 'default' },
        { title: 'Empty (a blank project)', value: 'empty' },
      ],
      initial: 0,
    },
    {
      name: 'selectedLangs',
      type: 'multiselect',
      message: 'Select languages to include',
      choices: LANGUAGES,
      initial: [0, 1], // Попередньо вибрані UA та EN
      min: 1,
    },
  ],
  async afterCreation(answers) {
    const { templateType, selectedLangs, dir } = answers;

    // --- Обробка типу шаблону ---
    if (templateType === 'empty') {
      const pagePath = path.join(dir, 'src/pages/[lang]/index.astro');
      const headerPath = path.join(dir, 'src/layouts/Header.astro');
      
      await fs.rename(`${pagePath}.empty`, pagePath);
      await fs.rename(`${headerPath}.empty`, headerPath);

      // Видаляємо непотрібний .empty файл
      await fs.unlink(`${path.join(dir, 'src/layouts/Header.astro.empty')}`).catch(() => {});
    }
    // Видаляємо зайвий .empty файл, якщо він залишився
    await fs.unlink(path.join(dir, 'src/pages/[lang]/index.astro.empty')).catch(() => {});
    await fs.unlink(path.join(dir, 'src/layouts/Header.astro.empty')).catch(() => {});

    // --- Обробка мов ---
    const i18nDir = path.join(dir, 'i18n');
    const allLangs = LANGUAGES.map(l => l.value);

    // Видаляємо файли мов, які НЕ були обрані
    for (const lang of allLangs) {
      if (!selectedLangs.includes(lang)) {
        await fs.unlink(path.join(i18nDir, `${lang}.json`)).catch(() => {});
        await fs.unlink(path.join(i18nDir, `${lang}.json.empty`)).catch(() => {});
      }
    }

    // Перейменовуємо .empty файли для обраних мов, якщо треба
    if (templateType === 'empty') {
      for (const lang of selectedLangs) {
        const langPath = path.join(i18nDir, `${lang}.json`);
        await fs.rename(`${langPath}.empty`, langPath);
      }
    }
    // Видаляємо всі .empty файли, що залишились
    for (const lang of allLangs) {
      await fs.unlink(path.join(i18nDir, `${lang}.json.empty`)).catch(() => {});
    }

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

    console.log('\\n🚀 Project created successfully!');
    console.log('To get started, run:');
    console.log(`  cd ${path.basename(dir)}`);
    console.log('  npm install');
    console.log('  npm run dev');
  }
});