import { SessionModel } from "../models/mongoose-session-model";
import { Subscription } from "../models/subscriptions";

export async function getAllUniqueShops(): Promise<string[]> {
const shops = await SessionModel.distinct("shop", {
shop: { $exists: true, $ne: null },
  isUninstall: false
});
return shops;
}

export async function getCurrentPeriodEndsForShops(
  shops: string[]
): Promise<
  { shop: string; currentPeriodEnd: Date | null; subscriptionId?: string; status?: string }[]
> {
  if (!shops.length) return [];

  // Fetch all relevant subs in one query for efficiency
  const subs = await Subscription.find(
    { shop: { $in: shops }, status: "active" },
    { shop: 1, currentPeriodEnd: 1, status: 1 } // projection
  )
    .sort({ updatedAt: -1, _id: -1 })
    .lean();

  // Pick latest per-shop
  const latestByShop = new Map<string, any>();
  for (const s of subs) {
    if (!latestByShop.has(s.shop)) latestByShop.set(s.shop, s);
  }

  // Build output for all shops (include null when not found)
  return shops?.map((shop) => {
    const doc = latestByShop.get(shop);
    return doc
      ? {
          shop,
          currentPeriodEnd: doc.currentPeriodEnd ? new Date(doc.currentPeriodEnd) : null,
          subscriptionId: String(doc._id),
          status: doc.status,
        }
      : { shop, currentPeriodEnd: null };
  });
}