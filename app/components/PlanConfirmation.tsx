
import { Page, Layout, Text, Button, Box } from "@shopify/polaris";
import { useEffect,  useState } from "react";
// import Logo from "../../assets/images/donate-img.png"

interface PlanConfirmationProps {
  onTabChange?: (tab: string) => void;
}

export default function PlanConfirmation({ onTabChange }: PlanConfirmationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  
  //   const hasFetched = useRef(false);
const fetchSubscriptionDetails = async (planId:string, chargeId:string | null, name:string | null) => {
  try {
    // For free plans, only send plan parameter
    const queryParams = new URLSearchParams();
    
    if (planId) {
      queryParams.set('plan', planId);
    }
    // Multiple checks to ensure no charge_id for free plans
    const isFreeFromName = name === 'free';
    const isFreeFromUrl = window.location.href.includes('name=free');
    
    // Only add charge_id if it exists AND it's not a free plan
    if (chargeId && chargeId !== 'null' && !isFreeFromName && !isFreeFromUrl) {
      queryParams.set('charge_id', chargeId);
    }


    const response = await fetch(`/api/get-subscription?${queryParams.toString()}`);
    const data = await response.json();

    if (response.ok) {
      setSubscription(data);
    } else {
      setError(data.error || "Failed to fetch subscription details.");
    }
  } catch (err) {
    setError(`An unexpected error occurred: ${(err as Error).message}`);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  localStorage.clear();
  
  // Get parameters more robustly
  const currentUrl = new URL(window.location.href);
  const chargeId = currentUrl.searchParams.get("charge_id");
  const name = currentUrl.searchParams.get("name");
  const planId = currentUrl.searchParams.get("plan");
  
  if (planId) {
    fetchSubscriptionDetails(planId, chargeId, name);
  }
}, []);

  console.log('sdfdsf', subscription)

  
  const handleOnboard = async () => {
    if (onTabChange) {
      // If onTabChange is provided (when used in MainApp), use tab switching
    //   onTabChange('plans');
      onTabChange('plans');
    } else {
      // Fallback to navigation (when used standalone)
      window.location.href = '/app?tab=plans';
    }
  };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Box background="bg-surface" padding="500" borderRadius="300">

            <div className="text-center">
              <Text as="h1" variant="headingLg">
                Your plan has been updated!!!
              </Text>

              {/* <div className="my-3">
                <Text as="p" variant="bodyMd">
                  Click <strong>Finish</strong> to complete the onboarding
                  process. You can restart onboarding anytime by navigating to{" "}
                  <em>DonateMe &gt; Settings &gt; Restart Onboarding</em>.
                </Text>
              </div> */}

              <Button
                variant="primary"
                onClick={handleOnboard}
                loading={loading}
              >
                Go to Plans
              </Button>

              {error && (
                <div className="mt-3">
                  <Text as="p" variant="bodySm" tone="critical">
                    {error}
                  </Text>
                </div>
              )}
            </div>
          </Box>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
