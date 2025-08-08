// Interface for store settings document
export interface IStoreSettings {
    shop: string;
    postPurchaseProduct: string | null;
    autoFulfillOrders: boolean;
    tagValue: string | null;
    requireShipping: boolean;
    applySalesTax: boolean;
    createdAt: Date;
    updatedAt: Date;
  }
  
  // Interface for store settings document with MongoDB _id
  export interface IStoreSettingsDocument extends IStoreSettings, Document {
    _id: string;
  }
  
  // Interface for creating store settings
  export interface ICreateStoreSettings {
    shop: string;
    postPurchaseProduct?: string;
    autoFulfillOrders?: boolean;
    requireShipping?: boolean;
    applySalesTax?: boolean;
  }
  
  // Interface for updating store settings
  export interface IUpdateStoreSettings {
    postPurchaseProduct?: string;
    autoFulfillOrders?: boolean;
    requireShipping?: boolean;
    applySalesTax?: boolean;
  }