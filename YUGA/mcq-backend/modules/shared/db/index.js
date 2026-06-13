import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Mongoose connection options defined below and used in connectMongo() export
// MongoDB connection options to handle timeouts and network issues
const mongoOptions = {
  serverSelectionTimeoutMS: 30000, // 30 seconds timeout for server selection
  socketTimeoutMS: 45000, // 45 seconds timeout for socket operations
  connectTimeoutMS: 30000, // 30 seconds timeout for initial connection
  maxPoolSize: 50, // Maximum number of connections in the pool (increased for production)
  minPoolSize: 2, // Minimum number of connections in the pool (increased for better availability)
  retryWrites: true, // Enable retryable writes
  retryReads: true, // Enable retryable reads
  // Additional options for better connection stability
  heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds to keep connection alive
  maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
};

// Export connection function for async connection after server starts
export function connectMongo() {
  return mongoose
    .connect(process.env.MONGO_URI, mongoOptions)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Error connecting to MongoDB:", err);
      throw err;
    });
}

export default mongoose;