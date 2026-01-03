import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err);
  } finally {
    await client.close();
  }
}

main();
