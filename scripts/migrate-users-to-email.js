/**
 * Migration script to help existing phone-based users add email addresses
 *
 * This script:
 * 1. Lists all users without email addresses
 * 2. Provides a way to manually add emails to existing users
 *
 * Usage:
 * node scripts/migrate-users-to-email.js [action] [userId] [email]
 *
 * Actions:
 * - list: List all users without email
 * - add: Add email to a user (requires userId and email)
 *
 * Examples:
 * node scripts/migrate-users-to-email.js list
 * node scripts/migrate-users-to-email.js add 507f1f77bcf86cd799439011 user@example.com
 */

import mongoose from "mongoose";
import User from "../models/User.js";
import dbConnect from "../lib/mongodb.js";

async function listUsersWithoutEmail() {
  await dbConnect();

  const usersWithoutEmail = await User.find({
    $or: [{ email: { $exists: false } }, { email: null }, { email: "" }],
  }).select("_id name phone role createdAt");

  console.log("\n=== Users without email addresses ===");
  console.log(`Total: ${usersWithoutEmail.length}\n`);

  if (usersWithoutEmail.length === 0) {
    console.log("All users have email addresses! ✅");
    return;
  }

  usersWithoutEmail.forEach((user, index) => {
    console.log(`${index + 1}. ID: ${user._id}`);
    console.log(`   Name: ${user.name}`);
    console.log(`   Phone: ${user.phone || "N/A"}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Created: ${user.createdAt}`);
    console.log("");
  });

  console.log("\nTo add an email to a user, run:");
  console.log("node scripts/migrate-users-to-email.js add <userId> <email>");
}

async function addEmailToUser(userId, email) {
  await dbConnect();

  // Validate email format (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error("❌ Invalid email format");
    process.exit(1);
  }

  const user = await User.findById(userId);
  if (!user) {
    console.error(`❌ User with ID ${userId} not found`);
    process.exit(1);
  }

  if (user.email) {
    console.log(`⚠️  User already has an email: ${user.email}`);
    console.log(
      "Do you want to update it? (This script doesn't support updates - do it manually)"
    );
    process.exit(1);
  }

  // Check if email is already taken
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    console.error(
      `❌ Email ${email} is already taken by user ${existingUser._id}`
    );
    process.exit(1);
  }

  user.email = email.toLowerCase();
  user.emailVerified = false; // Require email verification
  await user.save();

  console.log(`✅ Email ${email} added to user ${user.name} (${user._id})`);
  console.log("⚠️  User will need to verify their email address");
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0];

  if (!action) {
    console.log("Usage:");
    console.log("  node scripts/migrate-users-to-email.js list");
    console.log(
      "  node scripts/migrate-users-to-email.js add <userId> <email>"
    );
    process.exit(1);
  }

  if (action === "list") {
    await listUsersWithoutEmail();
  } else if (action === "add") {
    const userId = args[1];
    const email = args[2];

    if (!userId || !email) {
      console.error("❌ Missing userId or email");
      console.log(
        "Usage: node scripts/migrate-users-to-email.js add <userId> <email>"
      );
      process.exit(1);
    }

    await addEmailToUser(userId, email);
  } else {
    console.error(`❌ Unknown action: ${action}`);
    console.log("Available actions: list, add");
    process.exit(1);
  }

  await mongoose.connection.close();
  process.exit(0);
}

main().catch((error) => {
  console.error("❌ Migration error:", error);
  process.exit(1);
});
