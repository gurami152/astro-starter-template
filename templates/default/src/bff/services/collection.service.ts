/**
 * Collection Service
 * 
 * Сервіс для роботи з колекціями.
 * Orchestration: викликає API, агрегує дані, застосовує трансформери.
 */

import { createApiClient } from '../http/api-client';
import { transformCollection, filterAndSortCollectionItems } from '../transformers';
import { transformError, logError } from '../transformers/error.transformer';
import type {
  ApiCollectionResponse,
  CollectionDTO,
  CollectionQueryParams,
  BFFResponse,
} from '../types';

/**
 * Отримує колекцію з бекенд API
 */
export async function getCollection(
  collectionName: string,
  params?: CollectionQueryParams
): Promise<BFFResponse<CollectionDTO>> {
  try {
    const startTime = Date.now();
    const apiClient = createApiClient();

    // Будуємо query string для пагінації
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));

    const queryString = queryParams.toString();
    const path = `/collections/${collectionName}${queryString ? `?${queryString}` : ''}`;

    // Запит до API
    const apiResponse = await apiClient.get<ApiCollectionResponse>(path);

    // Трансформація відповіді
    let collectionDTO = transformCollection(apiResponse, {
      currentPage: params?.page,
      itemsPerPage: params?.limit,
    });

    // Застосовуємо фільтри та сортування на рівні BFF
    if (params?.tags || params?.author || params?.sortBy) {
      collectionDTO.items = filterAndSortCollectionItems(collectionDTO.items, {
        tags: params.tags,
        author: params.author,
        sortBy: params.sortBy,
        order: params.order,
      });
      collectionDTO.totalItems = collectionDTO.items.length;
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: collectionDTO,
      meta: {
        cached: false,
        duration,
      },
    };
  } catch (error) {
    logError(error, `getCollection(${collectionName})`);
    return transformError(error);
  }
}

/**
 * Отримує кілька колекцій одночасно (агрегація)
 */
export async function getMultipleCollections(
  collectionNames: string[]
): Promise<BFFResponse<Record<string, CollectionDTO>>> {
  try {
    const startTime = Date.now();

    // Паралельні запити до API
    const promises = collectionNames.map(name => getCollection(name));
    const results = await Promise.all(promises);

    // Збираємо результати
    const collections: Record<string, CollectionDTO> = {};
    const errors: string[] = [];

    results.forEach((result, index) => {
      if (result.success) {
        collections[collectionNames[index]] = result.data;
      } else {
        errors.push(`${collectionNames[index]}: ${result.error.message}`);
      }
    });

    // Якщо всі запити завершились помилкою
    if (Object.keys(collections).length === 0) {
      throw new Error(`Failed to fetch collections: ${errors.join(', ')}`);
    }

    const duration = Date.now() - startTime;

    return {
      success: true,
      data: collections,
      meta: {
        cached: false,
        duration,
      },
    };
  } catch (error) {
    logError(error, 'getMultipleCollections');
    return transformError(error);
  }
}

/**
 * Пошук по колекції (приклад складнішої логіки)
 */
export async function searchCollection(
  collectionName: string,
  searchQuery: string
): Promise<BFFResponse<CollectionDTO>> {
  try {
    // Отримуємо всю колекцію
    const result = await getCollection(collectionName);

    if (!result.success) {
      return result;
    }

    // Фільтруємо на рівні BFF
    const filtered = result.data.items.filter(item =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return {
      success: true,
      data: {
        ...result.data,
        items: filtered,
        totalItems: filtered.length,
      },
      meta: result.meta,
    };
  } catch (error) {
    logError(error, `searchCollection(${collectionName})`);
    return transformError(error);
  }
}

