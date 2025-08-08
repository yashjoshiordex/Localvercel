
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
import {  useSearchParams, useLocation } from "@remix-run/react";
import Loader from "./Loader";
import toast, { Toaster } from 'react-hot-toast';
// import { fetchData } from "app/utils/helper";
// import "../css/changeplan.css";
import truesign from "../assets/images/truesignIocn.svg";
// import Header from "./Header";
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

  // const navigate = useNavigate();
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
  // const [currentPlan, setcurrentPlan] = useState<Subscription>();
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

      if (!response.ok) {
        throw new Error('Failed to fetch plans');
      }

      const data = await response.json();
      if (data?.plans) {
        setPlans(
          data.plans.sort((a: plans, b: plans) => {
            return a.price - b.price;
          }),
        );
        // setcurrentPlan(data?.currentSubscription);
        setLoader(false);
      } else {
        console.log("somthing went wrong");
        throw new Error('Invalid response structure');
      }
    } catch {
      setLoader(false);
      console.error("somthing went wrong");
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
        console.log("Failed to fetch subscription details.");
        throw new Error(data.message || 'Failed to fetch subscription details');
      }
    } catch (err) {
      console.error(`An unexpected error occurred: ${(err as Error).message}`);
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
      // if (nextStep && typeof nextStep === 'function') {
      //     nextStep();
      // }
      console.log("planId", planId);
      const url = `/api/billing-start/?plan=${planId}&isSetting=${isProductPage ? true : false}`
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

          if (nextStep && typeof nextStep === 'function') {
            nextStep(planId); // Go to step 5 directly
          }

        setLoader(true);
        setBtnLoader({ ...btnLoader, toggle: false });
        
      return;

        // if (isProductPage) {
        //   return navigate(`/app/planconfirmation/?plan=${planId}`);
        //   // fetchSubscriptionDetails(); // Call fetchData only in product page
        // } else {
        //   return navigate(`/app/thankyou/?plan=${planId}`);
        // }
      }

      // Navigate to confiramtion page if it isn't free plan
      if (confirmationUrl) {

        toast.success('Redirecting to payment...', {
          duration: 3000,
          position: 'top-right',
        });

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
        toast.error('Failed to process subscription. Please try again.', {
          duration: 4000,
          position: 'top-right',
        });
        setBtnLoader({ id: planId, toggle: false });
      }
    } catch (error) {
      console.error("Failed to initiate billing:", error);
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
    setLoader(true);
    fetchPlans();
    !(seletedPlan.planPrice === null) && fetchSubscriptionDetails();
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
                      // const isCurrentPlan = currentPlan?.planId === plan._id;
                      return (
                        <Card key={plan._id} padding="400" 
                        // background={isCurrentPlan ? "bg-surface-secondary" : undefined}
>
                        <BlockStack gap="200">
                          <InlineStack align="space-between" blockAlign="center">
                            <Text
                              variant="headingLg"
                              as="h2"
                              alignment="center"
                            >
                              {plan.name}
                            </Text>

                              <div>
                                {/* {isCurrentPlan && (
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
                                )} */}

                                {plan.popular  && (
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


                          <span className="freeplan-custom-btn">
                            <Text
                              as="span"
                              variant="headingLg"
                              alignment="center"
                            >
                              ${plan.price}
                              <span className=""> /month</span>
                            </Text>
                          </span>

                            <Text as="p" variant="bodyMd" fontWeight="bold">
                              {plan.note}
                            </Text>
                            <Text tone="subdued" as="p" variant="bodyMd">
                              {plan.subNote}
                            </Text>
                            <Box
                              as="ul"
                              padding="0"
                              paddingInlineStart="0"
                              paddingBlockStart="0"
                              paddingBlockEnd="800"
                              
                            >
                              {plan.features.map(
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

                            {/* Select Button at Bottom */}
                            <Box paddingBlockStart="800">
                              <div className="bottom-button select-freeplan-btn">
                                <Button
                                  fullWidth
                                  variant={ "primary"}
                                  onClick={() => {
                                    if (plan.price === 0) {
                                      setSelectedPlan({
                                        planId: plan._id,
                                        planPrice: null,
                                      });
                                    }
                                    handleSubmit(plan._id);
                                  }}
                                  // disabled={
                                  //   isCurrentPlan
                                  // }
                                  loading={
                                    btnLoader.id === plan._id &&
                                    btnLoader.toggle
                                  }
                                >
                                 { "Select"}
                                </Button>
                              </div>
                            </Box>
                          </BlockStack>
                        </Card>
                      )
                    })}
                  </InlineGrid>

                <Box>
                {!isProductPage && (
                        <div className="text-center theme-btn mt-4">
                          <Button
                            variant="primary"
                            // onClick={() => handleSubmit(plans[0]?._id)}
                            
        onClick={() => {
          if (nextStep && typeof nextStep === 'function') {
            nextStep(); // Go to step 5 directly
          }
        }}
                            disabled={loader}
                          >
                            Continue Without Changes
                          </Button>
                        </div>
                      )}
                      </Box>
                </Layout.Section>
              </Layout>

            </div>
          </div>
      )}
    </>
  );
}