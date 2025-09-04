import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { SessionModel } from "app/server/models/mongoose-session-model";
import Donation from "app/server/models/Donation";

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
    console.log(`✅ Marked donation record for ${shop} as uninstalled`);
  } catch (err) {
    console.error(`❌ Error processing uninstall for ${shop}:`, err);
  }

  return new Response();
};

