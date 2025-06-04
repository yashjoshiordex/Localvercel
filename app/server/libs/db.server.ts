import mongoose from "mongoose";

const MONGODB_URI:string = process.env.DATABASE_URL!;
const MONGODB_DB_NAME = "Donate-Me";

export const connectToDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB_NAME,
    });
    console.log("✅ Mongoose connected successfully");
  } catch (error) {
    console.error("❌ Mongoose connection error:", error);
    throw error;
  }
};
