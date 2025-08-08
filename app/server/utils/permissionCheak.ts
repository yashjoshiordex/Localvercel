import { getPlanById } from "../services/plan.service";
import { getShopSubscription } from "../services/subscription.service";


export const checkPlanPermission = async (shop: string, requiredPlans: string[]) => {
  try {
    // Get the shop's subscription
    const subscription = await getShopSubscription(shop);
    if (!subscription?.planId) {
      return {
        hasAccess: false,
        error: "You need an active subscription to use this feature."
      };
    }
    
    // Get the plan details
    const plan = await getPlanById(subscription.planId.toString());
    if (!plan) {
      return {
        hasAccess: false,
        error: "Your subscription plan could not be found."
      };
    }
    
    // Check if the plan is in the list of required plans
    if (!requiredPlans.includes(plan.name)) {
      return {
        hasAccess: false,
        error: `This feature is only available on the following plans: ${requiredPlans.join(", ")}.`
      };
    }
    
    return {
      hasAccess: true,
      plan: plan // Return the plan for additional use if needed
    };
  } catch (error) {
    console.error("Error checking plan permission:", error);
    return {
      hasAccess: false,
      error: "An error occurred while checking permissions."
    };
  }
};