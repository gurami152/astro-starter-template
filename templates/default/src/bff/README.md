# BFF (Backend for Frontend) Шар

## Що таке BFF?

BFF (Backend for Frontend) — це серверний шар, який виступає посередником між UI (фронтенд) та бекенд API. Основна ціль BFF — адаптувати дані з бекенду під специфічні потреби фронтенду.

## Переваги BFF

- **Агрегація даних**: Об'єднання даних з кількох API в один запит
- **Трансформація даних**: Перетворення даних у формат, зручний для UI
- **Приховування складності**: UI не знає про внутрішню структуру бекенду
- **Централізована обробка помилок**: Єдиний підхід до обробки помилок
- **Кешування**: Централізоване кешування на рівні BFF
- **Безпека**: Приховування API токенів та чутливих даних

## Структура BFF шару

```
src/bff/
├── types/              # TypeScript типи та DTO
│   └── index.ts
├── http/               # HTTP клієнти для зовнішніх API
│   └── api-client.ts
├── transformers/       # Трансформація даних з API в DTO
│   ├── collection.transformer.ts
│   ├── user.transformer.ts
│   ├── error.transformer.ts
│   └── index.ts
├── services/           # Бізнес-логіка та оркестрація
│   ├── collection.service.ts
│   ├── user.service.ts
│   └── index.ts
├── client/             # Клієнт для використання у UI
│   └── index.ts
└── README.md
```

## Як це працює?

### Потік даних

```
UI Component → BFF Client → BFF Endpoint → BFF Service → API Client → Backend API
                                                ↓
                                         Transformer
                                                ↓
UI Component ← BFF Client ← BFF Endpoint ← BFF Service ← DTO
```

### Приклад використання

#### 1. У серверному компоненті (SSR)

```astro
---
// src/pages/posts.astro
import { fetchCollection } from '@/bff/client';

const result = await fetchCollection('posts', {
  page: 1,
  limit: 10,
  sortBy: 'date',
  order: 'desc',
});

const posts = result.success ? result.data : null;
const error = result.success ? null : result.error;
---

{error ? (
  <div class="error">{error.userMessage}</div>
) : posts ? (
  <div>
    <h1>{posts.name}</h1>
    <div>Всього: {posts.totalItems}</div>
    {posts.items.map(post => (
      <article>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <span>{post.publishedDate}</span>
      </article>
    ))}
  </div>
) : null}
```

#### 2. У клієнтському компоненті

```typescript
// src/components/PostList.tsx
import { fetchCollection } from '@/bff/client';
import { useEffect, useState } from 'react';

export function PostList() {
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCollection('posts')
      .then(result => {
        if (result.success) {
          setPosts(result.data);
        } else {
          setError(result.error);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>{error.userMessage}</div>;
  if (!posts) return null;

  return (
    <div>
      {posts.items.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </article>
      ))}
    </div>
  );
}
```

## Як додати новий BFF endpoint?

### Крок 1: Визначити типи

У `src/bff/types/index.ts` додайте API типи та DTO:

```typescript
// API Response Type
export interface ApiProductResponse {
  id: number;
  name: string;
  price: number;
  // ...
}

// DTO для UI
export interface ProductDTO {
  id: string;
  name: string;
  formattedPrice: string;
  // ...
}
```

### Крок 2: Створити трансформер

У `src/bff/transformers/product.transformer.ts`:

```typescript
import type { ApiProductResponse, ProductDTO } from '../types';

export function transformProduct(apiProduct: ApiProductResponse): ProductDTO {
  return {
    id: String(apiProduct.id),
    name: apiProduct.name,
    formattedPrice: `${apiProduct.price} грн`,
  };
}
```

### Крок 3: Створити сервіс

У `src/bff/services/product.service.ts`:

```typescript
import { createApiClient } from '../http/api-client';
import { transformProduct } from '../transformers/product.transformer';
import type { BFFResponse, ProductDTO } from '../types';

export async function getProduct(productId: string): Promise<BFFResponse<ProductDTO>> {
  try {
    const apiClient = createApiClient();
    const apiResponse = await apiClient.get(`/products/${productId}`);
    const productDTO = transformProduct(apiResponse);

    return {
      success: true,
      data: productDTO,
    };
  } catch (error) {
    return transformError(error);
  }
}
```

### Крок 4: Створити endpoint

У `src/pages/api/bff/products/[productId].ts`:

```typescript
import type { APIRoute } from 'astro';
import { getProduct } from '@/bff/services/product.service';

export const GET: APIRoute = async ({ params }) => {
  const { productId } = params;
  
  if (!productId) {
    return new Response(JSON.stringify({
      success: false,
      error: { /* ... */ }
    }), { status: 400 });
  }

  const result = await getProduct(productId);
  const statusCode = result.success ? 200 : 500;

  return new Response(JSON.stringify(result), {
    status: statusCode,
    headers: { 'Content-Type': 'application/json' },
  });
};
```

### Крок 5: Додати клієнтську функцію

У `src/bff/client/index.ts`:

```typescript
export async function fetchProduct(productId: string): Promise<BFFResponse<ProductDTO>> {
  const baseUrl = getBFFBaseUrl();
  const url = `${baseUrl}/products/${productId}`;

  try {
    const response = await fetch(url);
    return await handleBFFResponse<ProductDTO>(response);
  } catch (error) {
    return { /* error handling */ };
  }
}
```

### Крок 6: Використати у UI

```astro
---
import { fetchProduct } from '@/bff/client';

const result = await fetchProduct('123');
const product = result.success ? result.data : null;
---

{product && (
  <div>
    <h1>{product.name}</h1>
    <p>{product.formattedPrice}</p>
  </div>
)}
```

## Налаштування змінних середовища

BFF використовує змінні середовища для налаштування URL бекенд API.

Створіть `.env` файл:

```env
# Основний API URL
PUBLIC_API_URL=https://api.example.com

# Додаткові API (якщо потрібно)
MAIN_API_URL=https://api.example.com
ANALYTICS_API_URL=https://analytics.example.com
```

У коді:

```typescript
import { createApiClient } from '@/bff/http/api-client';

// Використовує PUBLIC_API_URL або MAIN_API_URL
const mainClient = createApiClient('MAIN');

// Використовує ANALYTICS_API_URL
const analyticsClient = createApiClient('ANALYTICS');
```

## Best Practices

1. **Завжди використовуйте BFF для взаємодії з бекендом**: Ніколи не викликайте бекенд API безпосередньо з UI.

2. **DTO != API Response**: DTO має відповідати потребам UI, а не повторювати структуру API.

3. **Обробка помилок**: Використовуйте уніфікований формат помилок (`BFFErrorDTO`).

4. **Типізація**: Всі endpoints та сервіси мають бути типізовані.

5. **Кешування**: Налаштуйте відповідні заголовки `Cache-Control` для endpoints.

6. **Агрегація**: Використовуйте BFF для об'єднання даних з кількох джерел.

7. **Трансформація**: Адаптуйте дані під потреби UI (форматування дат, обчислення полів тощо).

## Тестування

```bash
# Запустіть dev сервер
npm run dev

# Тестуйте BFF endpoints
curl http://localhost:4321/api/bff/collections/posts
curl http://localhost:4321/api/bff/users/123
```

## Проблеми та їх вирішення

### Помилка: "API URL not configured"

**Рішення**: Додайте змінну `PUBLIC_API_URL` у `.env` файл.

### Помилка: "Module not found: @/bff/..."

**Рішення**: Перевірте, що у `tsconfig.json` є:

```json
{
  "compilerOptions": {
    "paths": {
      "@/bff/*": ["src/bff/*"]
    }
  }
}
```

### Timeout помилки

**Рішення**: Збільште timeout у `api-client.ts`:

```typescript
const apiClient = new ApiClient({
  baseURL: '...',
  timeout: 60000, // 60 секунд
});
```

