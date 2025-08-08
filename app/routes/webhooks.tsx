import { ActionFunction } from "@shopify/remix-oxygen";
import  { authenticate } from "../shopify.server"; // path should be correct
import crypto from "crypto";
// import { SessionModel } from "app/server/models/mongoose-session-model";
import { handleOrderFulfillment } from "app/server/services/fullfilment.service";
import { logger } from "app/server/utils/logger";

enum WebhookTopic {
  ORDERS_CREATE = "ORDERS_CREATE",
  PRODUCTS_CREATE = "PRODUCTS_CREATE",
}

const SHOPIFY_API_SECRET = process.env.SHOPIFY_API_SECRET!;

const verifyShopifyWebhook = (hmacHeader: string, rawBody: string) => {
  console.log("SHOPIFY_API_SECRET", SHOPIFY_API_SECRET);
  const generatedHash = crypto
    .createHmac("sha256", SHOPIFY_API_SECRET)
    .update(rawBody, "utf8")
    .digest("base64");
  // console.log({ rawBody, generatedHash, hmacHeader });
  // console.log("Computed HMAC:", generatedHash, "Header HMAC:", hmacHeader);
  console.log("Compare", generatedHash === hmacHeader);
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
    const { shop, topic, session, admin } = await authenticate.webhook(
      new Request(request.url, {
        method: request.method,
        headers: request.headers,
        body: rawBody,
      }),
    );
    console.log("Webhook received:", topic, shop, session);
    const payload = JSON.parse(rawBody);
    console.log("Parsed payload:", payload);
    // Handle different Shopify webhook topics
    switch (topic) {
      // case WebhookTopic.ORDERS_CREATE:
      //   console.log("Handling ORDERS_CREATE webhook");
      //   return new Response(
      //     JSON.stringify({
      //       success: true,
      //       message: "Order created webhook processed.",
      //     }),
      //     { status: 200 },
      //   );
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
        console.log("Handling PRODUCTS_CREATE webhook");
        console.log("Product payload:", payload);
        return new Response(
          JSON.stringify({
            success: true,
            message: "Product created webhook processed.",
            productId: payload.id,
          }),
          { status: 200 },
        );

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
    console.error("Error handling webhook:", error);
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
