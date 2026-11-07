
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const ServiceProvider = require("../models/ServiceProvider");

// CUSTOMER REGISTRATION
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters"
            });
        }

        const normalizedEmail = email.toLowerCase().trim();

        // Check both collections
        const existingUser = await User.findOne({
            email: normalizedEmail
        });

        const existingProvider = await ServiceProvider.findOne({
            email: normalizedEmail
        });

        if (existingUser || existingProvider) {
            return res.status(409).json({
                message: "An account with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: "user"
        });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


// CUSTOMER AND PROVIDER LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const normalizedEmail = email.toLowerCase().trim();

        // First check normal customer
        let account = await User.findOne({
            email: normalizedEmail
        });

        let role = "user";
        let accountName;

        if (account) {
            accountName = account.name;
        } else {
            // Then check service provider
            account = await ServiceProvider.findOne({
                email: normalizedEmail
            });

            if (account) {
                role = "provider";
                accountName = account.ownerName;
            }
        }

        if (!account) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            account.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        // Generate JWT using the correct collection's ID
        const token = jwt.sign(
            {
                id: account._id.toString(),
                role: role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: account._id,
                name: accountName,
                email: account.email,
                role: role
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};


module.exports = {
    registerUser,
    loginUser
};
