import { ActionFunctionArgs } from '@remix-run/node';
import { Product } from 'app/server/models/Product';
import StoreConfiguration from 'app/server/models/storeConfiguration';
import { GET_INVENTORY_ITEM_ID, PRODUCT_ALL_VARIANTS_QUERY, PRODUCT_VARIANT_QUERY, SHOP_CURRENCY_QUERY, VARIANT_DETAIL_QUERY } from 'app/server/mutations';
import { updateInventoryItem } from 'app/server/ShopifyServices/updateInventoryItem';
import { authenticate } from 'app/shopify.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  console.log("✅ Proxy endpoint hit: create-variant");

  const { admin, session } = await authenticate.public.appProxy(request);
  const { price, productId } = await request.json();
  const shopDomain = session?.shop;

  if (!admin) {
    console.warn("Shopify Admin client not available.");
    return new Response(
      JSON.stringify({ error: "Shopify Admin client not available." }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const storeConfig:any = await StoreConfiguration.findOne({ shop: shopDomain }).lean();
  if (!storeConfig) {
    return new Response(
      JSON.stringify({ error: "Store configuration not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const { requireShipping, applySalesTax } = storeConfig;

  const shopifyproductId = `gid://shopify/Product/${productId}`;
  const variantTitle = `Donation Product of ${price}`;

  try {
    // 1. Check if variant already exists
    const getVariantsRes: any = await admin.graphql(
      PRODUCT_ALL_VARIANTS_QUERY as string,
      { variables: { id: shopifyproductId } }
    );
    const getVariantsJson = await getVariantsRes.json();
    const variants = getVariantsJson?.data?.product?.variants?.edges || [];
    const existingVariant = variants.find((v: any) =>
      v.node.title === variantTitle
    );

    if (existingVariant) {
      const variantId = existingVariant.node.id.split('/').pop();
      return new Response(
        JSON.stringify({ variantId, message: "Existing variant returned." }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    // 2. If not, create new variant
    const variables = {
      productId: shopifyproductId,
      variants: [
        {
          price: price || 5,
          taxable: applySalesTax,
          optionValues: [
            { name: variantTitle, optionName: "Title" }
          ]
        }
      ]
    };

    const response: any = await admin.graphql(
      PRODUCT_VARIANT_QUERY as string,
      { variables }
    );
    const result = await response.json();

    const errors = result.data.productVariantsBulkCreate.userErrors;
    const variant = result.data.productVariantsBulkCreate.productVariants[0];

    if (errors?.length > 0) {
      return new Response(JSON.stringify({ errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!variant) {
      console.warn('Variant creation failed: No variant returned.');
      return new Response(
        JSON.stringify({ error: 'Variant creation failed: No variant returned.' }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const variantId = variant.id.split('/').pop();

    // invantory item update
    const inventoryresponse = await admin.graphql(GET_INVENTORY_ITEM_ID, {
      variables: { variantId: variant.id },
    });
    const data = await inventoryresponse.json();
    const inventoryItemId = data?.data?.productVariant?.inventoryItem?.id;
    const inventoryErrors = await updateInventoryItem(admin, inventoryItemId, {
      sku: "donation",
      requiresShipping: requireShipping,
      tracked: false,
    });
    if (inventoryErrors.length > 0) {
      console.log("Inventory update errors:", inventoryErrors);
    } else {
      console.log("Inventory item updated successfully:", inventoryItemId);
    }
   
    try {
      const variantResponse = await admin.graphql(VARIANT_DETAIL_QUERY, {
        variables: { id: `gid://shopify/ProductVariant/${variantId}` }
      });
      const varianData = await variantResponse.json();
        
      const currencyResponse = await admin.graphql(SHOP_CURRENCY_QUERY);
      const currencyData = await currencyResponse.json();
      const shopCurrency = currencyData?.data?.shop?.currencyCode || 'USD';
      
      console.log("Shop currency:", shopCurrency);
      const variantProduct:any = varianData?.data?.productVariant;
      
        const newVariant = new Product({
        shopifyProductId: shopifyproductId,
        title: `${variantProduct.product.title} of ${price} ${shopCurrency}`,
        variantId: variantProduct.id,
        sku: variantProduct.sku,
        description: `This is variant product of ${variantProduct?.price} ${shopCurrency}`,
        price: parseFloat(variantProduct.price),
        minimumDonationAmount: variantProduct.minimumDonationAmount || 0,
        shop: shopDomain,
        isDeleted: false,
        isVariant: true,
      });
      await newVariant.save();
    } catch (error) {
      console.warn("Error saving variant to database:", error);
      return new Response(
        JSON.stringify({ error: 'Failed to save variant to database' }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ variantId }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.log(error)
    return new Response(
      JSON.stringify({ error: 'Variant creation failed' }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};