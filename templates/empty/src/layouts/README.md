# Layouts Structure

Ця папка містить всі layouts проекту, організовані за категоріями для кращої структуризації та зручності використання.

## 📁 Структура папок

### `/base` - Базові layouts
Основні layouts, які використовуються як основа для інших:

- **BaseLayout.astro** - Основний layout з HTML структурою, Header, Footer та SEO
- **ErrorLayout.astro** - Layout для сторінок помилок (404, 500, тощо)

### `/content` - Layouts для контенту
Layouts для різних типів контенту:

- **PageLayout.astro** - Layout для звичайних сторінок з контентом
- **BlogLayout.astro** - Layout для блог-постів з метаданими
- **LandingLayout.astro** - Layout для лендинг-сторінок

## 🎯 Принципи організації

1. **Ієрархія** - Layouts наслідують один від одного
2. **Спеціалізація** - Кожен layout має чітку відповідальність
3. **Перевикористання** - Базові layouts можна використовувати в різних місцях
4. **Типізація** - Всі layouts мають TypeScript інтерфейси
5. **SEO** - Підтримка мета-тегів та canonical URLs

## 📝 Використання

### BaseLayout
```astro
---
import BaseLayout from "@/layouts/base/BaseLayout.astro";
---

<BaseLayout 
  title="My Page" 
  description="Page description"
  image="/og-image.jpg"
  canonical="https://example.com/page"
>
  <h1>My Content</h1>
</BaseLayout>
```

### PageLayout
```astro
---
import PageLayout from "@/layouts/content/PageLayout.astro";
---

<PageLayout 
  title="About Us" 
  showBreadcrumbs={true}
>
  <h1>About Us</h1>
  <p>Content here...</p>
</PageLayout>
```

### BlogLayout
```astro
---
import BlogLayout from "@/layouts/content/BlogLayout.astro";

const publishDate = new Date('2024-01-15');
---

<BlogLayout 
  title="My Blog Post"
  description="Post description"
  publishDate={publishDate}
  author="John Doe"
  tags={["astro", "web", "development"]}
>
  <p>Blog content here...</p>
</BlogLayout>
```

### ErrorLayout
```astro
---
import ErrorLayout from "@/layouts/base/ErrorLayout.astro";
---

<ErrorLayout 
  title="Page Not Found"
  description="The page you're looking for doesn't exist."
  code={404}
/>
```

## 🔧 Налаштування

Всі layouts підтримують:
- Темну тему
- SEO мета-теги
- Responsive дизайн
- Accessibility
- TypeScript типи
