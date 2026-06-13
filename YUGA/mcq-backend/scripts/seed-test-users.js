import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// User Schema (copied from user_schema.js)
const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    topic: { type: String, enum: ["NEET", "JEE"], required: true },
    password: { type: String, required: false, minlength: 6 },
    confirmPassword: { type: String, required: false },
    emailVerified: { type: Boolean, default: false },
    emailVerificationOTP: { type: String, required: false },
    emailVerificationExpires: { type: Date, required: false },
    class: { type: String, enum: ["plus-one", "plus-two", "repeater"], required: false },
    avatar: { type: String, required: false },
    preferences: {
        learningStyle: { type: String, enum: ["visual", "auditory", "reading", "kinesthetic"], default: "visual" },
        difficulty: { type: String, enum: ["beginner", "easy", "intermediate", "hard"], default: "intermediate" },
        notifications: { type: Boolean, default: true },
        theme: { type: String, enum: ["light", "dark"], default: "light" },
    },
    progress: {
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        weeklyGoal: { type: Number, default: 5 },
        completedLessons: [{ lessonId: String, completedAt: Date }],
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
});

// Pre-save hook to hash password
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.confirmPassword = undefined;
    next();
});

const User = mongoose.model("User", userSchema);

// Test users configuration
const testUsers = [
    {
        fullName: "Sourav R",
        email: "sourav.r@yugaai.app",
        topic: "JEE",
        password: "Test@123",
        emailVerified: true,
    },
    {
        fullName: "Arpita M",
        email: "arpita.m@yugaai.app",
        topic: "NEET",
        password: "Test@123",
        emailVerified: true,
    },
    {
        fullName: "CEO YUGA",
        email: "ceo@yugaai.app",
        topic: "JEE",
        password: "Test@123",
        emailVerified: true,
    },
    {
        fullName: "Test User",
        email: "test@yugaai.app",
        topic: "NEET",
        password: "Test@123",
        emailVerified: true,
    },
];

async function seedTestUsers() {
    try {
        // Connect to MongoDB
        console.log("Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✓ Connected to MongoDB");

        // Check and create each user
        for (const userData of testUsers) {
            // Check if user already exists
            const existingUser = await User.findOne({ email: userData.email });

            if (existingUser) {
                console.log(`⚠ User ${userData.email} already exists - skipping`);
                continue;
            }

            // Create new user
            const newUser = new User({
                fullName: userData.fullName,
                email: userData.email,
                topic: userData.topic,
                password: userData.password,
                confirmPassword: userData.password,
                emailVerified: userData.emailVerified,
            });

            await newUser.save();
            console.log(`✓ Created user: ${userData.email}`);
        }

        console.log("\n✅ Test users seeded successfully!");
        console.log("\nCredentials for all test accounts:");
        console.log("Password: Test@123\n");
        console.log("Accounts created:");
        testUsers.forEach(user => {
            console.log(`  - ${user.email} (${user.fullName}, ${user.topic})`);
        });

    } catch (error) {
        console.error("❌ Error seeding users:", error);
    } finally {
        // Close connection
        await mongoose.connection.close();
        console.log("\n✓ Database connection closed");
        process.exit(0);
    }
}

// Run the seed function
seedTestUsers();
