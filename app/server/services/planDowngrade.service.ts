import { logger } from "../utils/logger";
import { Product } from "../models/Product";
import { DELETE_PRODUCT_MUTATION_FOR_DOWN } from "../mutations";
import { authenticate } from "app/shopify.server";

export async function handlePlanDowngrade(shop: string, request: any) {
  try {
    // 1. Get all active non-deleted products
    const activeProducts = await Product.find({
      shop,
      isDeleted: { $ne: true }
    }).sort({ createdAt: -1 }).lean();
    
    if (activeProducts.length === 0) {
      logger.info(`Shop ${shop} downgraded to Free plan but has no products - no action needed`);
      return { 
        success: true, 
        productsAffected: 0,
        message: "No products needed to be changed" 
      };
    }

    // 2. Find the most recent product
    const mostRecentProduct = activeProducts[0];

    // 3. Keep all products with the same shopifyProductId as the most recent product
    const productIdToKeep = mostRecentProduct.shopifyProductId;

    // Keep the status as ACTIVE for the most recent product and its variants
    const updateResult = await Product.updateMany(
      {
        shop,
        shopifyProductId: productIdToKeep,
        isDeleted: { $ne: true }
      },
      { status: "ACTIVE" }
    );

    // Get products to delete from Shopify (only non-variants)
    const productsToDeleteFromShopify = activeProducts.filter(
      product => product.shopifyProductId !== productIdToKeep && !product.isVariant
    );
    console.log("Products to delete from Shopify:", productsToDeleteFromShopify.length);
    // Delete products from Shopify if there are any to delete
    const { admin } = await authenticate.admin(request);
    if (productsToDeleteFromShopify.length > 0) {
      if (admin) {
        try {
          // Delete each product from Shopify
          for (const product of productsToDeleteFromShopify) {
            try {
              await admin.graphql(DELETE_PRODUCT_MUTATION_FOR_DOWN, {
                variables: {
                  input: {
                    id: product.shopifyProductId
                  }
                }
              });
              console.log(`Successfully deleted product ${product.title} (ID: ${product.shopifyProductId}) from Shopify`);
              logger.info(`Successfully deleted product ${product.title} (ID: ${product.shopifyProductId}) from Shopify`);
            } catch (deleteError) {
              logger.error(`Failed to delete product ${product.title} (ID: ${product.shopifyProductId}) from Shopify:`, deleteError);
            }
          }
        } catch (authError) {
          logger.error(`Failed to authenticate with Shopify for shop ${shop}:`, authError);
        }
      } else {
        logger.error(`Could not find valid session with accessToken for shop ${shop}`);
      }
    }

    // 4. Mark all other products as deleted and set status to null in our database
    const deleteResult = await Product.updateMany(
      {
        shop,
        shopifyProductId: { $ne: productIdToKeep },
        isDeleted: { $ne: true }
      },
      {
        isDeleted: true,
        status: null
      }
    );

    logger.info(`Shop ${shop} downgraded to Free plan. Product "${mostRecentProduct.title}" and its variants (${updateResult.modifiedCount} items) kept ACTIVE. ${deleteResult.modifiedCount} other products marked as deleted in DB and removed from Shopify.`);

    return {
      success: true,
      keptProductId: productIdToKeep,
      keptProductTitle: mostRecentProduct.title,
      variantsKept: updateResult.modifiedCount,
      productsDeleted: deleteResult.modifiedCount,
      message: `Plan downgraded to Free. Your product "${mostRecentProduct.title}" and its variants remain ACTIVE. ${deleteResult.modifiedCount} other products were removed.`
    };
  } catch (error) {
    logger.error(`Error handling plan downgrade for shop ${shop}:`, error);
    return {
      success: false,
      error: "Failed to process plan downgrade"
    };
  }
}