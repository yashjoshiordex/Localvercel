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
    vendor: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);