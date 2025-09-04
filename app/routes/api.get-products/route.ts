// app/routes/api.products.tsx
import { authenticate } from "../../shopify.server";
import { logger } from "app/server/utils/logger";
import { getProducts } from "app/server/controllers/product.Controller";

export async function loader({ request }: { request: Request }) {
  try {
    // Step 1: Authenticate admin and extract session
    const { session } = await authenticate.admin(request);
    if (!session || !session.shop) {
      logger.error("Authentication failed: No session or shop found");
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    logger.info("Admin authenticated", { shop: session.shop });

    // Step 2: Parse query parameters
    const url = new URL(request.url);
    const pageParam = url.searchParams.get("page");
    const pageSizeParam = url.searchParams.get("pageSize");
    const statusParam = url.searchParams.get("status");
    const searchParam = url.searchParams.get("search");
    const shopName = session.shop; // Use authenticated shop

    logger.info("Query parameters received", {
      pageParam,
      pageSizeParam,
      statusParam,
      searchParam,
      shop: shopName
    });

    // Parse parameters with defaults
    const page = pageParam ? parseInt(pageParam, 10) : 1;
    const pageSize = pageSizeParam ? parseInt(pageSizeParam, 10) : 10;

    // Step 3: Validate parameters
    if (isNaN(page) || page < 1) {
      logger.error("Invalid page parameter", { pageParam, parsedPage: page });
      return new Response(
        JSON.stringify({
          error: "Page must be a valid number greater than 0",
          debug: { receivedPage: pageParam, parsedPage: page }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    if (isNaN(pageSize) || pageSize < 1) {
      logger.error("Invalid pageSize parameter", { pageSizeParam, parsedPageSize: pageSize });
      return new Response(
        JSON.stringify({
          error: "Page size must be a valid number between 1 and 100",
          debug: { receivedPageSize: pageSizeParam, parsedPageSize: pageSize }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate status parameter if provided
    if (statusParam && !["ACTIVE", "DRAFT"].includes(statusParam)) {
      logger.error("Invalid status parameter", { statusParam });
      return new Response(
        JSON.stringify({
          error: "Status must be either 'Active' or 'Archived'",
          debug: { receivedStatus: statusParam }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const getProductsData = await getProducts(page, pageSize, shopName, statusParam, searchParam);

    return ({ getProductsData });

  } catch (err: any) {

    // Catch-all for unexpected errors
    logger.error("Unexpected error in products API", { error: err });
    return new Response(
      JSON.stringify({
        error: "Internal server error"
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

