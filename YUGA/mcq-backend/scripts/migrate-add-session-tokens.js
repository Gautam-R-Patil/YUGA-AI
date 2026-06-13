#!/usr/bin/env node

/**
 * Migration Script: Add Session Tokens to Existing Users
 * 
 * This script adds sessionToken fields to all existing users in the database
 * who don't have one yet. This is necessary for the single-device enforcement
 * feature to work properly.
 * 
 * Run this script once after deploying the updated authentication system:
 * node scripts/migrate-add-session-tokens.js
 */

import mongoose, { connectMongo } from '../modules/shared/db/index.js';
import User from '../modules/shared/db/models/user_schema.js';

async function migrateUsers() {
    try {
        console.log('🔄 Starting migration: Adding sessionToken to users...\n');

        // Connect to database
        console.log('📡 Connecting to database...');
        await connectMongo();
        console.log('✅ Database connected\n');

        // Find all users without a sessionToken
        const usersWithoutToken = await User.find({
            $or: [
                { sessionToken: { $exists: false } },
                { sessionToken: null }
            ]
        });

        console.log(`📊 Found ${usersWithoutToken.length} users without sessionToken\n`);

        if (usersWithoutToken.length === 0) {
            console.log('✨ All users already have sessionToken. No migration needed.');
            process.exit(0);
        }

        // Update each user
        let updated = 0;
        let failed = 0;

        for (const user of usersWithoutToken) {
            try {
                // Set sessionToken to null (they'll get a new one on next login)
                user.sessionToken = null;
                await user.save({ validateBeforeSave: false });
                updated++;
                console.log(`✅ Updated user: ${user.email}`);
            } catch (err) {
                failed++;
                console.error(`❌ Failed to update user ${user.email}:`, err.message);
            }
        }

        console.log('\n' + '='.repeat(60));
        console.log('📈 Migration Summary:');
        console.log(`   Total users processed: ${usersWithoutToken.length}`);
        console.log(`   ✅ Successfully updated: ${updated}`);
        console.log(`   ❌ Failed: ${failed}`);
        console.log('='.repeat(60) + '\n');

        if (failed > 0) {
            console.error('⚠️  Some users failed to update. Please review the errors above.');
            await mongoose.connection.close();
            process.exit(1);
        } else {
            console.log('🎉 Migration completed successfully!\n');
            console.log('ℹ️  Users will receive new session tokens on their next login.');
            await mongoose.connection.close();
            process.exit(0);
        }

    } catch (error) {
        console.error('❌ Migration failed:', error);
        await mongoose.connection.close();
        process.exit(1);
    }
}

// Run migration
migrateUsers();
