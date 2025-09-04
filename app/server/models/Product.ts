// models/Product.ts
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        shopifyProductId: { type: String, required: true },
        title: { type: String, required: true },
        variantId: { type: String, required: true,unique: true },
        sku: { type: String, default: null },
        description: { type: String, required: true },
        price: { type: Number, required: true },
        minimumDonationAmount: { type: Number, default: null },
        goalAmount: { type: Number, default: null },
        presetValue: { type: [Number], default: [] }, 
        shop: { type: String, required: true },
        isDeleted: { type: Boolean, default: false },
        status: { type: String, default: "ACTIVE", enum: ["ACTIVE", "DRAFT", null] },
        isVariant: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);
