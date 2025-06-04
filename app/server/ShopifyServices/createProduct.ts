import { CREATE_PRODUCT_MUTATION } from "app/server/mutations";

export async function createShopifyProduct(admin: any, title: string) {
    const response = await admin.graphql(CREATE_PRODUCT_MUTATION, {
        variables: {
            product: {
                title,
                vendor: "DonateMe",
                descriptionHtml: "This is a Donation product",
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

    const variantId = productCreate?.product?.variants?.edges?.[0]?.node?.id;

    return {
        product: productCreate.product,
        variantId,
        errors: productCreate.userErrors || [],
    };
} 
