import Redis from 'ioredis';

/**
 * Цей файл створює та експортує єдиний екземпляр (singleton) Redis-клієнта.
 * Це запобігає створенню нових підключень при кожному запиті до API.
 * 
 * Клієнт автоматично використовує `REDIS_URL` зі змінних оточення.
 */

// Створюємо екземпляр Redis-клієнта.
// ioredis автоматично підхопить `process.env.REDIS_URL` або `import.meta.env.REDIS_URL`.
const redis = new Redis(import.meta.env.REDIS_URL, {
  // Додаткові налаштування для продакшену
  // Наприклад, для кращої обробки помилок
  maxRetriesPerRequest: null, 
});

redis.on('connect', () => {
  console.log('Connected to Redis successfully!');
});

redis.on('error', (err) => {
  console.error('Could not connect to Redis:', err);
});

export default redis; 