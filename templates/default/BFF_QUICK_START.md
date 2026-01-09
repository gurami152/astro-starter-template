# BFF Quick Start Guide

Швидкий старт для роботи з BFF шаром у цьому Astro шаблоні.

## 🚀 Швидкий старт за 5 хвилин

### Крок 1: Налаштування змінних середовища

Створіть файл `.env` у корені проєкту:

```bash
# Для демо використовуємо JSONPlaceholder API
PUBLIC_API_URL=https://jsonplaceholder.typicode.com
SITE=http://localhost:4321
```

### Крок 2: Встановіть залежності

```bash
npm install
```

### Крок 3: Запустіть проєкт

```bash
npm run dev
```

### Крок 4: Відкрийте демо

Відкрийте у браузері:

- Основна демо сторінка: `http://localhost:4321/uk/bff-demo`
- Колекція: `http://localhost:4321/uk/collection/posts`

## 📝 Перший запит через BFF

### У Astro компоненті (SSR)

Створіть файл `src/pages/my-posts.astro`:

```astro
---
import { fetchCollection } from "@/bff/client";
import BaseLayout from "@/layouts/base/BaseLayout.astro";

// Отримуємо дані через BFF
const result = await fetchCollection("posts", {
  page: 1,
  limit: 5,
});

const posts = result.success ? result.data : null;
---

<BaseLayout title="My Posts">
  {
    posts ? (
      <div>
        <h1>{posts.name}</h1>
        <p>Всього: {posts.totalItems}</p>

        {posts.items.map((post) => (
          <article>
            <h2>{post.title}</h2>
            <p>{post.excerpt}</p>
          </article>
        ))}
      </div>
    ) : (
      <p>Не вдалося завантажити дані</p>
    )
  }
</BaseLayout>
```

Відкрийте `http://localhost:4321/my-posts`

## 🎯 Основні функції

### 1. Отримати колекцію

```typescript
import { fetchCollection } from "@/bff/client";

const result = await fetchCollection("posts", {
  page: 1,
  limit: 10,
  sortBy: "date",
  order: "desc",
});

if (result.success) {
  console.log("Items:", result.data.items);
} else {
  console.error("Error:", result.error.userMessage);
}
```

### 2. Пошук у колекції

```typescript
import { searchCollection } from "@/bff/client";

const result = await searchCollection("posts", "astro");

if (result.success) {
  console.log("Found:", result.data.totalItems, "items");
}
```

### 3. Агрегація кількох колекцій

```typescript
import { fetchMultipleCollections } from "@/bff/client";

const result = await fetchMultipleCollections(["posts", "products"]);

if (result.success) {
  console.log("Posts:", result.data.posts);
  console.log("Products:", result.data.products);
}
```

### 4. Отримати користувача

```typescript
import { fetchUser } from "@/bff/client";

const result = await fetchUser("123");

if (result.success) {
  console.log("User:", result.data.displayName);
}
```

## 🔧 Налаштування під ваш API

### Крок 1: Визначте API відповідь

Припустимо, ваш API повертає:

```json
{
  "id": 1,
  "name": "Product Name",
  "price": 99.99,
  "created_at": "2024-01-01T00:00:00Z"
}
```

### Крок 2: Додайте типи

У `src/bff/types/index.ts`:

```typescript
// API Response
export interface ApiProductResponse {
  id: number;
  name: string;
  price: number;
  created_at: string;
}

// DTO для UI
export interface ProductDTO {
  id: string;
  name: string;
  formattedPrice: string;
  createdDate: string;
}
```

### Крок 3: Створіть трансформер

У `src/bff/transformers/product.transformer.ts`:

```typescript
import type { ApiProductResponse, ProductDTO } from "../types";

export function transformProduct(api: ApiProductResponse): ProductDTO {
  return {
    id: String(api.id),
    name: api.name,
    formattedPrice: `${api.price} грн`,
    createdDate: new Date(api.created_at).toLocaleDateString("uk-UA"),
  };
}
```

### Крок 4: Створіть сервіс

У `src/bff/services/product.service.ts`:

```typescript
import { createApiClient } from "../http/api-client";
import { transformProduct } from "../transformers/product.transformer";
import { transformError } from "../transformers/error.transformer";
import type { BFFResponse, ProductDTO } from "../types";

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

### Крок 5: Створіть endpoint

У `src/pages/api/bff/products/[id].ts`:

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

### Крок 6: Додайте клієнтську функцію

У `src/bff/client/index.ts`:

```typescript
export async function fetchProduct(
  id: string,
): Promise<BFFResponse<ProductDTO>> {
  const baseUrl = getBFFBaseUrl();
  const url = `${baseUrl}/products/${id}`;

  try {
    const response = await fetch(url);
    return await handleBFFResponse<ProductDTO>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: error instanceof Error ? error.message : "Network error",
        userMessage: "Помилка з'єднання",
        timestamp: new Date().toISOString(),
      },
    };
  }
}
```

### Крок 7: Використайте у компоненті

```astro
---
import { fetchProduct } from "@/bff/client";

const result = await fetchProduct("123");
const product = result.success ? result.data : null;
---

{
  product && (
    <div>
      <h1>{product.name}</h1>
      <p>{product.formattedPrice}</p>
      <p>{product.createdDate}</p>
    </div>
  )
}
```

## 📚 Корисні ресурси

- **[README.md](./README.md)** - Загальна інформація про проєкт
- **[src/bff/README.md](./src/bff/README.md)** - Повна документація BFF
- **[BFF_ARCHITECTURE.md](./BFF_ARCHITECTURE.md)** - Детальна архітектура
- **[BFF_EXAMPLES.md](./BFF_EXAMPLES.md)** - Практичні приклади
- **[ENV.md](./ENV.md)** - Налаштування змінних середовища
- **[CHANGELOG_BFF.md](./CHANGELOG_BFF.md)** - Історія змін

## 🎓 Навчальні матеріали

### Відео уроки (концептуально)

1. **Що таке BFF?** - Огляд концепції
2. **Створення першого endpoint** - Покроковий туторіал
3. **Трансформація даних** - Як адаптувати API під UI
4. **Агрегація даних** - Об'єднання кількох джерел
5. **Обробка помилок** - Best practices

### Статті

1. **BFF Pattern Explained** - Теоретичний огляд
2. **Astro + BFF: Perfect Match** - Чому це працює
3. **TypeScript in BFF** - Типізація всього

## 💡 Поради

### ✅ Do

- Завжди перевіряйте `result.success` перед використанням даних
- Використовуйте `result.error.userMessage` для відображення користувачу
- Типізуйте всі функції
- Обробляйте loading стани
- Логуйте помилки

### ❌ Don't

- Не використовуйте `result.data` без перевірки `success`
- Не показуйте технічні повідомлення користувачам
- Не викликайте бекенд API безпосередньо з UI
- Не ігноруйте помилки
- Не дублюйте логіку трансформації

## 🐛 Проблеми та вирішення

### Помилка: "API URL not configured"

**Причина:** Не налаштовано змінну середовища

**Рішення:**

```bash
# Додайте у .env
PUBLIC_API_URL=https://your-api.com
```

### Помилка: "Cannot find module '@/bff/...'"

**Причина:** TypeScript не знайшов шлях

**Рішення:** Перезапустіть dev сервер:

```bash
npm run dev
```

### Timeout помилки

**Причина:** API відповідає занадто повільно

**Рішення:** Збільште timeout у `api-client.ts`:

```typescript
const apiClient = new ApiClient({
  timeout: 60000, // 60 секунд
});
```

### CORS помилки

**Причина:** Браузер блокує запити

**Рішення:** BFF вирішує це! Використовуйте BFF endpoints замість прямих викликів.

## 🚀 Наступні кроки

1. Ознайомтеся з [демо сторінкою](/uk/bff-demo)
2. Прочитайте [повну документацію](./src/bff/README.md)
3. Вивчіть [приклади](./BFF_EXAMPLES.md)
4. Налаштуйте під свій API
5. Додайте свої endpoints

## 📞 Підтримка

- Документація: Всі `.md` файли у корені проєкту
- Issues: Створіть issue з описом проблеми
- Приклади: Дивіться `src/pages/[lang]/bff-demo.astro`

---

**Готові почати?** Запустіть `npm run dev` та відкрийте `/uk/bff-demo`! 🎉
