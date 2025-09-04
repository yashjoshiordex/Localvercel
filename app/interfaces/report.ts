// Define types for API response
interface MonthlyData {
  month: string;
  totalPrice: number;
  orderCount: number;
  itemCount: number;
  averagePerItem: number;
}

export interface ReportData {
  overall: {
    totalPrice: number;
    averageDonation: number;
    orderCount: number;
    itemCount: number;
    totalClientCount: number;
    uniqueClientCount: number;
  };
  currentYear: {
    totalPrice: number;
    average: number;
    averageDonation: number;
    orderCount: number;
    itemCount: number;
  };
  monthlyData: MonthlyData[];
}

export interface DonationProduct {
  title: string;
  productId: string;
  variantId: string;
  price: number;
}

export interface DonationReportResponse {
  success: boolean;
  count: number;
  searchQuery: string;
  products: DonationProduct[];
}

interface MonthlyBreakdown {
  month: string;
  totalPrice: number;
}

export interface DonationReportData {
  monthlyBreakdown: MonthlyBreakdown[];
}
interface DonationListOrder {
  orderId: string;
  orderNumber: string;
  createdAt: string;
  lineItems: {
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    price: GLfloat;
    vendor: string;
    productName: string;
    _id: string;
  }[];
  redirectUrl: string;
}

export interface DonationListResponse {
  success: boolean;
  data: {
    orders: DonationListOrder[];
    totalLineItemCount: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}