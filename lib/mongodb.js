import mongoose from "mongoose";
import chalk from "chalk";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/ibm-skillsbuild";

if (!MONGODB_URI) {
  throw new Error("⚠️ Please define the MONGODB_URI environment variable");
}

// Cache the connection in global variable, this is used to prevent hot-reload
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const isSrv = MONGODB_URI.startsWith("mongodb+srv://");

    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      ...(isSrv ? {} : { directConnection: true }),
    }).then((mongoose) => {
      console.log(chalk.green.bold.underline("✅ MongoDB connected (Vercel)"));
      return mongoose;
    }).catch((err) => {
      cached.promise = null; // Reset on failure
      console.error(chalk.red("❌ MongoDB connection failed:"), err.message);
      throw err;
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default connectDB;
