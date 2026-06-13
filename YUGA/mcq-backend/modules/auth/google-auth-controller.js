import { verifyGoogleToken, findOrCreateUser } from "./google-auth-service.js";
import { generateToken } from "../shared/utils/generateToken.js";

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    const payload = await verifyGoogleToken(idToken);
    const user = await findOrCreateUser(payload);

    const token = generateToken(user._id);

    // Set cookie with proper production settings
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      message: "Google login successful",
      token,
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(401).json({ message: "Invalid Google token" });
  }
};
