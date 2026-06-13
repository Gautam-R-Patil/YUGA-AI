import { OAuth2Client } from "google-auth-library";
import User from "../shared/db/models/user_schema.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (idToken) => {
    const ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
};

export const findOrCreateUser = async (payload) => {
    const { sub: googleId, email, name } = payload;
    const lowercasedEmail = email.toLowerCase();
    let user = await User.findOne({ email: lowercasedEmail });

    if (!user) {
        user = await User.create({
            fullName: name,
            email,
            googleId,
            password: "",
        });
    }
    return user;
};
