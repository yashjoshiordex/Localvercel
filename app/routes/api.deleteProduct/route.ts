// app/routes/api.products.$id.jsx
import { authenticate } from "app/shopify.server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { PRODUCT_ARCHIVE_MUTATION } from "app/server/mutations";
import { softDeleteProductByShopifyId } from "app/server/controllers/product.Controller";
import { logger } from "app/server/utils/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Get productId from query string
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");

  logger.info(`[ARCHIVE PRODUCT] Received request for productId: ${productId}`);

  if (request.method !== "DELETE") {
    logger.error(`[ARCHIVE PRODUCT] Invalid method: ${request.method}`);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!productId) {
    logger.error("[ARCHIVE PRODUCT] Product ID is missing in request");
    return new Response(
      JSON.stringify({ error: "Product ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    logger.info(`[ARCHIVE PRODUCT] Archiving product in Shopify: ${productId}`);
    // Archive the product using Shopify Admin API
    const response = await admin.graphql(PRODUCT_ARCHIVE_MUTATION, {
      variables: {
        input: {
          id: productId,
          status: "ARCHIVED",
        },
      },
    });

    const responseJson = await response.json();
    const { productUpdate } = responseJson.data;

    // Check for errors
    if (productUpdate.userErrors && productUpdate.userErrors.length > 0) {
      logger.error("[ARCHIVE PRODUCT] Shopify archive errors:", productUpdate.userErrors);
      return new Response(
        JSON.stringify({
          error: "Failed to archive product",
          details: productUpdate.userErrors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Soft delete in MongoDB
    logger.info(`[ARCHIVE PRODUCT] Soft deleting product in MongoDB: ${productId}`);
    await softDeleteProductByShopifyId(productId);

    logger.info(`[ARCHIVE PRODUCT] Product archived successfully: ${productId}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Product archived successfully",
        archivedProductId: productUpdate.product.id,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    logger.error("[ARCHIVE PRODUCT] Error archiving product:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// Optional: Add a loader if you want to handle GET requests too
export const loader = async () => {
  logger.error("[ARCHIVE PRODUCT] Loader called with GET method");
  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    { status: 405, headers: { "Content-Type": "application/json" } }
  );
};