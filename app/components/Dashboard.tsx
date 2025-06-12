import React, { useEffect, useState } from "react";
import { Box, Button, Card, Page, Text, Layout } from "@shopify/polaris";
import "../css/style.css";
import { useNavigate } from "@remix-run/react";

interface Plan {
  _id: string;
  id: string;
  name: string;
  price: number;
  trialDays: number;
  interval: string;
  features: string[];
}
const Dashboard = () => {
  const navigate = useNavigate();
    const [currentPlan, setCurrentPlanPlans] = useState<Plan>();
    const [loader, setLoader] = useState<boolean>(false);

  useEffect(() => {
      setLoader(true);
      const fetchPlans = async () => {
        try {
          const response = await fetch("/api/dashboard");
          await fetch("/api/onboarding")
          if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
          }
  
          const data = await response.json();
  
          if (data) {
            console.log("Received plans:", data.plan);
            setCurrentPlanPlans(data.plan);
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
                  You are currently subscribed to the {currentPlan?.name}.
                </Text>
                {/* <Text as="h2" variant="bodyMd">
                  Your monthly included usage is US$100
                </Text> */}

                <div className="mt-1">
                  <Button variant="primary" onClick={()=> navigate("/app/plans")}>Change Plan</Button>
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
