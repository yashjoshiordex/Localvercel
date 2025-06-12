// routes/api/product.ts
import type { ActionFunctionArgs } from "@remix-run/node";
import { SessionModel } from "app/server/models/mongoose-session-model";
import {
  validateProductInput,
} from "app/server/validations/productSchema";
import { createShopifyProduct } from "app/server/ShopifyServices/createProduct";
import { Product } from "app/server/models/Product";
import { updateProductVariant } from "app/server/ShopifyServices/updateVariant";
import { withAuth } from "app/server/utils/withAuth";
import { Session } from "@shopify/shopify-app-remix/server";
import { AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients";
import { logger } from "app/server/utils/logger";
import { createProductInDb } from "app/server/controllers/product.Controller";

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
    async (admin: AdminApiContextWithoutRest, session: Session) => {
      /* 2️⃣  Parse & validate body ------------------------------------------------ */
      const body = await request.json();
      const parsed = validateProductInput(body);
      console.log("Parsed product input:", body);

      if (!parsed.success) {
        logger.error("Product input validation failed", { error: parsed.error });
        return new Response(JSON.stringify({ error: parsed.error }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      const { title, description, sku } = parsed.data;
      const shopDomain: string = session.shop;

      /* 3️⃣  Create product in Shopify ------------------------------------------- */
      const { product, variantId, errors: createErrors }: CreateProductResult =
        await createShopifyProduct(admin, title, description);

      if (createErrors?.length > 0) {
        logger.error(`Shopify product creation errors ${JSON.stringify(createErrors)}`);
        return new Response(JSON.stringify({ error: createErrors }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      logger.info("Product created in Shopify", { productId: product.id, shop: shopDomain });


      const variantErrors: VariantUpdateErrors = await updateProductVariant(
        admin,
        product.id,
        variantId,
        body.price ?? 10,   // ← your price logic from earlier
        sku,          // optional
        body.minDonation  // optional metafield; omit or set undefined to skip
      );

      if (variantErrors?.length > 0) {
        console.log("Variant update errors:", variantErrors);
        logger.error("Variant update errors", { errors: variantErrors });
      } else {
        console.log("Variant update errors:", variantErrors);

        logger.info("Product variant updated", { productId: product.id, variantId });
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
          price: body.price ?? 10,
          shop:shopDomain,
          minimumDonationAmount: body.minDonation ?? null,
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
