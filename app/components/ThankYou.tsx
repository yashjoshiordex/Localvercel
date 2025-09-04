import {
  Page,
  Text,
  Box,
  BlockStack,
  Card,
} from '@shopify/polaris';
import { useSearchParams } from '@remix-run/react';
import { useEffect, useState } from 'react';


interface ThankYouProps {
  planId?: string | null;
  chargeId?: string | null;
}

export default function Thankyou({ planId: propPlanId, chargeId: propChargeId }: ThankYouProps) {

  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  const chargeId = propChargeId || searchParams?.get("charge_id");
  const planId = propPlanId || searchParams?.get("plan");



  const fetchSubscriptionDetails = async () => {
  
    try {
      const response = await fetch(
        `/api/get-subscription?charge_id=${chargeId}&plan=${planId}`,
      );
      const data = await response.json();

      if (response.ok) {
        // setSubscription(data);
      } else {
        setError(data.error || "Failed to fetch subscription details.");
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${(err as Error).message}`);
    }   };

  useEffect(() => {
    localStorage.clear();
      fetchSubscriptionDetails();
  }, []);


  return (
    <Page fullWidth>
      <Box paddingBlock="800" paddingInline="400">
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <BlockStack gap="600" align="center">
            {/* Success Icon */}
            <div style={{
              width: "70px",
              height: "70px",
              borderRadius: "50%",
              backgroundColor: "#00A047",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto"
            }}>
              <Text as="span" variant="heading2xl" alignment="center" tone="text-inverse">
                ✓
              </Text>
            </div>

            {/* Main Content */}
            <BlockStack gap="400" align="center">
              <BlockStack gap="300" align="center">
                <Text as="h1" variant="heading2xl" alignment="center">
                  Thank You for Installing DonateMe!
                </Text>
                <Text as="p" variant="headingMd" alignment="center" tone="subdued">
                  Your donation platform is now ready to make a difference
                </Text>
              </BlockStack>

            </BlockStack>

            {/* Success Message Card */}
            <Card>
              <Box padding="500">
                <BlockStack gap="400" align="center">
                  <Text as='span' variant="headingMd" alignment="center">
                    🎉 Installation Successful!
                  </Text>
                  
                  <Text as='span' variant="bodyLg" alignment="center">
                    DonateMe has been successfully installed and is ready to help you 
                    start collecting donations for your cause.
                  </Text>


                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '20px',
                    width: '100%',
                    marginTop: '20px'
                  }}>
                    {/* Step 1 - Completed */}
                    <Box 
                      background="bg-surface-success" 
                      padding="400" 
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border-success"
                    >
                      <BlockStack gap="200" align="center">
                        <Text as='span' variant="bodyMd" fontWeight="semibold" tone="success">
                          ✅ Step 1 - Completed
                        </Text>
                        <Text as='span' variant="bodySm" alignment="center">
                          Complete the onboarding process
                        </Text>
                      </BlockStack>
                    </Box>

                    {/* Step 2 - Next Step */}
                    <Box 
                      background="bg-surface-secondary" 
                      padding="400" 
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <BlockStack gap="200" align="center">
                        <Text as='span' variant="bodyMd" fontWeight="semibold">
                          🎯 Next Step
                        </Text>
                        <Text as='span' variant="bodySm" alignment="center">
                          Create your first donation product
                        </Text>
                      </BlockStack>
                    </Box>

                    {/* Step 3 - Next Step */}
                    <Box 
                      background="bg-surface-secondary" 
                      padding="400" 
                      borderRadius="200"
                      borderWidth="025"
                      borderColor="border"
                    >
                      <BlockStack gap="200" align="center">
                        <Text as='span' variant="bodyMd" fontWeight="semibold">
                          📊 Next Step
                        </Text>
                        <Text as='span' variant="bodySm" alignment="center">
                          Track your donation impact
                        </Text>
                      </BlockStack>
                    </Box>
                  </div>
                </BlockStack>
              </Box>
            </Card>

            {/* Error Display */}
            {error && (
              <Box 
                background="bg-surface-critical" 
                padding="400" 
                borderRadius="200"
                width="100%"
              >
                <Text as="p" variant="bodyMd" tone="critical" alignment="center">
                  {error}
                </Text>
              </Box>
            )}
          </BlockStack>
        </div>
      </Box>
    </Page>
  );
}