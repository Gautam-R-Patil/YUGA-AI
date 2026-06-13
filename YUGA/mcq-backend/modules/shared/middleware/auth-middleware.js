import jwt from "jsonwebtoken";
import User from "../db/models/user_schema.js";

export const verifyToken = async (req, res, next) => {
  let token = req.cookies?.token;

  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access Denied: No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = { id: decoded.id || decoded._id || decoded.userId };

    if (!req.user.id) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Validate session token for single-device enforcement (MANDATORY)
    // If token doesn't have sessionToken, it's an old token and must be refreshed
    if (!decoded.sessionToken) {
      console.log(`❌ INVALID TOKEN for user ${req.user.id}: No sessionToken in JWT (old token)`);
      return res.status(401).json({
        message: "Session expired. Please log in again.",
        error: "SESSION_EXPIRED"
      });
    }

    try {
      const user = await User.findById(req.user.id).select('sessionToken');

      if (!user) {
        return res.status(401).json({
          message: "User not found",
          error: "INVALID_USER"
        });
      }

      // Check if the session token in JWT matches the current active session
      if (user.sessionToken !== decoded.sessionToken) {
        console.log(`❌ SESSION CONFLICT for user ${req.user.id}: JWT has "${decoded.sessionToken}", DB has "${user.sessionToken}"`);
        return res.status(401).json({
          message: "Session expired. This account is logged in on another device.",
          error: "SESSION_EXPIRED"
        });
      }
      console.log(`✅ SESSION VALID for user ${req.user.id}: ${decoded.sessionToken}`);
    } catch (dbError) {
      console.error("Database error during session validation:", dbError);
      return res.status(500).json({
        message: "Session validation failed",
        error: "SESSION_VALIDATION_ERROR"
      });
    }

    next();
  } catch (error) {
    // Handle different JWT errors more gracefully
    if (error.name === 'TokenExpiredError') {
      // Only log if in development mode to reduce noise in production
      if (process.env.NODE_ENV === 'development') {
        console.warn("Token expired:", error.expiredAt);
      }
      return res.status(401).json({
        message: "Token expired",
        error: "TOKEN_EXPIRED",
        expiredAt: error.expiredAt
      });
    } else if (error.name === 'JsonWebTokenError') {
      console.error("Invalid JWT token:", error.message);
      return res.status(401).json({
        message: "Invalid token",
        error: "INVALID_TOKEN"
      });
    } else {
      console.error("Token verification error:", error);
      return res.status(401).json({
        message: "Token verification failed",
        error: "TOKEN_ERROR"
      });
    }
  }
};
