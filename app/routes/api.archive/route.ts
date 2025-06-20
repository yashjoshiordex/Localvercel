import { type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { archiveAllProducts } from "app/server/utils/archiveAllProducts";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return new Response(
    JSON.stringify({ message: "Archive API endpoint" }),
    { headers: { "Content-Type": "application/json" } }
  );
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { admin, session } = await authenticate.admin(request);

    if (!admin || !session) {
      console.log("❌ No admin or session");
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("✅ Archiving products for shop:", session?.shop);
    const data = await archiveAllProducts({ admin });

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("❌ Error archiving products:", err?.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};