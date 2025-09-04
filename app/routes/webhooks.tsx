import { ActionFunction } from "@shopify/remix-oxygen";
import { authenticate } from "../shopify.server"; // path should be correct
import crypto from "crypto";
// import { SessionModel } from "app/server/models/mongoose-session-model";
import { handleOrderFulfillment } from "app/server/services/fullfilment.service";
import { logger } from "app/server/utils/logger";
import { Order } from "app/server/models/Order";
import StoreConfiguration from "app/server/models/storeConfiguration";
import { env } from "env.server";

enum WebhookTopic {
  ORDERS_CREATE = "ORDERS_CREATE",
  PRODUCTS_CREATE = "PRODUCTS_CREATE",
  CUSTOMERS_DATA_REQUEST = "CUSTOMERS_DATA_REQUEST",
  CUSTOMERS_REDACT = "CUSTOMERS_REDACT",
  SHOP_REDACT = "SHOP_REDACT"
}

const SHOPIFY_API_SECRET = env.SHOPIFY_API_SECRET!;

const verifyShopifyWebhook = (hmacHeader: string, rawBody: string) => {
  const generatedHash = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");

  const signatureOk = crypto.timingSafeEqual(
    Buffer.from(generatedHash),
    Buffer.from(hmacHeader),
  );
  if (signatureOk) {
    console.log("Webhook verification successful");
    return true;
  } else {
    console.log("Webhook verification failed");
    return false;
  }
};

export const action: ActionFunction = async ({ request }) => {
  console.log("Webhook endpoint hit!");
  try {
    // Get the raw body from the request
    const rawBody = await request.text(); // 📦 Get the raw body as text
    const hmacHeader = request?.headers?.get("x-shopify-hmac-sha256"); // Get HMAC from headers

    // Verify the HMAC signature
    verifyShopifyWebhook(hmacHeader as string, rawBody); // Verify the HMAC signature
    const { shop, topic, admin } = await authenticate.webhook(
      new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: rawBody,
      }),
    );
    console.log("📩 Incoming webhook:", topic, "from", shop);

    const payload = JSON.parse(rawBody);
    // Handle different Shopify webhook topics
    switch (topic) {
      case WebhookTopic.ORDERS_CREATE:
        console.log("Handling ORDERS_CREATE webhook");
        try {
          const shop = request.headers.get("x-shopify-shop-domain");
          if (!shop) {
            throw new Error("No shop domain provided");
          }
          await handleOrderFulfillment(shop, payload, admin);

          return new Response(
            JSON.stringify({
              success: true,
              message: "Order created webhook processed.",
            }),
            { status: 200 },
          );
        } catch (error) {
          console.log("Error processing order webhook", error);

          logger.error(`Error processing order webhook ${error}`);
          return new Response(
            JSON.stringify({
              success: false,
              message: "Error processing order webhook",
            }),
            { status: 500 },
          );
        }

      case WebhookTopic.PRODUCTS_CREATE:
        return new Response(
          JSON.stringify({
            success: true,
            message: "Product created webhook processed.",
            productId: payload.id,
          }),
          { status: 200 },
        );
      case WebhookTopic.CUSTOMERS_DATA_REQUEST:
        console.log("Handling GDPR CUSTOMERS_DATA_REQUEST");
        // Shopify sends customer data request payload
        // TODO: Look up customer in DB and return to Shopify if required
        const shopDomain = request.headers.get("x-shopify-shop-domain");
        console.log("shopDomain", shopDomain)
        const customerId = payload.customer?.id;
        const email = payload.customer?.email;
        const orders = await Order.find({
          $or: [
            { "customer.id": customerId },
            { "customer.email": email }
          ]
        });
        console.log("GDPR Data request - orders found:", orders.length);
        return new Response("Data request processed", { status: 200 });

      case WebhookTopic.CUSTOMERS_REDACT:
        console.log("Handling GDPR CUSTOMERS_REDACT");
        try {
          const customerId = payload.customer?.id;
          const email = payload.customer?.email;
          // Example: remove orders linked to this customer
          await Order.deleteMany({
            $or: [
              { "customer.id": customerId },
              { "customer.email": email }
            ]
          });
          return new Response(
            JSON.stringify({ success: true, message: "Customer data deleted" }),
            { status: 200 }
          );
        } catch (err) {
          console.warn("Error deleting customer data", err);
          return new Response("Error", { status: 500 });
        }

      case WebhookTopic.SHOP_REDACT:
        console.log("Handling GDPR SHOP_REDACT");
        try {
          const shopDomain = payload.shop_domain;
          await Order.deleteMany({ shop: shopDomain });
          await StoreConfiguration.deleteOne({ shop: shopDomain });
          return new Response("Shop data deleted", { status: 200 });
        } catch (err) {
          console.warn("Error deleting shop data", err);
          return new Response("Error", { status: 500 });
        }

      default:
        console.log("Unhandled webhook topic:", topic);
        return new Response(
          JSON.stringify({
            success: false,
            message: "Unhandled webhook topic.",
          }),
          { status: 400 },
        );
    }
  } catch (error) {
    console.warn("Error handling webhook:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
        error: String(error),
      }),
      { status: 500 },
    );
  }
};
