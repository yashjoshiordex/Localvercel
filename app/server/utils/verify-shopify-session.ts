// server/verify-shopify-session.ts
import type { Session } from '@shopify/shopify-api';
import shopify  from '../../shopify.server'; // adjust the path if needed

/**
 * Load and verify a Shopify session from MongoDB using the shop domain.
 * If found, returns a valid Session object. Otherwise, returns null.
 */
export async function loadOfflineSession(shop: string): Promise<Session | null> {
  try {
    const offlineSessionId = `offline_${shop}`;
    console.log('🔍 Loading session for ID:', offlineSessionId);

    const session = await shopify.sessionStorage.loadSession(offlineSessionId);

    if (session && session.accessToken) {
      console.log('✅ Valid session loaded for shop:', session.shop);
      return session;
    }

    console.warn('⚠️ Session not found or invalid for shop:', shop);
    return null;
  } catch (error) {
    console.error('❌ Error loading session for shop:', shop, error);
    return null;
  }
}
