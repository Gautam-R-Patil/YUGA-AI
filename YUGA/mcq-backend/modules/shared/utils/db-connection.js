import mongoose from "../db/index.js";

/**
 * Wait for MongoDB connection to be ready with timeout
 * @param {number} maxWait - Maximum time to wait in milliseconds (default: 5000ms)
 * @returns {Promise<void>}
 * @throws {Error} If connection is not ready within timeout
 */
export const waitForConnection = async (maxWait = 5000) => {
  // If already connected, return immediately
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const start = Date.now();
  const checkInterval = 100; // Check every 100ms

  return new Promise((resolve, reject) => {
    const checkConnection = () => {
      const elapsed = Date.now() - start;

      // If connection is ready, resolve
      if (mongoose.connection.readyState === 1) {
        resolve();
        return;
      }

      // If timeout exceeded, reject
      if (elapsed >= maxWait) {
        reject(
          new Error(
            `Database connection timeout after ${maxWait}ms. Current state: ${mongoose.connection.readyState}`
          )
        );
        return;
      }

      // Check again after interval
      setTimeout(checkConnection, checkInterval);
    };

    // Start checking
    checkConnection();
  });
};

/**
 * Check if database connection is available
 * @returns {boolean}
 */
export const isConnectionReady = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Get connection state as string for logging
 * @returns {string}
 */
export const getConnectionState = () => {
  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  return states[mongoose.connection.readyState] || "unknown";
};
