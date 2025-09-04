import { SessionModel } from "app/server/models/mongoose-session-model";
import { getAllPlans } from "app/server/services/plan.service";
import { getShopSubscription } from "app/server/services/subscription.service";
import { authenticate } from "app/shopify.server";
import {logger} from "app/server/utils/logger"; // <-- Add this import

export async function loader({ request }: any) {
    try {
        const { session } = await authenticate.admin(request);
        const { shop } = session;
        logger.info("Fetching plans for shop", { shop });

        const shopData = await SessionModel.findOne({ shop });

        if (!shopData) {
            logger.error("No session found for shop", { shop });
            throw new Error(`No session found for shop: ${shop}`);
        }

        const plans = await getAllPlans();
        const currentSubscription = await getShopSubscription(shopData.shop);

        logger.info("Plans and subscription loaded", { shop });

        return new Response(
            JSON.stringify({ plans, currentSubscription }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        logger.error("Failed to load plans", { error });
        return new Response(
            JSON.stringify({
                plans: [],
                currentSubscription: null,
                error: "Failed to load subscription data",
            }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
}
