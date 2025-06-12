import { VARIANT_UPDATE_MUTATION } from "app/server/mutations";

export async function updateProductVariant(
    admin: any,
    productId: string,
    variantId: string,
    price: number,
    sku: string,
    minDonation?: number
) {
    const variantInput: Record<string, any> = {
        id: variantId,
        price,
    };

    if (sku) {
        variantInput.inventoryItem = { sku };
    }

    if (minDonation != null) {
        variantInput.metafields = [
            {
                namespace: "donation",
                key: "minimum_value",
                type: "number_integer",   // Shopify expects the metafield type
                value: String(minDonation),
            },
        ];
    }

    const response = await admin.graphql(VARIANT_UPDATE_MUTATION, {
        variables: {
            productId,
            variants: [variantInput],
        },
    });

    const result = await response.json();
    return result.data?.productVariantsBulkUpdate?.userErrors || [];
}