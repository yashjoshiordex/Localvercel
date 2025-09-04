import { getPlanById } from "app/server/services/plan.service";
import { authenticate } from "app/shopify.server";
import { logger } from "app/server/utils/logger";
import { CANCEL_SUBSCRIPTION_MUTATION } from "app/server/mutations";
import { Subscription } from "app/server/models/subscriptions";

export const loader = async ({ request }: any) => {
  try {
    const { admin, session } = await authenticate.admin(request);
    const storeName = session.shop?.split(".")[0];

    if (!session || !session.shop) {
      logger.error("Authentication failed: No session or shop found");
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const url = new URL(request.url);
    const selectedPlanId = url.searchParams.get("plan");
    const isSetting = url.searchParams.get("isSetting") === "true";
    if (!selectedPlanId) {
      logger.error("Plan ID is required but not provided");
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const planConfig = await getPlanById(selectedPlanId);
    if (!planConfig) {
      logger.error("Invalid plan ID", { selectedPlanId });
      return new Response(JSON.stringify({ error: "Invalid plan ID" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // ✅ Return early if plan is free
    if (planConfig.price === 0) {


      // ✅ Cancel existing subscription if any
      const existingSubscription = await Subscription.findOne({
        shop: session.shop,
        status: "active",
      });
      console.log("existingSubscription", existingSubscription);

      if (existingSubscription && existingSubscription.chargeId) {
        try {
          logger.info("Cancelling existing Shopify subscription", {
            chargeId: existingSubscription.chargeId,
          });
          const globalId = `gid://shopify/AppSubscription/${existingSubscription.chargeId}`;
          const cancelResponse = await admin.graphql(CANCEL_SUBSCRIPTION_MUTATION, {
            variables: { id: globalId },
          });

          const cancelJson = await cancelResponse.json();
          const cancelErrors = cancelJson?.data?.appSubscriptionCancel?.userErrors;
          console.log("Cancel Mutation Response JSON:", JSON.stringify(cancelJson, null, 2));

          if (cancelErrors && cancelErrors.length > 0) {
            console.log("cancelErrors", cancelErrors);

            logger.warn("Cancellation user errors", cancelErrors);
          } else {
            console.log("cancelErrors else", cancelErrors);

            logger.info("Previous subscription cancelled successfully");
          }
        } catch (cancelErr) {
          console.log("cancelErrors catch", cancelErr);

          logger.error("Failed to cancel previous subscription", { cancelErr });
        }
      }
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

    // ✅ Proceed with paid plan creation
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

    // const returnUrl = `https://admin.shopify.com/store/${storeName}/apps/${process.env.SHOPIFY_APP_NAME}/app/thankyou?plan=${selectedPlanId}`;
//     const returnPath = isSetting ? "app?tab=planconfirmation" : "app";
// const returnUrl = `https://admin.shopify.com/store/${storeName}/apps/${process.env.SHOPIFY_APP_NAME}/${returnPath}?plan=${selectedPlanId}`;

const returnUrl = new URL(`https://admin.shopify.com/store/${storeName}/apps/${process.env.SHOPIFY_APP_NAME}/app`);

if (isSetting) {
  returnUrl.searchParams.set("tab", "planconfirmation");
} 
returnUrl.searchParams.set("plan", selectedPlanId);
    // const variables = {
    //   name: planConfig.name,
    //   returnUrl: returnUrl.toString(),
    //   trialDays: planConfig.trialDays,
    //   lineItems: [
    //     {
    //       plan: {
    //         appRecurringPricingDetails: {
    //           price: {
    //             amount: planConfig.price,
    //             currencyCode: "USD",
    //           },
    //           interval: "EVERY_30_DAYS",
    //         },
    //       },
    //     },
    //   ],
    // };
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
          {
            plan: {
              appUsagePricingDetails: {
                terms: `${planConfig?.transactionFee} fee per ${planConfig?.threshold} in donations`,
                cappedAmount: {
                  amount: planConfig?.threshold,
                  currencyCode: "USD",
                },
              },
            },
          },
        ],
};


    const result = await admin.graphql(mutation, { variables });
    const jsonData = await result.json();

    const userErrors = jsonData?.data?.appSubscriptionCreate?.userErrors;
    if (userErrors && userErrors.length > 0) {
      logger.warn("User errors in subscription creation", userErrors);
      return new Response(
        JSON.stringify({ error: "Billing creation failed due to user errors" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const confirmationUrl = jsonData?.data?.appSubscriptionCreate?.confirmationUrl;
    if (!confirmationUrl) {
      logger.error("Missing confirmation URL", { jsonData });
      return new Response(JSON.stringify({ error: "Billing creation failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    logger.info("Subscription created successfully", { confirmationUrl });
    return new Response(JSON.stringify({ confirmationUrl }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

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
