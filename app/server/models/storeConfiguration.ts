import mongoose from 'mongoose';
import { IStoreSettingsDocument } from '../types/store';

const storeConfigurationSchema = new mongoose.Schema<IStoreSettingsDocument>({
  shop: { type: String, required: true, unique: true },
  postPurchaseProduct: { type: String, default: null },
  autoFulfillOrders: { type: Boolean, default: false },
  requireShipping: { type: Boolean, default: false },
  applySalesTax: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const StoreConfiguration = mongoose.model<IStoreSettingsDocument>('StoreSettings', storeConfigurationSchema);
export default StoreConfiguration;