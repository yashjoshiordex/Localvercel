import { SessionModel } from "app/server/models/mongoose-session-model";
import { authenticate } from "../../shopify.server";
import { Types } from "mongoose";
import { getPlanById } from "app/server/services/plan.service";
import { IPlan } from "app/server/models/plan";
import { createSubscription } from "app/server/services/subscription.service";
import { ISubscription, Subscription } from "app/server/models/subscriptions";
import {logger} from "app/server/utils/logger"; // <-- Add this import

/**
 * Converts a string or ObjectId to a Mongoose ObjectId.
 */
function toObjectId(id: string | Types.ObjectId) {
  return typeof id === "string" ? new Types.ObjectId(id) : id;
}

export async function loader({ request }: { request: Request }) {
  try {
    // Step 1: Authenticate admin and extract session
    const { admin, session } = await authenticate.admin(request);
    if (!session || !session.shop) {
      logger.error("Authentication failed: No session or shop found");
      return new Response(JSON.stringify({ error: "Authentication failed" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    logger.info("Admin authenticated", { shop: session.shop });

    // Step 2: Parse query parameters
    const url = new URL(request.url);
    const chargeId = url.searchParams.get("charge_id");
    const planId = url.searchParams.get("plan");

    if (!planId) {
      logger.error("Plan ID is required but not provided");
      return new Response(JSON.stringify({ error: "Plan ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 3: Fetch plan configuration
    let planConfig: IPlan | null;
    try {
      planConfig = await getPlanById(planId as string);
      if (!planConfig) {
        logger.error("Invalid plan ID", { planId });
        return new Response(JSON.stringify({ error: "Invalid plan ID" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      logger.error("Error fetching plan", { error: err });
      return new Response(
        JSON.stringify({ error: "Failed to fetch plan details" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

    // Step 5: Fetch store from DB
    let store: any;
    try {
      store = await SessionModel.findOne({ shop: session.shop }).lean();
      if (!store || !store._id) {
        logger.error("Store not found", { shop: session.shop });
        return new Response(JSON.stringify({ error: "Store not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (err) {
      logger.error("Error fetching store", { error: err });
      return new Response(JSON.stringify({ error: "Failed to fetch store" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (planConfig.price == 0) {
      logger.info("Free plan selected", { planId: planConfig.id, shop: session.shop });
      const subscription: ISubscription = await createSubscription({
        storeId: toObjectId(store._id),
        planId: toObjectId(planConfig._id as string),
        chargeId: null,
        currentPeriodEnd: null,
      });

      logger.info("Free subscription created", { subscriptionId: subscription._id, shop: session.shop });
      return new Response(
        JSON.stringify({
          ...subscription,
          plan: {
            id: planConfig.id,
            name: planConfig.name,
            price: planConfig.price,
            interval: planConfig.interval,
            features: planConfig.features,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    if (!chargeId || !session.accessToken) {
      logger.error("Missing charge ID or session", { chargeId, accessToken: !!session.accessToken });
      return new Response(
        JSON.stringify({ error: "Missing charge ID or session" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Step 4: Query Shopify for subscription details
    const query = `
      query {
        node(id: "gid://shopify/AppSubscription/${chargeId}") {
          ... on AppSubscription {
            id
            status
            name
            test
            createdAt
            currentPeriodEnd
          }
        }
      }
    `;

    let responseData: any;
    try {
      const response = await admin.graphql(query);
      responseData = await response.json();
    } catch (err) {
      logger.error("Shopify GraphQL error", { error: err });
      return new Response(
        JSON.stringify({ error: "Failed to verify subscription with Shopify" }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    const subscriptionData = responseData?.data?.node;
    if (!subscriptionData) {
      logger.error("Subscription not found in Shopify", { chargeId });
      return new Response(JSON.stringify({ error: "Subscription not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 6: Process subscription based on status
    const subscriptionStatus = subscriptionData.status;
    if (subscriptionStatus !== "ACTIVE") {
      logger.error("Subscription is not active", { status: subscriptionStatus, chargeId });
      return new Response(
        JSON.stringify({
          error: "Subscription is not active",
          status: subscriptionStatus,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Step 7: Check if subscription already exists for this chargeId and store
    try {
      const existingSubscription = await Subscription.findOne({
        chargeId,
        storeId: toObjectId(store._id),
      }).lean();
      logger.info("Checked for existing subscription", { existingSubscription });

      if (existingSubscription) {
        logger.info("Subscription already exists", { chargeId, shop: session.shop });
        return new Response(
          JSON.stringify({ message: "Subscription is already Created" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      // If not exists, create subscription
      const subscription: ISubscription = await createSubscription({
        storeId: toObjectId(store._id),
        planId: toObjectId(planConfig._id as string),
        chargeId,
        currentPeriodEnd: subscriptionData.currentPeriodEnd
          ? new Date(subscriptionData.currentPeriodEnd)
          : null,
      });

      logger.info("Subscription created", { subscriptionId: subscription._id, shop: session.shop });

      return new Response(
        JSON.stringify({
          ...subscriptionData,
          plan: {
            id: planConfig.id,
            name: planConfig.name,
            price: planConfig.price,
            interval: planConfig.interval,
            features: planConfig.features,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (err) {
      logger.error("Error checking or creating subscription", { error: err });
      return new Response(
        JSON.stringify({ error: "Failed to check or create subscription record" }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }

  } catch (err) {
    // Catch-all for unexpected errors
    logger.error("Unexpected error", { error: err });
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
