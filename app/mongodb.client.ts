import { env } from "env.server";
import { MongoClient } from "mongodb";

const MONGO_URI:string = env.DATABASE_URL;

const client: MongoClient = new MongoClient(MONGO_URI);
export default client;
