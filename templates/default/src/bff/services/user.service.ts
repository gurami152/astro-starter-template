/**
 * User Service
 * 
 * Сервіс для роботи з користувачами.
 */

import { createApiClient } from '../http/api-client';
import { transformUser, transformUsers } from '../transformers';
import { transformError, logError } from '../transformers/error.transformer';
import type { ApiUserResponse, UserDTO, BFFResponse } from '../types';

/**
 * Отримує інформацію про користувача
 */
export async function getUser(userId: string): Promise<BFFResponse<UserDTO>> {
  try {
    const apiClient = createApiClient();
    const apiResponse = await apiClient.get<ApiUserResponse>(`/users/${userId}`);
    const userDTO = transformUser(apiResponse);

    return {
      success: true,
      data: userDTO,
      meta: {
        cached: false,
      },
    };
  } catch (error) {
    logError(error, `getUser(${userId})`);
    return transformError(error);
  }
}

/**
 * Отримує список користувачів
 */
export async function getUsers(params?: {
  page?: number;
  limit?: number;
}): Promise<BFFResponse<UserDTO[]>> {
  try {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.set('page', String(params.page));
    if (params?.limit) queryParams.set('limit', String(params.limit));

    const queryString = queryParams.toString();
    const path = `/users${queryString ? `?${queryString}` : ''}`;

    const apiClient = createApiClient();
    const apiResponse = await apiClient.get<ApiUserResponse[]>(path);
    const usersDTO = transformUsers(apiResponse);

    return {
      success: true,
      data: usersDTO,
      meta: {
        cached: false,
      },
    };
  } catch (error) {
    logError(error, 'getUsers');
    return transformError(error);
  }
}

/**
 * Отримує поточного авторизованого користувача
 */
export async function getCurrentUser(token?: string): Promise<BFFResponse<UserDTO>> {
  try {
    const apiClient = createApiClient();
    const apiResponse = await apiClient.get<ApiUserResponse>('/users/me', {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    const userDTO = transformUser(apiResponse);

    return {
      success: true,
      data: userDTO,
      meta: {
        cached: false,
      },
    };
  } catch (error) {
    logError(error, 'getCurrentUser');
    return transformError(error);
  }
}

