import type { LoaderFunction } from "@remix-run/node";
import { Product } from "app/server/models/Product";
import { getTotalOrderAmount } from "app/server/utils/getTotalOrderAmount";

// Loader to handle GET /apps/product/:productId
export const loader: LoaderFunction = async ({ params }) => {
  console.log("✅ Proxy endpoint hit: get product");

  try {

    const productId = params.productId;
    console.log("productid-------------->",productId);
    
    if (!productId) {
      return new Response(
        JSON.stringify({ error: "Product ID is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const product = await Product.findOne({ shopifyProductId: `gid://shopify/Product/${productId}` });
  const totalOrderAmount = await getTotalOrderAmount(`gid://shopify/Product/${productId}`);
  console.log("totalOrderAmount------->",totalOrderAmount);
  
    if (!product) {
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
    JSON.stringify({
      goalAmount: product?.goalAmount ?? null,
      availableSales:totalOrderAmount
    }),
  { status: 200, headers: { "Content-Type": "application/json" } }
);
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
