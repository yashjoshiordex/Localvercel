import { APP_USAGE_CHARGE_MUTATION } from "../mutations";
import { logger } from "./logger";

interface CreateAppUsageChargeParams {
  admin: any; // Shopify admin client
  amount: number;
  description: string;
  subscriptionLineItemId: string;
}

export async function createAppUsageCharge({
  admin,
  amount,
  description,
  subscriptionLineItemId,
}: CreateAppUsageChargeParams) {
  try {
    console.log("🟡 Creating app usage charge...");
    console.log("➡️ Input Params:", {
      amount,
      description,
      subscriptionLineItemId,
    });

    const response = await admin.graphql(APP_USAGE_CHARGE_MUTATION, {
      variables: {
        subscriptionLineItemId,
        price: {
          amount: amount.toFixed(2),
          currencyCode: "USD",
        },
        description,
      },
    });

    const result = await response.json();
    const { appUsageRecord, userErrors } = result?.data?.appUsageRecordCreate ?? {};

    if (userErrors?.length > 0) {
      console.error("❌ User error creating usage charge:", userErrors[0]);
      logger.error("❌ Shopify user error on usage charge", {
        userErrors,
      });
      throw new Error(userErrors[0].message);
    }

    console.log("✅ App usage charge created:", appUsageRecord);
    logger.info("✅ App usage charge created successfully", {
      amount,
      description,
      appUsageRecord,
    });

    return appUsageRecord;
  } catch (error: any) {
    console.error("❌ Error creating app usage charge:", error.message);
    logger.error("❌ Failed to create app usage charge", {
      error: error.message,
      amount,
      description,
      subscriptionLineItemId,
    });
    throw error;
  }
}