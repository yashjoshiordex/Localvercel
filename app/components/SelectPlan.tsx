import {
  Layout,
  Card,
  Text,
  Button,
  BlockStack,
  InlineGrid,
  Box,
  Image,
  InlineStack,

} from "@shopify/polaris";
import "../css/style.css";
import { useEffect, useState } from "react";
import { Redirect } from "@shopify/app-bridge/actions";
import { useAppBridge } from "@shopify/app-bridge-react";
import {  useSearchParams } from "@remix-run/react";
import Loader from "./Loader";
import toast, { Toaster } from 'react-hot-toast';
import truesign from "../assets/images/truesignIocn.svg";
type IProps = {
  nextStep?: Function;
  onTabChange?: (tab: string) => void; // Add this
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

export default function SelectPlan({ nextStep, onTabChange }: IProps) {
  const [searchParams] = useSearchParams();

  const app: any = useAppBridge();
  const [plans, setPlans] = useState<any>();
  const [seletedPlan, setSelectedPlan] = useState<{
    planId: string,
    planPrice: number | null
  }>({
    planId: "",
    planPrice: null
  });
  const [currentPlan, setcurrentPlan] = useState<Subscription>();
  const [loader, setLoader] = useState<boolean>(false);
  const [btnLoader, setBtnLoader] = useState({
    id: "",
    toggle: false,
  });

const [hasInitialized, setHasInitialized] = useState(false);

  const chargeId = searchParams?.get("charge_id");
  const planId = searchParams?.get("plan") || seletedPlan;

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/plans");

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      if (data?.plans) {
        setPlans(
          data?.plans.sort((a: plans, b: plans) => {
            return a.price - b.price;
          }),
        );
        setcurrentPlan(data?.currentSubscription);
        setLoader(false);
      } else {
        console.warn("something went wrong");
        throw new Error('Invalid response structure');
      }
    } catch {
      setLoader(false);
      console.warn("somthing went wrong");
      toast.error('Failed to load plans. Please refresh the page.', {
        duration: 4000,
        position: 'top-right',
      });
    }
  };


  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch(
        `/api/get-subscription?charge_id=${chargeId}&plan=${planId}`,
      );
      const data = await response.json();

      if (response.ok) {
        toast.success('Subscription details updated successfully!', {
          duration: 4000,
          position: 'top-right',
        });
        fetchPlans();
      } else {
        console.warn("Failed to fetch subscription details.");
        throw new Error(data.message || 'Failed to fetch subscription details');
      }
    } catch (err) {
      console.warn(`An unexpected error occurred: ${(err as Error).message}`);
      toast.error('Failed to fetch subscription details. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
    } finally {
      console.log(false);
    }
  };

  const handleSubmit = async (planId: string) => {
    try {
      setLoader(true);
      setBtnLoader({ id: planId, toggle: true });

      const url = `/api/billing-start/?plan=${planId}&isSetting=true`
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error('Failed to start billing process');
      }

      const data = await response.json();
      const confirmationUrl = data?.confirmationUrl;

      // Navigate to Thank you page if it's a free plan
      if (data?.plan?.isFree) {
        toast.success('Plan selected successfully!', {
          duration: 4000,
          position: 'top-right',
        });

        setLoader(true);
        setBtnLoader({ ...btnLoader, toggle: false });


        // Always redirect to MainApp with planconfirmation tab
        if (onTabChange && typeof onTabChange === 'function') {

          // If we're in MainApp context, switch tabs

          const baseUrl = window.location.origin + window.location.pathname;
          const newUrl = new URL(baseUrl);

          // Copy only the necessary Shopify parameters
          const shopifyParams = ['embedded', 'hmac', 'host', 'id_token', 'locale', 'session', 'shop', 'timestamp'];
          shopifyParams.forEach(param => {
            const value = searchParams.get(param);
            if (value) {
              newUrl.searchParams.set(param, value);
            }
          });
          newUrl.searchParams.set('tab', 'planconfirmation');
          newUrl.searchParams.set('plan', planId);
          newUrl.searchParams.set('name', 'free');
          // newUrl.searchParams.delete('charge_id'); // Remove charge_id if it exists
          // console.log('Setting new URL for free plan:', newUrl.toString());
          window.history.replaceState({}, '', newUrl.toString());


          // console.log('Switching to planconfirmation tab in MainApp');
          setTimeout(() => {
            onTabChange('planconfirmation');
          }, 10);

        } else {
          // If we're in a route, redirect to MainApp with tab parameter
          window.location.href = `/app?tab=planconfirmation&plan=${planId}`;
        }

        return;
      }

      // Navigate to confiramtion page if it isn't free plan
      if (confirmationUrl) {


        const redirect = Redirect.create(app);

        if (redirect && typeof redirect.dispatch === "function") {
          try {
            redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
          } catch (error) {
            console.warn(
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
        console.warn("Subscription failed: Missing confirmation URL.");
        toast.error('Failed to process subscription. Please try again.', {
          duration: 4000,
          position: 'top-right',
        });
        setBtnLoader({ id: planId, toggle: false });
      }
    } catch (error) {
      console.warn("Failed to initiate billing:", error);
      toast.error('An error occurred while processing your request. Please try again.', {
        duration: 4000,
        position: 'top-right',
      });
      setBtnLoader({ id: planId, toggle: false });
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
    if (hasInitialized) return;

  const loadData = async () => {
    setLoader(true);
    fetchPlans();
    !(seletedPlan.planPrice === null) && fetchSubscriptionDetails();
    setHasInitialized(true);
  };
    loadData();
  }, []);

  return (
    <>
      <Toaster />
      {loader || btnLoader.toggle ? (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </div>
      ) : (
          <div className="bg-white min-vh-100">
            <div className="container py-3">
              <Layout>
                <Layout.Section>
                  <Box>
                    <div className="d-flex justify-content-between">
                      <Text as="h2" variant="headingXl">
                        Change Plan
                      </Text>

                    </div>
                    <div className="mb-4">
                      <Text as="p" variant="headingLg" fontWeight="regular">
                        You can upgrade or downgrade the plans from here
                      </Text>
                    </div>
                  </Box>

                  <InlineGrid
                    columns={{ xs: 1, sm: 2, md: 3, lg: 4 }}
                    gap="400"
                  >
                    {plans?.map((plan: any, id: any) => {
                      const isCurrentPlan = currentPlan?.planId === plan?._id;
                      return (
                        <Card key={plan?._id} padding="400" 
                        background={isCurrentPlan ? "bg-surface-secondary" : undefined}
>
                        <BlockStack gap="200">
                          <InlineStack align="space-between" blockAlign="center">
                            <Text
                              variant="headingLg"
                              as="h2"
                              alignment="center"
                            >
                              {plan?.name}
                            </Text>

                              <div>
                                {isCurrentPlan && (
                                  <span 
                                    style={{ 
                                      backgroundColor: "#28a745", 
                                      color: "white", 
                                      padding: "4px 12px", 
                                      borderRadius: "16px", 
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    Current Plan
                                  </span>
                                )}

                                {plan?.popular && !isCurrentPlan && (
                                  <span 
                                    style={{ 
                                      backgroundColor: "#007bff", 
                                      color: "white", 
                                      padding: "4px 12px", 
                                      borderRadius: "16px", 
                                      fontSize: "12px",
                                      fontWeight: "500",
                                      whiteSpace: "nowrap"
                                    }}
                                  >
                                    Popular
                                  </span>
                                )}
                              </div>
                           </InlineStack>


                          <span className="freeplan-custom-btn mt-3">
                            <Text
                              as="span"
                              variant="headingLg"
                              alignment="center"
                            >
                              ${plan?.price}
                              <span className=""> /month</span>
                            </Text>
                          </span>

                            <Text as="p" variant="bodyMd" fontWeight="bold">
                              {plan?.note}
                            </Text>
                            <Text tone="subdued" as="p" variant="bodyMd">
                              {plan?.subNote}
                            </Text>
                            <Box
                              as="ul"
                              padding="0"
                              paddingInlineStart="0"
                              paddingBlockStart="0"
                              paddingBlockEnd="800"
                              
                            >
                              {plan?.features.map(
                                (feature: any, index: number) => (
                                  <Box as="li" key={index} paddingBlock="100" paddingInlineStart="600">
                                    <div className="freeplan-feature py-1 d-flex align-items-start">
                                      <Image
                                         source={truesign}
                                         alt="point"
                                         width={20}
                                         className="me-2 pt-1"
                                      />
                                      <Text
                                        as="span"
                                        variant="headingMd"
                                        fontWeight="regular"
                                      >
                                        {feature}
                                      </Text>
                                    </div>
                                  </Box>
                                ),
                              )}
                            </Box>
                            <Box paddingBlockStart="800">

                              <div className={`bottom-button select-freeplan-btn ${isCurrentPlan ? 'gray-current-plan' : ''}`}>

                                <Button
                                  fullWidth
                                  variant={isCurrentPlan ? "secondary" : "primary"}
                                  onClick={() => {
                                    if (plan?.price === 0) {
                                      setSelectedPlan({
                                        planId: plan?._id,
                                        planPrice: null,
                                      });
                                    }
                                    handleSubmit(plan?._id);
                                  }}
                                  disabled={isCurrentPlan}
                                  loading={btnLoader.id === plan?._id && btnLoader.toggle}
                                >
                                  {isCurrentPlan ? "Current Plan" : "Select"}
                                </Button>
                              </div>
                            </Box>
                          </BlockStack>
                        </Card>
                      )
                    })}
                  </InlineGrid>

                </Layout.Section>
              </Layout>

            </div>
          </div>
      )}
    </>
  );
}