import {
  Text,
  Box,
  BlockStack,
  InlineStack,
  Grid,
  Button,
  // Card,
  Select,
  TextField,
  DataTable,
  // Page,
  DatePicker,
  Popover,
  Image
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
// import Header from "./Header";
import {  useState } from "react";
// import { SearchIcon } from "@shopify/polaris-icons";
import Search from '../assets/images/SearchIcon.svg';
// import "../css/manageproduct.css";

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

// Exact area chart data matching the image curve
const areaChartData = {
  labels: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  datasets: [
    {
      data: [
        3200, 3800, 4200, 2800, 3200, 4800, 5200, 4900, 4300, 3900, 3600, 3400,
      ],
      fill: true,
      backgroundColor: (context: any) => {
        const chart = context.chart
        const { ctx, chartArea } = chart

        if (!chartArea) {
          return null
        }

        // Create linear gradient using your specified colors
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom)
        gradient.addColorStop(0, "#6C8ED0") // Top color
        gradient.addColorStop(0.5, "#6C8ED060") // Middle
        gradient.addColorStop(1, "#3C2FC900") // Bottom (transparent)

        return gradient
      },
    //   backgroundColor: "rgba(147, 167, 209, 0.4)", // Light purple/blue gradient
      borderColor: "#93A7D1", // Purple/blue border
      borderWidth: 2,
      tension: 0.4, // Smooth curves
      pointRadius: 0, // No visible points
      pointHoverRadius: 0,
    },
  ],
};

const areaChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      enabled: false,
    },
  },
  interaction: {
    intersect: false,
    mode: "index" as const,
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
          family:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        padding: 8,
      },
    },
    y: {
      grid: {
        display: true,
        color: "#F1F5F9",
        lineWidth: 1,
      },
      border: {
        display: false,
      },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
          family:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        stepSize: 1000,
        padding: 12,
        callback: (value: any) => (value === 0 ? "0" : value.toString()),
      },
      max: 6000,
      min: 0,
    },
  },
  elements: {
    line: {
      tension: 0.4,
    },
  },
};

// Report chart with exact styling
const reportChartData = {
  labels: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  datasets: [
    {
      label: "No Donation Found",
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      borderColor: "#10B981",
      backgroundColor: "#10B981",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
    },
  ],
};

const reportChartOptions = {
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
          family:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
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
      border: {
        display: false,
      },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
          family:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
      },
    },
    y: {
      grid: {
        display: true,
        color: "#E5E7EB",
        lineWidth: 1,
      },
      border: {
        display: false,
      },
      ticks: {
        color: "#6B7280",
        font: {
          size: 11,
          family:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        },
        stepSize: 0.2,
      },
      max: 1,
      min: -1,
    },
  },
};

const Reports = () => {

    const [selectedDates, setSelectedDates] = useState({
    start: new Date(2025, 6, 1), // July is month 6 (0-indexed)
    end: new Date(2025, 6, 10),
  });
    const [popoverActive, setPopoverActive] = useState(false);

  const togglePopover = () => setPopoverActive((active) => !active);
  const [entriesCount, setEntriesCount] = useState("10")
  const [searchValue, setSearchValue] = useState("")

  // const rows: string[][] = []

  const entriesOptions = [
    { label: "10", value: "10" },
    { label: "25", value: "25" },
    { label: "50", value: "50" },
  ]



  return (
      <Box background="bg-surface" paddingBlock="600">
        <div className="container">
          <BlockStack gap="600">
            {/* Top Metrics Cards - Using Grid with responsive columnSpan */}
            <Grid>
              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <Box paddingInlineEnd="300">
                  <div
                    style={{
                      backgroundColor: "#ECF1FB",
                      borderRadius: "2px",
                    }}
                  >
                    <Box padding="300">
                      <BlockStack gap="100" align="center">
                        <Text
                          as="h1"
                          variant="headingLg"
                          fontWeight="medium"
                          alignment="center"
                        >
                          Total Donations
                        </Text>
                        <Text
                          variant="headingXl"
                          as="p"
                          fontWeight="bold"
                          alignment="center"
                        >
                          $0.00
                        </Text>
                      </BlockStack>
                    </Box>
                  </div>
                </Box>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <Box paddingInlineEnd="300">
                  <div
                    style={{
                      backgroundColor: "#ECF1FB",
                      borderRadius: "2px",
                    }}
                  >
                    <Box padding="300">
                      <BlockStack gap="100" align="center">
                        <Text
                          as="h1"
                          variant="headingLg"
                          fontWeight="medium"
                          alignment="center"
                        >
                          Donors
                        </Text>
                        <Text
                          variant="headingXl"
                          as="p"
                          fontWeight="bold"
                          alignment="center"
                        >
                          14
                        </Text>
                      </BlockStack>
                    </Box>
                  </div>
                </Box>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <Box paddingInlineEnd="300">
                  <div
                    style={{
                      backgroundColor: "#ECF1FB",
                      borderRadius: "2px",
                    }}
                  >
                    <Box padding="300">
                      <BlockStack gap="100" align="center">
                        <Text
                          as="h1"
                          variant="headingLg"
                          fontWeight="medium"
                          alignment="center"
                        >
                          Average Donations
                        </Text>
                        <Text
                          variant="headingXl"
                          as="p"
                          fontWeight="bold"
                          alignment="center"
                        >
                          $0.00
                        </Text>
                      </BlockStack>
                    </Box>
                  </div>
                </Box>
              </Grid.Cell>

              <Grid.Cell columnSpan={{ xs: 6, sm: 3, md: 3, lg: 3, xl: 3 }}>
                <Box paddingInlineEnd="300">
                  <div
                    style={{
                      backgroundColor: "#ECF1FB",
                      borderRadius: "2px",
                    }}
                  >
                    <Box padding="300">
                      <BlockStack gap="100" align="center">
                        <Text
                          as="h1"
                          variant="headingLg"
                          fontWeight="medium"
                          alignment="center"
                        >
                          Completion Rate
                        </Text>
                        <Text
                          variant="headingXl"
                          as="p"
                          fontWeight="bold"
                          alignment="center"
                        >
                          36%
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
                <Line data={areaChartData} options={areaChartOptions} />
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
                      <Select
                        label=""
                        options={[
                          { label: "Please Select", value: "please-select" },
                        ]}
                        value="please-select"
                        onChange={() => {}}
                      />
                    </BlockStack>
                  </Grid.Cell>

                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}>
                    <BlockStack gap="200">
                      <Text as="span" variant="headingMd" fontWeight="regular">
                        Select Date Range
                      </Text>

                      {/* <Popover
  active={popoverActive}
  autofocusTarget="first-node"
  preferredAlignment="left"
  preferredPosition="below"
  fullWidth
  onClose={() => setPopoverActive(false)}
  activator={
    <InlineStack gap="200" onClick={togglePopover} align="stretch">
      <Box width="50%">
        <TextField
          label=""
          placeholder="Start Date"
          value={
            selectedDates.start
              ? selectedDates.start.toLocaleDateString()
              : ""
          }
          onFocus={togglePopover}
          onChange={() => {}}
          autoComplete="off"
          readOnly
        />
      </Box>
      <Box width="50%">
        <TextField
          label=""
          placeholder="End Date"
          value={
            selectedDates.end
              ? selectedDates.end.toLocaleDateString()
              : ""
          }
          onFocus={togglePopover}
          onChange={() => {}}
          autoComplete="off"
          readOnly
        />
      </Box>
    </InlineStack>
  }
>
  <DatePicker
    month={6}
    year={2025}
    onChange={(range) => {
      setSelectedDates(range);
      setPopoverActive(false);
    }}
    selected={selectedDates}
    allowRange
  />
</Popover> */}

                      {/* <Popover
  active={popoverActive}
  autofocusTarget="first-node"
  preferredAlignment="left"
  preferredPosition="below"
  fullWidth
  onClose={() => setPopoverActive(false)}
  activator={
    <InlineStack gap="200" align="stretch" wrap={false} style={{ width: '100%' }} onClick={togglePopover}>
      <Box style={{ flex: 1 }}>
        <TextField
          label=""
          placeholder="Start Date"
          value={
            selectedDates.start
              ? selectedDates.start.toLocaleDateString()
              : ""
          }
          onFocus={togglePopover}
          onChange={() => {}}
          autoComplete="off"
          readOnly
        />
      </Box>
      <Box style={{ flex: 1 }}>
        <TextField
          label=""
          placeholder="End Date"
          value={
            selectedDates.end
              ? selectedDates.end.toLocaleDateString()
              : ""
          }
          onFocus={togglePopover}
          onChange={() => {}}
          autoComplete="off"
          readOnly
        />
      </Box>
    </InlineStack>
  }
>
  <DatePicker
    month={6}
    year={2025}
    onChange={(range) => {
      setSelectedDates(range);
      setPopoverActive(false);
    }}
    selected={selectedDates}
    allowRange
  />
</Popover> */}

                      <Popover
                        active={popoverActive}
                        autofocusTarget="first-node"
                        preferredAlignment="left"
                        preferredPosition="below"
                        fullWidth
                        onClose={() => setPopoverActive(false)}
                        activator={
                          <div onClick={togglePopover}>
                            <InlineStack
                              gap="200"
                              // align="stretch"
                              wrap={false}
                            >
                              <div style={{ flex: 1 }}>
                                <TextField
                                  label=""
                                  placeholder="Start Date"
                                  value={
                                    selectedDates.start
                                      ? selectedDates.start.toLocaleDateString()
                                      : ""
                                  }
                                  onFocus={togglePopover}
                                  onChange={() => {}}
                                  autoComplete="off"
                                  readOnly
                                />
                              </div>
                              <div style={{ flex: 1 }}>
                                <TextField
                                  label=""
                                  placeholder="End Date"
                                  value={
                                    selectedDates.end
                                      ? selectedDates.end.toLocaleDateString()
                                      : ""
                                  }
                                  onFocus={togglePopover}
                                  onChange={() => {}}
                                  autoComplete="off"
                                  readOnly
                                />
                              </div>
                            </InlineStack>
                          </div>
                        }
                      >
                        <div
                          style={{
                            maxHeight: "none",
                            overflow: "visible",
                            padding: "8px",
                            background: "white",
                          }}
                        >
                          <DatePicker
                            month={6}
                            year={2025}
                            onChange={(range) => {
                              setSelectedDates(range);
                              setPopoverActive(false);
                            }}
                            selected={selectedDates}
                            allowRange
                          />
                        </div>
                      </Popover>
                    </BlockStack>
                  </Grid.Cell>

                  <Grid.Cell columnSpan={{ xs: 6, sm: 6, md: 2, lg: 2, xl: 2 }}>
                    <BlockStack
                      gap="200"
                      align="center"
                      inlineAlign="center"
                    >
                      <div className="theme-btn pt-4">
                        <Button>Apply</Button>
                      </div>
                    </BlockStack>
                  </Grid.Cell>
                </Grid>

                {/* Report Chart */}
                <div style={{ height: "300px", backgroundColor: "#FFFFFF" }}>
                  <Line data={reportChartData} options={reportChartOptions} />
                </div>
              </BlockStack>
            </Box>

            {/* Donations List Section */}

            {/* <Box padding="500">
                <BlockStack gap="500">
                  <InlineStack align="space-between">
                    <Text variant="headingMd" as="h2" fontWeight="semibold">
                      Donations List
                    </Text>
                    <Button variant="primary">Export</Button>
                  </InlineStack>

                  
                  <Grid>
                    <Grid.Cell
                      columnSpan={{ xs: 6, sm: 6, md: 4, lg: 4, xl: 4 }}
                    >
                      <InlineStack gap="200" blockAlign="center">
                        <Text variant="bodyMd">Show</Text>
                        <Box minWidth="80px">
                          <Select
                            label=""
                            options={[
                              { label: "10", value: "10" },
                              { label: "25", value: "25" },
                              { label: "50", value: "50" },
                            ]}
                            value="10"
                            onChange={() => {}}
                          />
                        </Box>
                        <Text variant="bodyMd">entries</Text>
                      </InlineStack>
                    </Grid.Cell>

                    <Grid.Cell
                      columnSpan={{ xs: 6, sm: 6, md: 8, lg: 8, xl: 8 }}
                    >
                      <BlockStack gap="200">
                        <Text variant="bodyMd" fontWeight="medium">
                          Search
                        </Text>
                        <TextField
                          label=""
                          value=""
                          onChange={() => {}}
                          autoComplete="off"
                        />
                      </BlockStack>
                    </Grid.Cell>
                  </Grid>

                  <Text variant="bodyMd" tone="subdued">
                    Showing 0 to 0 of 0 entries
                  </Text>

                  <DataTable
                    columnContentTypes={["text", "text", "text", "text"]}
                    headings={["Order Id", "Donation Name", "Amount", "Date"]}
                    rows={rows}
                    footerContent={
                      <Box padding="400">
                        <Text
                          variant="bodyMd"
                          tone="subdued"
                          alignment="center"
                        >
                          No data available in table
                        </Text>
                      </Box>
                    }
                  />

                  <InlineStack align="center">
                    <InlineStack gap="200">
                      <Button disabled>Previous</Button>
                      <Button disabled>Next</Button>
                    </InlineStack>
                  </InlineStack>
                </BlockStack>
              </Box> */}
            <Box>
              <BlockStack gap="200">
                {/* Header with title only */}
                <Text variant="headingLg" as="h2" fontWeight="semibold">
                  Donations List
                </Text>

                {/* Controls row with Export button and Show entries */}
                <InlineStack>
                  <div className="theme-btn">
                    <Button>Export</Button>
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
                      onChange={setEntriesCount}
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
                    value={searchValue}
                    onChange={setSearchValue}
                    autoComplete="off"
                    prefix={<Image source={Search} alt="Search" />}
                  />
                </BlockStack>

                {/* Entries count display */}
                <Text as="span" variant="bodyLg">
                  Showing 0 to 0 of 0 entries
                </Text>

                {/* Data table */}
                {/* <DataTable
          columnContentTypes={["text", "text", "text", "text"]}
          headings={["Order Id", "Donation Name", "Amount", "Date"]}
          rows={rows}
          footerContent={
            <Box padding="400">
              <Text variant="bodyMd" tone="subdued" alignment="center">
                No data available in table
              </Text>
            </Box>
          }
        /> */}
                {/* <Box borderWidth="025" borderColor="border" borderRadius="200">
          <DataTable
            columnContentTypes={["text", "text", "text", "text"]}
            headings={[
              <Text key="name" as="span" alignment="center">Name</Text>,
              <Text key="status" as="span" alignment="center">Status</Text>,
              <Text key="updated" as="span" alignment="center">Last Updated</Text>,
              <Text key="actions" as="span" alignment="center">Actions</Text>,
            ]}
            rows={data?.getProductsData?.data?.products?.map(
              (item: DonationProduct, index: number) => [
                
                // Name Cell
                
                <Box key={`title-${index}`}>
                  <Text as="span" alignment="center">{item.title}</Text>
                </Box>,
        
                // Status Cell
                <Box key={`status-${index}`}>
                  <Text
                    as="span"
                    alignment="center"
                    tone={item.isDeleted ? "critical" : "success"}
                  >
                    {item.isDeleted ? "Inactive" : "Active"}
                  </Text>
                </Box>,
        
                // Last Updated Cell
                <Box key={`updated-${index}`}>
                  <Text as="span" alignment="center">
                    {new Date(item.updatedAt).toLocaleString()}
                  </Text>
                </Box>,
        
           
                // Actions Cell
                <Box  key={`actions-${index}`} >
                   <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem" }}>
                  <Button 
                    variant="primary"
                     tone="critical"
                     textAlign="center"
                    onClick={() => {
                      setProductId(item.shopifyProductId);
                      setActive(true);
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                  variant="primary"
                    tone="success"
                    onClick={() => {
                      setModal({
                        ...model,
                        id: item.shopifyProductId,
                        isOpen: true,
                      });
                    }}
                  >
                    Edit
                  </Button>
                  </div>
                </Box>,
              ]
            )}
            increasedTableDensity
          />
          </Box> */}

                {/* <Box borderWidth="025" borderColor="border" borderRadius="200">
                  <DataTable
                    columnContentTypes={["text", "text", "text", "text"]}
                    headings={[
                      <Text key="name" as="span" alignment="center">
                        Order Id
                      </Text>,
                      <Text key="status" as="span" alignment="center">
                        Donation Name
                      </Text>,
                      <Text key="updated" as="span" alignment="center">
                        Amount
                      </Text>,
                      <Text key="actions" as="span" alignment="center">
                        Date
                      </Text>,
                    ]}
                    rows={[
                      [
                        // Name Cell
                        <Box key="title-0">
                          <Text as="span" alignment="center">
                            Donation A
                          </Text>
                        </Box>,

                        // Status Cell
                        <Box key="status-0">
                          <Text as="span" alignment="center" tone="success">
                            Active
                          </Text>
                        </Box>,

                        // Last Updated Cell
                        <Box key="updated-0">
                          <Text as="span" alignment="center">
                            24 Jul 2025, 12:30 PM
                          </Text>
                        </Box>,

                        // Actions Cell
                        <Box key="updated-1">
                          <Text as="span" alignment="center">
                            egdgdjsjj
                          </Text>
                        </Box>,
                      ],
                      [
                        <Box key="title-1">
                          <Text as="span" alignment="center">
                            Donation B
                          </Text>
                        </Box>,

                        <Box key="status-1">
                          <Text as="span" alignment="center" tone="critical">
                            Inactive
                          </Text>
                        </Box>,

                        <Box key="updated-1">
                          <Text as="span" alignment="center">
                            22 Jul 2025, 4:45 PM
                          </Text>
                        </Box>,

                        <Box key="updated-2">
                          <Text as="span" alignment="center">
                            egdgdjsjj
                          </Text>
                        </Box>,
                      ],
                    ]}
                    increasedTableDensity
                  />
                </Box> */}

                <div className="custom-data-table-wrapper">
                    <Box borderWidth="025" borderColor="border" borderRadius="200">
                       <DataTable
                columnContentTypes={["text", "text", "text", "text"]}
                headings={[
                  <Text key="name" as="span" alignment="center" fontWeight="bold">Order Id</Text>,
                  <Text key="status" as="span" alignment="center" fontWeight="bold">Donation Name</Text>,
                  <Text key="status" as="span" alignment="center" fontWeight="bold">Amount</Text>,
                  <Text key="status" as="span" alignment="center" fontWeight="bold">Date</Text>,
                ]}
                rows={[
                
                  [
                    <Box key="title-1">
                      <Text as="span" alignment="center">Total Donation Amount:</Text>
                    </Box>,
            <Box key="title-1">
                      <Text as="span" alignment="center">Total Donation Amount:</Text>
                    </Box>,
                    <Box key="status-1">
                      <Text as="span" alignment="center">total</Text>
                    </Box>                   
                    
                    ,
                    <Box key="title-1">
                      <Text as="span" alignment="center">Total Donation Amount:</Text>
                    </Box>
                    
                  ]
                ]}
                increasedTableDensity
              />
                    </Box>
                </div>

                {/* Pagination */}
                <InlineStack align="center">
                  <InlineStack gap="200">
                    <Button disabled>Previous</Button>
                    <div className="theme-btn">
                      <Button disabled>Next</Button>
                    </div>
                  </InlineStack>
                </InlineStack>
              </BlockStack>
            </Box>
          </BlockStack>
        </div>
      </Box>
  );
};

export default Reports;
