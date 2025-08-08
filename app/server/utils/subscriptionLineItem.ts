import { gql } from "graphql-request";
import { logger } from "../utils/logger";

const FETCH_LINE_ITEM_ID_QUERY = gql`
  query {
    currentAppInstallation {
      activeSubscriptions {
        id
        name
        status
        lineItems {
          id
          plan {
            pricingDetails {
              __typename
              ... on AppRecurringPricing {
                price {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  }
`;

export const getSubscriptionLineItemId = async (admin: any): Promise<string | null> => {
  try {
    const result = await admin.graphql(FETCH_LINE_ITEM_ID_QUERY);
    const data = await result.json();

    const lineItems =
      data?.data?.currentAppInstallation?.activeSubscriptions?.[0]?.lineItems ?? [];

    const usageLineItem = lineItems.find(
      (item: any) => item.plan.pricingDetails.__typename === "AppUsagePricing"
    );

    if (!usageLineItem?.id) {
      logger.warn("⚠️ No usage-based line item ID found");
      return null;
    }

    return usageLineItem?.id;
  } catch (error: any) {
    logger.error("❌ Failed to fetch usage-based line item ID", { error: error.message });
    return null;
  }
};