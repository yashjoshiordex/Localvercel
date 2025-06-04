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
import { useNavigate } from "@remix-run/react";
import Loader from "./Loader";

type IProps = {
  nextStep: Function;
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
export default function SelectPlan({ nextStep }: IProps) {
  const navigate = useNavigate();
  const app: any = useAppBridge();
  const [plans, setPlans] = useState<plans[]>([]);
  const [loader, setLoader] = useState<boolean>(false);
  const [btnLoader, setBtnLoader] = useState({
    id:'',
    toggle:false
  });

const handleSubmit = async (planId: string) => {
  try {
    setLoader(true);
    setBtnLoader({id:planId, toggle:true});
    const response = await fetch(`/api/billing-start/?plan=${planId}`);
    const data = await response.json();
    
    const confirmationUrl = data?.confirmationUrl;

    // Navigate to Thank you page if it's a free plan
    if (data?.plan?.isFree) {
      return navigate(`/app/thankyou/?plan=${planId}`);
    }

    // Navigate to confiramtion page if it isn't free plan
    if (confirmationUrl) {
      const redirect = Redirect.create(app);

      if (redirect && typeof redirect.dispatch === "function") {
        try {
          redirect.dispatch(Redirect.Action.REMOTE, confirmationUrl);
        } catch (error) {
          console.error("App Bridge redirect failed. Falling back to native redirect.", error);
          safeRedirect(confirmationUrl);
        }
      } else {
        console.warn("App Bridge Redirect unavailable. Using fallback redirect.");
        safeRedirect(confirmationUrl);
      }
    } else {
      console.error("Subscription failed: Missing confirmation URL.");
      setBtnLoader({id:planId, toggle:false});
    }
  } catch (error) {
    console.error("Failed to initiate billing:", error);
  }finally{
     setLoader(false);
  }
};


  function safeRedirect(url: string) {
    if (typeof window !== "undefined" && window.top) {
      window.top.location.href = url;
    } else {
      window.location.href = url;
    }
    setLoader(false)
  }

  useEffect(() => {
    setLoader(true);
    const fetchPlans = async() => {
      try{
      const response = await fetch("/api/plans");
      const data = await response.json();
      if(data?.plans) {
        setPlans(data.plans);
        setLoader(false);
      }else{
        console.log("somthing went wrong");
      }
    }catch{
        setLoader(false);
        console.log("somthing went wrong");
    }
    } 
    fetchPlans();
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
              <div>
                <Button
                  variant="primary"
                  onClick={() => handleSubmit(plans[0]?._id)}
                  disabled={loader}
                >
                  Continue Without Changes
                </Button>
              </div>
            </div>
          </Box>

         { loader ? <Loader /> : (
           <InlineGrid columns={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap="400">
            {plans.map((plan: any, id: any) => (
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
                      onClick={() => handleSubmit(plan._id)}
                      disabled={plan.price === 0 || loader}
                      loading={btnLoader.id === plan._id && btnLoader.toggle}
                    >
                      Select
                    </Button>
                  </div>
                </BlockStack>
              </Card>
            ))}
          </InlineGrid>
         ) }
        </Layout.Section>
      </Layout>
    </Page>
  );
}