// app/handlers/api.hello.ts
import { LoaderFunctionArgs } from "@remix-run/node";
import { HelloLog } from "app/server/models/HelloLog";
import { loadOfflineSession } from "app/server/utils/verify-shopify-session";
import { authenticate } from "app/shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log("👋 Hello from API:", request.url);

  try {

    const { session } = await authenticate.admin(request); // 🔒 Auth check
    const sessions = await loadOfflineSession(session.shop);

    if (!sessions) {
      return new Response(JSON.stringify({ error: 'Unauthorized: no session found' }), { status: 401 });
    }
    console.log("✅ Authorized API call from shop:", session.shop);

    const entry = await HelloLog.create({ message: "Hello from Shopify API!" });

    return new Response(
      JSON.stringify({ success: true, message: entry.message }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("❌ Authentication failed:", err);

    return new Response(
      JSON.stringify({ success: false, error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}



