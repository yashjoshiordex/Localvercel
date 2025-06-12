import { UPDATE_PRODUCT_MUTATION } from "app/server/mutations";
import { updateProductVariant } from "app/server/ShopifyServices/updateVariant";
import { logger } from "app/server/utils/logger";
import { authenticate } from "app/shopify.server";
import { updateProductInDb } from "app/server/controllers/product.Controller";

// API endpoint for updating product
export const action = async ({ request }: any) => {
  const { admin } = await authenticate.admin(request);

  // Get form data
  const body = await request.json();

  const { productId, title, description, vendor, productType, sku, price, minimumDonationAmount, presetValue,goalAmount } = body;

  console.log("action function called with body:", presetValue);

  logger.info("Received product update request:", {
    productId, title, vendor, productType, sku, price, minimumDonationAmount
  });

  if (!productId) {
    logger.error("Product ID is missing in the request.");
    return new Response(JSON.stringify({ error: "Product ID is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!title) {
    logger.error("Title is missing in the request.");
    return new Response(JSON.stringify({ error: "Title is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!description) {
    logger.error("Description is missing in the request.");
    return new Response(JSON.stringify({ error: "Description is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(presetValue)) {
    logger.error("Preset value must be an array.");
    return new Response(JSON.stringify({ error: "Preset value must be an array" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Check for duplicate values in presetValue
  const presetSet = new Set(presetValue);
  if (presetSet.size !== presetValue.length) {
    logger.error("Duplicate values found in presetValue.");
    return new Response(JSON.stringify({ error: "Duplicate values are not allowed in presetValue" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Update the product in Shopify
    logger.info("Sending update to Shopify GraphQL API...");
    const updateResponse = await admin.graphql(UPDATE_PRODUCT_MUTATION, {
      variables: {
        input: {
          id: productId,
          title,
          descriptionHtml: description,
        },
      },
    });
    const updateResult: any = await updateResponse.json();

    logger.info("Shopify update response:", updateResult);

    if (updateResult.errors) {
      logger.error("GraphQL error:", updateResult.errors[0].message);
      return new Response(JSON.stringify({ error: updateResult.errors[0].message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (updateResult.data.productUpdate.userErrors.length > 0) {
      logger.error("User error:", updateResult.data.productUpdate.userErrors[0].message);
      return new Response(JSON.stringify({ error: updateResult.data.productUpdate.userErrors[0].message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    let variantId = null;
    if (sku) {
      logger.info("Updating product variant SKU...");
      const variants = updateResult.data.productUpdate.product.variants.edges;
      if (variants?.length > 0) {
        variantId = variants[0].node.id;

        logger.info(`"Updating product variant SKU..." ${variantId}`);

        const variantResult: any = await updateProductVariant(
          admin,
          productId,
          variantId,
          price ?? 10,
          sku,
          minimumDonationAmount
        );

        if (variantResult?.errors) {
          logger.error("Error updating SKU:", variantResult.errors[0].message);
          console.log("Error updating SKU:", variantResult.errors[0].message);
        } else if (
          variantResult.data &&
          variantResult.data.productVariantUpdate &&
          variantResult.data.productVariantUpdate.userErrors &&
          variantResult.data.productVariantUpdate.userErrors.length > 0
        ) {
          logger.error(
            "Error updating SKU:",
            variantResult.data.productVariantUpdate.userErrors[0].message
          );
        } else {
          logger.info("SKU successfully updated");
          console.log("SKU successfully updated:", variantId);
        }
      }
    }

    // --- MongoDB Update ---
    try {
      await updateProductInDb({ productId, title, description, sku, price, minimumDonationAmount, presetValue,goalAmount });
      logger.info("MongoDB product updated successfully:", productId);
    } catch (mongoError) {
      logger.error("MongoDB update error:", mongoError instanceof Error ? mongoError.message : mongoError);
      console.log("MongoDB update error:", mongoError);
    }

    logger.info("Product updated successfully:", productId);
    return new Response(JSON.stringify({ success: true, message: "Product updated successfully" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    logger.error("Error updating product:", error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      logger.error("Stack trace:", error.stack);
    }
    if (error.status === 401) {
      return new Response(
        JSON.stringify({ error: "Unauthorized access. Please log in again." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};