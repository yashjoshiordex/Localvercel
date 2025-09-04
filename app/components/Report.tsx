import {
  Text,
  Box,
  BlockStack,
  InlineStack,
  Grid,
  Button,
  Select,
  TextField,
  DataTable,
  Image,
  Page,
  Listbox,
  InlineGrid,
  Combobox,
  Icon,
  Pagination,
} from "@shopify/polaris";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import {   useCallback, useEffect, useMemo, useState } from "react";
import { SearchIcon } from "@shopify/polaris-icons";
import Search from '../assets/images/SearchIcon.svg';
import usePlan from "app/context/PlanContext";
import type { ReportData, DonationReportData,DonationProduct, DonationReportResponse, DonationListResponse } from "app/interfaces/report";
import { exportDonationListSimple } from 'app/utils/excelExport';
import Loader from "./Loader";
import toast from "react-hot-toast";
import NestedLoader from "./NestedLoader";
import useCurrency from "app/context/CurrencyContext";


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface ReportsProps {
  onTabChange?: (tab: string) => void;
}
const Reports = ({ onTabChange }: ReportsProps) => {

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDates, setSelectedDates] = useState<{ start: Date | null; end: Date | null }>({
    start: null, // July is month 6 (0-indexed)
    end: null,
  });

  const [entriesCount, setEntriesCount] = useState("10")
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);


  // Donation report states
  const [donationSearchQuery, setDonationSearchQuery] = useState("");
  const [donationProducts, setDonationProducts] = useState<DonationProduct[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [donationReportData, setDonationReportData] = useState<DonationReportData | null>(null);

  // middle graph
  const [loadingDonationReport, setLoadingDonationReport] = useState(false);
  const [donationComboboxActive, setDonationComboboxActive] = useState(false);
  const [donationListData, setDonationListData] = useState<DonationListResponse | null>(null);
  // the bottom list
  const [loadingReportList, setLoadingReportList] = useState(false);

  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const { plan } = usePlan();
  const { currency } = useCurrency();

  const [keepProducts, setKeepProducts] = useState(false);

const debouncedSearchDonationProducts = useCallback(
  debounce(async (searchQuery: string) => {
    
    if (!searchQuery.trim()) {
      if (!keepProducts) {
        setDonationProducts([]);
      } else {
        setKeepProducts(false); // Reset the flag
      }
      return;
    }

    try {
      setLoadingDonationReport(true);
      const response = await fetch(`/api/donation-report?search=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data: DonationReportResponse = await response.json();
        if (data.success) {
          setDonationProducts(data?.products);
        }
      }
    } catch (error) {
      console.warn('Error fetching donation products:', error);
    } finally {
      setLoadingDonationReport(false);
    }
  }, 300),
  [keepProducts]
);

  function debounce<T extends (...args: any[]) => any>(func: T, delay: number): T {
    let timeoutId: NodeJS.Timeout;
    return ((...args: any[]) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    }) as T;
  }

  // Effect for donation search
  useEffect(() => {
    debouncedSearchDonationProducts(donationSearchQuery);
  }, [donationSearchQuery]);


const debouncedSearchDonationList = useCallback(
  debounce(async (searchQuery: string, entriesCount: string) => {
    try {
      setLoadingReportList(true);
      // console.log('search query...', searchQuery);
      const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery)}` : '';
      const response = await fetch(`/api/report-list?page=1&limit=${entriesCount}${searchParam}`);
      
      if (response.ok) {
        const data: DonationListResponse = await response.json();
        if (data.success) {
          setDonationListData(data);
          setCurrentPage(1); // Reset to page 1 on search
        }
      }
    } catch (error) {
      console.warn('Error fetching donation list:', error);
    } finally {
      setLoadingReportList(false);
    }
  }, 500), // 500ms debounce delay
  []
);

useEffect(() => {
  if (plan !== 'Gold Plan' || isInitialLoad) return;
  
  debouncedSearchDonationList(searchQuery, entriesCount);
}, [plan, searchQuery, entriesCount]);

const fetchDonationList = async (searchQuery: string = "", page: number = 1) => {
  try {
    setLoadingReportList(true);
    // console.log('search query...', searchQuery);
    const searchParam = searchQuery.trim() ? `&search=${encodeURIComponent(searchQuery)}` : '';
    const response = await fetch(`/api/report-list?page=${page}&limit=${entriesCount}${searchParam}`);
    
    if (response.ok) {
      const data: DonationListResponse = await response.json();
      if (data.success) {
        setDonationListData(data);
        setCurrentPage(page); // Update current page
      }
    }
  } catch (error) {
    console.warn('Error fetching donation list:', error);
  } finally {
    setLoadingReportList(false);
  }
};

// Add pagination helper functions
const getTotalPages = () => {
  if (!donationListData?.data) return 0;
  return Math.ceil(donationListData.data?.totalPages);
};

const canGoPrevious = () => {
  return currentPage > 1;
};

const canGoNext = () => {
  return currentPage < getTotalPages();
};

const handlePreviousPage = () => {
  if (canGoPrevious()) {
    const newPage = currentPage - 1;
    fetchDonationList(searchQuery, newPage);
  }
};

const handleNextPage = () => {
  if (canGoNext()) {
    const newPage = currentPage + 1;
    fetchDonationList(searchQuery, newPage);
  }
};

// Update the entries count change handler
const handleEntriesCountChange = (newCount: string) => {
  setEntriesCount(newCount);
  setCurrentPage(1); // Reset to page 1 when changing entries count
  fetchDonationList(searchQuery, 1);
};

// Add useEffect to fetch data when component mounts
useEffect(() => {
  if (plan === 'Gold Plan') {
    fetchDonationList();
    setIsInitialLoad(false); // Set initial load to false after first fetch
  }
}, [plan]);

const createDonationRows = () => {
  if (!donationListData?.data?.orders) return [];

  const rows: any[] = [];

  donationListData?.data?.orders.forEach(order => {
    order?.lineItems.forEach(lineItem => {
      rows.push([
        <Box key={`order-${order?.orderId}-${lineItem?.id}`}>
          <Text as="span" alignment="center">{order?.orderId}</Text>
        </Box>,
        <Box key={`product-${order?.orderId}-${lineItem?.id}`}>
          <Text as="span" alignment="center">{lineItem?.productName}</Text>
        </Box>,
        <Box key={`price-${order?.orderId}-${lineItem?.id}`}>
          <Text as="span" alignment="center">{lineItem?.price * lineItem?.quantity}</Text>
        </Box>,
        <Box key={`date-${order?.orderId}-${lineItem?.id}`}>
          <Text as="span" alignment="center">
            {new Date(order?.createdAt).toLocaleDateString()}
          </Text>
        </Box>
      ]);
    });
  });

  return rows;
};

// Update the entries count text
const getEntriesText = () => {
  const totalCount = donationListData?.data?.totalLineItemCount || 0;
  const currentPageData = donationListData?.data?.page || 1;
  const limit = donationListData?.data?.limit || 20;
  
  if (totalCount === 0) return "Showing 0 to 0 of 0 entries";
  
  const startEntry = ((currentPageData - 1) * limit) + 1;
  const endEntry = Math.min(currentPageData * limit, totalCount);
  
  return `Showing ${startEntry} to ${endEntry} of ${totalCount} entries`;
};

const exportToExcel = () => {
  if (!donationListData) {
    alert('No data available to export');
    return;
  }

  try {
     exportDonationListSimple(donationListData);
    // const result = exportDonationListSimple(donationListData);
    // console.log(`✅ Export successful: ${result.recordsExported} records exported to ${result.filename}`);
    
  } catch (error) {
    console.warn('❌ Export failed:', error);
    alert('Failed to export data. Please try again.');
  }
};

  const fetchReportData = async () => {
    try {
      if (plan !== 'Gold Plan') {
        console.warn('Skipping report data fetch for non-Gold plans');
        return;
      }
      setLoading(true);
      const response = await fetch('/api/report-overall');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setReportData(data?.data);
        } else {
          console.warn('API returned error:', data);
        }
      } else {
        console.warn('Failed to fetch report data:', response.statusText);
      }
    } catch (error) {
      console.warn('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch donation report based on selected variant and dates
  const fetchDonationReport = async () => {
  if (!selectedProductId) {
    toast.error('Please select a donation product first', {
      duration: 4000,
      position: 'top-right',
    });
    return;
  }
  
  if (!selectedDates.start) {
    toast.error('Please select a start date', {
      duration: 4000,
      position: 'top-right',
    });
    return;
  }
  
  if (!selectedDates.end) {
    toast.error('Please select an end date', {
      duration: 4000,
      position: 'top-right',
    });
    return;
  }

    try {
      setLoadingDonationReport(true);
      const payload = {
        productId: selectedProductId,
        startDate: selectedDates?.start?.toISOString(),
        endDate: selectedDates?.end?.toISOString(),
      };

      const response = await fetch('/api/donation-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data: DonationReportData = await response.json();
        setDonationReportData(data);
      } else {
        console.warn('Failed to fetch donation report');
        toast.error('Failed to fetch donation report');
      }
    } catch (error) {
      console.warn('Error fetching donation report:', error);
    } finally {
      setLoadingDonationReport(false);
    }
  };

  useEffect(() => {
    if (plan === 'Gold Plan') {
      fetchReportData();
    }
  }, [plan]);
  // const [active, setActive] = useState(false);

  const createAreaChartData = () => {
    if (!reportData) {
      return {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [{
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          fill: true,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return null;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "#6C8ED0");
            gradient.addColorStop(0.5, "#6C8ED060");
            gradient.addColorStop(1, "#3C2FC900");
            return gradient;
          },
          borderColor: "#93A7D1",
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 0,
        }]
      };
    }

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const orderCounts = reportData.monthlyData.map(item => item.orderCount);

    return {
      labels: monthLabels,
      datasets: [{
        data: orderCounts,
        fill: true,
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, "#6C8ED0");
          gradient.addColorStop(0.5, "#6C8ED060");
          gradient.addColorStop(1, "#3C2FC900");
          return gradient;
        },
        borderColor: "#93A7D1",
        borderWidth: 2,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 0,
      }]
    };
  };

  // Create donation report chart data
  const createDonationReportChartData = () => {
    if (!donationReportData) {
      return {
        labels: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
        datasets: [{
          label: "No Donation Found",
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          borderColor: "#6C8ED0",
          backgroundColor: "#6C8ED0",
          borderWidth: 2,
          pointRadius: 0,
          fill: false,
        }]
      };
    }

    const months = donationReportData.monthlyBreakdown.map(item => item.month);
    const quantities = donationReportData.monthlyBreakdown.map(item => item.totalPrice);
    // const maxQuantity = Math.max(...quantities, 1);

    return {
      labels: months,
      datasets: [{
        label: "Donations",
        data: quantities,
        borderColor: "#6C8ED0",
        backgroundColor: "#6C8ED0",
        borderWidth: 2,
        pointRadius: 4,
        fill: false,
      }]
    };
  };

// Update the areaChartOptions to include axis labels
const areaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  interaction: {
    intersect: false,
    mode: "index" as const,
  },
  scales: {
    x: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
          family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        padding: 8,
      },
      title: {
        display: true,
        text: 'Months',
        color: "#374151",
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          top: 10
        }
      }
    },
    y: {
      grid: {
        display: true,
        color: "#F1F5F9",
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
          family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        stepSize: Math.max(1, Math.ceil((reportData?.overall.orderCount || 10) / 10)),
        padding: 12,
        callback: (value: any) => (value === 0 ? "0" : value.toString()),
      },
      max: Math.max(10, (reportData?.overall.orderCount || 0) + 5),
      min: 0,
      title: {
        display: true,
        text: 'Order Count',
        color: "#374151",
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 10
        }
      }
    },
  },
  elements: {
    line: { tension: 0.4 },
  },
};

// Update the donationReportChartOptions to include axis labels
const donationReportChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: "top" as const,
      align: "start" as const,
      labels: {
        usePointStyle: true,
        pointStyle: "rect",
        font: {
          size: 12,
          family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        color: "#374151",
        padding: 20,
      },
    },
  },
  scales: {
    x: {
      grid: {
        display: true,
        color: "#E5E7EB",
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
          family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      },
      title: {
        display: true,
        text: 'Months',
        color: "#374151",
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          top: 10
        }
      }
    },
    y: {
      grid: {
        display: true,
        color: "#E5E7EB",
        lineWidth: 1,
      },
      border: { display: false },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
          family: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        stepSize: 1,
      },
      min: 0,
      title: {
        display: true,
        text: 'Donation Amount',
        color: "#374151",
        font: {
          size: 14,
          weight: 'bold' as const,
        },
        padding: {
          bottom: 10
        }
      }
    },
  },
};
  // const togglePopover = () => setPopoverActive((active) => !active);

  const entriesOptions = [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ];

  const handleChangePlanClick = () => {
    if (onTabChange) {
      onTabChange('plans');
    } else {
      window.location.href = '/app?tab=plans';
    }
  };

  // Format currency
  // const formatCurrency = (amount: number) => {
  //   return new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: currency
  //   }).format(amount);
  // };

  // Prepare options for combobox
  const donationOptions = useMemo(() => {
    return donationProducts.map(product => ({
      value: product?.productId,
      label: `${product?.title} `,
    }));
  }, [donationProducts]);

  const selectedOptionLabel = useMemo(() => {
    const selectedProduct = donationProducts?.find(p => p.productId === selectedProductId);
    return selectedProduct ? `${selectedProduct?.title}` : '';
  }, [selectedProductId, donationProducts]);


  if( plan !== "Gold Plan"){

  return(
    <Page>
        <Box borderWidth="025" borderColor="border" borderRadius="200">
        <InlineGrid columns={{ xs: 1, md: "5fr 7fr" }} gap="0">
          {/* Left Section */}
          {/* Right Sertion */}
          <div style={{ backgroundColor: "#ECF1FB" }}>
            <Box padding="400">
              <BlockStack gap="300">
                <Text variant="headingLg" as="h1">
                  Upgrade To Gold Plan
                </Text>
                <Text as="p" variant="bodyLg">
                  Click on the upgrade now button and move to the Gold
                  Plan. So, you can use the Report view feature. 
                </Text>
                <Box maxWidth="fit-content">
                  <div className="theme-btn">
                    <Button onClick={handleChangePlanClick}>Upgrade New</Button>
                  </div>
                </Box>
              </BlockStack>
            </Box>
          </div>
        </InlineGrid>
      </Box>
    </Page>
  )
  }

  if ( loading) {
    return (
      <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader />
      </div>
    );
  }
  
  if ( plan == 'Gold Plan') {
  return (
      <Box background="bg-surface" paddingBlock="600">
        <div className="container">
          <BlockStack gap="600">
            {/* Top Metrics Cards - Using Grid with responsive columnSpan */}
          <Grid>
            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
              <Box paddingInlineEnd="300">
                <div style={{ backgroundColor: "#ECF1FB", borderRadius: "2px" }}>
                  <Box padding="300">
                    <BlockStack gap="100" align="center">
                      <Text as="h1" variant="headingLg" fontWeight="medium" alignment="center">
                        Total Donations
                      </Text>
                      <Text variant="headingXl" as="p" fontWeight="bold" alignment="center">
                          {loading ? "Loading..." : currency +" " + (reportData?.overall.totalPrice || 0).toFixed(2)}
                      </Text>
                    </BlockStack>
                  </Box>
                </div>
              </Box>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
              <Box paddingInlineEnd="300">
                <div style={{ backgroundColor: "#ECF1FB", borderRadius: "2px" }}>
                  <Box padding="300">
                    <BlockStack gap="100" align="center">
                      <Text as="h1" variant="headingLg" fontWeight="medium" alignment="center">
                        Donors
                      </Text>
                      <Text variant="headingXl" as="p" fontWeight="bold" alignment="center">
                          {loading ? "Loading..." : reportData?.overall.uniqueClientCount || 0}
                      </Text>
                    </BlockStack>
                  </Box>
                </div>
              </Box>
            </Grid.Cell>

            <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}>
              <Box paddingInlineEnd="300">
                <div style={{ backgroundColor: "#ECF1FB", borderRadius: "2px" }}>
                  <Box padding="300">
                    <BlockStack gap="100" align="center">
                      <Text as="h1" variant="headingLg" fontWeight="medium" alignment="center">
                        Average Donations
                      </Text>
                      <Text variant="headingXl" as="p" fontWeight="bold" alignment="center">
                          {loading ? "Loading..." : currency + " " + (reportData?.overall.averageDonation || 0).toFixed(2)}
                      </Text>
                    </BlockStack>
                  </Box>
                </div>
              </Box>
            </Grid.Cell>
          </Grid>
          {/* Main Area Chart - Exact styling from image */}
          <Box padding="0">
            <div
              style={{
                height: "380px",
                padding: "24px 20px 20px 20px",
                backgroundColor: "#FFFFFF",
              }}
            >
              {loading ? (
                <Box padding="400">
                  <Text as="span" alignment="center">Loading chart data...</Text>
                </Box>
              ) : (
                <Line data={createAreaChartData()} options={areaChartOptions} />
              )}
            </div>
          </Box>

          {/* Donations Report Section */}
          <Box padding="500">
            <BlockStack gap="500">
              <BlockStack gap="200">
                <Text variant="headingLg" as="h2" fontWeight="semibold">
                  Donations Report
                </Text>
                <Text as="p" variant="headingMd" fontWeight="regular">
                  Allow you to see report of the donations collected in
                  selected month/year.
                </Text>
              </BlockStack>

              {/* Filters Row - Using Grid with responsive columnSpan */}
              <Grid>
                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 4, lg: 3, xl: 3 }}>
                  <BlockStack gap="200">
                    <Text as="span" variant="headingMd" fontWeight="regular">
                      Select Donations
                    </Text>

                    <Combobox
                      activator={
                        <Combobox.TextField
                          onChange={(value) => {

                            setDonationSearchQuery(value);
                            setDonationComboboxActive(value.length > 0);

                            if (value !== selectedOptionLabel) {
                              setSelectedProductId('');
                            }
                          }}
                          label=""
                          labelHidden

                          value={selectedProductId ? selectedOptionLabel : donationSearchQuery}
                          placeholder="Search donation products..."
                          autoComplete="off"
                          suffix={<Icon source={SearchIcon} />}
                        />
                      }
                    >
                      {(donationComboboxActive || donationSearchQuery) ? (

                        <Listbox
                          onSelect={(value) => {

                            if (value !== 'loading' && value !== 'no-results' && value !== 'search-prompt') {

                              setSelectedProductId(value);
                              setKeepProducts(true); // Set flag to keep products
                              setDonationSearchQuery(''); // This will clear query but keep products due to flag
                              setDonationComboboxActive(false);

                            }
                          }}
                        >
                          {loadingDonationReport ? (
                            <Listbox.Option value="loading" disabled>
                              <Text as="span">Loading...</Text>
                            </Listbox.Option>
                          ) : donationOptions.length > 0 ? (
                            donationOptions.map((option) => (
                              <Listbox.Option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </Listbox.Option>
                            ))
                          ) : donationSearchQuery.length > 0 ? (
                            <Listbox.Option value="no-results" disabled>
                              <Text as="span">No products found</Text>
                            </Listbox.Option>
                          ) : (
                            <Listbox.Option value="search-prompt" disabled>
                              <Text as="span">Start typing to search products</Text>
                            </Listbox.Option>
                          )}
                        </Listbox>
                      ) : null}
                    </Combobox>

                    {selectedProductId && (
                      <InlineStack gap="200" align="space-between">
                        <Text as="p" variant="bodyMd" tone="subdued">
                          Selected: {selectedOptionLabel}
                        </Text>
                        <Button
                          size="micro"
                          variant="plain"
                          onClick={() => {
                            // Clear selected product
                            setSelectedProductId('');
                            setDonationSearchQuery('');
                            setDonationComboboxActive(false);

                            // Clear date inputs
                            setSelectedDates({
                              start: null,
                              end: null
                            });

                            // Clear donation report data (this will reset the graph)
                            setDonationReportData(null);

                            // Clear donation products list
                            setDonationProducts([]);

                            // Reset any loading states
                            setLoadingDonationReport(false);
                            setLoadingDonationReport(false);
                          }}
                        >
                          Clear
                        </Button>
                      </InlineStack>
                    )}
                    </BlockStack>
                  </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                  <BlockStack gap="200">
                    <Text as="span" variant="headingMd" fontWeight="regular">
                      Select Date Range
                    </Text>

                    <InlineStack gap="200" wrap={false}>

                      <div >
                        <TextField
                          label=""
                          placeholder="Start Date"
                          type="date"
                          value={selectedDates.start ? selectedDates.start.toISOString().split('T')[0] : ''}
                          max={new Date().toISOString().split('T')[0]} // Restrict to today's date
                          onChange={(value) => {
                            const newStartDate = new Date(value);
                            setSelectedDates(prev => ({
                              start: newStartDate,
                              end: prev.end && newStartDate > prev.end ? null : new Date() // Clear end date if start is after end
                            }));
                          }}
                          autoComplete="off"
                        />
                      </div>
                      {/* <div style={{ flex: 1 }}> */}
                      <div >
                        <TextField
                          label=""
                          placeholder="End Date"
                          type="date"
                          value={selectedDates.end ? selectedDates.end.toISOString().split('T')[0] : ''}
                          min={selectedDates.start ? selectedDates.start.toISOString().split('T')[0] : undefined}
                          max={new Date().toISOString().split('T')[0]} // Restrict to today's date
                          onChange={(value) => {
                            const newEndDate = new Date(value);
                            const today = new Date();
                            today.setHours(23, 59, 59, 999); // Set to end of today

                            if (newEndDate <= today && (!selectedDates.start || newEndDate >= selectedDates.start)) {
                              setSelectedDates(prev => ({
                                ...prev,
                                end: newEndDate
                              }));
                            }
                          }}
                          autoComplete="off"
                          error={
                            selectedDates.end && selectedDates.start && selectedDates.end < selectedDates.start
                              ? "End date cannot be earlier than start date"
                              : selectedDates.end && selectedDates.end > new Date()
                                ? "End date cannot be in the future"
                                : undefined
                          }
                        />
                      </div>
                    </InlineStack>
                  </BlockStack>
                </Grid.Cell>

                <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 2, xl: 2 }}>
                  <BlockStack gap="200" align="center" inlineAlign="center">
                    {/* <div className="theme-btn pt-4"> */}

            <div className={` theme-btn pt-4 ${loadingDonationReport || !selectedProductId || !selectedDates.start || !selectedDates.end? 'gray-current-plan' : ''} `}>
                      <Button
                        onClick={fetchDonationReport}
                       disabled={loadingDonationReport || !selectedProductId || !selectedDates.start || !selectedDates.end}
                      >
                        Apply
                      </Button>
                    </div>
                  </BlockStack>
                </Grid.Cell>
              </Grid>

                {/* Report Chart */}
                <div style={{ height: "300px", backgroundColor: "#FFFFFF", padding: "20px" }}>
                  {loadingDonationReport ? (
                    <Box padding="400">
                      <Text as="span" alignment="center">Loading donation report...</Text>
                    </Box>
                  ) : (
                    <Line data={createDonationReportChartData()} options={donationReportChartOptions} />
                  )}
                </div>
              </BlockStack>
            </Box>

            <Box>
              <BlockStack gap="200">
                {/* Header with title only */}
                <Text variant="headingLg" as="h2" fontWeight="semibold">
                  Donations List
                </Text>

                {/* Controls row with Export button and Show entries */}
                <InlineStack>
                  <div className="theme-btn">
                  <Button
                    onClick={exportToExcel}
                    disabled={loadingReportList || !donationListData?.data?.orders?.length}
                  >
                    Export
                  </Button>
                  </div>
                </InlineStack>
                <InlineStack gap="200" align="end" blockAlign="center">
                  <Text as="span" variant="bodyLg">
                    Show
                  </Text>
                  <Box minWidth="80px">
                    <Select
                      label=""
                      options={entriesOptions}
                      value={entriesCount}
                      onChange={handleEntriesCountChange}
                    />
                  </Box>
                  <Text as="span" variant="bodyLg">
                    entries
                  </Text>
                </InlineStack>
                {/* Search section */}
                <BlockStack gap="200">
                  <Text as="span" variant="headingMd" fontWeight="medium">
                    Search
                  </Text>
                  <TextField
                    label=""
                    placeholder="Search by Order Id or Donation Name"
                    value={searchQuery}
                    onChange={setSearchQuery}
                    autoComplete="off"
                    prefix={<Image source={Search} alt="Search" />}
                  />
                </BlockStack>

<Text as="span" variant="bodyLg">
  {getEntriesText()}
</Text>

{createDonationRows().length !== 0 ? (
  <>
    <div className="custom-data-table-wrapper">
      <Box
        borderWidth="025"
        borderColor="border"
        borderRadius="200"
      >
        {loadingReportList ? (
          <div style={{ backgroundColor: "#ffffff", minHeight: "45vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <NestedLoader />
          </div>
        ) : (
          <div style={{ minHeight: "45vh" }}>
            <DataTable
              columnContentTypes={["text", "text", "text", "text"]}
              headings={[
                <Text key="orderId" as="span" alignment="center" variant="headingLg">
                  Order Id
                </Text>,
                <Text key="donationName" as="span" alignment="center" variant="headingLg">
                  Donation Name
                </Text>,
                <Text key="amount" as="span" alignment="center" variant="headingLg">
                  Amount
                </Text>,
                <Text key="date" as="span" alignment="center" variant="headingLg">
                  Date
                </Text>,
              ]}
              rows={donationListData?.data?.orders?.map((order, orderIndex) =>
                order.lineItems.map((lineItem, itemIndex) => [
                  <Box key={`order-${orderIndex}-${itemIndex}`}>
                    <a 
                      href={`${order?.redirectUrl}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'underline', color: '#6B46C1' }}
                    >
                      <Text as="span" alignment="center" variant="bodyLg">
                      {order?.orderNumber}
                      </Text>
                    </a>
                  </Box>,
                  <Box key={`product-${orderIndex}-${itemIndex}`}>
                    <Text as="span" alignment="center" variant="bodyLg">
                      {lineItem?.productName}
                    </Text>
                  </Box>,
                  <Box key={`price-${orderIndex}-${itemIndex}`}>
                    <Text as="span" alignment="center" variant="bodyLg">
                      {currency} {((lineItem?.price) * lineItem?.quantity).toFixed(2)}
                    </Text>
                  </Box>,
                  <Box key={`date-${orderIndex}-${itemIndex}`}>
                    <Text as="span" alignment="center" variant="bodyLg">
                      {new Date(order?.createdAt).toLocaleDateString()}
                    </Text>
                  </Box>,
                ])
              ).flat() || []}
              increasedTableDensity
            />
          </div>
        )}
      </Box>
    </div>

    {getTotalPages() > 1 && (
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          justifyContent: "end",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <Pagination
          hasPrevious={canGoPrevious()}
          hasNext={canGoNext()}
          onPrevious={handlePreviousPage}
          onNext={handleNextPage}
          label={`${donationListData?.data?.totalLineItemCount || 0} donations, Page ${currentPage} of ${getTotalPages()}`}
        />
      </div>
    )}
  </>
) : (
  donationListData?.data?.orders?.length === 0 && (
    <Box padding="400">
      <Text as="span" variant="bodyMd" tone="subdued" alignment="center">
        No donation data available
      </Text>
    </Box>
  )
)}
              </BlockStack>
            </Box>
          </BlockStack>
        </div>
      </Box>
  );
};

}
export default Reports;
