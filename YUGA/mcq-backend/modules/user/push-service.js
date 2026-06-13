import webpush from 'web-push';
import User from '../shared/db/models/user_schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Setup web-push
const publicVapidKey = process.env.VAPID_PUBLIC_KEY || 'BM2gq2O5gN_QjYj3_zK9r3W5V_d5i_r_X4L_S9X_s9i_W_F32K33_D3J1F3g_x9g5z5o5F9g9g2Z9K5j9o5K9_D_';
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || 'D_3F3g_x9g5z5o5F9g9g2Z9K5j9o5K9_D_3F3g_x9g5z5o5F9g9g2Z9K5j9o5K9';

webpush.setVapidDetails(
    'mailto:test@test.com',
    publicVapidKey,
    privateVapidKey
);

/**
 * Send a notification to all subscribed users
 * @param {string} title 
 * @param {string} body 
 * @param {string} url 
 */
export const sendBroadcastNotification = async (title, body, url = '/') => {
    try {
        const payload = JSON.stringify({
            title,
            body,
            url,
            icon: '/icon-192x192.png'
        });

        // Find all users who have at least one subscription
        const users = await User.find({ 'pushSubscriptions.0': { $exists: true } });

        console.log(`Sending notification to ${users.length} users`);

        let successCount = 0;
        let failCount = 0;

        for (const user of users) {
            for (const subscription of user.pushSubscriptions) {
                try {
                    await webpush.sendNotification(subscription, payload);
                    successCount++;
                } catch (error) {
                    // If subscription is invalid/expired, we should ideally remove it here
                    if (error.statusCode === 410 || error.statusCode === 404) {
                        user.pushSubscriptions = user.pushSubscriptions.filter(s => s.endpoint !== subscription.endpoint);
                        await user.save();
                    }
                    failCount++;
                }
            }
        }

        console.log(`Notification Results: ${successCount} sent, ${failCount} failed`);
        return { success: true, sent: successCount, failed: failCount };

    } catch (error) {
        console.error("Error broadcasting push notification:", error);
        return { success: false, error: error.message };
    }
};
