/**
 * BFF Endpoint: Search Collection
 * 
 * Endpoint для пошуку у колекції.
 * 
 * GET /api/bff/collections/search?collection=posts&q=search+query
 */

import type { APIRoute } from 'astro';
import { searchCollection } from '@/bff/services';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const collection = url.searchParams.get('collection');
  const query = url.searchParams.get('q');

  if (!collection) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Collection parameter is missing',
          userMessage: 'Не вказано назву колекції',
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  if (!query) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: 'BAD_REQUEST',
          message: 'Search query is missing',
          userMessage: 'Не вказано пошуковий запит',
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  // Викликаємо BFF сервіс
  const result = await searchCollection(collection, query);

  const statusCode = result.success ? 200 : 500;

  return new Response(JSON.stringify(result), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=30', // Кешуємо на 30 секунд
    },
  });
};

