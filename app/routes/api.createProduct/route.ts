// routes/api/product.ts
import type { ActionFunctionArgs } from "@remix-run/node";
import { SessionModel } from "app/server/models/mongoose-session-model";
import { validateProductInput } from "app/server/validations/productSchema";
import { createShopifyProduct } from "app/server/ShopifyServices/createProduct";
import { updateProductVariant } from "app/server/ShopifyServices/updateVariant";
import { withAuth } from "app/server/utils/withAuth";
import { Session } from "@shopify/shopify-app-remix/server";
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import { logger } from "app/server/utils/logger";
import { countActiveProductsByShop, createProductInDb } from "app/server/controllers/product.Controller";
import { createMetafieldDefinition } from "app/server/ShopifyServices/createMetafieldDefinition";
import StoreConfiguration from "app/server/models/storeConfiguration";
import { GET_INVENTORY_ITEM_ID, SET_PRODUCT_METAFIELD_MUTATION } from "app/server/mutations";
import { updateInventoryItem } from "app/server/ShopifyServices/updateInventoryItem";
import { checkPlanPermission } from "app/server/utils/permissionCheak";

// ────────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────────

type CreateProductResult = Awaited<ReturnType<typeof createShopifyProduct>>;
type VariantUpdateErrors = Awaited<ReturnType<typeof updateProductVariant>>;

// ────────────────────────────────────────────────────────────────────────────────
// Action
// ────────────────────────────────────────────────────────────────────────────────

export const action = async ({ request }: ActionFunctionArgs) => {
  return withAuth(
    request,
    /* 1️⃣  Authenticate request (handled by withAuth) */
    async (admin: AdminApiContextWithoutRest | any, session: Session) => {
      /* 2️⃣  Parse & validate body ------------------------------------------------ */
      const body = await request.json();
      const parsed = validateProductInput(body);
      console.log("Parsed product input:", body); // should be present

      if (!parsed.success) {
        logger.error("Product input validation failed", { error: parsed.error });
        return new Response(JSON.stringify({ error: parsed.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { title, description, sku, goalAmount, status, minimumDonationAmount } = parsed.data;
      const shopDomain: string = session.shop;

      try {
        // Check if the shop has a free plan or bronze plan 
        const permissionResult:any = await checkPlanPermission(shopDomain, ["Gold Plan", "Silver Plan"]);
        
        // If not on Gold/Silver plan, check if they already have a product
        if (!permissionResult.hasAccess) {
          // Import the countActiveProductsByShop function at the top of the file
          const productCount = await countActiveProductsByShop(shopDomain);
          
          if (productCount >= 1) {
            logger.warn("Free or Bronze plan user attempted to create more than one product", { 
              shop: shopDomain,
              productCount 
            });
            
            return new Response(
              JSON.stringify({ 
                error: "Your current plan allows only one active product. Upgrade to Silver or Gold plan for unlimited products." 
              }),
              { status: 403, headers: { "Content-Type": "application/json" } }
            );
          }
          
          logger.info("Free plan user creating their first product", { shop: shopDomain });
        } else {
          logger.info(`${permissionResult.plan.name} user creating a product`, { shop: shopDomain });
        }
      } catch (error) {
        logger.error("Error checking plan permissions", { error, shop: shopDomain });
      }

      const storeConfig = await StoreConfiguration.findOne({ shop: shopDomain }).lean();
      if (!storeConfig) {
        logger.error("Store configuration not found", { shop: shopDomain });
        return new Response(
          JSON.stringify({ error: "Store configuration not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      const { requireShipping, applySalesTax } = storeConfig;


      /* 3️⃣  Create product in Shopify ------------------------------------------- */
      const { product, variantId, errors: createErrors }: CreateProductResult =
        await createShopifyProduct(admin, title, description, status, storeConfig, shopDomain);

      if (createErrors?.length > 0) {
        logger.error(`Shopify product creation errors ${JSON.stringify(createErrors)}`);
        return new Response(JSON.stringify({ error: createErrors }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const response = await admin.graphql(GET_INVENTORY_ITEM_ID, {
        variables: { variantId },
      });

      const data = await response.json(); // ✅ Parse the body
      console.log("Parsed inventory data:", data);

      // Now access the inventoryItem ID
      const inventoryItemId = data?.data?.productVariant?.inventoryItem?.id;
      console.log("inventoryItemId:", inventoryItemId);

      const inventoryErrors = await updateInventoryItem(admin, inventoryItemId, {
        sku,
        requiresShipping: requireShipping,
        tracked: false,
      });
      if (inventoryErrors.length > 0) {
        console.log("Inventory update errors:", inventoryErrors);
        logger.error("Inventory update errors", { errors: inventoryErrors });
      } else {
        logger.info("Inventory item updated successfully", { inventoryItemId });
      }
      logger.info("Product created in Shopify", { productId: product.id, shop: shopDomain });

      const variantErrors: VariantUpdateErrors = await updateProductVariant(
        admin,
        product.id, 
        variantId,
        5,
        sku,
        body.minDonation,
        applySalesTax
      );
      if (variantErrors?.length > 0) {
        console.log("Variant update errors:", variantErrors);
        logger.error("Variant update errors", { errors: variantErrors });
      } else {
        console.log("Variant update errors:", variantErrors);
        logger.info("Product variant updated", { productId: product.id, variantId });
      }

      const metafieldResponse = await createMetafieldDefinition(admin, {
        name: "Preset Value",
        namespace: "donate",
        key: "preset_value",
        type: "list.number_integer",
        ownerType: "PRODUCT",
      });

      if (!metafieldResponse.success) {
        logger.warn("⚠️ Failed to create metafield definition", {
          errors: metafieldResponse.errors,
        });
      } else {
        logger.info("✅ Metafield definition created", {
          id: metafieldResponse.definition?.id,
          name: metafieldResponse.definition?.name,
        });
      }

      const minDonationResponse = await admin.graphql(SET_PRODUCT_METAFIELD_MUTATION, {
        variables: {
          metafields: [
            {
              ownerId: product.id,
              namespace: "minimum_donation",
              key: "minimum_value",
              type: "number_integer",
              value: String(minimumDonationAmount),
            },
          ],
        },
      });

      if (!minDonationResponse.success) {
        logger.warn("⚠️ Failed to create metafield definition", {
          errors: metafieldResponse.errors,
        });
      } else {
        logger.info("✅ Metafield definition created", {
          id: metafieldResponse.definition?.id,
          name: metafieldResponse.definition?.name,
        });
      }
      /* 5️⃣  Persist to MongoDB --------------------------------------------------- */
      const shopSession = await SessionModel.findOne({ shop: shopDomain });
      if (!shopSession) {
        logger.error("Store session not found", { shop: shopDomain });
        return new Response(
          JSON.stringify({ error: "Store session not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      try {
        const savedProduct = await createProductInDb({
          shopifyProductId: product.id,
          title,
          variantId,
          sku: sku ?? null,
          description,
          price: 5,
          goalAmount: goalAmount,
          shop: shopDomain,
          minimumDonationAmount: body.minimumDonationAmount,
          status: status,
        });
        logger.info(`Product saved to database : ${JSON.stringify(savedProduct)}`, { shop: shopDomain });
      } catch (err) {
        logger.error("DB save error", { error: err });
        return new Response(
          JSON.stringify({ error: "Failed to save to database" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      logger.info("Product creation flow completed successfully", { productId: product.id, shop: shopDomain });
      return new Response(JSON.stringify({ success: true, product }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    },
  );
};
