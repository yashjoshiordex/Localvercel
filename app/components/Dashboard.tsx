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
  import {  useNavigate } from "@remix-run/react";
import {  useEffect, useState } from "react";
import type { DashboardData } from "app/interfaces/dashboard";
import Loader from "./Loader";
import usePlan from "app/context/PlanContext";
import useCurrency from "app/context/CurrencyContext";


// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);


interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

export default function DonateMEPolarisExact({ onTabChange }: DashboardProps) {
   const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { plan, setPlan } = usePlan();
  const { currency, setCurrency } = useCurrency();

const [hasInitialized, setHasInitialized] = useState(false);


    const fetchPlans = async () => {
      try {
        const response = await fetch("/api/dashboard");
        if (!response.ok) {
          throw new Error(`Server error: ${response.status}`);
        }

        const data = await response.json();

        if (data) {
          // console.log("Received plans:", data.plan);
          setDashboardData(data);
          setPlan(data?.plan?.name);
          setCurrency(data?.currency);
        } else {
          console.warn("Unexpected response structure: 'plans' not found.");
        }
      } catch (error) {
        console.warn("Failed to fetch plans:", error);
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
  }, [plan]);

  const handleChangePlanClick = () => {
    if (onTabChange) {
      // If onTabChange is provided (when used in MainApp), use tab switching
      onTabChange('plans');
    } else {
      // Fallback to navigation (when used standalone)
      navigate("/app/plans");
    }
  };

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

  const amounts = monthOrder?.map(month => 
    dashboardData?.monthlyDonations[month]?.amount || 0
  );

  return {
    labels: monthAbbreviations, // Show all 12 months
    datasets: [
      {
        label: "Monthly Donations",
        data: amounts,
        backgroundColor: amounts?.map((amount) => 
          amount > 0 ? "#6C8ED0" : "#C3C6CC"
        ),
        borderRadius: 2,
        borderSkipped: false,
        barThickness: 20, // Slightly smaller bars to fit all 12 months
      },
    ],
  };
};


const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: function(context: any) {
          return `Amount: ${context?.parsed?.y?.toFixed(2)}`;
        }
      }
    }
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
      title: {
        display: true,
        text: 'Months',
        color: "#374151",
        font: {
          size: 14,
          weight: "bold" as const,
        },
        padding: {
          top: 10
        }
      }
    },
    y: {
      grid: {
        display: true,
        color: "#F3F4F6",
      },
      border: {
        display: false,
      },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
        },
        stepSize: (() => {
          if (!dashboardData) return 25;
          
          // Get all donation amounts for calculating max value
          const monthOrder = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];

          const amounts = monthOrder?.map(month => 
            dashboardData?.monthlyDonations[month]?.amount || 0
          );
          
          const maxAmount = Math.max(...amounts, 0);
          
          // Dynamic step size based on max amount
          if (maxAmount <= 100) return 25;
          if (maxAmount <= 500) return 50;
          if (maxAmount <= 1000) return 100;
          if (maxAmount <= 5000) return 500;
          if (maxAmount <= 10000) return 1000;
          if (maxAmount <= 50000) return 5000;
          return 10000; // For very large amounts
        })(),
        callback: function(value: any) {
          // Format large numbers with K, M suffixes
          if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
          } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
          }
          return `${value}`;
        }
      },
      title: {
        display: true,
        text: `Amount (${currency})`,
        color: "#374151",
        font: {
          size: 14,
          weight: "bold" as const,
        },
        padding: {
          bottom: 10
        }
      },
      max: (() => {
        if (!dashboardData) return 100;
        
        const monthOrder = [
          "January", "February", "March", "April", "May", "June",
          "July", "August", "September", "October", "November", "December"
        ];
        
        const amounts = monthOrder?.map(month => 
          dashboardData?.monthlyDonations[month]?.amount || 0
        );
        
        const maxAmount = Math.max(...amounts, 0);
        
        // Add 20% padding to the max value for better visualization
        const paddedMax = maxAmount * 1.2;
        
        // Round up to nearest step size for cleaner appearance
        if (paddedMax <= 100) return Math.ceil(paddedMax / 25) * 25;
        if (paddedMax <= 500) return Math.ceil(paddedMax / 50) * 50;
        if (paddedMax <= 1000) return Math.ceil(paddedMax / 100) * 100;
        if (paddedMax <= 5000) return Math.ceil(paddedMax / 500) * 500;
        if (paddedMax <= 10000) return Math.ceil(paddedMax / 1000) * 1000;
        if (paddedMax <= 50000) return Math.ceil(paddedMax / 5000) * 5000;
        return Math.ceil(paddedMax / 10000) * 10000;
      })(),
      min: 0,
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
                            variant="headingLg"
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
                            {currency} {dashboardData?.currentMonthDonation?.amount?.toFixed(2) || "0.00"}
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
                            variant="headingLg"
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
                            {currency} {dashboardData?.lifeTimeDonation?.amount?.toFixed(2) || "0.00"}
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
                            variant="headingLg"
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
            </BlockStack>
          </Box>
        </div>
      </div>
  );
}
