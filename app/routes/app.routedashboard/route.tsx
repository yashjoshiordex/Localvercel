// import React, { useEffect, useState } from "react";
// import { Box, Button, Card, Page, Text, Layout } from "@shopify/polaris";
// import { authenticate } from "../../shopify.server";
// import type { LoaderFunctionArgs } from "@remix-run/node";
// import { isOnboardingCompleted } from "app/server/utils/checkOnboarding.server";
import "../../css/style.css";
import MainApp from "app/components/MainApp";
// import Onboarding from "../app.onboarding/route";

// export const loader = async ({ request }: LoaderFunctionArgs) => {
//   const { session } = await authenticate.admin(request);
//   const completed = await isOnboardingCompleted(session.shop);
  
//   return { isCompleted: completed };
// };
export const RouteDashboard = () => {
  
  return (
    <>
     <MainApp />

    </>
  );
};

export default RouteDashboard;
