/**
 * BFF Endpoint: Get Collection
 * 
 * Endpoint для отримання колекції через BFF шар.
 * UI має викликати цей endpoint замість прямого звернення до бекенд API.
 * 
 * GET /api/bff/collections/{collection}?page=1&limit=10&tags=tag1,tag2&author=john&sortBy=date&order=desc
 */

import type { APIRoute } from 'astro';
import { getCollection } from '@/bff/services';
import type { CollectionQueryParams } from '@/bff/types';

export const GET: APIRoute = async ({ params, request }) => {
  const { collection } = params;

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

  // Парсинг query параметрів
  const url = new URL(request.url);
  const queryParams: CollectionQueryParams = {};

  const page = url.searchParams.get('page');
  if (page) queryParams.page = parseInt(page, 10);

  const limit = url.searchParams.get('limit');
  if (limit) queryParams.limit = parseInt(limit, 10);

  const tags = url.searchParams.get('tags');
  if (tags) queryParams.tags = tags.split(',');

  const author = url.searchParams.get('author');
  if (author) queryParams.author = author;

  const sortBy = url.searchParams.get('sortBy');
  if (sortBy === 'date' || sortBy === 'title' || sortBy === 'popularity') {
    queryParams.sortBy = sortBy;
  }

  const order = url.searchParams.get('order');
  if (order === 'asc' || order === 'desc') {
    queryParams.order = order;
  }

  // Викликаємо BFF сервіс
  const result = await getCollection(collection, queryParams);

  // Повертаємо результат
  const statusCode = result.success ? 200 : 500;

  return new Response(JSON.stringify(result), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60', // Кешуємо на 1 хвилину
    },
  });
};

