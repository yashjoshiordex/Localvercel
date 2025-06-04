import { json } from "@remix-run/node";
import { SessionModel } from "app/server/models/mongoose-session-model";
import { ISubscription } from "app/server/models/subscriptions";
import { getPlanById } from "app/server/services/plan.service";
import { createSubscription } from "app/server/services/subscription.service";
import { authenticate } from "app/shopify.server";
import { Types } from "mongoose";
import {logger} from "app/server/utils/logger";

function toObjectId(id: string | Types.ObjectId) {
  return typeof id === "string" ? new Types.ObjectId(id) : id;
}
export const loader = async ({ request }: any) => {
  try {
    // Authenticate the admin user
    const { admin, session } = await authenticate.admin(request);
    const storeName = session.shop?.split(".")[0];

    logger.info("Authenticating admin user", { shop: session.shop });

    if (!session || !session.shop) {
      logger.error("Authentication failed: No session or shop found");
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the plan from URL query parameters
    const url = new URL(request.url);

    const selectedPlanId = url.searchParams.get("plan");

    if (!selectedPlanId) {
      logger.error("Plan ID is required but not provided");
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get plan details from MongoDB
    const planConfig = await getPlanById(selectedPlanId);
    if (!planConfig) {
      logger.error("Invalid plan ID", { selectedPlanId });
      return new Response(JSON.stringify({ error: "Invalid plan ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (planConfig.price == 0) {
      logger.info("Free plan selected", { planId: planConfig.id });
      return new Response(
        JSON.stringify({
          plan: {
            id: planConfig.id,
            name: planConfig.name,
            price: planConfig.price,
            interval: planConfig.interval,
            features: planConfig.features,
            isFree: true,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    const mutation = `
    mutation AppSubscriptionCreate($name: String!, $returnUrl: URL!, $trialDays: Int, $lineItems: [AppSubscriptionLineItemInput!]!) {
      appSubscriptionCreate(
        name: $name
        returnUrl: $returnUrl
        trialDays: $trialDays
        test: true
        lineItems: $lineItems
      ) {
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `;
    const returnUrl = `https://admin.shopify.com/store/${storeName}/apps/${process.env.SHOPIFY_APP_NAME}/app/thankyou?plan=${selectedPlanId}`;

    const variables = {
      name: planConfig.name,
      returnUrl,
      trialDays: planConfig.trialDays,
      lineItems: [
        {
          plan: {
            appRecurringPricingDetails: {
              price: {
                amount: planConfig.price,
                currencyCode: "USD",
              },
              interval: "EVERY_30_DAYS",
            },
          },
        },
      ],
    };

    console.log("Creating subscription with details:", {
      shop: session.shop,
      planName: planConfig.name,
      returnUrl,
    });

    try {
      const result = await admin.graphql(mutation, { variables });
      const jsonData = await result.json();

      const userErrors = jsonData?.data?.appSubscriptionCreate?.userErrors;
      if (userErrors && userErrors.length > 0) {
        console.error("User Errors:", userErrors);
        return new Response(
          JSON.stringify({
            error: "Billing creation failed due to user errors",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      const confirmationUrl =
        jsonData?.data?.appSubscriptionCreate?.confirmationUrl;

      if (!confirmationUrl) {
        logger.error("Missing confirmation URL", { jsonData });
        return new Response(
          JSON.stringify({ error: "Billing creation failed" }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      logger.info("Subscription created successfully", { confirmationUrl });

      return new Response(JSON.stringify({ confirmationUrl }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      logger.error("Unexpected error during billing creation", { error });
      return new Response(JSON.stringify({ error: "Internal Server Error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  } catch (error) {
    logger.error("Error creating subscription", { error });
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        details: (error as Error).message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
};
