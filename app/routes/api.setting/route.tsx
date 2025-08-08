import StoreConfiguration from 'app/server/models/storeConfiguration';
import { authenticate } from 'app/shopify.server';
import { checkPlanPermission } from "app/server/utils/permissionCheak";

export async function loader({ request }:any) {
  const { session } = await authenticate.admin(request);
  
  try {
    const settings = await StoreConfiguration.findOne({ shop: session.shop }) || {};
    return new Response(JSON.stringify(settings), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), { status: 500 });
  }
}

export async function action({ request }:any) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  
  try {
    const data = await request.json();

    if (data.tagValue && data.tagValue !== null) {
      const permissionResult = await checkPlanPermission(shop, ["Gold Plan", "Silver Plan"]);

      if (!permissionResult.hasAccess) {
        return new Response(JSON.stringify({ error: permissionResult.error }), { status: 403 });
      }
    }
    
    // If we reach here, either tagValue is not being updated or the user has the right plan
    const settings = await StoreConfiguration.findOneAndUpdate(
      { shop: session.shop },
      { ...data, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    return new Response(JSON.stringify(settings), { status: 200 });
  } catch (error) {
    console.error('Settings update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), { status: 500 });
  }
}