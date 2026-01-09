/**
 * This file contains utility functions for interacting with your API.
 */

/**
 * Fetches all items for a given collection from our internal API route.
 * @param collectionName The name of the collection (e.g., 'posts').
 * @returns A promise that resolves to the collection data.
 */
export async function getCollection(collectionName: string) {
  // In a real app, you'd use the full URL for server-side fetching
  // or a relative path for client-side fetching.
  // Astro.url.origin provides the base URL safely on the server.
  const baseUrl = import.meta.env.DEV
    ? "http://localhost:4321"
    : new URL(import.meta.env.SITE).origin;

  try {
    const response = await fetch(
      `${baseUrl}/api/collections/${collectionName}`,
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch collection: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching collection:", error);
    return null;
  }
}
