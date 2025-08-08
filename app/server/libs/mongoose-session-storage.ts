/**********************************************************************
 *  mongoose.session-model.ts
 *  -------------------------------------------------------------------
 *  Custom Shopify session storage backed by Mongoose.
 *  Tracks:
 *   • onboardingCompleted       → wizard finished?
 *   • isUninstall               → shop has uninstalled the app?
 *   • uninstallTime             → when the uninstall happened
 *********************************************************************/

import {
  Session,
  SessionParams,
  OnlineAccessInfo,
} from '@shopify/shopify-api';
import { SessionModel } from '../models/mongoose-session-model';
import Donation from '../models/Donation';

/** ───────────────────────────────────────────────────────────────
 * 1️⃣  Extend the Shopify Session type at runtime
 * ───────────────────────────────────────────────────────────────*/
export interface SessionWithFlags extends Session {
  onboardingCompleted: boolean;
  isUninstall: boolean;
  uninstallTime?: Date | null;
}

export class MongooseSessionStorage {
  /** ────────────────────────────────────────────────────────────
   * STORE
   * ─────────────────────────────────────────────────────────── */
  async storeSession(session: SessionWithFlags): Promise<boolean> {
    console.log("Storing session in DB:", session);

    try {
      await SessionModel.findOneAndUpdate(
        { id: session.id },
        {
          /* ---------- core Shopify session fields ---------- */
          id: session.id,
          shop: session.shop,
          state: session.state,
          isOnline: session.isOnline,
          scope: session.scope,
          accessToken: session.accessToken,
          onlineAccessInfo: session.onlineAccessInfo,
          expires: session.expires ?? null,

          /* ---------- custom flags ---------- */
          onboardingCompleted: session.onboardingCompleted ?? false,
          isUninstall: session.isUninstall ?? false,
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        },
      );
      const existingDonation = await Donation.findOne({ shopDomain: session.shop });

      if (!existingDonation) {
        await Donation.create({
          shopDomain: session.shop,
          totalDonation: 0,
          donations: [],
          isAppUninstalled: false,
        });
        console.log(`✅ Created new Donation doc for ${session.shop}`);
      } else if (existingDonation.isAppUninstalled) {
        // ♻️ Reinstall scenario: reset uninstall flag
        existingDonation.isAppUninstalled = false;
        await existingDonation.save();
        console.log(`♻️ Reset uninstall flag for ${session.shop}`);
      }

      return true;
    } catch (err) {
      console.error('Error storing session:', err);
      return false;
    }
  }

  /** ────────────────────────────────────────────────────────────
   * LOAD
   * ─────────────────────────────────────────────────────────── */
  async loadSession(id: string): Promise<SessionWithFlags | undefined> {
    const doc: any = await SessionModel.findOne({ id }).lean();
    if (!doc) return undefined;
    console.log("Loaded session from DB:", doc, id);

    const params: SessionParams = {
      id: doc.id,
      shop: doc.shop,
      state: doc.state,
      isOnline: doc.isOnline,
      scope: doc.scope,
      accessToken: doc.accessToken,
      onlineAccessInfo: doc.onlineAccessInfo as OnlineAccessInfo,
      expires: doc.expires ? new Date(doc.expires) : undefined,
    };

    const shopifySession = new Session(params) as SessionWithFlags;

    /* ---------- hydrate custom flags ---------- */
    shopifySession.onboardingCompleted = doc.onboardingCompleted ?? false;
    shopifySession.isUninstall = doc.isUninstall ?? false;
    shopifySession.uninstallTime = doc.uninstallTime ?? null;

    return shopifySession;
  }

  /** ────────────────────────────────────────────────────────────
   * DELETE ONE
   * ─────────────────────────────────────────────────────────── */
  async deleteSession(id: string): Promise<boolean> {
    try {
      await SessionModel.deleteOne({ id });
      return true;
    } catch (err) {
      console.error('Error deleting session:', err);
      return false;
    }
  }

  /** ────────────────────────────────────────────────────────────
   * DELETE MANY
   * ─────────────────────────────────────────────────────────── */
  async deleteSessions(ids: string[]): Promise<boolean> {
    try {
      await SessionModel.deleteMany({ id: { $in: ids } });
      return true;
    } catch (err) {
      console.error('Error deleting multiple sessions:', err);
      return false;
    }
  }

  /** ────────────────────────────────────────────────────────────
   * FIND-BY-SHOP
   * ─────────────────────────────────────────────────────────── */
  async findSessionsByShop(shop: string): Promise<SessionWithFlags[]> {
    const docs = await SessionModel.find({ shop }).lean();

    return docs.map((doc: any) => {
      const params: SessionParams = {
        id: doc.id,
        shop: doc.shop,
        state: doc.state,
        isOnline: doc.isOnline,
        scope: doc.scope,
        accessToken: doc.accessToken,
        onlineAccessInfo: doc.onlineAccessInfo as OnlineAccessInfo,
        expires: doc.expires ? new Date(doc.expires) : undefined,
      };

      const s = new Session(params) as SessionWithFlags;
      s.onboardingCompleted = doc.onboardingCompleted ?? false;
      s.isUninstall = doc.isUninstall ?? false;
      s.uninstallTime = doc.uninstallTime ?? null;

      return s;
    });
  }
}
