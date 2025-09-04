// import React, { useEffect, useState } from "react";
// import { Box, Button, Card, Page, Text, Layout } from "@shopify/polaris";
// import "../css/style.css";
// import { Link, useNavigate } from "@remix-run/react";
// import Loader from "./Loader";

// interface Plan {
//   _id: string;
//   id: string;
//   name: string;
//   price: number;
//   trialDays: number;
//   interval: string;
//   features: string[];
// }
// const Dashboard = () => {
//   const navigate = useNavigate();
//   const [currentPlan, setCurrentPlanPlans] = useState<Plan>();
//   const [loader, setLoader] = useState<boolean>(false);

//   useEffect(() => {
//     setLoader(true);
//     const fetchPlans = async () => {
//       try {
//         const response = await fetch("/api/dashboard");
//         await fetch("/api/onboarding", {
//           method: "POST",
//         });
//         if (!response.ok) {
//           throw new Error(`Server error: ${response.status}`);
//         }

//         const data = await response.json();

//         if (data) {
//           console.log("Received plans:", data.plan);
//           setCurrentPlanPlans(data.plan);
//         } else {
//           console.error("Unexpected response structure: 'plans' not found.");
//         }
//       } catch (error) {
//         console.error("Failed to fetch plans:", error);
//       } finally {
//         setLoader(false);
//       }
//     };
//     fetchPlans();
//   }, []);

//   return (
//     <>
//       {!loader ? <Page>
//         <Layout>
//           <Layout.Section>
//             <Box>
//               <Text variant="heading2xl" as="h3">
//                 Dashboard
//               </Text>
//               <Card>
//                 <Text as="h2" variant="bodyMd">
//                   You are currently subscribed to the {currentPlan?.name}.
//                 </Text>
//                 {/* <Text as="h2" variant="bodyMd">
//                   Your monthly included usage is US$100
//                 </Text> */}

//                 <div className="mt-1">
//                   <Button
//                     variant="primary"
//                     onClick={() => navigate("/app/plans")}
//                   >
//                     Change Plan
//                   </Button>
//                 </div>
//               </Card>

//               <div className="mt-1">
//                 <Card>
//                   <Text as="h2" variant="bodyMd">
//                     You have received US$0.00 in donations this month.
//                   </Text>
//                 </Card>
//               </div>
//               <div className="mt-1">
//                 <Card>
//                   <Text as="h2" variant="bodyMd">
//                     Lifetime Donations on Donateme: US$0.00
//                   </Text>
//                 </Card>
//               </div>
//               <div className="mt-2">
//                 <Card>
//                   <Text as="h2" variant="bodyMd">
//                     Email me at{" "}
//                     <Button variant="plain">support@donateme.app</Button>
//                   </Text>
//                 </Card>
//               </div>
//             </Box>
//             <Link to="/app/archiveProduct">
//               🗃️ Archive All Products
//             </Link>
//           </Layout.Section>
//         </Layout>
//       </Page> : <Loader />}
//     </>
//   );
// };

// export default Dashboard;
"use client";

import {
  Text,
  Box,
  InlineStack,
  Grid,
  Button,
  BlockStack,
  Image,
} from "@shopify/polaris";
import {  Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import mailIcon from "../assets/images/mailIcon.svg";
// import Header from "./Header";
// import download from "../assets/images/downloadIcon.svg"
  import {  useNavigate } from "@remix-run/react";
import {  useEffect, useState } from "react";
import type { DashboardData } from "app/interfaces/dashboard";
// import { Loading } from "@shopify/polaris/build/ts/src/components/Frame/components";
import Loader from "./Loader";
import usePlan from "app/context/PlanContext";


// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

// const donutData = {
//   labels: ["Online", "Recurring", "On-time"],
//   datasets: [
//     {
//       data: [25, 35, 30],
//       backgroundColor: ["#C3C6CC", "#ECF1FB", " #6C8ED0"],
//       borderWidth: 0,
//       cutout: "85%",
//     },
//   ],
// };

// const donutOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       display: false,
//     },
//     tooltip: {
//       enabled: false,
//     },
//   },
// };

// const barData = {
//   labels: ["Jan", "Feb", "Mar", "Apr", "May"],
//   datasets: [
//     {
//       data: [23, 55, 50, 35, 40],
//       backgroundColor: ["#C3C6CC", "#6C8ED0", "#6C8ED0", "#C3C6CC", "#ECF1FB"],
//       borderRadius: 2,
//       borderSkipped: false,
//       barThickness: 24,
//     },
//   ],
// };

// const barOptions = {
//   responsive: true,
//   maintainAspectRatio: false,
//   plugins: {
//     legend: {
//       display: false,
//     },
//   },
//   scales: {
//     x: {
//       grid: {
//         display: false,
//       },
//       border: {
//         display: false,
//       },
//       ticks: {
//         color: "#6B7280",
//         font: {
//           size: 11,
//         },
//       },
//     },
//     y: {
//       grid: {
//         display: false,
//       },
//       border: {
//         display: false,
//       },
//       ticks: {
//         color: "#6B7280",
//         font: {
//           size: 11,
//         },
//         stepSize: 25,
//       },
//       max: 100,
//     },
//   },
// };

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

export default function DonateMEPolarisExact({ onTabChange }: DashboardProps) {
   const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { setPlan } = usePlan();

const [hasInitialized, setHasInitialized] = useState(false);


    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data) {
          console.log("Received plans:", data.plan);
          setDashboardData(data);
          setPlan(data?.plan.name);
        } else {
          console.error("Unexpected response structure: 'plans' not found.");
        }
      } catch (error) {
        console.error("Failed to fetch plans:", error);
      } finally {
        setLoading(false);
      }
      };

  useEffect(() => {

  if (hasInitialized) return;
  const loadData = async () => {
    fetchPlans();
    setHasInitialized(true);
  };
  loadData();
  }, []);

  const handleChangePlanClick = () => {
    if (onTabChange) {
      // If onTabChange is provided (when used in MainApp), use tab switching
      onTabChange('plans');
    } else {
      // Fallback to navigation (when used standalone)
      navigate("/app/plans");
    }
  };

  // Generate bar chart data from monthly donations
  // const generateBarData = () => {
  //   if (!dashboardData?.monthlyDonations) return { labels: [], datasets: [] };

  //   const months = Object.keys(dashboardData.monthlyDonations);
  //   const amounts = months.map(month => dashboardData.monthlyDonations[month].amount);
  //   const maxAmount = Math.max(...amounts, 100); // Ensure minimum scale

  //   return {
  //     labels: months.slice(0, 5), // Show first 5 months or adjust as needed
  //     datasets: [
  //       {
  //         data: amounts.slice(0, 5),
  //         backgroundColor: amounts.slice(0, 5).map((amount, index) => 
  //           amount > 0 ? "#6C8ED0" : "#C3C6CC"
  //         ),
  //         borderRadius: 2,
  //         borderSkipped: false,
  //         barThickness: 24,
  //       },
  //     ],
  //   };
  // };
const generateBarData = () => {
  if (!dashboardData?.monthlyDonations) return { labels: [], datasets: [] };

  // Get all 12 months in order
  const monthOrder = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  
  // Get abbreviations for display
  const monthAbbreviations = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const amounts = monthOrder.map(month => 
    dashboardData.monthlyDonations[month]?.amount || 0
  );

  return {
    labels: monthAbbreviations, // Show all 12 months
    datasets: [
      {
        data: amounts,
        backgroundColor: amounts.map((amount) => 
          amount > 0 ? "#6C8ED0" : "#C3C6CC"
        ),
        borderRadius: 2,
        borderSkipped: false,
        barThickness: 20, // Slightly smaller bars to fit all 12 months
      },
    ],
  };
};



  // // Generate donut chart data (you can customize this based on your donation types)
  // const generateDonutData = () => {
  //   if (!dashboardData) return { labels: [], datasets: [] };

  //   // For now, using mock percentages - you can adjust based on your actual data structure
  //   return {
  //     labels: ["Online", "Recurring", "On-time"],
  //     datasets: [
  //       {
  //         data: [30, 20, 10], // You can calculate these from your data
  //         backgroundColor: ["#6C8ED0", "#ECF1FB", "#C3C6CC"],
  //         borderWidth: 0,
  //         cutout: "85%",
  //       },
  //     ],
  //   };
  // };

  // const donutOptions = {
  //   responsive: true,
  //   maintainAspectRatio: false,
  //   plugins: {
  //     legend: {
  //       display: false,
  //     },
  //     tooltip: {
  //       enabled: false,
  //     },
  //   },
  // };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          stepSize: 25,
        },
        max: dashboardData ? Math.max(dashboardData?.currentMonthDonation?.amount * 1.2, 100) : 100,
      },
    },
  };

  if (loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </div>
    );
  }
  
  return (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh" }}>
      {/* Use div with inline styles for properties not supported by Polaris Box */}
        {/* Header */}
        {/* <Header /> */}

        {/* Main Content */}
        {/* <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}> */}
        <div className="container">
          <Box paddingBlockStart="600" paddingBlockEnd="600">
            <BlockStack gap="600">
              <Text variant="headingXl" as="h1" fontWeight="bold">
                Dashboard Overview
              </Text>

              {/* Subscription Banner */}
              <div
                style={{
                  backgroundColor: "#ECF1FB",
                  borderRadius: "6px",
                  padding: "16px",
                }}
              >
                <InlineStack align="space-between" blockAlign="center">
                  <Text as="h2" fontWeight="bold" variant="headingLg">
                    You are currently subscribed to the {dashboardData?.plan?.name || "Free Plan"}.
                  </Text>
                  <div
                  className="mt-md-0 mt-3 theme-btn">
                   <Button onClick={handleChangePlanClick}>Change Plan</Button>
                  </div>
                </InlineStack>
              </div>

              {/* Stats Cards */}
              {/* Stats Cards */}
              <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                  <Box paddingInlineEnd="300">
                    <div
                      style={{
                        backgroundColor: "#ECF1FB",
                        borderRadius: "6px",
                      }}
                    >
                      <Box padding="300">
                        <BlockStack gap="300">
                          <Text
                            as="h1"
                            variant="headingXl"
                            fontWeight="medium"
                            alignment="center"
                          >
                            This Month's Donations
                          </Text>
                          <Text
                            variant="heading2xl"
                            as="h1"
                            fontWeight="bold"
                            alignment="center"
                          >
                            $ {dashboardData?.currentMonthDonation?.amount?.toFixed(2) || "0.00"}
                          </Text>
                        </BlockStack>
                      </Box>
                    </div>
                  </Box>
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                  <Box paddingInlineEnd="300">
                    <div
                      style={{
                        backgroundColor: "#ECF1FB",
                        borderRadius: "6px",
                      }}
                    >
                      <Box padding="300">
                        <BlockStack gap="300">
                          <Text
                            as="h1"
                            variant="headingXl"
                            fontWeight="medium"
                            alignment="center"
                          >
                            Lifetime Donations
                          </Text>
                          <Text
                            variant="heading2xl"
                            as="h1"
                            fontWeight="bold"
                            alignment="center"
                          >
                            $ {dashboardData?.lifeTimeDonation?.amount?.toFixed(2) || "0.00"}
                          </Text>
                        </BlockStack>
                      </Box>
                    </div>
                  </Box>
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                  <Box paddingBlockEnd="300">
                    <div
                      style={{
                        backgroundColor: "#ECF1FB",
                        borderRadius: "6px",
                      }}
                    >
                      <Box padding="300">
                        <BlockStack gap="300">
                          <Text
                            as="h1"
                            variant="headingXl"
                            fontWeight="medium"
                            alignment="center"
                          >
                            Support
                          </Text>
                          <InlineStack gap="100" blockAlign="center">
                            <span className="d-flex mx-auto gap-1 mb-2">
                              <Image
                                source={mailIcon}
                                alt="Email Icon"
                                width={18}
                              />
                              <Text
                                as="p"
                                variant="headingXl"
                                fontWeight="regular"
                                alignment="center"
                              >
                                support@donateme.app
                              </Text>
                            </span>
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    </div>
                  </Box>
                </Grid.Cell>
              </Grid>

              {/* Charts Section */}
              {/* <Grid> */}
                {/* Card 1: Donation Trends */}
                {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                  <Box paddingBlockEnd="300" paddingInlineEnd="300">
                    <div
                      style={{
                        border: "2px solid #ECF1FB",
                        borderRadius: "6px",
                      }}
                    >
                      <Box padding="500">
                        <BlockStack gap="400">
                          <Text
                            variant="headingLg"
                            as="h1"
                            fontWeight="semibold"
                            alignment="center"
                          >
                            Donation Trends
                          </Text>
                          <Box paddingBlock="400">
                            <InlineStack align="center">
                              <div style={{ width: "180px", height: "180px" }}>
                                <Doughnut
                                  data={generateDonutData()}
                                  options={donutOptions}
                                />
                              </div>
                            </InlineStack>
                          </Box>
                          <InlineStack gap="200" align="space-between">
                            <InlineStack gap="200" blockAlign="center">
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  backgroundColor: "#6B9BD2",
                                  borderRadius: "50%",
                                }}
                              />
                              <Text as="span" variant="bodySm" tone="subdued">
                                online 30%
                              </Text>
                            </InlineStack>
                            <InlineStack gap="200" blockAlign="center">
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  backgroundColor: "#A8C5E8",
                                  borderRadius: "50%",
                                }}
                              />
                              <Text as="span" variant="bodySm" tone="subdued">
                                Recurring 20%
                              </Text>
                            </InlineStack>
                            <InlineStack gap="200" blockAlign="center">
                              <div
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  backgroundColor: "#D1E3F5",
                                  borderRadius: "50%",
                                }}
                              />
                              <Text as="span" variant="bodySm" tone="subdued">
                                On-time 10%
                              </Text>
                            </InlineStack>
                          </InlineStack>
                        </BlockStack>
                      </Box>
                    </div>
                  </Box>
                </Grid.Cell> */}

                {/* Card 2: Donation Over Time */}
                {/* <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 4, xl: 4 }}>
                  <Box paddingBlockEnd="300" paddingInlineEnd="300">
                    <div
                      style={{
                        border: "2px solid #ECF1FB",
                        borderRadius: "6px",
                      }}
                    >
                      <Box padding="500">
                        <BlockStack gap="400">
                          <Text
                            variant="headingLg"
                            as="h1"
                            fontWeight="semibold"
                            alignment="center"
                          >
                            Donation Over time
                          </Text>
                          <div style={{ height: "240px" }}>
                            <Bar data={generateBarData()} options={barOptions} />
                          </div>
                        </BlockStack>
                      </Box>
                    </div>
                  </Box>
                </Grid.Cell> */}

                {/* <Grid.Cell columnSpan={{ xs: 12, sm: 12, md: 12, lg: 8, xl: 8 }}> */}
                  <Box paddingBlockEnd="400">
                    <div
                      style={{
                        border: "2px solid #ECF1FB",
                        borderRadius: "8px",

                      }}
                    >
                      <Box padding="600">
                        <BlockStack gap="600">
                          <Text
                            variant="headingXl"
                            as="h1"
                            fontWeight="semibold"
                            alignment="center"
                          >
                            Donation Over time
                          </Text>
                          <div style={{ height: "320px", width: "100%" }}>
                            <Bar data={generateBarData()} options={barOptions} />
                          </div>
                        </BlockStack>
                      </Box>
                    </div>
                  </Box>
                {/* </Grid.Cell> */}
              {/* </Grid> */}

              {/* Archive Section */}
              {/* <Box>
                <div
                  style={{
                    background: "#ECF1FB",
                    borderRadius: "6px",
                    padding: "12px 16px",
                    width: "fit-content",
                    cursor:"pointer"
                  }}
                  
                >
                  <InlineStack gap="200" blockAlign="center">
                    <Image source={download} alt="download" width={18} />
                    <Text as="span" variant="headingMd" fontWeight="medium">
                      Archive All Products
                    </Text>
                  </InlineStack>
                </div>
              </Box> */}
            </BlockStack>
          </Box>
        </div>
      </div>
  );
}
