import crypto from "crypto";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import User from "../shared/db/models/user_schema.js";

/**
 * Generate a 6-digit numeric OTP
 */
export const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP before storing in database
 */
export const hashOTP = async (otp) => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(otp, salt);
};

/**
 * Send OTP via email
 */
export const sendOTPEmail = async (email, fullName, otp, isReset = false) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const subject = isReset ? "Password Reset - YUGA AI" : "Email Verification - YUGA AI";
    const title = isReset ? "Password Reset Request" : "Welcome to YUGA AI!";
    const message = isReset 
        ? "We received a request to reset your password. Use the code below to set a new password."
        : "Thank you for signing up! Please verify your email address to complete your registration.";

    const mailOptions = {
        from: `"YUGA AI" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: subject,
        html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { padding: 40px 30px; }
          .otp-box { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 32px; font-weight: bold; text-align: center; padding: 20px; border-radius: 8px; letter-spacing: 8px; margin: 30px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
          .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${title}</h1>
          </div>
          <div class="content">
            <p>Hi <strong>${fullName}</strong>,</p>
            <p>${message}</p>
            <p>Your verification code is:</p>
            <div class="otp-box">${otp}</div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>&copy; 2026 YUGA AI. All rights reserved.</p>
            <p>Empowering students with AI-powered learning</p>
          </div>
        </div>
      </body>
      </html>
    `,
    };

    await transporter.sendMail(mailOptions);
};

/**
 * Save OTP to user record
 */
export const saveOTP = async (email, otp) => {
    const hashedOTP = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    const lowercasedEmail = email.toLowerCase();

    const user = await User.findOneAndUpdate(
        { email: lowercasedEmail },
        {
            emailVerificationOTP: hashedOTP,
            emailVerificationExpires: expiresAt,
        },
        { new: true }
    );

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    return user;
};

/**
 * Verify OTP
 */
export const verifyOTP = async (email, otp) => {
    const lowercasedEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercasedEmail });

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    if (!user.emailVerificationOTP || !user.emailVerificationExpires) {
        throw { status: 400, message: "No verification code found. Please request a new one." };
    }

    // Check if OTP has expired
    if (Date.now() > user.emailVerificationExpires.getTime()) {
        throw { status: 400, message: "Verification code has expired. Please request a new one." };
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, user.emailVerificationOTP);
    if (!isValid) {
        throw { status: 400, message: "Invalid verification code" };
    }

    // Mark email as verified and clear OTP fields
    user.emailVerified = true;
    user.emailVerificationOTP = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return user;
};

/**
 * Resend OTP
 */
export const resendOTP = async (email) => {
    const lowercasedEmail = email.toLowerCase();
    const user = await User.findOne({ email: lowercasedEmail });

    if (!user) {
        throw { status: 404, message: "User not found" };
    }

    if (user.emailVerified) {
        throw { status: 400, message: "Email is already verified" };
    }

    // Generate new OTP
    const otp = generateOTP();
    await saveOTP(email, otp);
    await sendOTPEmail(email, user.fullName, otp);

    return { message: "Verification code sent successfully" };
};
