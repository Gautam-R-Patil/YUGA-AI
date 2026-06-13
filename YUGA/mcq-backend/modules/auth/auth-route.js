import express from "express";
import {
  forgotPassword,
  getUserProfile,
  getUserProfileById,
  login,
  logout,
  resetPassword,
  signup,
  updateUserProfile,
  initiateSignup,
  verifyOTP,
  completeSignupController,
  resendOTP,
  verifyPasswordResetOTP,
} from "./auth-controller.js";
import { verifyToken } from "../shared/middleware/auth-middleware.js";
import { googleLogin } from "./google-auth-controller.js";

const router = express.Router();

// New multi-step signup routes
router.post("/signup/initiate", initiateSignup);
router.post("/signup/verify-otp", verifyOTP);
router.post("/signup/complete", completeSignupController);
router.post("/signup/resend-otp", resendOTP);

// Remove /auth prefix - it's already in server.js
router.get("/users/:id", verifyToken, getUserProfile);
router.post("/signup", signup);              // ✅ Changed from /auth/signup
router.post("/login", login);                // ✅ Changed from /auth/login
router.post("/logout", logout);              // ✅ Changed from /auth/logout
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyPasswordResetOTP);
router.post("/reset-password", resetPassword);
router.put("/users/:id", verifyToken, updateUserProfile);
router.post("/google-login", googleLogin);   // ✅ Changed
router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await getUserProfileById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        topic: user.topic,
        avatar: user.avatar,
        currentStreak: user.currentStreak || 0,
        progress: user.progress || {},
        preferences: user.preferences || {},
        class: user.class || null,
        membership: user.membership || { plan: 'basic', status: 'active' },
        xp: user.xp || 0,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Error in /me route:", err);
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;

