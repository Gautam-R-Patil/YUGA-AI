import express from "express";
import { getCourseProgress } from "./progress-controller.js";
import { verifyToken } from "../shared/middleware/auth-middleware.js";

const router = express.Router();

router.get("/courses/:courseId/progress", verifyToken, getCourseProgress);
export default router;
