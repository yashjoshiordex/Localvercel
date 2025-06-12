import {
  Page,
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineGrid,
  Box,
} from "@shopify/polaris";
import "../css/style.css";
import { useEffect, useState } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import { useNavigate, useSearchParams } from "@remix-run/react";
import Loader from "./Loader";
import { useLocation } from "@remix-run/react";
import { fetchData } from "app/utils/helper";
type IProps = {
  nextStep?: Function;
};
interface plans {
  _id: string;
  id: string;
  name: string;
  price: number;
  trialDays: number;
  interval: string;
  features: string[];
  popular?: boolean;
}
export interface Subscription {
  _id: string;
  shop: string;
  planId: string;
  chargeId: string;
  status: "active" | "inactive" | "cancelled" | string; // Add other possible statuses as needed
  currentPeriodEnd: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  __v: number;
  id: string;
}

export default function SelectPlan({ nextStep }: IProps) {
  const location = useLocation();
  const isProductPage = location.pathname === "/app/plans";

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const app: any = useAppBridge();
  const [plans, setPlans] = useState<any>();
  const [seletedPlan, setSelectedPlan] = useState<{
    planId:string,
    planPrice:number|null
  }>({
    planId:"",
    planPrice: null
  });
  const [currentPlan, setcurrentPlan] = useState<Subscription>();
  const [loader, setLoader] = useState<boolean>(false);
  const [btnLoader, setBtnLoader] = useState({
    id: "",
    toggle: false,
  });

  const chargeId = searchParams.get("charge_id");
  const planId = searchParams.get("plan") || seletedPlan;

   const fetchPlans = async () => {
      try {
        const response = await fetch("/api/plans");
        const data = await response.json();
        if (data?.plans) {
          setPlans(data.plans);
          setcurrentPlan(data?.currentSubscription);
          setLoader(false);
        } else {
          console.log("somthing went wrong");
        }
      } catch {
        setLoader(false);
        console.error("somthing went wrong");
      }
    };


  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch(
         `/api/get-subscription?charge_id=${chargeId}&plan=${planId}`,
      );
      const data = await response.json();

      if (response.ok) {
        fetchPlans();
      } else {
        console.log("Failed to fetch subscription details.");
      }
    } catch (err) {
      console.error(`An unexpected error occurred: ${(err as Error).message}`);
    } finally {
      console.log(false);
    }
  };

  const handleSubmit = async (planId: string) => {    
    try {
      setLoader(true);
      setBtnLoader({ id: planId, toggle: true });

      const url = `/api/billing-start/?plan=${planId}&isSetting=${isProductPage ? true : false}`
      const response = await fetch(url);
      const data = await response.json();

      const confirmationUrl = data?.confirmationUrl;
      // Navigate to Thank you page if it's a free plan
      if (data?.plan?.isFree) {
        setBtnLoader({...btnLoader, toggle:false})
        if (isProductPage) {
          return navigate(`/app/planconfirmation/?plan=${planId}`);
          // fetchSubscriptionDetails(); // Call fetchData only in product page
        } else {
          return navigate(`/app/thankyou/?plan=${planId}`);
        }
      }

      // Navigate to confiramtion page if it isn't free plan
      if (confirmationUrl) {
        const redirect = Redirect.create(app);

        if (redirect && typeof redirect.dispatch === "function") {
          try {
            redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
          } catch (error) {
            console.error(
              "App Bridge redirect failed. Falling back to native redirect.",
              error,
            );
            safeRedirect(confirmationUrl);
          }
        } else {
          console.warn(
            "App Bridge Redirect unavailable. Using fallback redirect.",
          );
          safeRedirect(confirmationUrl);
        }
      } else {
        console.error("Subscription failed: Missing confirmation URL.");
        setBtnLoader({ id: planId, toggle: false });
      }
    } catch (error) {
      console.error("Failed to initiate billing:", error);
    } finally {
      setLoader(false);
    }
  };

  function safeRedirect(url: string) {
    if (typeof window !== "undefined" && window.top) {
      window.top.location.href = url;
    } else {
      window.location.href = url;
    }
    setLoader(false);
  }

  useEffect(() => {
    setLoader(true);
    fetchPlans()
    !(seletedPlan.planPrice === null) && fetchSubscriptionDetails()
  }, []);

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Box>
            <div className="d-flex mb-3 justify-content-between">
              <Text variant="headingLg" as="h2">
                Select Plan
              </Text>
              {!isProductPage && (
                <div>
                  <Button
                    variant="primary"
                    onClick={() => handleSubmit(plans[0]?._id)}
                    disabled={loader}
                  >
                    Continue Without Changes
                  </Button>
                </div>
              )}
            </div>
          </Box>

          {loader ? (
            <Loader />
          ) : (
            <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="400">
              {plans?.map((plan: any, id: any) => (
                <Card key={plan._id} roundedAbove="sm" padding="400">
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h2">
                      {plan.name}
                    </Text>

                    <Text variant="headingMd" as="h2">
                      {plan.price}
                      <Text as="span" tone="subdued" variant="bodyMd">
                        /month
                      </Text>
                    </Text>

                    <Text as="p" variant="bodyMd" fontWeight="bold">
                      {plan.note}
                    </Text>
                    <Text tone="subdued" as="p" variant="bodyMd">
                      {plan.subNote}
                    </Text>
                    <Box>
                      <ul className="mb-5">
                        {plan.features.map((feature: any, index: any) => (
                          <li key={index}>
                            <Text as="p" variant="bodyMd">
                              {feature}
                            </Text>
                          </li>
                        ))}
                      </ul>
                    </Box>
                    <div className="bottom-button ">
                      <Button
                        variant="primary"
                        fullWidth
                        onClick={() => {
                          plan.price === 0 && setSelectedPlan({ planId: plan._id, planPrice: null });
                          handleSubmit(plan._id)}}
                        // disabled={plan.price === 0 || loader}
                        disabled={plan._id === currentPlan?.planId!}
                        loading={btnLoader.id === plan._id && btnLoader.toggle}
                      >
                        Select
                      </Button>
                    </div>
                  </BlockStack>
                </Card>
              ))}
            </InlineGrid>
          )}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
