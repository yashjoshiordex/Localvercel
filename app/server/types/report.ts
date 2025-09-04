export interface AggregateResult {
  _id: any;
  totalPrice: number;
  orderCount: number;
  itemCount: number;
}

export interface ClientCountResult {
  _id: null;
  totalClientCount: number;
  uniqueClientCount: number;
}

export interface MonthlyAggregateResult {
  _id: number;
  totalPrice: number;
  orderCount: number;
  itemCount: number;
}

// Types for response data
export interface MonthData {
  month: string;
  totalPrice: number;
  orderCount: number;
  itemCount: number;
  averagePerItem: number;
}

export interface StatsData {
  totalPrice: number;
  average?: number;
  averageDonation: number;
  orderCount: number;
  itemCount: number;
  totalClientCount?: number; // Added field for total clients
  uniqueClientCount?: number; // Added field for unique clients
}

export interface ReportResponse {
  success: boolean;
  data?: {
    overall: StatsData;
    currentYear: StatsData;
    monthlyData: MonthData[];
  };
  error?: string;
}

export interface OrderWithProducts {
  orderId: string;
  orderNumber: string;
  createdAt: Date;
  clientDetails?: {
    id: string | null;
    fullName: string | null;
    email: string | null;
  };
  lineItems: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    price: string;
    vendor: string;
    productName: string;
  }>;
}

export interface ApiResponse {
  success: boolean;
  data?: {
    orders: OrderWithProducts[];
    totalCount: number;
    page: number;
    limit: number;
  };
  error?: string;
}
