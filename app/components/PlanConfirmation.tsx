import { Page, Layout, Text, Button, Box, BlockStack, InlineStack, Badge, Card, List } from "@shopify/polaris";
import usePlan from "app/context/PlanContext";
import { useEffect, useRef, useState } from "react";
import Loader from "./Loader";

interface PlanConfirmationProps {
  onTabChange?: (tab: string) => void;
}

export default function PlanConfirmation({ onTabChange }: PlanConfirmationProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const { setPlan } = usePlan();
  
  const hasFetched = useRef(false);

  const fetchSubscriptionDetails = async (planId: string, chargeId: string | null, name: string | null) => {
    try {
      const queryParams = new URLSearchParams();
      
      if (planId) {
        queryParams.set('plan', planId);
      }
      
      const isFreeFromName = name === 'free';
      const isFreeFromUrl = window.location.href.includes('name=free');
      
      if (chargeId && chargeId !== 'null' && !isFreeFromName && !isFreeFromUrl) {
        queryParams.set('charge_id', chargeId);
      }

      const response = await fetch(`/api/get-subscription?${queryParams?.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setSubscription(data);
        setPlan(data?.plan?.name || 'Free Plan');
      } else {
        setError(data?.error || "Failed to fetch subscription details.");
      }
    } catch (err) {
      setError(`An unexpected error occurred: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      localStorage.clear();
      
      const currentUrl = new URL(window.location.href);
      const chargeId = currentUrl?.searchParams?.get("charge_id");
      const name = currentUrl?.searchParams?.get("name");
      const planId = currentUrl?.searchParams?.get("plan");

      if (planId) {
        fetchSubscriptionDetails(planId, chargeId, name);
      }

      hasFetched.current = true;
    }
  }, []);
  
  const handleOnboard = async () => {

  const currentUrl = new URL(window.location.href);
  const baseUrl = currentUrl.origin + currentUrl.pathname; // Gets just the base URL without any params
    if (onTabChange) {
    window.history.replaceState({}, '', baseUrl);
      onTabChange('dashboard');
    } else {
      window.location.href = '/app?tab=dashboard';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge tone="success">Active</Badge>;
      case 'PENDING':
        return <Badge tone="attention">Pending</Badge>;
      case 'CANCELLED':
        return <Badge tone="critical">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <Loader />
    );
  }

  return (
    <Page>
      <Layout>
        <Layout.Section>
          <BlockStack gap="600">
            {/* Success Header */}
            <Box background="bg-surface" padding="500" borderRadius="300">
              <div className="text-center">
                <BlockStack gap="400" align="center">
                  <div style={{ 
                    width: "60px",  // Reduced from 80px
                    height: "60px", // Reduced from 80px
                    borderRadius: "50%", 
                    backgroundColor: "#00A047", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    margin: "0 auto" // Ensure it's centered
                  }}>
                    <Text as="span" variant="headingLg" alignment="center" tone="text-inverse">
                      ✓
                    </Text>
                  </div>
                  
                  <BlockStack gap="200" align="center">
                    <Text as="h1" variant="heading2xl" alignment="center">
                      Plan Updated Successfully!
                    </Text>
                    <Text as="p" variant="bodyLg" alignment="center" tone="subdued">
                      Your subscription has been activated and is ready to use.
                    </Text>
                  </BlockStack>
                </BlockStack>
              </div>
            </Box>

            {/* Subscription Details */}
            {subscription && (
              <Card>
                <BlockStack gap="500">
                  <InlineStack align="space-between" blockAlign="center">
                    <Text as="h2" variant="headingLg">
                      Subscription Details
                    </Text>
                    {getStatusBadge(subscription?.status)}
                  </InlineStack>

                  <div style={{ backgroundColor: "#F6F6F7", padding: "20px", borderRadius: "8px" }}>
                    <BlockStack gap="400">
                      {/* Plan Info */}
                      <InlineStack align="space-between" wrap={false}>
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" tone="subdued">
                            Current Plan
                          </Text>
                          <Text as="h3" variant="headingMd" fontWeight="semibold">
                            {subscription?.plan?.name}
                          </Text>
                        </BlockStack>
                        
                        <BlockStack gap="100" align="end">
                          <Text as="span" variant="bodyMd" tone="subdued">
                            Monthly Price
                          </Text>
                          <Text as="h3" variant="headingMd" fontWeight="semibold">
                            ${subscription?.plan?.price}/month
                          </Text>
                        </BlockStack>
                      </InlineStack>

                      {/* Dates */}
                      <InlineStack align="space-between" wrap={false}>
                        <BlockStack gap="100">
                          <Text as="span" variant="bodyMd" tone="subdued">
                            Started On
                          </Text>
                          <Text as="span" variant="bodyMd">
                            {formatDate(subscription?.createdAt)}
                          </Text>
                        </BlockStack>
                        
                      </InlineStack>

                    </BlockStack>
                  </div>

                  {/* Plan Features */}
                  {subscription.plan?.features && (
                    <BlockStack gap="300">
                      <Text as="h3" variant="headingMd">
                        Plan Features
                      </Text>
                      <Card >
                        <List type="bullet">
                          {subscription?.plan?.features.map((feature: string, index: number) => (
                            <List.Item key={index}>
                              <Text as="span" variant="bodyMd">
                                {feature}
                              </Text>
                            </List.Item>
                          ))}
                        </List>
                      </Card>
                    </BlockStack>
                  )}

                  {/* Action Button */}
                  <div className="text-center">
                    <div className="theme-btn">
                      <Button
                        variant="primary"
                        size="large"
                        onClick={handleOnboard}
                        loading={loading}
                      >
                        Continue to Dashboard
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Box padding="300" background="bg-fill-critical-secondary" borderRadius="200">
                      <Text as="p" variant="bodyMd" tone="critical">
                        {error}
                      </Text>
                    </Box>
                  )}
                </BlockStack>
              </Card>
            )}

            {/* Additional Info */}
            <Card >
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">
                  What's Next?
                </Text>
                <List type="number">
                  <List.Item>
                    <Text as="span" variant="bodyMd">
                      Configure your donation settings in the Settings tab
                    </Text>
                  </List.Item>
                  <List.Item>
                    <Text as="span" variant="bodyMd">
                      Create and manage your donation products
                    </Text>
                  </List.Item>
                  <List.Item>
                    <Text as="span" variant="bodyMd">
                      Monitor your donations through the Reports dashboard
                    </Text>
                  </List.Item>
                </List>
              </BlockStack>
            </Card>
          </BlockStack>
        </Layout.Section>
      </Layout>
    </Page>
  );
}