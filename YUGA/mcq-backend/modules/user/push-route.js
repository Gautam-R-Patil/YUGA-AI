import express from "express";
import { verifyToken } from "../shared/middleware/auth-middleware.js";
import { saveSubscription, removeSubscription } from "./push-controller.js";

const router = express.Router();

router.use(verifyToken);

router.post("/subscribe", saveSubscription);
router.post("/unsubscribe", removeSubscription);

export default router;
