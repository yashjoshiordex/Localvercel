import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { SessionModel } from "app/server/models/mongoose-session-model";
import Donation from "app/server/models/Donation";
import { Order } from "app/server/models/Order";
import { Product } from "app/server/models/Product";
import { Subscription } from "app/server/models/subscriptions";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`📩 Received ${topic} webhook for ${shop}`);

  try {
    // ✅ 1. Mark session as uninstalled
    await SessionModel.findOneAndUpdate(
      { shop: shop },
      {
        isUninstall: true,
        onboardingCompleted: false,
        accessToken: null,
        uninstallTime: new Date(),
      },
      { new: true },
    );
    console.log(`✅ Updated session for ${shop}`);

    // ✅ 2. Mark donation record as uninstalled
    await Donation.findOneAndUpdate(
      { shopDomain: shop },
      { isAppUninstalled: true },
      { new: true }
    );

    // delete order data 
    await Order.deleteMany({ shop: shop });
    console.log(`✅ Deleted order records for ${shop}`);

    // product delete
    await Product.updateMany(
      { shop: shop },
      { isDeleted: true }
    );
    console.log(`✅ Marked product records for ${shop} as deleted`);

    await Subscription.findOneAndUpdate({shop:shop,status:"active"},{status:"cancelled"});
    
    console.log(`✅ Marked donation record for ${shop} as uninstalled`);
  } catch (err) {
    console.warn(`❌ Error processing uninstall for ${shop}:`, err);
  }

  return new Response();
};

