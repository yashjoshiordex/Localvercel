import { INVENTORY_ITEM_UPDATE_MUTATION } from "../mutations";
import { logger } from "../utils/logger";

export async function updateInventoryItem(
  admin: any,
  inventoryItemId: string,
  input: {
    sku?: string;
    requiresShipping?: boolean;
    tracked?: boolean;
  }
) {
  try {
    const response = await admin.graphql(INVENTORY_ITEM_UPDATE_MUTATION, {
      variables: {
        id: inventoryItemId,
        input,
      },
    });

    const result = await response.json();

    const userErrors = result?.data?.inventoryItemUpdate?.userErrors;
    const updatedItem = result?.data?.inventoryItemUpdate?.inventoryItem;

    if (userErrors && userErrors.length > 0) {
      console.error("❌ Inventory Item Update: Errors occurred", userErrors);
      logger.error("Inventory Item Update failed", { errors: userErrors, id: inventoryItemId, input });
      return userErrors;
    }

    console.log("✅ Inventory Item Updated Successfully:", {
      id: updatedItem?.id,
      sku: updatedItem?.sku,
      requiresShipping: updatedItem?.requiresShipping,
      tracked: updatedItem?.tracked,
    });

    logger.info("Inventory item updated successfully", {
      inventoryItemId,
      updatedItem,
    });

    return [];
  } catch (error: any) {
    console.error("🔥 Exception during Inventory Item Update:", error);
    logger.error("Inventory Item Update Exception", { error, inventoryItemId, input });
    return [
      {
        field: null,
        message: "An unexpected error occurred while updating the inventory item.",
      },
    ];
  }
}
