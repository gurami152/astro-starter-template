/**
 * Collection Transformers
 *
 * Трансформери перетворюють дані з бекенд API в DTO для UI.
 * Це дозволяє адаптувати структуру даних під потреби фронтенду
 * без жорсткої прив'язки до API.
 */

import type {
  ApiCollectionResponse,
  ApiCollectionItem,
  CollectionDTO,
  CollectionItemDTO,
} from "../types";

/**
 * Форматує дату для відображення
 */
function formatDate(dateString?: string): string {
  if (!dateString) {
    return new Date().toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const date = new Date(dateString);
  return date.toLocaleDateString("uk-UA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Створює excerpt (скорочену версію) з контенту
 */
function createExcerpt(
  content?: string,
  maxLength: number = 150,
): string | undefined {
  if (!content) return undefined;

  if (content.length <= maxLength) {
    return content;
  }

  return content.substring(0, maxLength).trim() + "...";
}

/**
 * Трансформує один елемент колекції з API формату в DTO
 */
export function transformCollectionItem(
  item: ApiCollectionItem,
): CollectionItemDTO {
  return {
    id: String(item.id),
    title: item.title,
    excerpt: createExcerpt(item.content),
    author: item.author,
    publishedDate: formatDate(item.createdAt),
    tags: item.tags || [],
  };
}

/**
 * Трансформує всю колекцію з API формату в DTO
 */
export function transformCollection(
  apiResponse: ApiCollectionResponse,
  options?: {
    currentPage?: number;
    itemsPerPage?: number;
  },
): CollectionDTO {
  const items = apiResponse.items.map(transformCollectionItem);
  const totalItems = apiResponse.total || items.length;

  // Розраховуємо пагінацію якщо передані опції
  let pagination;
  if (options?.currentPage && options?.itemsPerPage) {
    const totalPages = Math.ceil(totalItems / options.itemsPerPage);
    pagination = {
      currentPage: options.currentPage,
      totalPages,
      hasNext: options.currentPage < totalPages,
      hasPrev: options.currentPage > 1,
    };
  }

  return {
    name: apiResponse.collection,
    items,
    totalItems,
    updatedAt: formatDate(apiResponse.timestamp),
    pagination,
  };
}

/**
 * Фільтрує та сортує елементи колекції
 */
export function filterAndSortCollectionItems(
  items: CollectionItemDTO[],
  filters?: {
    tags?: string[];
    author?: string;
    sortBy?: "date" | "title";
    order?: "asc" | "desc";
  },
): CollectionItemDTO[] {
  let filtered = [...items];

  // Фільтр по тегах
  if (filters?.tags && filters.tags.length > 0) {
    filtered = filtered.filter((item) =>
      filters.tags!.some((tag) => item.tags.includes(tag)),
    );
  }

  // Фільтр по автору
  if (filters?.author) {
    filtered = filtered.filter((item) =>
      item.author?.toLowerCase().includes(filters.author!.toLowerCase()),
    );
  }

  // Сортування
  if (filters?.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;

      if (filters.sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (filters.sortBy === "date") {
        // Тут можна додати більш складну логіку сортування по даті
        comparison = (a.publishedDate || "").localeCompare(
          b.publishedDate || "",
        );
      }

      return filters.order === "desc" ? -comparison : comparison;
    });
  }

  return filtered;
}
