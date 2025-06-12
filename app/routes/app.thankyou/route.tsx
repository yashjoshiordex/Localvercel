import { useNavigate, useSearchParams } from "@remix-run/react";
import { Page, Layout, Text, Button, Box } from "@shopify/polaris";
import { useEffect, useRef, useState } from "react";
// import Logo from "../../assets/images/donate-img.png"

export default function ThankYou() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  const chargeId = searchParams.get("charge_id");
  const planId = searchParams.get("plan");

  const hasFetched = useRef(false);

    const [submitting, setSubmitting] = useState(false);

const handleOnboard = async () => {
  setSubmitting(true);
  try {
    // await fetch(`/api/onboarding`, { method: "POST", credentials: "include" });
    navigate("/app/routedashboard");
  } catch (error) {
    console.log("Error: ", error);
  } finally {
    setSubmitting(false);
  }
};
  const fetchSubscriptionDetails = async () => {
  
    try {
      const response = await fetch(
        `/api/get-subscription?charge_id=${chargeId}&plan=${planId}`,
      );
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
    if (!hasFetched.current) {
      fetchSubscriptionDetails();
      hasFetched.current = true;
    }
  }, []);
  
  // const handleOnboard = async () => {
  //   console.log("sdfdsf");
  //     navigate("/app/dashboard");
  //   // try {
  //   //   await fetch(`/api/onboarding`, {
  //   //     method: "POST",
  //   //     credentials: "include",
  //   //   });
  //   //   navigate("/app/dashboard");
  //   // } catch (error) {
  //   //   console.log("Error: ", error);
  //   // }
  // };

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Box background="bg-surface" padding="500" borderRadius="300">


            <div className="text-center">
              <Text as="h1" variant="headingLg">
                Thank You for Installing DonateMe!
              </Text>

              <div className="my-3">
                <Text as="p" variant="bodyMd">
                  Click <strong>Finish</strong> to complete the onboarding
                  process. You can restart onboarding anytime by navigating to{" "}
                  <em>DonateMe &gt; Settings &gt; Restart Onboarding</em>.
                </Text>
              </div>

              <Button
                variant="primary"
                onClick={handleOnboard}
                loading={loading}
              >
                Finish
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
