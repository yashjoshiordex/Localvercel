import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { Frame } from "@shopify/polaris";
import { PlanProvider } from "app/context/PlanContext";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();

  
  return (
    <PlanProvider>
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <Frame>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        {/* <Link to="/app/additional">Additional page</Link> */}
        <Link to="/app/manage">Manage Product</Link>
        <Link to="/app/plans">Change Plan</Link>
        <Link to="/app/settings">Settings</Link>
        {/* <Link to="/app/onboarding">Onboarding page</Link>
        <Link to="/app/sub">Test subscription page</Link>
        <Link to="/app/subscription-plans">Test plans page</Link> */}
      </NavMenu>
      <Outlet />
        </Frame>
    </AppProvider>
    </PlanProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
