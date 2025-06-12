import { Product } from "app/server/models/Product";
import { authenticate } from "app/shopify.server";

export const loader = async ({ request }: any) => {
  const { admin, session } = await authenticate.admin(request);
  const shop:string = session?.shop;
  const url = new URL(request.url);
  const shopifyId:string|null = url.searchParams.get("id");

  if (!shopifyId) {
    return new Response(
      JSON.stringify({ error: "Product ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Find the product in your MongoDB collection using the passed `id` and `shop`
    const dbProduct = await Product.findOne({ shopifyProductId: shopifyId, shop,isDeleted: false });

    if (!dbProduct) {
      return new Response(
        JSON.stringify({ error: "Product not found in DB" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use the Shopify Product GID from your database to fetch fresh data from Shopify

    return new Response(
      JSON.stringify({
        data:{
          id: dbProduct.shopifyProductId,
          title: dbProduct.title,
          description: dbProduct.description,
          sku: dbProduct.sku,
          price: dbProduct.price,
          minimumDonation: dbProduct.minimumDonationAmount,
          presetValue: dbProduct.presetValue, 
          shop: dbProduct.shop,
        }
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error fetching product:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch product" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
