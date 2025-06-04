import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { SessionModel } from "app/server/models/mongoose-session-model";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);
  if (session) {
    if (session) {
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
    }
  }

  return new Response();
};
