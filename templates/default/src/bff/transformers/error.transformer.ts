/**
 * Error Transformers
 *
 * Трансформери для обробки та форматування помилок
 */

import { ApiClientError, TimeoutError, NetworkError } from "../http/api-client";
import type { BFFErrorDTO } from "../types";

/**
 * Код помилки на основі типу або статус коду
 */
function getErrorCode(error: Error, statusCode?: number): string {
  if (error instanceof TimeoutError) {
    return "TIMEOUT";
  }

  if (error instanceof NetworkError) {
    return "NETWORK_ERROR";
  }

  if (statusCode) {
    if (statusCode === 404) return "NOT_FOUND";
    if (statusCode === 401) return "UNAUTHORIZED";
    if (statusCode === 403) return "FORBIDDEN";
    if (statusCode === 400) return "BAD_REQUEST";
    if (statusCode >= 500) return "SERVER_ERROR";
  }

  return "UNKNOWN_ERROR";
}

/**
 * Користувацьке повідомлення про помилку
 */
function getUserMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    TIMEOUT: "Запит занадто довго виконувався. Спробуйте пізніше.",
    NETWORK_ERROR: "Помилка з'єднання. Перевірте інтернет-з'єднання.",
    NOT_FOUND: "Запитувані дані не знайдено.",
    UNAUTHORIZED: "Необхідна авторизація.",
    FORBIDDEN: "У вас немає доступу до цього ресурсу.",
    BAD_REQUEST: "Некоректний запит.",
    SERVER_ERROR: "Помилка сервера. Спробуйте пізніше.",
    UNKNOWN_ERROR: "Виникла непередбачена помилка.",
  };

  return messages[errorCode] || messages.UNKNOWN_ERROR;
}

/**
 * Трансформує помилку в BFF Error DTO
 */
export function transformError(error: unknown): BFFErrorDTO {
  let errorCode = "UNKNOWN_ERROR";
  let message = "Unknown error occurred";
  let statusCode: number | undefined;

  if (error instanceof ApiClientError) {
    statusCode = error.statusCode;
    message = error.message;
    errorCode = getErrorCode(error, statusCode);
  } else if (error instanceof Error) {
    message = error.message;
    errorCode = getErrorCode(error);
  } else if (typeof error === "string") {
    message = error;
  }

  return {
    success: false,
    error: {
      code: errorCode,
      message,
      userMessage: getUserMessage(errorCode),
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Логує помилку (можна інтегрувати з системою логування)
 */
export function logError(error: unknown, context?: string): void {
  console.error("[BFF Error]", context || "", error);

  // Тут можна додати інтеграцію з Sentry, LogRocket тощо
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, { tags: { context } });
  // }
}
