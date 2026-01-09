/**
 * BFF Endpoint: Get User
 *
 * Endpoint для отримання інформації про користувача.
 *
 * GET /api/bff/users/{userId}
 */

import type { APIRoute } from "astro";
import { getUser } from "@/bff/services";

export const GET: APIRoute = async ({ params }) => {
  const { userId } = params;

  if (!userId) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "BAD_REQUEST",
          message: "User ID is missing",
          userMessage: "Не вказано ID користувача",
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Викликаємо BFF сервіс
  const result = await getUser(userId);

  const statusCode = result.success ? 200 : 500;

  return new Response(JSON.stringify(result), {
    status: statusCode,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=300", // Кешуємо на 5 хвилин
    },
  });
};
