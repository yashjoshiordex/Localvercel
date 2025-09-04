import { MongoClient } from "mongodb";

const MONGO_URI:string = process.env.DATABASE_URL || "mongodb://localhost:27017/shopify-app";

const client: MongoClient = new MongoClient(MONGO_URI);
export default client;
