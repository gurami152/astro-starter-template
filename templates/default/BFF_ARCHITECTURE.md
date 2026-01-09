# BFF Architecture - Детальна архітектура

## Огляд архітектури

BFF (Backend for Frontend) шар у цьому шаблоні реалізовано як проміжний серверний рівень між UI та бекенд API. Архітектура складається з кількох шарів, кожен з яких має свою відповідальність.

## Архітектурні шари

```
┌─────────────────────────────────────────────────────────────┐
│                        UI Layer (Astro)                      │
│  - Astro компоненти (.astro)                                │
│  - React/Vue/Svelte компоненти (опціонально)                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ fetchCollection(), fetchUser(), etc.
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    BFF Client Layer                          │
│  src/bff/client/                                            │
│  - Надає зручні функції для UI                              │
│  - Обробляє URLs (відносні/абсолютні)                       │
│  - Базова обробка помилок                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP Request
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BFF API Endpoints                          │
│  src/pages/api/bff/                                         │
│  - Astro API Routes                                          │
│  - Валідація запитів                                         │
│  - Парсинг параметрів                                        │
│  - Формування HTTP відповідей                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Виклик сервісу
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   BFF Services Layer                         │
│  src/bff/services/                                          │
│  - Orchestration логіка                                      │
│  - Агрегація даних з кількох джерел                         │
│  - Бізнес-логіка на рівні BFF                               │
│  - Виклики до API Client                                     │
│  - Застосування трансформерів                                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ API запити
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   HTTP Client Layer                          │
│  src/bff/http/                                              │
│  - Інкапсуляція HTTP запитів                                │
│  - Timeout і retry логіка                                    │
│  - Обробка помилок (4xx, 5xx)                               │
│  - Налаштування headers                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ HTTP/HTTPS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API(s)                            │
│  - RESTful API                                               │
│  - GraphQL (можливо)                                         │
│  - Мікросервіси                                              │
└─────────────────────────────────────────────────────────────┘
```

## Потік даних

### 1. Запит від UI

```typescript
// У Astro компоненті
const result = await fetchCollection('posts', {
  page: 1,
  limit: 10,
  sortBy: 'date',
});
```

### 2. BFF Client формує URL та робить fetch

```typescript
// src/bff/client/index.ts
const url = `${baseUrl}/collections/posts?page=1&limit=10&sortBy=date`;
const response = await fetch(url);
```

### 3. BFF Endpoint обробляє запит

```typescript
// src/pages/api/bff/collections/[collection].ts
export const GET: APIRoute = async ({ params, request }) => {
  const { collection } = params;
  const queryParams = parseQueryParams(request.url);
  
  const result = await getCollection(collection, queryParams);
  
  return new Response(JSON.stringify(result), {
    status: result.success ? 200 : 500,
  });
};
```

### 4. BFF Service orchestrate логіку

```typescript
// src/bff/services/collection.service.ts
export async function getCollection(name, params) {
  try {
    // 1. Викликаємо API
    const apiClient = createApiClient();
    const apiResponse = await apiClient.get(`/collections/${name}`);
    
    // 2. Трансформуємо дані
    const dto = transformCollection(apiResponse);
    
    // 3. Застосовуємо додаткові фільтри
    dto.items = filterAndSortCollectionItems(dto.items, params);
    
    // 4. Повертаємо результат
    return { success: true, data: dto };
  } catch (error) {
    return transformError(error);
  }
}
```

### 5. HTTP Client виконує запит до бекенду

```typescript
// src/bff/http/api-client.ts
async get(path) {
  const url = `${this.config.baseURL}${path}`;
  
  // Retry логіка
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await this.fetchWithTimeout(url, options, timeout);
      return this.handleResponse(response);
    } catch (error) {
      // Retry або throw
    }
  }
}
```

### 6. Transformers адаптують дані

```typescript
// src/bff/transformers/collection.transformer.ts
export function transformCollection(apiResponse) {
  return {
    name: apiResponse.collection,
    items: apiResponse.items.map(transformCollectionItem),
    totalItems: apiResponse.total,
    updatedAt: formatDate(apiResponse.timestamp),
  };
}
```

## Типи даних

### API Response Types

Типи даних, які повертає бекенд API (як є):

```typescript
interface ApiCollectionResponse {
  collection: string;
  items: ApiCollectionItem[];
  timestamp: string;
  total?: number;
}
```

### DTO Types

Типи даних, які повертає BFF до UI (адаптовані):

```typescript
interface CollectionDTO {
  name: string;
  items: CollectionItemDTO[];
  totalItems: number;
  updatedAt: string; // Форматована дата
  pagination?: PaginationInfo;
}
```

### BFF Response Wrapper

Уніфікований формат відповіді BFF:

```typescript
type BFFResponse<T> = 
  | { success: true; data: T; meta?: { cached: boolean; duration?: number } }
  | { success: false; error: { code: string; message: string; userMessage: string } };
```

## Принципи проектування

### 1. Separation of Concerns

Кожен шар має свою відповідальність:
- **Client**: URL формування та базова обробка помилок
- **Endpoints**: HTTP специфіка (запити, відповіді, валідація)
- **Services**: Бізнес-логіка та orchestration
- **HTTP Client**: Взаємодія з зовнішніми API
- **Transformers**: Адаптація даних

### 2. Single Responsibility

Кожна функція має одну відповідальність:
- `transformCollection` - трансформує колекцію
- `filterAndSortCollectionItems` - фільтрує та сортує
- `getCollection` - orchestrate весь процес отримання колекції

### 3. Don't Repeat Yourself (DRY)

Загальна логіка винесена в окремі функції:
- `createApiClient()` - створення API клієнта
- `transformError()` - трансформація помилок
- `getBFFBaseUrl()` - отримання базового URL

### 4. Dependency Inversion

Сервіси залежать від абстракцій (interfaces), не від конкретних реалізацій:

```typescript
// Сервіс не знає про конкретну реалізацію HTTP клієнта
const apiClient = createApiClient(); // Factory pattern
const response = await apiClient.get(path);
```

### 5. Open/Closed Principle

Легко додавати нові функціональності без зміни існуючого коду:

```typescript
// Додавання нового трансформера
export function transformProduct(apiProduct: ApiProductResponse): ProductDTO {
  // ...
}

// Додавання нового сервісу
export async function getProduct(id: string): Promise<BFFResponse<ProductDTO>> {
  // ...
}
```

## Patterns

### 1. Repository Pattern

HTTP Client діє як repository для зовнішніх API:

```typescript
class ApiClient {
  async get<T>(path: string): Promise<T> { /* ... */ }
  async post<T>(path: string, data: unknown): Promise<T> { /* ... */ }
  async put<T>(path: string, data: unknown): Promise<T> { /* ... */ }
  async delete<T>(path: string): Promise<T> { /* ... */ }
}
```

### 2. Transformer Pattern

Трансформери відокремлюють логіку перетворення даних:

```typescript
// API Response -> DTO
export function transformX(apiX: ApiXResponse): XDTO {
  return { /* трансформована структура */ };
}
```

### 3. Service Layer Pattern

Сервіси інкапсулюють бізнес-логіку:

```typescript
export async function getCollection(name: string): Promise<BFFResponse<CollectionDTO>> {
  // 1. Отримати дані
  // 2. Трансформувати
  // 3. Обробити помилки
  // 4. Повернути результат
}
```

### 4. Factory Pattern

Створення об'єктів через factory функції:

```typescript
export function createApiClient(apiName: string = 'MAIN'): ApiClient {
  const baseURL = import.meta.env[`${apiName}_API_URL`];
  return new ApiClient({ baseURL, /* ... */ });
}
```

### 5. Strategy Pattern

Різні стратегії обробки помилок:

```typescript
function getErrorCode(error: Error, statusCode?: number): string {
  if (error instanceof TimeoutError) return 'TIMEOUT';
  if (error instanceof NetworkError) return 'NETWORK_ERROR';
  if (statusCode === 404) return 'NOT_FOUND';
  // ...
}
```

## Обробка помилок

### Ієрархія помилок

```
Error (базовий клас)
  └── ApiClientError
      ├── TimeoutError
      └── NetworkError
```

### Трансформація помилок

Всі помилки трансформуються у уніфікований формат:

```typescript
interface BFFErrorDTO {
  success: false;
  error: {
    code: string;           // Машиночитаємий код
    message: string;        // Технічне повідомлення
    userMessage: string;    // Повідомлення для користувача
    timestamp: string;      // Час помилки
  };
}
```

## Performance

### 1. Агрегація запитів

Замість N запитів з UI, робимо 1 запит до BFF, який агрегує дані:

```typescript
// Замість цього у UI:
const posts = await fetch('/api/posts');
const products = await fetch('/api/products');

// Використовуємо агрегацію у BFF:
const data = await fetchMultipleCollections(['posts', 'products']);
```

### 2. Кешування

BFF може кешувати дані на своєму рівні:

```typescript
// У endpoint
return new Response(JSON.stringify(result), {
  headers: {
    'Cache-Control': 'public, max-age=60', // Кешування на 1 хвилину
  },
});
```

### 3. Parallel запити

BFF може робити паралельні запити до різних API:

```typescript
export async function getMultipleCollections(names: string[]) {
  const promises = names.map(name => getCollection(name));
  const results = await Promise.all(promises); // Паралельно
  // ...
}
```

## Security

### 1. API Keys приховані

API ключі та токени зберігаються тільки на сервері (BFF):

```typescript
// У BFF (безпечно)
const apiClient = new ApiClient({
  headers: {
    'Authorization': `Bearer ${import.meta.env.API_SECRET_KEY}`,
  },
});

// UI ніколи не бачить API_SECRET_KEY
```

### 2. Валідація на BFF рівні

```typescript
export const GET: APIRoute = async ({ params }) => {
  if (!params.collection) {
    return new Response(JSON.stringify({
      success: false,
      error: { /* ... */ }
    }), { status: 400 });
  }
  // ...
};
```

### 3. Rate Limiting

BFF може контролювати rate limiting:

```typescript
// Можна додати middleware для rate limiting
const rateLimiter = new RateLimiter({ max: 100, window: '1m' });
```

## Тестування

### Unit тести

Тестування окремих функцій:

```typescript
describe('transformCollection', () => {
  it('should transform API response to DTO', () => {
    const apiResponse = { /* ... */ };
    const dto = transformCollection(apiResponse);
    expect(dto.name).toBe('posts');
  });
});
```

### Integration тести

Тестування взаємодії між шарами:

```typescript
describe('getCollection', () => {
  it('should fetch and transform collection', async () => {
    const result = await getCollection('posts');
    expect(result.success).toBe(true);
    expect(result.data.items).toBeInstanceOf(Array);
  });
});
```

### E2E тести

Тестування всього потоку:

```typescript
test('should display posts on page', async ({ page }) => {
  await page.goto('/posts');
  const posts = await page.locator('.post-item');
  expect(await posts.count()).toBeGreaterThan(0);
});
```

## Масштабування

### Горизонтальне масштабування

BFF може бути розгорнуто на кількох серверах:

```
Load Balancer
    ├─ BFF Instance 1
    ├─ BFF Instance 2
    └─ BFF Instance 3
```

### Кешування з Redis

```typescript
// Додати Redis для кешування між інстансами
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

const data = await fetchFromAPI();
await redis.setex(cacheKey, 300, JSON.stringify(data));
```

### CDN

Статичні BFF відповіді можна кешувати на CDN:

```typescript
return new Response(JSON.stringify(result), {
  headers: {
    'Cache-Control': 'public, s-maxage=3600', // CDN кешування
  },
});
```

## Best Practices

1. **Завжди типізуйте** всі функції та endpoints
2. **Використовуйте DTO** замість прямого повернення API відповідей
3. **Обробляйте всі помилки** та логуйте їх
4. **Налаштуйте retry** для нестабільних API
5. **Використовуйте timeout** для запобігання зависань
6. **Агрегуйте дані** замість N+1 запитів
7. **Кешуйте** де можливо
8. **Валідуйте вхідні дані** на рівні endpoints
9. **Документуйте** всі endpoints та типи
10. **Тестуйте** кожен шар окремо та інтеграційно

