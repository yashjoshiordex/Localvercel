import { VARIANT_UPDATE_MUTATION } from "app/server/mutations";

export async function updateProductVariant(
    admin: any,
    productId: string,
    variantId: string,
    price: number,
    sku: string,
    minDonation?: number,
    applySalesTax: boolean = false // Default to true, can be overridden
) {
    const variantInput: Record<string, any> = {
        id: variantId,
        price,
        taxable: applySalesTax
    };

    if (sku) {
        variantInput.inventoryItem = { sku }; // Set requiresShipping to false for digital products
    }

  

    const response = await admin.graphql(VARIANT_UPDATE_MUTATION, {
        variables: {
            productId,
            variants: [variantInput],
        },
    });

    const result = await response.json();
    console.log(JSON.stringify(result, null, 2));
    return result.data?.productVariantsBulkUpdate?.userErrors || [];
}