import { ISubscription, Subscription } from "../models/subscriptions";

/**
 * Get the active subscription for a given shop domain
 */
export async function getShopSubscription(shop: string): Promise<ISubscription | null> {
    try {
        const subscription: any = await Subscription.findOne({
            shop,
            status: 'active',
        })
            .sort({ createdAt: -1 })
            .lean();

        if (!subscription) return null;

        return {
            ...subscription,
            id: subscription._id.toString(),
            _id: subscription._id.toString(),
        };
    } catch (error) {
        console.error(`Error fetching subscription for shop ${shop}:`, error);
        throw error;
    }
}

/**
 * Create a new subscription and cancel existing active ones
 */
export async function createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
    try {
        // Cancel all existing active subscriptions for the same shop
        await Subscription.updateMany(
            {
                shop: subscriptionData.shop,
                status: 'active',
            },
            {
                $set: { status: 'cancelled' },
            }
        );

        // Create the new subscription
        const newSubscription = new Subscription({
            ...subscriptionData,
            createdAt: new Date(),
        });

        const saved = await newSubscription.save();
        const plain: any = saved.toObject();

        return {
            ...plain,
            id: plain._id.toString(),
            _id: plain._id.toString(),
        };
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw error;
    }
}
