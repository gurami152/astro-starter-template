# BFF Examples - Практичні приклади

Ця документація містить практичні приклади використання BFF шару в різних сценаріях.

## Зміст

1. [Базові приклади](#базові-приклади)
2. [Агрегація даних](#агрегація-даних)
3. [Пошук та фільтрація](#пошук-та-фільтрація)
4. [Пагінація](#пагінація)
5. [Робота з користувачами](#робота-з-користувачами)
6. [Обробка помилок](#обробка-помилок)
7. [Client-side запити](#client-side-запити)
8. [Кастомні endpoints](#кастомні-endpoints)

## Базові приклади

### Отримання колекції (SSR)

```astro
---
// src/pages/posts.astro
import { fetchCollection } from '@/bff/client';
import BaseLayout from '@/layouts/base/BaseLayout.astro';

const result = await fetchCollection('posts');

if (!result.success) {
  console.error('Error:', result.error);
}

const posts = result.success ? result.data : null;
---

<BaseLayout title="Posts">
  {posts ? (
    <div>
      <h1>{posts.name}</h1>
      <p>Всього: {posts.totalItems}</p>
      
      {posts.items.map(post => (
        <article>
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
          <time>{post.publishedDate}</time>
        </article>
      ))}
    </div>
  ) : (
    <p>Не вдалося завантажити дані</p>
  )}
</BaseLayout>
```

### Перевірка успішності запиту

```astro
---
import { fetchCollection } from '@/bff/client';

const result = await fetchCollection('posts');

// Variant 1: if/else
if (result.success) {
  const posts = result.data;
  console.log('Items:', posts.items.length);
} else {
  console.error('Error:', result.error.userMessage);
}

// Variant 2: ternary
const posts = result.success ? result.data : null;
const error = result.success ? null : result.error;
---
```

## Агрегація даних

### Отримання кількох колекцій одночасно

```astro
---
// src/pages/dashboard.astro
import { fetchMultipleCollections } from '@/bff/client';

// Отримуємо дані з кількох джерел одним запитом
const result = await fetchMultipleCollections([
  'posts',
  'products',
  'news',
]);

const collections = result.success ? result.data : null;
---

<div class="dashboard">
  {collections && (
    <div class="grid">
      {/* Posts section */}
      {collections.posts && (
        <section>
          <h2>Останні пости</h2>
          {collections.posts.items.slice(0, 5).map(post => (
            <div>{post.title}</div>
          ))}
        </section>
      )}

      {/* Products section */}
      {collections.products && (
        <section>
          <h2>Популярні продукти</h2>
          {collections.products.items.slice(0, 5).map(product => (
            <div>{product.title}</div>
          ))}
        </section>
      )}

      {/* News section */}
      {collections.news && (
        <section>
          <h2>Новини</h2>
          {collections.news.items.slice(0, 3).map(item => (
            <div>{item.title}</div>
          ))}
        </section>
      )}
    </div>
  )}
</div>
```

### Створення власної функції агрегації

```typescript
// src/utils/bff-helpers.ts
import { fetchCollection, type BFFResponse, type CollectionDTO } from '@/bff/client';

export async function fetchDashboardData() {
  // Паралельні запити
  const [postsResult, productsResult, newsResult] = await Promise.all([
    fetchCollection('posts', { limit: 5 }),
    fetchCollection('products', { limit: 5 }),
    fetchCollection('news', { limit: 3 }),
  ]);

  return {
    posts: postsResult.success ? postsResult.data : null,
    products: productsResult.success ? productsResult.data : null,
    news: newsResult.success ? newsResult.data : null,
    hasErrors: !postsResult.success || !productsResult.success || !newsResult.success,
  };
}
```

## Пошук та фільтрація

### Пошук у колекції

```astro
---
// src/pages/search.astro
import { searchCollection } from '@/bff/client';

const searchQuery = Astro.url.searchParams.get('q') || '';
const result = searchQuery 
  ? await searchCollection('posts', searchQuery)
  : null;
---

<div>
  <form method="get">
    <input 
      type="text" 
      name="q" 
      placeholder="Пошук..." 
      value={searchQuery}
    />
    <button type="submit">Шукати</button>
  </form>

  {result?.success && (
    <div>
      <p>Знайдено: {result.data.totalItems} результатів</p>
      {result.data.items.map(item => (
        <div>
          <h3>{item.title}</h3>
          <p>{item.excerpt}</p>
        </div>
      ))}
    </div>
  )}
</div>
```

### Фільтрація за тегами

```astro
---
import { fetchCollection } from '@/bff/client';

const selectedTags = Astro.url.searchParams.get('tags')?.split(',') || [];

const result = await fetchCollection('posts', {
  tags: selectedTags.length > 0 ? selectedTags : undefined,
  sortBy: 'date',
  order: 'desc',
});

const posts = result.success ? result.data : null;
---

<div>
  {/* Tag filters */}
  <div class="filters">
    <a href="?tags=javascript">JavaScript</a>
    <a href="?tags=typescript">TypeScript</a>
    <a href="?tags=astro">Astro</a>
  </div>

  {/* Results */}
  {posts && posts.items.map(post => (
    <article>
      <h2>{post.title}</h2>
      <div class="tags">
        {post.tags.map(tag => <span>{tag}</span>)}
      </div>
    </article>
  ))}
</div>
```

## Пагінація

### Базова пагінація

```astro
---
// src/pages/posts/[page].astro
import { fetchCollection } from '@/bff/client';

const page = parseInt(Astro.params.page || '1', 10);
const limit = 10;

const result = await fetchCollection('posts', {
  page,
  limit,
  sortBy: 'date',
  order: 'desc',
});

const collection = result.success ? result.data : null;
const pagination = collection?.pagination;
---

<div>
  {collection && (
    <div>
      {/* Items */}
      {collection.items.map(item => (
        <article>
          <h2>{item.title}</h2>
          <p>{item.excerpt}</p>
        </article>
      ))}

      {/* Pagination */}
      {pagination && (
        <nav class="pagination">
          {pagination.hasPrev && (
            <a href={`/posts/${pagination.currentPage - 1}`}>
              ← Попередня
            </a>
          )}
          
          <span>
            Сторінка {pagination.currentPage} з {pagination.totalPages}
          </span>
          
          {pagination.hasNext && (
            <a href={`/posts/${pagination.currentPage + 1}`}>
              Наступна →
            </a>
          )}
        </nav>
      )}
    </div>
  )}
</div>
```

### Пагінація з query параметрами

```astro
---
const page = parseInt(Astro.url.searchParams.get('page') || '1', 10);
const limit = 15;

const result = await fetchCollection('posts', { page, limit });
const collection = result.success ? result.data : null;
---

{collection?.pagination && (
  <div class="pagination">
    {/* Previous */}
    {collection.pagination.hasPrev && (
      <a href={`?page=${collection.pagination.currentPage - 1}`}>
        ← Попередня
      </a>
    )}

    {/* Page numbers */}
    {Array.from({ length: collection.pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
      <a 
        href={`?page=${pageNum}`}
        class={pageNum === collection.pagination.currentPage ? 'active' : ''}
      >
        {pageNum}
      </a>
    ))}

    {/* Next */}
    {collection.pagination.hasNext && (
      <a href={`?page=${collection.pagination.currentPage + 1}`}>
        Наступна →
      </a>
    )}
  </div>
)}
```

## Робота з користувачами

### Отримання інформації про користувача

```astro
---
// src/pages/profile/[userId].astro
import { fetchUser } from '@/bff/client';

const { userId } = Astro.params;
const result = await fetchUser(userId!);
const user = result.success ? result.data : null;
---

{user ? (
  <div class="profile">
    {user.avatarUrl && (
      <img src={user.avatarUrl} alt={user.displayName} />
    )}
    <h1>{user.displayName}</h1>
    <p>@{user.username}</p>
    <p>Email: {user.email}</p>
    <p>Член з: {user.memberSince}</p>
    {user.isAdmin && <span class="badge">Admin</span>}
  </div>
) : (
  <p>Користувача не знайдено</p>
)}
```

### Поточний користувач (з авторизацією)

```astro
---
import { fetchCurrentUser } from '@/bff/client';

// Отримуємо токен з cookies або session
const token = Astro.cookies.get('auth_token')?.value;

const result = await fetchCurrentUser(token);
const currentUser = result.success ? result.data : null;
---

<header>
  {currentUser ? (
    <div class="user-menu">
      <span>Привіт, {currentUser.displayName}!</span>
      {currentUser.avatarUrl && (
        <img src={currentUser.avatarUrl} alt="" />
      )}
    </div>
  ) : (
    <a href="/login">Увійти</a>
  )}
</header>
```

## Обробка помилок

### Показ користувацьких повідомлень

```astro
---
import { fetchCollection } from '@/bff/client';

const result = await fetchCollection('posts');
---

{result.success ? (
  <div>
    {result.data.items.map(item => (
      <div>{item.title}</div>
    ))}
  </div>
) : (
  <div class="error-message">
    <h2>Помилка</h2>
    <p>{result.error.userMessage}</p>
    <details>
      <summary>Технічні деталі</summary>
      <p>Код: {result.error.code}</p>
      <p>Повідомлення: {result.error.message}</p>
      <p>Час: {result.error.timestamp}</p>
    </details>
  </div>
)}
```

### Різні типи помилок

```astro
---
const result = await fetchCollection('posts');

function getErrorIcon(code: string) {
  switch (code) {
    case 'TIMEOUT': return '⏱️';
    case 'NETWORK_ERROR': return '📡';
    case 'NOT_FOUND': return '🔍';
    case 'UNAUTHORIZED': return '🔒';
    default: return '⚠️';
  }
}
---

{!result.success && (
  <div class={`alert alert-${result.error.code.toLowerCase()}`}>
    <span class="icon">{getErrorIcon(result.error.code)}</span>
    <div>
      <strong>{result.error.code}</strong>
      <p>{result.error.userMessage}</p>
    </div>
  </div>
)}
```

## Client-side запити

### Використання у скрипті

```astro
---
// SSR частина
---

<div id="posts-container"></div>
<button id="load-more">Завантажити ще</button>

<script>
  let currentPage = 1;
  
  async function loadPosts() {
    const response = await fetch(`/api/bff/collections/posts?page=${currentPage}&limit=10`);
    const result = await response.json();
    
    if (result.success) {
      const container = document.getElementById('posts-container');
      result.data.items.forEach(post => {
        const article = document.createElement('article');
        article.innerHTML = `
          <h2>${post.title}</h2>
          <p>${post.excerpt || ''}</p>
        `;
        container?.appendChild(article);
      });
      
      currentPage++;
    } else {
      alert(result.error.userMessage);
    }
  }
  
  document.getElementById('load-more')?.addEventListener('click', loadPosts);
</script>
```

### Автокомпліт пошуку

```astro
<input 
  type="text" 
  id="search-input" 
  placeholder="Пошук..." 
/>
<div id="search-results"></div>

<script>
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  const searchResults = document.getElementById('search-results');
  
  let debounceTimeout: number;
  
  searchInput?.addEventListener('input', (e) => {
    const query = (e.target as HTMLInputElement).value;
    
    clearTimeout(debounceTimeout);
    
    if (query.length < 3) {
      searchResults!.innerHTML = '';
      return;
    }
    
    debounceTimeout = setTimeout(async () => {
      const response = await fetch(
        `/api/bff/collections/search?collection=posts&q=${encodeURIComponent(query)}`
      );
      const result = await response.json();
      
      if (result.success) {
        searchResults!.innerHTML = result.data.items
          .slice(0, 5)
          .map((item: any) => `
            <div class="search-result-item">
              <a href="/posts/${item.id}">${item.title}</a>
            </div>
          `)
          .join('');
      }
    }, 300);
  });
</script>
```

## Кастомні endpoints

### Створення кастомного endpoint для аналітики

```typescript
// src/pages/api/bff/analytics/popular.ts
import type { APIRoute } from 'astro';
import { getCollection } from '@/bff/services';

export const GET: APIRoute = async () => {
  try {
    // Отримуємо кілька колекцій
    const [postsResult, productsResult] = await Promise.all([
      getCollection('posts', { limit: 10, sortBy: 'popularity' }),
      getCollection('products', { limit: 10, sortBy: 'popularity' }),
    ]);

    // Агрегуємо найпопулярніші
    const popularItems = [];
    
    if (postsResult.success) {
      popularItems.push(...postsResult.data.items.slice(0, 5).map(item => ({
        ...item,
        type: 'post',
      })));
    }
    
    if (productsResult.success) {
      popularItems.push(...productsResult.data.items.slice(0, 5).map(item => ({
        ...item,
        type: 'product',
      })));
    }

    return new Response(JSON.stringify({
      success: true,
      data: popularItems,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch popular items',
        userMessage: 'Не вдалося завантажити популярні елементи',
      },
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
```

### Використання кастомного endpoint

```astro
---
// src/components/PopularItems.astro
const response = await fetch('/api/bff/analytics/popular');
const result = await response.json();
const items = result.success ? result.data : [];
---

<section class="popular">
  <h2>Популярне</h2>
  <div class="items">
    {items.map(item => (
      <div class={`item item-${item.type}`}>
        <h3>{item.title}</h3>
        <span class="type">{item.type}</span>
      </div>
    ))}
  </div>
</section>
```

## Best Practices

### 1. Завжди перевіряйте success

```astro
---
const result = await fetchCollection('posts');

// ❌ Погано - не перевіряємо success
const posts = result.data; // може бути undefined

// ✅ Добре
const posts = result.success ? result.data : null;
---
```

### 2. Показуйте користувацькі повідомлення

```astro
---
const result = await fetchCollection('posts');
---

{/* ❌ Погано */}
{!result.success && <p>{result.error.message}</p>}

{/* ✅ Добре */}
{!result.success && <p>{result.error.userMessage}</p>}
```

### 3. Використовуйте типи

```typescript
// ❌ Погано
const result: any = await fetchCollection('posts');

// ✅ Добре
import type { BFFResponse, CollectionDTO } from '@/bff/client';
const result: BFFResponse<CollectionDTO> = await fetchCollection('posts');
```

### 4. Обробляйте loading стани

```astro
<div id="content">Завантаження...</div>

<script>
  async function loadData() {
    const content = document.getElementById('content');
    content!.innerHTML = 'Завантаження...';
    
    const result = await fetchCollection('posts');
    
    if (result.success) {
      content!.innerHTML = /* render items */;
    } else {
      content!.innerHTML = `<p class="error">${result.error.userMessage}</p>`;
    }
  }
</script>
```

### 5. Логуйте помилки

```astro
---
const result = await fetchCollection('posts');

if (!result.success) {
  console.error('[Collection Error]', {
    code: result.error.code,
    message: result.error.message,
    timestamp: result.error.timestamp,
  });
  
  // Можна відправити в систему моніторингу
  // Sentry.captureException(new Error(result.error.message));
}
---
```

