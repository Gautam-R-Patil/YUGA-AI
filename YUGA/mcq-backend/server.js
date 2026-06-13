import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

// Import Routes
import db, { connectMongo } from "./modules/shared/db/index.js";
import authRoutes from "./modules/auth/auth-route.js";
import courseRoutes from "./modules/course/course-route.js";

import progressRoutes from "./modules/user/progress-route.js";
import voiceRoutes from "./modules/ai/voice-route.js";
import translationRoutes from "./modules/ai/translation-route.js";
import mcqRoutes from "./modules/assessment/mcq-route.js";
import paymentRoutes from "./modules/payment/payment-route.js";
import ocrRoutes from "./modules/ai/ocr-route.js";
import scheduleRoutes from "./modules/user/schedule-route.js";
import curriculumRoutes from "./modules/curriculum/curriculum-route.js";
import analysisRoutes from "./modules/analysis/analysis.js";
import learningAnalyticsRoutes from "./modules/learning-analytics/analytics-route.js";
import aiAssessmentRoutes from "./modules/ai-assessment/ai-assessment-route.js";
import gamificationRoutes from "./modules/user/gamification-route.js";
import srsRoutes from "./modules/user/srs-route.js";
import pushRoutes from "./modules/user/push-route.js";
import notificationRoutes from "./modules/user/notification-route.js";
import { verifyToken } from "./modules/shared/middleware/auth-middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Server starting...");
console.log("Project root (__dirname):", __dirname);
console.log("PORT:", process.env.PORT);
console.log("Mongo URI:", process.env.MONGO_URI ? "OK" : "NOT SET");

import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express();
const PORT = process.env.PORT || 8080;

// Security & Optimization Middleware
app.use(compression()); // Compress responses
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for dev flexibility; enable in prod with proper config
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Allow images to be loaded
  })
);

// Rate Limiting (Basic Protection)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests from this IP, please try again after 15 minutes",
});
app.use("/api", apiLimiter);

// Increase payload limit for audio data and translation
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// CORS Configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://soft-longma-c0dc57.netlify.app",
  "https://gray-pond-0c817cc10.3.azurestaticapps.net",
  "https://www.yugaai.app",
  process.env.FRONTEND_URL // Allow adding via env var
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // Check if origin matches a regex pattern if needed, or just strict match
        return callback(null, true); // For development convenience, allowing all. In strict prod, check array.
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

// Routes - Order matters! More specific routes first
app.use("/api/auth", authRoutes);
app.use("/api/course", courseRoutes);

app.use("/api/progress", progressRoutes);
app.use("/api/voice", voiceRoutes);
app.use("/api/mcq", mcqRoutes);
app.use("/api/ocr", ocrRoutes);
app.use("/api", translationRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/curriculum", curriculumRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/learning-analytics", learningAnalyticsRoutes);
app.use("/api/ai-assessment", aiAssessmentRoutes);
app.use("/api/user/gamification", gamificationRoutes);
app.use("/api/srs", srsRoutes);
app.use("/api/push", pushRoutes);
app.use("/api/notifications", notificationRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Serve Question Data (Practice & Mock Tests) - PROTECTED
app.use('/api/questions-data', verifyToken, express.static(path.join(__dirname, 'data', 'questions')));

// Serve One-Shot / Crash Course classroom JSON data statically - PROTECTED
// This powers the Crash Courses Classes UI without affecting existing curriculum endpoints.
app.use('/api/oneshorts', verifyToken, express.static(path.join(__dirname, 'data', 'classroom', 'oneshorts')));

// Serve static files in production (without wildcard route)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../mcq-frontend/dist');

  // Serve static files only
  app.use(express.static(buildPath));

  // Serve index.html for root and specific frontend routes (avoid wildcard)
  app.get("/", (req, res) => {
    try {
      res.sendFile(path.join(buildPath, 'index.html'));
    } catch (err) {
      console.error("Error serving index.html:", err);
      res.status(404).json({ message: 'Frontend not found' });
    }
  });
} else {
  app.get("/", (req, res) => {
    res.send("Welcome to the Yuga Backend!");
  });
}

// Handle unmatched API routes
app.use("/api", (req, res) => {
  res.status(404).json({ message: 'API route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', details: err.message });
});

const server = app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);

  // Connect to MongoDB asynchronously after server starts
  connectMongo()
    .then(() => console.log("MongoDB connected successfully"))
    .catch((err) => console.error("MongoDB connection error:", err));
});

// Increase timeout for long-running AI tasks (5 minutes)
server.timeout = 300000;
server.keepAliveTimeout = 300000;
server.headersTimeout = 301000;
// Force restart 12 - fixes applied to physics set2 and set3
