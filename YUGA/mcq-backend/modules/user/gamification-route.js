import express from "express";
import { verifyToken } from "../shared/middleware/auth-middleware.js";
import {
    getGamificationStats,
    getLeaderboard,
    awardXp,
    awardBadge
} from "./gamification-controller.js";

const router = express.Router();

// Public/Semi-public routes
router.get("/leaderboard", getLeaderboard);

// Protected routes (require valid JWT)
router.use(verifyToken);
router.get("/stats", getGamificationStats);
router.post("/award-xp", awardXp);
router.post("/award-badge", awardBadge);

export default router;
