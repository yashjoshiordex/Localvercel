
import { redirect } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const planId = url.searchParams.get("plan");
  const chargeId = url.searchParams.get("charge_id");
  console.log('PlanConfirmation - chargeId:', chargeId);
  
  
  // // Redirect to MainApp with planconfirmation tab
  // let redirectUrl = "/app?tab=planconfirmation";
  
  // if (planId) {
  //   redirectUrl += `&plan=${planId}`;
  // }
  
  // if (chargeId) {
  //   redirectUrl += `&charge_id=${chargeId}`;
  // }
  
  // return redirect(redirectUrl);

  const redirectUrl = new URL("/app", url.origin);
  redirectUrl.searchParams.set("tab", "planconfirmation");
  
  if (planId) {
    redirectUrl.searchParams.set("plan", planId);
  }
  
  if (chargeId) {
    redirectUrl.searchParams.set("charge_id", chargeId);
  }
  
  // Return just the pathname and search params
  return redirect(redirectUrl.pathname + redirectUrl.search);
};

export default function PlanConfirmationRoute() {
  // This component should never render because of the redirect
  return null;
}