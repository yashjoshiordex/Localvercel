export interface CreateDonationModalProps {
  open: boolean;
  onClose: () => void;
  id?: string | "";
  fetchPage?: Function;
  onProductAction?: (success: boolean, action: 'create' | 'edit', message?: string) => void;
  data?: DonationProduct; // Add this line
}

interface DonationProduct {
  _id: string;
  title: string;
  description: string;
  sku: string;
  price: number;
  minimumDonationAmount: number;
  shop: string;
  shopifyProductId: string;
  variantId: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  __v: number;
}

export interface IFormData {
  productId?: string;
  title: string;
  description: string;
  minimumDonationAmount: number | null;
  sku: number | null | string;
  presetvalue: any[];
  price: number | null;
  goalAmount: number | null;
}

// Add validation errors interface
export interface ValidationErrors {
  presetValues: string[];
}