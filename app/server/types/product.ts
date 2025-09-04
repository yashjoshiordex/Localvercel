export interface CreateProductParams {
  shopifyProductId: string;
  title: string;
  variantId: string;
  sku?: string;
  description: string;
  price: number;
  goalAmount?: number | null;
  shop:string
  minimumDonationAmount?: number | null;
  status: string;
}

export interface ProductDocument {
  _id: string;
  shopifyProductId: string;
  title: string;
  variantId: string;
  sku: string;
  description?: string;
  price: number;
  storeId: string;
  minimumDonationAmount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: number | null;
  prevPage: number | null;
}

export interface ProductApiResponse {
  success: boolean;
  data: {
    products: ProductDocument[];
    pagination: ProductPagination;
    shop: {
      name: string;
    };
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  debug?: any;
}

// types/product.ts

// export interface CreateProductParams {
//     shopifyProductId: string;
//     title: string;
//     variantId: string;
//     sku: string;
//     description: string;
//     price: number;
//     storeId: string;
//     minimumDonationAmount?: number | null;
// }

export interface UpdateProductParams {
    productId: string;
    title?: string;
    name?: string;
    description?: string;
    sku?: string;
    minimumDonationAmount?: number;
    shopName?: string;
    price: number;
    goalAmount?: number | null;
    presetValue?: number[] | null;
    status?: string;
}



// export interface ProductApiResponse {
//     success: true;
//     data: {
//         products: ProductDocument[];
//         pagination: {
//             currentPage: number;
//             pageSize: number;
//             totalCount: number;
//             totalPages: number;
//             hasNextPage: boolean;
//             hasPrevPage: boolean;
//             nextPage: number | null;
//             prevPage: number | null;
//         };
//         shop: {
//             name: string;
//             storeId: string;
//         };
//     };
// }

export interface ErrorResponse {
    success: false;
    error: string;
}