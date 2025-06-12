import { json } from '@remix-run/node';
import StoreConfiguration from 'app/server/models/storeConfiguration';
import { authenticate } from 'app/shopify.server';

export async function loader({ request }:any) {
  const { session } = await authenticate.admin(request);
  
  try {
    const settings = await StoreConfiguration.findOne({ shop: session.shop }) || {};
    return json(settings);
  } catch (error) {
    return json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function action({ request }:any) {
  const { session } = await authenticate.admin(request);
  
  try {
    const data = await request.json();
    
    const settings = await StoreConfiguration.findOneAndUpdate(
      { shop: session.shop },
      { ...data, updatedAt: new Date() },
      { new: true, upsert: true }
    );
    
    return json(settings);
  } catch (error) {
    return json({ error: 'Failed to save settings' }, { status: 500 });
  }
}