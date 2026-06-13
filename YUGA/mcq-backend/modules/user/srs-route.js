import express from "express";
import { verifyToken } from "../shared/middleware/auth-middleware.js";
import { getDueItems, submitReview, initItem } from "./srs-controller.js";

const router = express.Router();

router.use(verifyToken);

router.get("/due", getDueItems);
router.post("/review", submitReview);
router.post("/init", initItem);

export default router;
