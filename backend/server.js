const express = require("express");
const path = require("path");
const cors = require("cors");
const menuRoutes = require("./routes/menuRoutes");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const providerRoutes = require("./routes/providerRoutes");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);
app.use("/api/menus", menuRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Home page
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Test API
app.get("/api/status", (req, res) => {
    res.json({
        project: "MealMap",
        status: "Running",
        message: "MealMap backend is working!"
    });
});

// Connect to MongoDB
// Start server after connecting to MongoDB
const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`MealMap server running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Failed to start MealMap:", error.message);
        process.exit(1);
    }
};

startServer();