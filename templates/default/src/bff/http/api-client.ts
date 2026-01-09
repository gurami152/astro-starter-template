/**
 * HTTP Client для взаємодії з зовнішніми API
 *
 * Цей клієнт інкапсулює всі HTTP запити до бекенд API,
 * обробляє помилки, таймаути та retry логіку.
 */

import type { ApiErrorResponse } from "../types";

// ============================================================================
// Configuration
// ============================================================================

export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions {
  timeout?: number;
  retries?: number;
  headers?: Record<string, string>;
}

// ============================================================================
// Custom Errors
// ============================================================================

export class ApiClientError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

export class TimeoutError extends ApiClientError {
  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
  }
}

export class NetworkError extends ApiClientError {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

// ============================================================================
// API Client Class
// ============================================================================

export class ApiClient {
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig) {
    this.config = {
      baseURL: config.baseURL,
      timeout: config.timeout || 30000, // 30 seconds default
      retries: config.retries || 3,
      retryDelay: config.retryDelay || 1000,
      headers: config.headers || {},
    };
  }

  /**
   * Виконує HTTP запит з підтримкою таймауту та retry
   */
  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if ((error as Error).name === "AbortError") {
        throw new TimeoutError(`Request timeout after ${timeout}ms`);
      }

      throw new NetworkError(
        error instanceof Error ? error.message : "Network request failed",
      );
    }
  }

  /**
   * Виконує запит з retry логікою
   */
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number,
    timeout: number,
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, options, timeout);

        // Не повторюємо запити для 4xx помилок (клієнтські помилки)
        if (response.status >= 400 && response.status < 500) {
          return response;
        }

        // Якщо успішний запит або 5xx помилка на останній спробі
        if (response.ok || attempt === retries) {
          return response;
        }

        // Чекаємо перед наступною спробою для 5xx помилок
        await this.delay(this.config.retryDelay * (attempt + 1));
      } catch (error) {
        lastError = error as Error;

        // Якщо це остання спроба, кидаємо помилку
        if (attempt === retries) {
          throw lastError;
        }

        // Чекаємо перед наступною спробою
        await this.delay(this.config.retryDelay * (attempt + 1));
      }
    }

    throw lastError || new Error("All retry attempts failed");
  }

  /**
   * Затримка для retry логіки
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Обробляє відповідь від API
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get("content-type");
    const isJson = contentType?.includes("application/json");

    if (!response.ok) {
      let errorData: ApiErrorResponse | undefined;

      if (isJson) {
        try {
          errorData = await response.json();
        } catch {
          // Якщо не вдалося розпарсити JSON
        }
      }

      throw new ApiClientError(
        errorData?.message ||
          `HTTP Error: ${response.status} ${response.statusText}`,
        response.status,
        errorData,
      );
    }

    if (isJson) {
      return await response.json();
    }

    return (await response.text()) as T;
  }

  /**
   * GET запит
   */
  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = `${this.config.baseURL}${path}`;
    const timeout = options?.timeout || this.config.timeout;
    const retries =
      options?.retries !== undefined ? options.retries : this.config.retries;

    const response = await this.fetchWithRetry(
      url,
      {
        method: "GET",
        headers: {
          ...this.config.headers,
          ...options?.headers,
        },
      },
      retries,
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  /**
   * POST запит
   */
  async post<T>(
    path: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = `${this.config.baseURL}${path}`;
    const timeout = options?.timeout || this.config.timeout;
    const retries =
      options?.retries !== undefined ? options.retries : this.config.retries;

    const response = await this.fetchWithRetry(
      url,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      retries,
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  /**
   * PUT запит
   */
  async put<T>(
    path: string,
    data?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    const url = `${this.config.baseURL}${path}`;
    const timeout = options?.timeout || this.config.timeout;
    const retries =
      options?.retries !== undefined ? options.retries : this.config.retries;

    const response = await this.fetchWithRetry(
      url,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...this.config.headers,
          ...options?.headers,
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      retries,
      timeout,
    );

    return this.handleResponse<T>(response);
  }

  /**
   * DELETE запит
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = `${this.config.baseURL}${path}`;
    const timeout = options?.timeout || this.config.timeout;
    const retries =
      options?.retries !== undefined ? options.retries : this.config.retries;

    const response = await this.fetchWithRetry(
      url,
      {
        method: "DELETE",
        headers: {
          ...this.config.headers,
          ...options?.headers,
        },
      },
      retries,
      timeout,
    );

    return this.handleResponse<T>(response);
  }
}

// ============================================================================
// Factory функції для створення клієнтів
// ============================================================================

/**
 * Створює API клієнт з конфігурацією з environment variables
 */
export function createApiClient(apiName: string = "MAIN"): ApiClient {
  const envKey = `${apiName}_API_URL`;
  const baseURL = import.meta.env[envKey] || import.meta.env.PUBLIC_API_URL;

  if (!baseURL) {
    throw new Error(
      `API URL not configured. Please set ${envKey} or PUBLIC_API_URL environment variable.`,
    );
  }

  return new ApiClient({
    baseURL,
    timeout: 30000,
    retries: 3,
    retryDelay: 1000,
    headers: {
      Accept: "application/json",
    },
  });
}
