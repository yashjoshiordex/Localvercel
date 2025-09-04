import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import { checkPlanPermission } from "app/server/utils/permissionCheak";
import { authenticate } from "app/shopify.server";

// Loader to handle GET /apps/product/:productId
export const loader: LoaderFunction = async ({ request }: ActionFunctionArgs) => {
    try {
        const { session } = await authenticate.public.appProxy(request);
        const shopDomain: string | undefined = session?.shop;
        const permissionResult: any = await checkPlanPermission(shopDomain as string, ["Gold Plan", "Silver Plan"]);
        return new Response(
            JSON.stringify({ permissionResult: permissionResult?.hasAccess}),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        console.error("Error fetching Subscription:", error);
        return new Response(
            JSON.stringify({ error: "Server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
};
