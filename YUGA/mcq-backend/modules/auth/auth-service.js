import User from "../shared/db/models/user_schema.js";
import { generateToken } from "../shared/utils/generateToken.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import * as OTPService from "./otp-service.js";

// ====== NEW MULTI-STEP SIGNUP FLOW ======

/**
 * Step 1: Initiate signup - Create user with name, email, topic and send OTP
 */
export const initiateSignup = async ({ fullName, email, topic }) => {
    const lowercasedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: lowercasedEmail });
    if (existingUser) {
        throw { status: 409, message: "Email already registered" };
    }

    // Create user without password (will be set in step 3)
    const newUser = new User({
        fullName,
        email,
        topic,
        emailVerified: false,
    });

    await newUser.save({ validateBeforeSave: false });

    // Generate and send OTP
    const otp = OTPService.generateOTP();
    await OTPService.saveOTP(email, otp);
    await OTPService.sendOTPEmail(email, fullName, otp);

    return { message: "Verification code sent to your email" };
};

/**
 * Step 2: Verify email OTP
 */
export const verifyEmailOTP = async ({ email, otp }) => {
    const lowercasedEmail = email.toLowerCase();
    const user = await OTPService.verifyOTP(lowercasedEmail, otp);
    return { message: "Email verified successfully", emailVerified: true };
};

/**
 * Step 3: Complete signup - Set password and return auth token
 */
export const completeSignup = async ({ email, password }) => {
    const lowercasedEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercasedEmail });

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    if (!user.emailVerified) {
        throw { status: 400, message: "Email not verified. Please verify your email first." };
    }

    if (user.password) {
        throw { status: 400, message: "Password already set. Please use login instead." };
    }

    // Set password
    user.password = password;
    user.confirmPassword = password;

    // Generate unique session token for single-device enforcement
    const sessionToken = crypto.randomUUID();
    user.sessionToken = sessionToken;

    console.log(`🔑 SIGNUP: Generated sessionToken for ${user.email}: ${sessionToken}`);

    await user.save();

    // Generate token for auto-login
    const token = generateToken(user._id, sessionToken);

    return {
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            topic: user.topic,
            avatar: user.avatar,
            membership: user.membership,
            progress: user.progress,
            preferences: user.preferences,
        },
    };
};

/**
 * Password Reset - Step 1: Initiate reset by sending OTP
 */
export const initiatePasswordResetOTP = async (email) => {
    const lowercasedEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercasedEmail });
    if (!user) {
        throw { status: 404, message: "No account found with this email" };
    }

    // Generate and save OTP
    const otp = OTPService.generateOTP();
    await OTPService.saveOTP(email, otp);
    
    // Send OTP with password reset template
    await OTPService.sendOTPEmail(email, user.fullName, otp, true); // Added 'true' for isReset flag

    return { message: "Reset code sent to your email" };
};

/**
 * Password Reset - Step 2: Verify OTP
 */
export const verifyPasswordResetOTP = async ({ email, otp }) => {
    const lowercasedEmail = email.toLowerCase();
    // We can reuse the existing verifyOTP logic
    const user = await OTPService.verifyOTP(lowercasedEmail, otp);
    return { message: "Email verified successfully", emailVerified: true };
};

/**
 * Password Reset - Step 3: Complete reset by setting new password
 */
export const completePasswordResetOTP = async ({ email, password }) => {
    const lowercasedEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercasedEmail });

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    if (!user.emailVerified) {
        throw { status: 400, message: "Email not verified. Please verify your email first." };
    }

    // Set new password
    user.password = password;
    user.confirmPassword = password;

    // Reset password reset fields just in case they were used by the legacy flow
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // We might want to invalidate existing sessions
    const sessionToken = crypto.randomUUID();
    user.sessionToken = sessionToken;

    await user.save();

    return { message: "Password reset successfully. You can now login." };
};

/**
 * Resend OTP for email verification
 */
export const resendVerificationOTP = async (email) => {
    return await OTPService.resendOTP(email);
};

// ====== LEGACY CREATE USER (kept for backward compatibility) ======

// Create User
export const createUser = async ({ fullName, email, password, confirmPassword }) => {
    const lowercasedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: lowercasedEmail });
    if (existingUser) {
        throw { status: 409, message: "Email already registered" };
    }

    const newUser = new User({
        fullName,
        email,
        password,
        confirmPassword,
    });

    await newUser.save();
    return newUser;
};

// Authenticate User
export const authenticateUser = async ({ email, password }) => {
    if (!email || !password) {
        throw { status: 400, message: "Email and password are required" };
    }

    const lowercasedEmail = email.toLowerCase();
    console.log(`[AUTH] Login attempt for: ${lowercasedEmail}`);
    try {
        const user = await User.findOne({ email: lowercasedEmail });
        if (!user) {
            console.log(`[AUTH] User not found: ${lowercasedEmail}`);
            throw { status: 401, message: "Invalid credentials" };
        }

        console.log(`[AUTH] User found: ${user.email}, Hashed Password present: ${!!user.password}`);

        // Check if email is verified
        if (!user.emailVerified) {
            console.log(`[AUTH] Email not verified: ${lowercasedEmail}`);
            throw { status: 403, message: "Please verify your email before logging in" };
        }

        // Check if password is set (in case user didn't complete signup)
        if (!user.password) {
            throw { status: 400, message: "Please complete your signup by setting a password" };
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`[AUTH] Password match for ${lowercasedEmail}: ${isMatch}`);
        if (!isMatch) {
            throw { status: 401, message: "Invalid credentials" };
        }

        // Generate unique session token for single-device enforcement
        const sessionToken = crypto.randomUUID();
        user.sessionToken = sessionToken;
        await user.save({ validateBeforeSave: false });

        console.log(`🔑 LOGIN: Generated sessionToken for ${user.email}: ${sessionToken}`);

        // Return user with session token
        return { user, sessionToken };
    } catch (error) {
        // If it's already a status error, re-throw it
        if (error.status) {
            throw error;
        }
        // Otherwise, it's a database or other error
        console.error("Error in authenticateUser:", error);
        throw { status: 500, message: "Authentication service error" };
    }
};

// Generate Reset Token
export const generateResetToken = async (email) => {
    const lowercasedEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercasedEmail });
    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    return { user, resetToken };
};

// Send Reset Email
export const sendResetEmail = async (user, resetToken) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const frontendUrl = process.env.NODE_ENV === 'production'
        ? 'https://yugaai.app'
        : 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const mailOptions = {
        from: `"Yuga Platform" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: "Reset your password",
        html: `
      <p>Hello ${user.fullName || "User"},</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `,
    };

    await transporter.sendMail(mailOptions);
};

// Reset Password
export const resetUserPassword = async (token, newPassword) => {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
        throw { status: 400, message: "Invalid or expired token" };
    }

    user.password = newPassword;
    user.confirmPassword = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
};

// Get User Profile
export const getUserById = async (userId) => {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw { status: 400, message: "Invalid user ID format" };
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw { status: 404, message: "User not found" };
    }
    return user;
};

// Update User Profile
export const updateUser = async (userId, updates) => {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
        throw { status: 400, message: "Invalid user ID format" };
    }

    if ("password" in updates || "confirmPassword" in updates) {
        throw { status: 400, message: "Password updates not allowed in profile update" };
    }

    // Convert nested preferences to dot notation
    const mongoUpdates = { ...updates };
    if (mongoUpdates.preferences) {
        Object.keys(mongoUpdates.preferences).forEach(key => {
            mongoUpdates[`preferences.${key}`] = mongoUpdates.preferences[key];
        });
        delete mongoUpdates.preferences;
    }

    const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: mongoUpdates },
        { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
        throw { status: 404, message: "User not found" };
    }
    return updatedUser;
};
