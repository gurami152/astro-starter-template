/**
 * BFF Client для використання у UI компонентах
 * 
 * Цей модуль надає зручні функції для взаємодії з BFF endpoints з UI.
 * UI компоненти мають використовувати ці функції замість прямих викликів fetch.
 */

import type {
  CollectionDTO,
  CollectionQueryParams,
  UserDTO,
  BFFResponse,
} from '../types';

/**
 * Отримує базовий URL для BFF endpoints
 */
function getBFFBaseUrl(): string {
  // На сервері використовуємо повний URL
  if (typeof window === 'undefined') {
    const baseUrl = import.meta.env.DEV
      ? 'http://localhost:4321'
      : import.meta.env.SITE || 'http://localhost:4321';
    return `${baseUrl}/api/bff`;
  }
  
  // На клієнті використовуємо відносний шлях
  return '/api/bff';
}

/**
 * Обробляє відповідь від BFF endpoint
 */
async function handleBFFResponse<T>(response: Response): Promise<BFFResponse<T>> {
  const data = await response.json();
  return data as BFFResponse<T>;
}

// ============================================================================
// Collection API
// ============================================================================

/**
 * Отримує колекцію через BFF
 */
export async function fetchCollection(
  collectionName: string,
  params?: CollectionQueryParams
): Promise<BFFResponse<CollectionDTO>> {
  const baseUrl = getBFFBaseUrl();
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.limit) queryParams.set('limit', String(params.limit));
  if (params?.tags) queryParams.set('tags', params.tags.join(','));
  if (params?.author) queryParams.set('author', params.author);
  if (params?.sortBy) queryParams.set('sortBy', params.sortBy);
  if (params?.order) queryParams.set('order', params.order);

  const queryString = queryParams.toString();
  const url = `${baseUrl}/collections/${collectionName}${queryString ? `?${queryString}` : ''}`;

  try {
    const response = await fetch(url);
    return await handleBFFResponse<CollectionDTO>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
        userMessage: 'Помилка з\'єднання. Перевірте інтернет-з\'єднання.',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Шукає у колекції через BFF
 */
export async function searchCollection(
  collectionName: string,
  searchQuery: string
): Promise<BFFResponse<CollectionDTO>> {
  const baseUrl = getBFFBaseUrl();
  const url = `${baseUrl}/collections/search?collection=${encodeURIComponent(collectionName)}&q=${encodeURIComponent(searchQuery)}`;

  try {
    const response = await fetch(url);
    return await handleBFFResponse<CollectionDTO>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
        userMessage: 'Помилка з\'єднання. Перевірте інтернет-з\'єднання.',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Отримує кілька колекцій одночасно через BFF
 */
export async function fetchMultipleCollections(
  collectionNames: string[]
): Promise<BFFResponse<Record<string, CollectionDTO>>> {
  const baseUrl = getBFFBaseUrl();
  const url = `${baseUrl}/collections/aggregate`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ collections: collectionNames }),
    });
    return await handleBFFResponse<Record<string, CollectionDTO>>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
        userMessage: 'Помилка з\'єднання. Перевірте інтернет-з\'єднання.',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

// ============================================================================
// User API
// ============================================================================

/**
 * Отримує інформацію про користувача через BFF
 */
export async function fetchUser(userId: string): Promise<BFFResponse<UserDTO>> {
  const baseUrl = getBFFBaseUrl();
  const url = `${baseUrl}/users/${userId}`;

  try {
    const response = await fetch(url);
    return await handleBFFResponse<UserDTO>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
        userMessage: 'Помилка з\'єднання. Перевірте інтернет-з\'єднання.',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

/**
 * Отримує поточного користувача через BFF
 */
export async function fetchCurrentUser(token?: string): Promise<BFFResponse<UserDTO>> {
  const baseUrl = getBFFBaseUrl();
  const url = `${baseUrl}/users/me`;

  try {
    const response = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    return await handleBFFResponse<UserDTO>(response);
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network error',
        userMessage: 'Помилка з\'єднання. Перевірте інтернет-з\'єднання.',
        timestamp: new Date().toISOString(),
      },
    };
  }
}

