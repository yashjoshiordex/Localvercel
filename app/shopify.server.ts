import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  DeliveryMethod,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { connectToDatabase } from "./server/libs/db.server";
import { MongooseSessionStorage } from "./server/libs/mongoose-session-storage";
import StoreConfiguration from "./server/models/storeConfiguration";
import { startDonationResetCron } from "./server/cron/donationReset";

connectToDatabase().then(() => {
  startDonationResetCron();
});
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new MongooseSessionStorage(),
  distribution: AppDistribution.AppStore,
  webhooks: {
    ORDERS_CREATE: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  hooks: {
    afterAuth: async ({ session, admin }) => {
      console.log("✅ afterAuth triggered for shop:", session.shop);
      try {
        const result = await shopify.registerWebhooks({ session });
        console.log("Webhooks registered:", result);

        const existingConfig = await StoreConfiguration.findOne({ shop: session.shop });

        if (!existingConfig) {
          console.log("Creating initial store configuration for:", session.shop);
          const newStoreConfig = new StoreConfiguration({
            shop: session.shop,
          });
          await newStoreConfig.save();
          console.log("✅ Initial store configuration created for:", session.shop);
        }
      } catch (error) {
        console.error("Error registering webhooks:", error);
      }
    }
  },
  future: {
    unstable_newEmbeddedAuthStrategy: true,
    removeRest: true,
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
