// app/routes/api.onboarding.ts
import type { ActionFunctionArgs } from "@remix-run/node";
import { SessionModel } from "app/server/models/mongoose-session-model";
import { authenticate } from "app/shopify.server";
import {logger} from "app/server/utils/logger";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { session } = await authenticate.admin(request);
    const shop:string = session?.shop;
    if (!shop) {
      logger.error("Shop domain is required");
      return new Response("Shop domain is required", { status: 400 });
    }

    const result = await SessionModel.updateMany(
      { shop },
      { $set: { onboardingCompleted: true } }
    );

    if (result.matchedCount === 0) {
      logger.error("Shop not found", { shop });
      return new Response("Shop not found", { status: 404 });
    }

    logger.info("Onboarding steps completed", { shop });

    return new Response(
      JSON.stringify({ message: "Onboarding Steps are completed" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    logger.error("Error updating onboarding status", { error: err });
    return new Response("Internal server error", { status: 500 });
  }
};
