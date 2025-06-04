// models/Product.ts
import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
    {
        shopifyProductId: { type: String, required: true, unique: true },
        title: { type: String, required: true },
        variantId: { type: String, required: true },
        // sku: { type: String, required: true },
        price: { type: Number, required: true },
        storeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Session",
            required: true,
        },
    },
    { timestamps: true }
);

export const Product =
    mongoose.models.Product || mongoose.model("Product", productSchema);
