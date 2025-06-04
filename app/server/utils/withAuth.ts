// app/utils/withAuth.ts
import { redirect } from "@remix-run/node";
import { authenticate } from "app/shopify.server";

export const withAuth = async (
  request: Request,
  callback: (
    admin: Awaited<ReturnType<typeof authenticate.admin>>["admin"],
    session: Awaited<ReturnType<typeof authenticate.admin>>["session"]
  ) => Promise<Response>
): Promise<Response> => {
  try {
    const { admin, session } = await authenticate.admin(request);
    return await callback(admin, session);

  } catch (err: unknown) {
    const { session } = await authenticate.admin(request);
    
    const shop =
      new URL(request.url).searchParams.get("shop") ?? session.shop;
    
    /* 🔑 1. Remix/Shopify now throws `Response` for 401 */
    if (err instanceof Response && err.status === 401) {
      return redirect(`/auth?shop=${shop}`);
    }

    /* 🔑 2. Fallback: older message-based errors */
    if (
      typeof err === "object" &&
      err &&
      "message" in err &&
      (err as any).message?.toString().match(/Invalid session|Session not found/i)
    ) {
      return redirect(`/auth?shop=${shop}`);
    }

    console.error("Unexpected error in withAuth middleware:", err);
    return new Response("Internal server error", { status: 500 });
  }
};

