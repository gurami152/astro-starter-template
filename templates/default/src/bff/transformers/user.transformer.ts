/**
 * User Transformers
 * 
 * Трансформери для користувацьких даних
 */

import type { ApiUserResponse, UserDTO } from '../types';

/**
 * Створює display name з firstName, lastName або username
 */
function createDisplayName(user: ApiUserResponse): string {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(' ');
  }
  return user.username;
}

/**
 * Форматує дату членства
 */
function formatMemberSince(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('uk-UA', {
    year: 'numeric',
    month: 'long',
  });
}

/**
 * Трансформує дані користувача з API формату в DTO
 */
export function transformUser(apiUser: ApiUserResponse): UserDTO {
  return {
    id: String(apiUser.id),
    username: apiUser.username,
    displayName: createDisplayName(apiUser),
    email: apiUser.email,
    avatarUrl: apiUser.avatar,
    isAdmin: apiUser.role === 'admin',
    memberSince: formatMemberSince(apiUser.createdAt),
  };
}

/**
 * Трансформує масив користувачів
 */
export function transformUsers(apiUsers: ApiUserResponse[]): UserDTO[] {
  return apiUsers.map(transformUser);
}

