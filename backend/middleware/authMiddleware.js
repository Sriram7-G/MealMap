const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
        if (!process.env.JWT_SECRET) {
        console.error("JWT_SECRET is not configured.");

        return res.status(500).json({
            message: "Authentication service is not configured."
        });
    }
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Authentication token required."
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = {
            id: decoded.id,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired authentication token."
        });
    }
};

const requireProvider = (req, res, next) => {
    if (req.user?.role !== "provider") {
        return res.status(403).json({
            message: "Only catering providers can manage menus."
        });
    }

    next();
};

module.exports = {
    authenticateToken,
    requireProvider
};