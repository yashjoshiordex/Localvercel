/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string;
    SHOPIFY_API_KEY: string;
    SHOPIFY_DONATE_ME_ID: string;
    SHOPIFY_APP_NAME: string;
    STATIC_IMAGE_URL: string;
    LOG_LEVEL?: string;
    NODE_ENV?: "development" | "production" | "test";
    SHOPIFY_CART_TRANSFORMER_ID: string;
    SMTP_USER: string;
    SMTP_PASS: string;
  }
}