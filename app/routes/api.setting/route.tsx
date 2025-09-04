import StoreConfiguration from 'app/server/models/storeConfiguration';
import { authenticate } from 'app/shopify.server';
import { checkPlanPermission } from "app/server/utils/permissionCheak";
import { EmailConfig } from 'app/server/models/EmailConfig';

export async function loader({ request }:any) {
  const { session } = await authenticate.admin(request);
  
  try {
    const settings = await StoreConfiguration.findOne({ shop: session.shop }) || {};
    const emailConfig = await EmailConfig.findOne({ shop: session.shop });
    const settingData = JSON.parse(JSON.stringify(settings));
    
    const response =  {
      ...settingData,
      isEmailActive:emailConfig?.isActive
    }

    return new Response(JSON.stringify(response), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch settings' }), { status: 500 });
  }
}

export async function action({ request }:any) {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;
  
  try {
    const data = await request.json();
    const {autoFulfillOrders,applySalesTax,requireShipping,tagValue,isEmailActive} = data;

    if (data.tagValue && data.tagValue !== null) {
      const permissionResult = await checkPlanPermission(shop, ["Gold Plan", "Silver Plan"]);

      if (!permissionResult.hasAccess) {
        return new Response(JSON.stringify({ error: permissionResult.error }), { status: 403 });
      }
    }

    if(isEmailActive !== undefined || isEmailActive !== null){
      try {
       await EmailConfig.findOneAndUpdate(
          { shop },
          { isActive: isEmailActive }
        )
      } catch (error) {
        return new Response(JSON.stringify({ error: 'Failed to update email configuration' }), { status: 500 });
      }
    }
    
    // If we reach here, either tagValue is not being updated or the user has the right plan
    const settings = await StoreConfiguration.findOneAndUpdate(
      { shop: session.shop },
      { autoFulfillOrders,applySalesTax,requireShipping,tagValue},
      { new: true, upsert: true }
    );

    return new Response(JSON.stringify(settings), { status: 200 });
  } catch (error) {
    console.error('Settings update error:', error);
    return new Response(JSON.stringify({ error: 'Failed to save settings' }), { status: 500 });
  }
}