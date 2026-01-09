/**
 * BFF Endpoint: Aggregate Collections
 *
 * Endpoint для отримання кількох колекцій одночасно (агрегація).
 * Демонструє як BFF може об'єднувати дані з кількох джерел.
 *
 * POST /api/bff/collections/aggregate
 * Body: { "collections": ["posts", "products", "news"] }
 */

import type { APIRoute } from "astro";
import { getMultipleCollections } from "@/bff/services";

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { collections } = body;

    if (
      !collections ||
      !Array.isArray(collections) ||
      collections.length === 0
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error: {
            code: "BAD_REQUEST",
            message: "Collections array is required",
            userMessage: "Не вказано масив колекцій",
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
    const result = await getMultipleCollections(collections);

    const statusCode = result.success ? 200 : 500;

    return new Response(JSON.stringify(result), {
      status: statusCode,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message:
            error instanceof Error ? error.message : "Internal server error",
          userMessage: "Виникла помилка при обробці запиту",
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
