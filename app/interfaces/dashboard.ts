 interface Plan {
  _id: string;
  name: string;
  price: number;
  trialDays: number;
  interval: string;
  features: string[];
}

interface MonthlyDonation {
  amount: number;
  quantity: number;
  orderCount: number;
}

export interface DashboardData {
  plan: Plan;
  allOrdersCount: number;
  monthlyOrdersCount: number;
  currentMonthDonation: {
    amount: number;
    quantity: number;
    orderCount: number;
  }
  yearlyOrdersCount: number;
  monthlyDonations: Record<string, MonthlyDonation>;
  lifeTimeDonation: {
    amount: number;
    quantity: number;
    orderCount: number;
  };
}
