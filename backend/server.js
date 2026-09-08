const express = require("express");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const providerRoutes = require("./routes/providerRoutes");

const app = express();

const PORT = 3000;

// Middleware
app.use(express.json());

// Authentication routes
app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend")));

// Home route
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
connectDB();

app.listen(PORT, () => {
    console.log(`MealMap server running at http://localhost:${PORT}`);
});