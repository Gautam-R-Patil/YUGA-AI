import express from "express";
import {
  getCourseById,
  getLessonById,
  getLessonsByCourse,
  listAll,
} from "./course-controller.js";
import { verifyToken } from "../shared/middleware/auth-middleware.js";

const router = express.Router();

// All course routes require authentication
router.get("/courses", verifyToken, listAll);
router.get("/courses/:id", verifyToken, getCourseById);
router.get("/courses/:id/lessons", verifyToken, getLessonsByCourse);
router.get("/lessons/:id", verifyToken, getLessonById);

export default router;
