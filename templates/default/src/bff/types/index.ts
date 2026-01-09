/**
 * BFF Types and DTOs
 * 
 * Цей файл містить типи даних, які використовуються у BFF шарі.
 * DTO (Data Transfer Objects) - це об'єкти, що передаються між шарами додатку.
 */

// ============================================================================
// API Response Types - внутрішні типи від бекенд API
// ============================================================================

export interface ApiCollectionItem {
  id: number;
  title: string;
  content?: string;
  author?: string;
  createdAt?: string;
  tags?: string[];
}

export interface ApiCollectionResponse {
  collection: string;
  items: ApiCollectionItem[];
  timestamp: string;
  total?: number;
  page?: number;
}

export interface ApiUserResponse {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  role: string;
  createdAt: string;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  details?: Record<string, unknown>;
}

// ============================================================================
// DTO Types - типи, які повертає BFF до UI
// ============================================================================

export interface CollectionItemDTO {
  id: string; // Перетворюємо number в string для зручності у UI
  title: string;
  excerpt?: string; // Скорочена версія контенту
  author?: string;
  publishedDate?: string; // Форматована дата
  tags: string[]; // Завжди масив, навіть якщо порожній
}

export interface CollectionDTO {
  name: string;
  items: CollectionItemDTO[];
  totalItems: number;
  updatedAt: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface UserDTO {
  id: string;
  username: string;
  displayName: string; // Комбінація firstName + lastName або username
  email: string;
  avatarUrl?: string;
  isAdmin: boolean;
  memberSince: string;
}

export interface BFFErrorDTO {
  success: false;
  error: {
    code: string;
    message: string;
    userMessage: string; // Повідомлення для відображення користувачу
    timestamp: string;
  };
}

export interface BFFSuccessDTO<T> {
  success: true;
  data: T;
  meta?: {
    cached: boolean;
    requestId?: string;
    duration?: number;
  };
}

// Generic response type
export type BFFResponse<T> = BFFSuccessDTO<T> | BFFErrorDTO;

// ============================================================================
// Request Types
// ============================================================================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface CollectionQueryParams extends PaginationParams {
  tags?: string[];
  author?: string;
  sortBy?: 'date' | 'title' | 'popularity';
  order?: 'asc' | 'desc';
}

