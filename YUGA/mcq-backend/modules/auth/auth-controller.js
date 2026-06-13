import { generateToken } from "../shared/utils/generateToken.js";
import * as AuthService from "./auth-service.js";
import mongoose from "../shared/db/index.js";
import { waitForConnection, getConnectionState } from "../shared/utils/db-connection.js";

// ====== NEW MULTI-STEP SIGNUP FLOW ======

// ✅ Step 1: Initiate Signup
export const initiateSignup = async (req, res) => {
  try {
    console.log("Initiate signup request:", req.body);
    const { fullName, email, topic } = req.body;

    if (!fullName || !email || !topic) {
      return res.status(400).json({ message: "Full name, email, and topic are required" });
    }

    if (!["NEET", "JEE", "Both"].includes(topic)) {
      return res.status(400).json({ message: "Topic must be NEET, JEE, or Both" });
    }

    const result = await AuthService.initiateSignup({ fullName, email, topic });
    res.status(200).json(result);
  } catch (error) {
    console.error("Initiate signup error:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Step 2: Verify OTP
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const result = await AuthService.verifyEmailOTP({ email, otp });
    res.status(200).json(result);
  } catch (error) {
    console.error("Verify OTP error:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Step 3: Complete Signup
export const completeSignupController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const result = await AuthService.completeSignup({ email, password });

    // Set cookie for session
    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      message: "Signup completed successfully",
      token: result.token,
      user: result.user,
    });
  } catch (error) {
    console.error("Complete signup error:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Resend OTP
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await AuthService.resendVerificationOTP(email);
    res.status(200).json(result);
  } catch (error) {
    console.error("Resend OTP error:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ====== LEGACY SIGNUP (kept for backward compatibility) ======

// ✅ Old Signup
export const signup = async (req, res) => {
  try {
    const newUser = await AuthService.createUser(req.body);
    const token = generateToken(newUser._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        topic: newUser.topic,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error(error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({ message: "Validation failed", errors });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Login Controller
export const login = async (req, res) => {
  try {
    // Validate input
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Check if JWT_SECRET is configured
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");
      return res.status(500).json({
        message: "Server configuration error. Please contact support."
      });
    }

    // Wait for database connection with retry (max 5 seconds)
    try {
      await waitForConnection(5000);
    } catch (dbError) {
      console.error("Database connection unavailable. State:", getConnectionState());
      return res.status(503).json({
        message: "Database temporarily unavailable. Please try again in a moment."
      });
    }

    const { user, sessionToken } = await AuthService.authenticateUser({ email, password });
    const token = generateToken(user._id, sessionToken);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        topic: user.topic,
        avatar: user.avatar,
        createdAt: user.createdAt,
        membership: user.membership,
        progress: user.progress,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    console.error("Error stack:", err.stack);
    console.error("Error details:", {
      message: err.message,
      name: err.name,
      status: err.status
    });

    // Handle status errors (from AuthService - these are authentication failures)
    if (err.status) {
      // Distinguish between authentication errors and database errors
      if (err.status === 401) {
        // This is a real authentication failure (invalid credentials)
        return res.status(401).json({ message: err.message || "Invalid credentials" });
      }
      // Other status errors (400, 404, etc.)
      return res.status(err.status).json({ message: err.message });
    }

    // Handle specific error types
    if (err.message && err.message.includes("JWT_SECRET")) {
      return res.status(500).json({
        message: "Server configuration error. Please contact support."
      });
    }

    // Handle database connection errors
    if (err.name === "MongoError" || err.name === "MongooseError" || err.message?.includes("Database connection")) {
      console.error("Database error during login. Connection state:", getConnectionState());
      return res.status(503).json({
        message: "Database temporarily unavailable. Please try again in a moment."
      });
    }

    // Generic server error
    res.status(500).json({
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  }
};

// ✅ Logout
export const logout = (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Forgot Password (Step 1: Send OTP)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const result = await AuthService.initiatePasswordResetOTP(email);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in forgotPassword:", err);
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Verify Password Reset OTP (Step 2)
export const verifyPasswordResetOTP = async (req, res) => {
  const { email, otp } = req.body;
  try {
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }
    const result = await AuthService.verifyPasswordResetOTP({ email, otp });
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in verifyPasswordResetOTP:", err);
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Reset Password Controller (Step 3: Set New Password)
export const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await AuthService.completePasswordResetOTP({ email, password });
    res.status(200).json(result);
  } catch (err) {
    console.error("Password reset error:", err);
    if (err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    // IDOR Check: Ensure user is only fetching their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "You are not authorized to view this profile" });
    }
    const user = await AuthService.getUserById(req.params.id);
    res.status(200).json(user);
  } catch (error) {
    console.error("Get User Profile Error:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Update User Profile
export const updateUserProfile = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Request body is empty" });
    }

    // IDOR Check: Ensure user is only updating their own profile
    if (req.user.id !== req.params.id) {
      return res.status(403).json({ message: "You are not authorized to update this profile" });
    }

    const updatedUser = await AuthService.updateUser(req.params.id, req.body);

    res.status(200).json({
      message: "Profile updated successfully",
      user: {
        ...updatedUser.toObject(),
        id: updatedUser._id,
      },
    });
  } catch (error) {
    console.error("Update User Profile Error:", error);
    if (error.status) {
      return res.status(error.status).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Get User Profile by ID (Utility function - kept for backward compatibility if needed elsewhere)
export const getUserProfileById = async (userId) => {
  return AuthService.getUserById(userId);
};
