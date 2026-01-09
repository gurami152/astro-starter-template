/**
 * BFF Endpoint: Get Current User
 *
 * Endpoint для отримання інформації про поточного користувача.
 *
 * GET /api/bff/users/me
 * Headers: Authorization: Bearer {token}
 */

import type { APIRoute } from "astro";
import { getCurrentUser } from "@/bff/services";

export const GET: APIRoute = async ({ request }) => {
  // Отримуємо токен з заголовка Authorization
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  // Викликаємо BFF сервіс
  const result = await getCurrentUser(token);

  const statusCode = result.success
    ? 200
    : result.error.code === "UNAUTHORIZED"
      ? 401
      : 500;

  return new Response(JSON.stringify(result), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-cache", // Не кешуємо авторизовані дані
    },
  });
};
