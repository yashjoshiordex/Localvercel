// app/routes/api.products.$id.jsx
import { authenticate } from "app/shopify.server";
import type { ActionFunctionArgs } from "@remix-run/node";
import { DELETE_PRODUCT_MUTATION } from "app/server/mutations";
import { softDeleteProductByShopifyId } from "app/server/controllers/product.Controller";
import { logger } from "app/server/utils/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Get productId from query string
  const url = new URL(request.url);
  const productId = url.searchParams.get("id");

  logger.info(`[DELETE PRODUCT] Received request for productId: ${productId}`);

  if (request.method !== "DELETE") {
    logger.error(`[DELETE PRODUCT] Invalid method: ${request.method}`);
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!productId) {
    logger.error("[DELETE PRODUCT] Product ID is missing in request");
    return new Response(
      JSON.stringify({ error: "Product ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    logger.info(`[DELETE PRODUCT] Deleting product in Shopify: ${productId}`);
    
    // Delete the product using Shopify Admin API
    const response = await admin.graphql(DELETE_PRODUCT_MUTATION, {
      variables: {
        input: {  // Changed from 'id' to 'input' containing the id
          id: productId,
        },
      },
    }); 

    const responseJson:any = await response.json();
    
    // Check for GraphQL errors
    if (responseJson.errors) {
      logger.error("[DELETE PRODUCT] GraphQL errors:", responseJson.errors);
      return new Response(
        JSON.stringify({
          error: "Failed to delete product",
          details: responseJson.errors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    const { productDelete } = responseJson.data;

    // Check for user errors
    if (productDelete.userErrors && productDelete.userErrors.length > 0) {
      logger.error("[DELETE PRODUCT] Shopify delete errors:", productDelete.userErrors);
      return new Response(
        JSON.stringify({
          error: "Failed to delete product",
          details: productDelete.userErrors
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Soft delete in MongoDB
    logger.info(`[DELETE PRODUCT] Soft deleting product in MongoDB: ${productId}`);
    const mongoResult = await softDeleteProductByShopifyId(productId);
    
    if (!mongoResult) {
      logger.warn(`[DELETE PRODUCT] Product not found in MongoDB: ${productId}`);
    }

    logger.info(`[DELETE PRODUCT] Product deleted successfully: ${productId}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Product deleted successfully",
        deletedProductId: productDelete.deletedProductId,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    logger.error("[DELETE PRODUCT] Error deleting product:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      }),
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