import mongoose, { Schema, Document, Model } from 'mongoose';


/* 🔷 Plan Schema           */
const planSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    interval: {
      type: String,
      required: true,
      enum: ['EVERY_30_DAYS', 'ANNUAL'],
    },
    trialDays: { type: Number, default: 0 },
    features: [{ type: String }],
    popular: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

planSchema.virtual('stringId').get(function () {
  return this._id.toString();
});

/* 🔷 Plan TypeScript Interface */
export interface IPlan extends Document {
  id: string;
  name: string;
  price: number;
  interval: 'EVERY_30_DAYS' | 'ANNUAL';
  trialDays: number;
  features: string[];
  popular?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}


/* 🔷 Plan Model Export     */
export const Plan: Model<IPlan> =
  mongoose.models.Plan || mongoose.model<IPlan>('Plan', planSchema);
