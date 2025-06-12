import { CREATE_PRODUCT_MUTATION } from "app/server/mutations";
import { publishProductToOnlineStore } from "./publishProduct";

export async function createShopifyProduct(admin: any, title: string, description: string) {
    const response = await admin.graphql(CREATE_PRODUCT_MUTATION, {
        variables: {
            product: {
                title,
                vendor: "DonateMe",
                descriptionHtml: description,
                tags: ["DonateMe"],
            },
            media: [
                {
                    originalSource: process.env.STATIC_IMAGE_URL,
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
