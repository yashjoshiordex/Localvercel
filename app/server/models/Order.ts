import { redirect } from '@remix-run/node';
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  shop: { type: String, required: true, index: true },
  orderId: { type: String, required: true, unique: true },
  orderNumber:{ type: String, required: true, unique: true },
  fulfillmentStatus: { type: String, enum: ['unfulfilled', 'fulfilled', 'partial'], default: 'unfulfilled' },
  lineItems: [{
    id: String,
    productId: String,
    variantId: String,
    quantity: Number,
    price: String,
    vendor: String,
    productName:String,
    variantName: String,
  }],
  clientDetails: {
    id: {type: String, default: null},
    fullName: {type: String, default: null},
    email: {type: String, default: null},
  },
  redirectUrl: { type: String, default: null },
  CURRENCY_CODE: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);