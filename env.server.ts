// app/env.server.ts
export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  SHOPIFY_API_KEY: process.env.SHOPIFY_API_KEY!,
  SHOPIFY_API_SECRET: process.env.SHOPIFY_API_SECRET!,
  SHOPIFY_DONATE_ME_ID: process.env.SHOPIFY_DONATE_ME_ID!,
  SHOPIFY_APP_NAME: process.env.SHOPIFY_APP_NAME!,
  STATIC_IMAGE_URL: process.env.STATIC_IMAGE_URL!,
  LOG_LEVEL: process.env.LOG_LEVEL ?? "info",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  SHOPIFY_CART_TRANSFORMER_ID: process.env.SHOPIFY_CART_TRANSFORMER_ID!,
  SMTP_USER: process.env.SMTP_USER!,
  SMTP_PASS: process.env.SMTP_PASS!,
};
