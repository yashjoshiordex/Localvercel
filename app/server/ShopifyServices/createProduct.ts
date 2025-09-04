import { CREATE_PRODUCT_MUTATION } from "app/server/mutations";
import { publishProductToOnlineStore } from "./publishProduct";
import { setProductMetafield } from "./metafieldService";
import { checkPlanPermission } from "app/server/utils/permissionCheak";
import { env } from "env.server";

export async function createShopifyProduct(
    admin: any, 
    title: string, 
    description: string, 
    status: string,
    storeConfig?: any,
    shop?: string
) {
    let productTags = ["Donation"];
    
    if (storeConfig?.tagValue && shop) {
        // Check if the shop has the required plan for using tagValue
        const permissionResult = await checkPlanPermission(shop, ["Gold Plan", "Silver Plan"]);
        
        if (permissionResult.hasAccess) {
            productTags.push(storeConfig.tagValue);
            console.log(`Adding custom tag ${storeConfig.tagValue} to product`);
        }
    }
    
    const response = await admin.graphql(CREATE_PRODUCT_MUTATION, {
        variables: {
            product: {
                title,
                vendor: "DonateMe",
                descriptionHtml: description,
                tags: productTags,
                status
            },
            media: [
                {
                    originalSource: env.STATIC_IMAGE_URL,
                    mediaContentType: "IMAGE",
                    alt: `Image for ${title}`,
                },
            ],
        },
    });

    const result = await response.json();
    const productCreate = result.data?.productCreate;
    const productId = productCreate?.product?.id;
    const variantId = productCreate?.product?.variants?.edges?.[0]?.node?.id;
    console.log("Product creation result:", productId);

    // Publish the product
    const publishErrors = productId
        ? await publishProductToOnlineStore(admin, productId)
        : [{ message: "Product ID missing for publishing." }];

    return {
        product: productCreate.product,
        variantId,
        errors: [...(productCreate.userErrors || []), ...(publishErrors || [])],
    };
} 
