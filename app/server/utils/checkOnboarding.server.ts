import { SessionModel } from "../models/mongoose-session-model";

export async function isOnboardingCompleted(shop: string): Promise<boolean> {
  const session:any = await SessionModel.findOne({ shop }).lean();
  return session?.onboardingCompleted === true;
}