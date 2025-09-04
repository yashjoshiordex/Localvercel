import mongoose, { Document, Model } from "mongoose";

// 1. Define the TypeScript interface for the EmailConfig document
export interface IEmailConfig extends Document {
  shop: string;
  cc: string[];
  template?: string | null;
  templateType: "default" | "custom";
  isActive: boolean;
  fromEmail?: string;
  subject?: string; // Add subject field
  createdAt: Date;
  updatedAt: Date;
}

// 2. Define the schema as before
const EmailConfigSchema = new mongoose.Schema<IEmailConfig>({
  shop: { 
    type: String, 
    required: true, 
    unique: true,
    index: true
  },
  cc: [{ 
    type: String,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email address in CC field'
    }
  }],
  template: { 
    type: String,
    required: false,
    default: null
  },
  templateType: {
    type: String,
    enum: ['default', 'custom'],
    default: 'default'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  fromEmail: {
    type: String,
    validate: {
      validator: function(email: string) {
        return !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid from email address'
    }
  },
  subject: {
    type: String,
    default: 'Donation Receipt'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 3. Export the typed model
export const EmailConfig: Model<IEmailConfig> = 
  mongoose.models.EmailConfig as Model<IEmailConfig> || 
  mongoose.model<IEmailConfig>("EmailConfig", EmailConfigSchema);