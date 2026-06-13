import express from "express";
import { generateHash, verifyPayment, cancelSubscription } from "./payment-controller.js";
import { verifyToken } from "../shared/middleware/auth-middleware.js";

const router = express.Router();

router.post("/hash", verifyToken, generateHash);
router.post("/verify", verifyPayment); // Removed verifyToken for PayU redirect
router.post("/cancel", verifyToken, cancelSubscription);

export default router;
