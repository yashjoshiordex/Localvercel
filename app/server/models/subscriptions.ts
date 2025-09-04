import mongoose, { Schema, Document, Model, Types } from 'mongoose';

/* 🔷 Subscription Schema        */
const subscriptionSchema = new Schema(
  {
    shop: {
      type: String,
      required: true,
      index: true,
    },
    planId: {
      type: Schema.Types.ObjectId,
      ref: 'subscriptionPlans',
      required: true,
    },
    chargeId: { type: String, required: false , default:null },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired', 'frozen'],
      default: 'active',
      required: true,
    },
    currentPeriodEnd: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

subscriptionSchema.virtual('stringId').get(function () {
  return this._id.toString();
});

/* 🔷 Subscription TypeScript Interface  */
export interface ISubscription extends Document {
  shop: string;
  planId: Types.ObjectId;
  chargeId: string | null;
  status: 'active' | 'cancelled' | 'expired' | 'frozen';
  currentPeriodEnd: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/* 🔷 Subscription Model Export     */
export const Subscription: Model<ISubscription> =
  (mongoose.models &&mongoose.models.Subscription) ||
  mongoose.model<ISubscription>('Subscription', subscriptionSchema);
