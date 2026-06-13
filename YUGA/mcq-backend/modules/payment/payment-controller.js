import { generatePaymentHash, verifyPaymentHash } from "./payment-service.js";
import User from "../shared/db/models/user_schema.js";

export const generateHash = async (req, res) => {
    try {
        const { txnid, amount, productinfo, firstname, email } = req.body;

        if (!txnid || !amount || !productinfo || !firstname || !email) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const result = generatePaymentHash(txnid, amount, productinfo, firstname, email);

        res.status(200).json(result);
    } catch (error) {
        console.error("Error generating hash:", error);
        if (error.status) {
            return res.status(error.status).json({ message: error.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { txnid, amount, productinfo, firstname, email, status, hash } = req.body;
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

        // PayU sends the hash in the body of a POST redirect
        const isValid = verifyPaymentHash(txnid, amount, productinfo, firstname, email, status, hash);

        if (isValid && status === "success") {
            // Payment is successful and verified
            let user = await User.findOne({ email });

            // Fallback to searching by req.user.id if available (though unlikely on a direct redirect)
            if (!user && req.user) {
                user = await User.findById(req.user.id);
            }

            if (user) {
                // Extract plan from productinfo (e.g., PremiumMembership_student)
                let selectedPlan = "premium"; // fallback
                if (productinfo && productinfo.includes("_")) {
                    selectedPlan = productinfo.split("_")[1] || "premium";
                }

                user.membership = {
                    plan: selectedPlan,
                    status: "active",
                    // Adding 1 month validity as per the new tiered pricing (199/mo, 349/mo)
                    validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1))
                };
                await user.save();
                console.log(`✅ Granted ${selectedPlan.toUpperCase()} membership to user: ${user.email}`);
                
                // Redirect back to frontend with success param
                return res.redirect(`${frontendUrl}/?payment=success&plan=${selectedPlan}`);
            } else {
                console.warn(`⚠️ Payment verified but user not found for email: ${email}`);
                return res.redirect(`${frontendUrl}/?payment=user_not_found`);
            }
        } else {
            console.error(`❌ Payment verification failed. Valid: ${isValid}, Status: ${status}`);
            return res.redirect(`${frontendUrl}/?payment=failed&reason=${status}`);
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        // Ensure we redirection on crash too if possible
        const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
        res.redirect(`${frontendUrl}/?payment=error`);
    }
};

export const cancelSubscription = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.membership?.plan !== "premium") {
            return res.status(400).json({ message: "User does not have an active premium subscription" });
        }

        user.membership = {
            plan: "basic",
            status: "active",
            validUntil: null
        };

        await user.save();
        console.log(`❌ Cancelled PREMIUM membership for user: ${user.email}`);

        res.status(200).json({ status: "success", message: "Subscription cancelled successfully", user: user });
    } catch (error) {
        console.error("Error cancelling subscription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
