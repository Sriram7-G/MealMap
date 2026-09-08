const bcrypt = require("bcryptjs");
const ServiceProvider = require("../models/ServiceProvider");
const User = require("../models/User");

const registerServiceProvider = async (req, res) => {
    try {
        const {
            businessName,
            ownerName,
            email,
            phone,
            password,
            confirmPassword,
            businessType,
            address,
            city,
            description
        } = req.body;

        if (
            !businessName ||
            !ownerName ||
            !email ||
            !phone ||
            !password ||
            !confirmPassword ||
            !businessType ||
            !address ||
            !city ||
            !description
        ) {
            return res.status(400).json({
                message: "All service provider fields are required"
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                message: "Please enter a valid email address"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                message: "Passwords do not match"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        const existingProvider = await ServiceProvider.findOne({
            email: normalizedEmail
        });

        if (existingProvider) {
            return res.status(409).json({
                message: "A service provider with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const serviceProvider = await ServiceProvider.create({
            businessName,
            ownerName,
            email: normalizedEmail,
            phone,
            password: hashedPassword,
            businessType,
            address,
            city,
            description
        });

        return res.status(201).json({
            message: "Service provider registered successfully",
            serviceProvider: {
                id: serviceProvider._id,
                businessName: serviceProvider.businessName,
                ownerName: serviceProvider.ownerName,
                email: serviceProvider.email,
                phone: serviceProvider.phone,
                businessType: serviceProvider.businessType,
                address: serviceProvider.address,
                city: serviceProvider.city,
                description: serviceProvider.description
            }
        });

    } catch (error) {
        console.error(
            "Service provider registration error:",
            error.message
        );

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    registerServiceProvider
};