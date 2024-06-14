import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import { changeOrderSummaryScheme, getCheckoutProfileId, setStyling } from "./cask/cast.server";


export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  const {admin} = await authenticate.admin(request);
  const id = await getCheckoutProfileId(admin.graphql)
  let profileId = id.data.checkoutProfiles.edges
  .map((item) => (item.node.isPublished === false ? item.node.id : null))
  .filter((id) => id !== null)
  await setStyling(admin.graphql, profileId[0])
  await changeOrderSummaryScheme(admin.graphql, profileId[0])

//  await changeOrderSummaryScheme(admin.graphql,profileId[0])

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/additional">Additional page</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
