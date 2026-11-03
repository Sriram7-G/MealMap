require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function promoteProvider() {
    try {
        const email = process.argv[2];

        if (!email) {
            console.error(
                "Usage: node scripts-promote-provider.js your-test-email@example.com"
            );
            process.exitCode = 1;
            return;
        }

        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from backend/.env");
        }

        await mongoose.connect(process.env.MONGODB_URI);

        const user = await User.findOne({
            email: email.toLowerCase().trim()
        });

        if (!user) {
            console.error("User not found. Register the account first.");
            process.exitCode = 1;
            return;
        }

        user.role = "provider";
        await user.save();

        console.log(`Provider role assigned to ${user.email}`);
    } catch (error) {
        console.error("Promotion failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.disconnect();
    }
}

promoteProvider();