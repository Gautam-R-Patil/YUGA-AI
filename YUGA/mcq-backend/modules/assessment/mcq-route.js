import express from "express";
import {
  getQuestionsBySubject,
  getAvailableSubjects,
  getSetsForSubject,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getAdminData,
  submitReport
} from "./mcq-controller.js";
import { verifyToken } from "../shared/middleware/auth-middleware.js";

const router = express.Router();

// Submit report
router.post("/admin/report", verifyToken, submitReport);

// Get admin overview data
router.get("/admin/data", verifyToken, getAdminData);

// Get questions by subject
router.get("/subject/:subject", verifyToken, getQuestionsBySubject);

// Get available sets for a subject
router.get("/subject/:subject/sets", verifyToken, getSetsForSubject);

// Get all available subjects
router.get("/subjects", getAvailableSubjects);

// Create new question
router.post("/", verifyToken, createQuestion);

// Update question by ID
router.put("/:id", verifyToken, updateQuestion);

// Delete question by ID
router.delete("/:id", verifyToken, deleteQuestion);

export default router;