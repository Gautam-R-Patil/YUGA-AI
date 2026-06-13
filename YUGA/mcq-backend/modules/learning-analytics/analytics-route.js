/**
 * Analytics Routes
 * API routes for learning analytics
 */

import express from "express";
import {
    recordAttempt,
    recordBatchAttempts,
    getOverview,
    getTopicMastery,
    getStudyPath,
    getNextQuestions,
    getPerformanceTrends,
    getWeakAreas,
    markComplete,
    getPredictiveScore
} from "./analytics-controller.js";
import { verifyToken } from "../shared/middleware/auth-middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Record question attempt
router.post("/attempt", recordAttempt);

// Record multiple question attempts in batch
router.post("/batch-attempt", recordBatchAttempts);

// Get user analytics overview
router.get("/overview", getOverview);

// Get topic mastery breakdown for a subject
router.get("/mastery/:subject", getTopicMastery);

// Get personalized study path
router.get("/study-path", getStudyPath);

// Get next recommended questions
router.get("/next-questions", getNextQuestions);

// Get performance trends
router.get("/trends", getPerformanceTrends);

// Get weak areas
router.get("/weak-areas", getWeakAreas);

// Get predicted exam score
router.get("/predictive-score", getPredictiveScore);

// Mark daily recommendation as complete
router.post("/mark-complete", markComplete);

export default router;
