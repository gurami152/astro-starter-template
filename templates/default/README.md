# Astro Starter Template with BFF

Сучасний Astro шаблон з вбудованим BFF (Backend for Frontend) шаром для ефективної взаємодії з бекенд API.

## ✨ Особливості

- 🚀 **Astro 5.x** - Сучасний фреймворк для швидких веб-додатків
- 🔄 **BFF Layer** - Backend for Frontend для інкапсуляції API логіки
- 📦 **TypeScript** - Повна типізація для безпеки коду
- 🎨 **Tailwind CSS 4.0** - Сучасний utility-first CSS фреймворк
- 🌐 **i18n** - Підтримка мультимовності
- 📱 **Responsive** - Адаптивний дизайн для всіх пристроїв
- ⚡ **SSR/SSG** - Server-Side Rendering та Static Site Generation

## 🚀 Project Structure

```text
/
├── public/                 # Статичні файли
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── bff/               # 🔥 Backend for Frontend шар
│   │   ├── types/         # TypeScript типи та DTO
│   │   ├── http/          # HTTP клієнти для API
│   │   ├── transformers/  # Трансформація даних
│   │   ├── services/      # Бізнес-логіка та оркестрація
│   │   ├── client/        # Клієнт для UI компонентів
│   │   └── README.md      # Документація BFF
│   ├── components/        # Astro компоненти
│   │   ├── base/         # Базові компоненти
│   │   ├── forms/        # Форми
│   │   ├── layout/       # Лейаут компоненти
│   │   ├── sections/     # Секції сторінок
│   │   ├── ui/           # UI компоненти
│   │   └── widgets/      # Віджети
│   ├── layouts/          # Лейаути сторінок
│   │   ├── base/
│   │   └── content/
│   ├── pages/            # Сторінки та API routes
│   │   ├── api/
│   │   │   ├── bff/     # 🔥 BFF API endpoints
│   │   │   └── collections/
│   │   └── [lang]/      # Мультимовні сторінки
│   ├── styles/          # Глобальні стилі
│   └── config/          # Конфігурація
├── utils/               # Утиліти
│   ├── api.ts
│   ├── i18n.ts
│   └── redis.ts
├── i18n/               # Переклади
├── ENV.md              # 🔥 Документація змінних середовища
└── package.json
```

## 🔥 BFF (Backend for Frontend)

Цей шаблон включає повноцінний BFF шар, який виступає посередником між UI та бекенд API.

### Що таке BFF?

BFF — це серверний шар, що адаптує дані з бекенду під специфічні потреби фронтенду.

### Переваги BFF

- **Агрегація даних**: Об'єднання даних з кількох API в один запит
- **Трансформація**: Перетворення даних у зручний для UI формат
- **Безпека**: Приховування API токенів та внутрішньої структури
- **Кешування**: Централізоване кешування
- **Обробка помилок**: Єдиний підхід до обробки помилок
- **Відв'язка**: UI не залежить від структури бекенд API

### Потік даних

```
UI Component → BFF Client → BFF Endpoint → BFF Service → API Client → Backend API
                                                ↓
                                         Transformer
                                                ↓
UI Component ← DTO (зручний для UI формат)
```

### Швидкий старт з BFF

1. **Налаштуйте змінні середовища** (див. [ENV.md](./ENV.md)):

```bash
# Створіть .env файл
PUBLIC_API_URL=https://api.example.com
SITE=http://localhost:4321
```

2. **Використовуйте BFF у компонентах**:

```astro
---
import { fetchCollection } from "@/bff/client";

const result = await fetchCollection("posts");
const posts = result.success ? result.data : null;
---

{
  posts && (
    <div>
      {posts.items.map((post) => (
        <article>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  )
}
```

3. **Перегляньте демо**: Відкрийте `/bff-demo` після запуску проєкту

### Документація BFF

Детальну документацію про BFF шар дивіться у:

- **[src/bff/README.md](./src/bff/README.md)** - Повна документація BFF
- **[ENV.md](./ENV.md)** - Налаштування змінних середовища

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                            |
| :------------------------ | :------------------------------------------------ |
| `npm install`             | Installs dependencies                             |
| `npm run dev`             | Starts local dev server at `localhost:4321`       |
| `npm run build`           | Build your production site to `./dist/`           |
| `npm run preview`         | Preview your build locally, before deploying      |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check`  |
| `npm run astro -- --help` | Get help using the Astro CLI                      |
| `npm run lint`            | Runs ESLint to check for code issues              |
| `npm run format`          | Runs Prettier to format code and Tailwind classes |

## 🛠 Якість коду

Для підтримки чистоти та єдиного стилю коду в проєкті налаштовані **ESLint** та **Prettier**.

- **ESLint**: Перевіряє код на логічні помилки та дотримання стандартів TypeScript та Astro.
- **Prettier**: Автоматично виправляє відступи, лапки та сортує Tailwind CSS класи у правильному порядку.

### Як використовувати:

```bash
# Тільки перевірка
npm run lint

# Автоматичне виправлення стилю у всьому проєкті
npm run format
```

## 📚 Додаткові ресурси

### BFF Архітектура

- [src/bff/README.md](./src/bff/README.md) - Повна документація BFF шару
- [ENV.md](./ENV.md) - Налаштування змінних середовища
- `/bff-demo` - Демо сторінка з прикладами використання BFF

### Astro

- [Документація Astro](https://docs.astro.build)
- [Discord сервер Astro](https://astro.build/chat)

## 🏗️ Як додати новий BFF endpoint?

### 1. Визначте типи (`src/bff/types/index.ts`)

```typescript
export interface ApiProductResponse {
  id: number;
  name: string;
  price: number;
}

export interface ProductDTO {
  id: string;
  name: string;
  formattedPrice: string;
}
```

### 2. Створіть трансформер (`src/bff/transformers/product.transformer.ts`)

```typescript
export function transformProduct(api: ApiProductResponse): ProductDTO {
  return {
    id: String(api.id),
    name: api.name,
    formattedPrice: `${api.price} грн`,
  };
}
```

### 3. Створіть сервіс (`src/bff/services/product.service.ts`)

```typescript
export async function getProduct(id: string): Promise<BFFResponse<ProductDTO>> {
  try {
    const apiClient = createApiClient();
    const apiResponse = await apiClient.get(`/products/${id}`);
    const productDTO = transformProduct(apiResponse);

    return { success: true, data: productDTO };
  } catch (error) {
    return transformError(error);
  }
}
```

### 4. Створіть endpoint (`src/pages/api/bff/products/[id].ts`)

```typescript
import type { APIRoute } from "astro";
import { getProduct } from "@/bff/services/product.service";

export const GET: APIRoute = async ({ params }) => {
  const result = await getProduct(params.id!);
  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 500,
    headers: { "Content-Type": "application/json" },
  });
};
```

### 5. Додайте клієнтську функцію (`src/bff/client/index.ts`)

```typescript
export async function fetchProduct(
  id: string,
): Promise<BFFResponse<ProductDTO>> {
  const url = `${getBFFBaseUrl()}/products/${id}`;
  const response = await fetch(url);
  return await response.json();
}
```

### 6. Використайте у компоненті

```astro
---
import { fetchProduct } from "@/bff/client";
const result = await fetchProduct("123");
---

{result.success && <div>{result.data.name}</div>}
```

## 🎯 Best Practices

1. **Завжди використовуйте BFF** для взаємодії з бекендом
2. **DTO ≠ API Response** - адаптуйте дані під потреби UI
3. **Типізація** - всі endpoints мають бути типізовані
4. **Обробка помилок** - використовуйте `BFFErrorDTO`
5. **Кешування** - налаштуйте `Cache-Control` headers
6. **Безпека** - не передавайте токени та credentials на клієнт

## 👀 Хочете дізнатися більше?

- [Документація Astro](https://docs.astro.build)
- [Discord сервер Astro](https://astro.build/chat)
- [Tailwind CSS документація](https://tailwindcss.com)
