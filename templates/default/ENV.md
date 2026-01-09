# Налаштування змінних середовища

## Створення .env файлу

Створіть файл `.env` у корені проєкту зі наступним вмістом:

```env
# API Configuration
# BFF використовує ці змінні для підключення до бекенд API

# Основний API URL (обов'язково)
PUBLIC_API_URL=https://api.example.com

# Альтернативно можна використовувати специфічні URL для різних API
# MAIN_API_URL=https://api.example.com
# ANALYTICS_API_URL=https://analytics.example.com
# AUTH_API_URL=https://auth.example.com

# Site URL (для генерації абсолютних URL)
SITE=http://localhost:4321

# Redis Configuration (якщо використовується)
# REDIS_URL=redis://localhost:6379
# REDIS_PASSWORD=your_password
```

## Змінні середовища для BFF

### PUBLIC_API_URL (обов'язково)

Основний URL бекенд API, до якого звертається BFF.

**Приклад:**

```env
PUBLIC_API_URL=https://api.example.com
```

### MAIN_API_URL, ANALYTICS_API_URL та інші

Якщо ваш проєкт використовує кілька різних API, ви можете налаштувати окремі URL для кожного:

```env
MAIN_API_URL=https://api.example.com
ANALYTICS_API_URL=https://analytics.example.com
AUTH_API_URL=https://auth.example.com
```

У коді використовуйте:

```typescript
import { createApiClient } from "@/bff/http/api-client";

const mainClient = createApiClient("MAIN");
const analyticsClient = createApiClient("ANALYTICS");
```

### SITE

URL вашого сайту. Використовується для генерації абсолютних URL у SSR.

```env
SITE=https://yourdomain.com
```

## Різні середовища

### Development

Для локальної розробки:

```env
PUBLIC_API_URL=http://localhost:3000
SITE=http://localhost:4321
```

### Production

Для production:

```env
PUBLIC_API_URL=https://api.yourdomain.com
SITE=https://yourdomain.com
```

## Безпека

⚠️ **ВАЖЛИВО:**

1. **Ніколи** не комітьте `.env` файл з реальними credentials в Git
2. Додайте `.env` до `.gitignore`
3. Використовуйте різні credentials для різних середовищ
4. API ключі та токени зберігайте тільки у змінних середовища
5. Для чутливих даних використовуйте сервіси типу Vault або AWS Secrets Manager

## Перевірка конфігурації

Запустіть проєкт та перевірте логи:

```bash
npm run dev
```

Якщо BFF не може підключитися до API, ви побачите помилку:

```
Error: API URL not configured. Please set PUBLIC_API_URL environment variable.
```

## Тестування з мок API

Для розробки та тестування можна використовувати публічне мок API:

```env
PUBLIC_API_URL=https://jsonplaceholder.typicode.com
```

Або запустити локальний мок сервер за допомогою json-server:

```bash
npm install -g json-server
json-server --watch db.json --port 3000
```

```env
PUBLIC_API_URL=http://localhost:3000
```
