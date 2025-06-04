// services/shopify/updateVariant.ts

import { VARIANT_UPDATE_MUTATION } from "app/server/mutations";

export async function updateProductVariant(admin: any, productId: string, variantId: string, price: number) {
    const response = await admin.graphql(VARIANT_UPDATE_MUTATION, {
        variables: {
            productId,
            variants: [
                {
                    id: variantId,
                    price,
                },
            ],
        },
    });

    const result = await response.json();
    return result.data?.productVariantsBulkUpdate?.userErrors || [];
}
