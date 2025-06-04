import React, { useEffect, useState } from "react";
import { Box, Button, Card, Page, Text, Layout } from "@shopify/polaris";
import "../../css/style.css";

export const Dashboard = () => {
  const [currentPlan, setCurrentPlanPlans] = useState([]);
  const [loader, setLoader] = useState<boolean>(false);

  useEffect(() => {
    setLoader(true);
    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/plans");

        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data?.plans) {
          setCurrentPlanPlans(data.plans);
        } else {
          console.error("Unexpected response structure: 'plans' not found.");
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoader(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <>
      <Page>
        <Layout>
          <Layout.Section>
            <Box>
              <Text variant="heading2xl" as="h3">
                Dashboard
              </Text>
              <Card>
                <Text as="h2" variant="bodyMd">
                  You are currently subscribed to the Free Plan.
                </Text>
                <Text as="h2" variant="bodyMd">
                  Your monthly included usage is US$100
                </Text>

                <div className="mt-1">
                  <Button variant="primary">Change Plan</Button>
                </div>
              </Card>

              <div className="mt-1">
                <Card>
                  <Text as="h2" variant="bodyMd">
                    You have received US$0.00 in donations this month.
                  </Text>
                </Card>
              </div>
              <div className="mt-1">
                <Card>
                  <Text as="h2" variant="bodyMd">
                    Lifetime Donations on Donateme: US$0.00
                  </Text>
                </Card>
              </div>
              <div className="mt-2">
                <Card>
                  <Text as="h2" variant="bodyMd">
                    Email me at{" "}
                    <Button variant="plain">support@donateme.app</Button>
                  </Text>
                </Card>
              </div>
            </Box>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
};

export default Dashboard;
