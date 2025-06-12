// app/server/controllers/store.controller.ts

import { SessionModel, ISession } from "../models/mongoose-session-model";
import { Subscription, ISubscription } from "../models/subscriptions";
import { Plan, IPlan } from "../models/plan";
import { CustomError } from "../utils/custom-error";

export async function getStoreWithPlan(shop: string) {
    try {
        const storeDoc = await SessionModel.findOne({ shop }).lean<ISession>();
        if (!storeDoc) {
            throw new CustomError(`Store not found for shop: ${shop}`, 404, "StoreNotFound");
        }

        const subscriptionDoc = await Subscription.findOne({
            shop: storeDoc.shop, 
            status: "active",
        }).lean<ISubscription>();
        if (!subscriptionDoc) {
            throw new CustomError(
                `Active subscription not found for shop: ${storeDoc.shop}`,
                404,
                "SubscriptionNotFound"
            );
        }

        const planDoc = await Plan.findById(subscriptionDoc.planId).lean<IPlan>();
        if (!planDoc) {
            throw new CustomError(
                `Plan not found for plan ID: ${subscriptionDoc.planId}`,
                404,
                "PlanNotFound"
            );
        }

        return { storeDoc, subscriptionDoc, planDoc };
    } catch (error: unknown) {
        if (error instanceof CustomError) {
            throw error; // Already formatted
        }
        throw new CustomError("Failed to get store with plan", 500, "UnknownError");
    }
}
export async function getStoreByDomain(shop: string) {
    try {
        const storeDoc = await SessionModel.findById({ shop: shop }).lean<ISession>();
        if (!storeDoc) {
            throw new CustomError(`Store not found for domain: ${shop}`, 404, "StoreNotFound");
        }
        return storeDoc;
    } catch (error: unknown) {
        if (error instanceof CustomError) {
            throw error; // Already formatted
        }
        throw new CustomError("Failed to get store by ID", 500, "UnknownError");
    }
}