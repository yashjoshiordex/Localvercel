// cron/donationResetCron.ts
import cron from "node-cron";
import { getAllUniqueShops, getCurrentPeriodEndsForShops } from "../utils/subscriptionPeriod";
import Donation from "../models/Donation";

// Cron: runs every day at midnight UTC
export function startDonationResetCron() {
  cron.schedule("0 0 * * *", async () => {
    console.log("[Cron] Running donation reset...");

    try {
      const shops = await getAllUniqueShops();
      console.log("shops",shops);
      
      const shopPeriods = await getCurrentPeriodEndsForShops(shops);
      console.log("shopPeriods",shopPeriods);

      const today = new Date();

      const expiredShops = shopPeriods.filter(
        (s) => s.currentPeriodEnd && s.currentPeriodEnd <= today
      );
      
      if (expiredShops?.length === 0) {
        console.log("[Cron] No expired shops today.");
        return;
      }

      for (const shopInfo of expiredShops) {
        await Donation.updateOne(
          { shopDomain: shopInfo.shop },
          {
            $set: {
              totalDonation: 0,
              donations: [],
              lastChargedDonationAmount: 0,
            },
          }
        );
        console.log(`[Cron] Donations reset for shop: ${shopInfo.shop}`);
      }

      console.log(`[Cron] Completed. Shops updated: ${expiredShops.length}`);
    } catch (err) {
      console.error("[Cron] Error:", err);
    }
  });
}
