import type { APIRoute } from 'astro';
import redis from '@utils/redis'; // Імпортуємо наш Redis-клієнт

/**
 * Example API Route to fetch collection data.
 * This acts as a proxy to your real API.
 *
 * It can be accessed via `/api/collections/posts`, `/api/collections/products`, etc.
 */

const CACHE_TTL_SECONDS = 300; // Кешувати на 5 хвилин

export const GET: APIRoute = async ({ params }) => {
  const { collection } = params;

  if (!collection) {
    return new Response('Collection parameter is missing', { status: 400 });
  }

  const cacheKey = `collection:${collection}`;

  // 1. Перевіряємо, чи є дані в кеші Redis
  try {
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log(`Serving from Redis cache for: ${cacheKey}`);
      return new Response(cachedData, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache-Status': 'HIT',
        },
      });
    }
  } catch (error) {
    console.error('Redis GET error:', error);
    // Якщо Redis недоступний, ми можемо продовжити і отримати свіжі дані,
    // замість того, щоб повертати помилку.
  }
  
  // 2. Якщо в кеші немає, робимо запит до API (зараз це мок)
  console.log(`Fetching new data for: ${cacheKey}`);
  
  const mockData = {
    collection: collection,
    items: [
      { id: 1, title: `Post 1 in ${collection} (from server)` },
      { id: 2, title: `Post 2 in ${collection} (from server)` },
      { id: 3, title: `Post 3 in ${collection} (from server)` },
    ],
    timestamp: new Date().toISOString(),
  };

  const dataString = JSON.stringify(mockData);

  // 3. Зберігаємо свіжі дані в кеш Redis з часом життя (TTL)
  try {
    await redis.setex(cacheKey, CACHE_TTL_SECONDS, dataString);
  } catch (error) {
    console.error('Redis SETEX error:', error);
  }
  
  return new Response(dataString, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'X-Cache-Status': 'MISS',
    },
  });
}; 