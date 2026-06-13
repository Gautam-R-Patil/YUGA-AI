import jwt from "jsonwebtoken";

// Generate and optionally set token as a cookie
export const generateToken = (userId, sessionToken = null, res = null) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured. Please set JWT_SECRET environment variable.");
  }

  if (!userId) {
    throw new Error("User ID is required to generate token");
  }

  const payload = { userId };

  // Add session token to payload if provided
  if (sessionToken) {
    payload.sessionToken = sessionToken;
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // If res is provided, set the cookie
  if (res) {
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Automatically secure in prod
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  return token;
};
