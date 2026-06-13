import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
  },
  topic: {
    type: String,
    enum: ["NEET", "JEE", "Both"],
    required: [true, "Topic is required"],
  },
  password: {
    type: String,
    required: false, // Not required initially - set in step 3 of signup
    minlength: 6,
  },
  confirmPassword: {
    type: String,
    required: false, // Not required initially - set in step 3 of signup
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Passwords do not match",
    },
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationOTP: {
    type: String,
    required: false,
  },
  emailVerificationExpires: {
    type: Date,
    required: false,
  },

  class: {
    type: String,
    enum: ["plus-one", "plus-two", "repeater"],
    required: false,
  },

  avatar: {
    type: String,
    required: false,
  },

  preferences: {
    learningStyle: {
      type: String,
      enum: ["visual", "auditory", "reading", "kinesthetic"],
      default: "visual",
    },
    difficulty: {
      type: String,
      enum: ["beginner", "easy", "intermediate", "hard"],
      default: "intermediate",
    },

    notifications: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ["light", "dark"],
      default: "light",
    },
  },
  progress: {
    currentStreak: {
      type: Number,
      default: 0,
    },
    longestStreak: {
      type: Number,
      default: 0,
    },
    completedLessons: [
      {
        lessonId: String,
        completedAt: Date,
      },
    ],
  },
  xp: {
    type: Number,
    default: 0,
  },
  badges: [
    {
      type: String,
    },
  ],
  pushSubscriptions: [
    {
      endpoint: String,
      keys: {
        p256dh: String,
        auth: String,
      },
    }
  ],
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Assessment Tracking
  dailyQuiz: {
    lastGenerated: { type: Date },
    questions: { type: Array, default: [] },
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    difficulty: { type: String },
    subject: { type: String },
    date: { type: String }, // Storing date string YYYY-MM-DD for easier day comparison
    expiresAt: { type: Date }
  },
  weeklyMock: {
    lastGenerated: { type: Date },
    questions: { type: Array, default: [] },
    score: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    difficulty: { type: String },
    weekNumber: { type: Number }, // Store week number to track weekly frequency
    year: { type: Number },
    expiresAt: { type: Date } // Explicit expiration time for Sunday midnight reset
  },

  sessionToken: {
    type: String,
    default: null,
    required: false,
  },

  // Premium Membership
  membership: {
    plan: {
      type: String,
      enum: ["free", "student", "pro", "premium"], // premium kept for legacy
      default: "free"
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active"
    },
    validUntil: {
      type: Date,
      default: null
    }
  },

  // Usage Statistics for limiting features
  usageStats: {
    doubtsAskedToday: {
      type: Number,
      default: 0
    },
    doubtsAskedThisWeek: {
      type: Number,
      default: 0
    },
    lastDoubtDate: {
      type: Date,
      default: null
    },
    ocrUsedToday: {
      type: Number,
      default: 0
    },
    lastOcrDate: {
      type: Date,
      default: null
    },
    papersGeneratedToday: {
      type: Number,
      default: 0
    },
    papersGeneratedThisWeek: {
      type: Number,
      default: 0
    },
    lastPaperGenDate: {
      type: Date,
      default: null
    }
  },
});

// ✅ Pre-save hook to hash password only if modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  this.confirmPassword = undefined; // remove confirmPassword from DB
  next();
});

const User = mongoose.model("User", userSchema);
export default User;
