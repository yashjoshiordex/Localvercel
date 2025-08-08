import type { Model} from "mongoose";
import mongoose, { Schema } from "mongoose";

interface DonationRecord {
  orderId: string;
  amount: number;
  donatedAt?: Date;
}

export interface DonationDocument extends mongoose.Document {
  shopDomain: string;
  totalDonation: number;
  donations: DonationRecord[];
  isAppUninstalled: boolean;
  createdAt: Date;
  updatedAt: Date;
  hasUsageChargeBeenApplied: boolean;
  lastChargedDonationAmount: number;
}

const DonationRecordSchema = new Schema<DonationRecord>({
  orderId: { type: String, required: true },
  amount: { type: Number, required: true },
  donatedAt: { type: Date, default: Date.now }, 
});

const DonationSchema = new Schema<DonationDocument>({
  shopDomain: { type: String, required: true, unique: true },
  totalDonation: { type: Number, default: 0 },
  donations: { type: [DonationRecordSchema], default: [] },
  isAppUninstalled: { type: Boolean, default: false },   // <-- New key added
  hasUsageChargeBeenApplied: { type: Boolean, default: false },
  lastChargedDonationAmount: { type: Number, default: 0 },
}, {
  timestamps: true,
});

const Donation: Model<DonationDocument> = mongoose.models.Donation || mongoose.model<DonationDocument>('Donation', DonationSchema);

export default Donation;