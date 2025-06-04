import { connectToDatabase } from 'app/server/libs/db.server';
import { IPlan, Plan } from '../models/plan';

/**
 * Get all available plans
 */
export async function getAllPlans(): Promise<IPlan[]> {
  try {
    await connectToDatabase();
    const plans = await Plan.find({}).lean();

    return plans.map((plan: any) => ({
      ...plan,
      id: plan.id || plan._id.toString(),
      _id: plan._id.toString(),
    }));
  } catch (error) {
    console.error('Error fetching plans:', error);
    throw error;
  }
}

/**
 * Get a single plan by its ID or _id
 */
export async function getPlanById(planId: string): Promise<IPlan | null> {
  try {
    await connectToDatabase();

    // Try to find by custom plan ID first
    let plan: any = await Plan.findOne({ _id: planId }).lean();

    // If not found, try by MongoDB _id
    if (!plan) {
      try {
        plan = await Plan.findById(planId).lean();
      } catch {
        return null; // Invalid ObjectId format
      }
    }

    if (!plan) return null;

    return {
      ...plan,
      id: plan.id || plan._id.toString(),
      _id: plan._id.toString(),
    };
  } catch (error) {
    console.error(`Error fetching plan ${planId}:`, error);
    throw error;
  }
}
