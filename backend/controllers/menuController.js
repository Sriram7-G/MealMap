const mongoose = require("mongoose");
const Menu = require("../models/Menu");

// Create a menu
exports.createMenu = async (req, res) => {
    try {
        const {
            name,
            description,
            category,
            pricePerPlate,
            foodType,
            minGuests,
            imageUrl,
            isAvailable
        } = req.body;

        if (!name || !category || !pricePerPlate || !foodType) {
            return res.status(400).json({
                message: "Name, category, price per plate, and food type are required."
            });
        }

        // Temporary integration: use the provider ID supplied by the
        // authenticated middleware or request body.
        const providerId = req.user.id;

        if (!providerId || !mongoose.isValidObjectId(providerId)) {
            return res.status(400).json({
                message: "A valid provider ID is required."
            });
        }

        const menu = await Menu.create({
            provider: providerId,
            name,
            description,
            category,
            pricePerPlate,
            foodType,
            minGuests,
            imageUrl,
            isAvailable
        });

        return res.status(201).json({
            message: "Menu created successfully.",
            menu
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid menu data.",
                error: error.message
            });
        }

        console.error("Create menu error:", error);

        return res.status(500).json({
            message: "Failed to create menu."
        });
    }
};

// Get all available menus (customer discovery)
exports.getMenus = async (req, res) => {
    try {
        const filter = { isAvailable: true };

        if (req.query.category) {
            filter.category = req.query.category;
        }

        if (req.query.foodType) {
            filter.foodType = req.query.foodType;
        }

        if (req.query.maxPrice !== undefined) {
            const maxPrice = Number(req.query.maxPrice);

            if (!Number.isFinite(maxPrice) || maxPrice < 0) {
                return res.status(400).json({
                    message: "maxPrice must be a valid non-negative number."
                });
            }

            filter.pricePerPlate = { $lte: maxPrice };
        }

        const menus = await Menu.find(filter)
            .populate("provider", "name")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: menus.length,
            menus
        });
    } catch (error) {
        console.error("Get menus error:", error);

        return res.status(500).json({
            message: "Failed to fetch menus."
        });
    }
};

// Get menus belonging to a specific provider
exports.getProviderMenus = async (req, res) => {
    try {
        const providerId = req.user.id;

        const menus = await Menu.find({ provider: providerId })
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: menus.length,
            menus
        });
    } catch (error) {
        console.error("Get provider menus error:", error);

        return res.status(500).json({
            message: "Failed to fetch provider menus."
        });
    }
};  
// Update a menu
exports.updateMenu = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid menu ID."
            });
        }

        const allowedFields = [
            "name",
            "description",
            "category",
            "pricePerPlate",
            "foodType",
            "minGuests",
            "imageUrl",
            "isAvailable"
        ];

        const updates = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) {
                updates[field] = req.body[field];
            }
        }

        const providerId = req.user.id;

        if (!providerId || !mongoose.isValidObjectId(providerId)) {
            return res.status(400).json({
                message: "A valid provider ID is required."
            });
        }

        const menu = await Menu.findOneAndUpdate(
            { _id: id, provider: providerId },
            { $set: updates },
            {
                new: true,
                runValidators: true
            }
        );

        if (!menu) {
            return res.status(404).json({
                message: "Menu not found for this provider."
            });
        }

        return res.status(200).json({
            message: "Menu updated successfully.",
            menu
        });
    } catch (error) {
        if (error.name === "ValidationError" || error.name === "CastError") {
            return res.status(400).json({
                message: "Invalid menu data.",
                error: error.message
            });
        }

        console.error("Update menu error:", error);

        return res.status(500).json({
            message: "Failed to update menu."
        });
    }
};

// Delete a menu
exports.deleteMenu = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({
                message: "Invalid menu ID."
            });
        }

        const providerId = req.user.id;

        if (!providerId || !mongoose.isValidObjectId(providerId)) {
            return res.status(400).json({
                message: "A valid provider ID is required."
            });
        }

        const menu = await Menu.findOneAndDelete({
            _id: id,
            provider: providerId
        });

        if (!menu) {
            return res.status(404).json({
                message: "Menu not found for this provider."
            });
        }

        return res.status(200).json({
            message: "Menu deleted successfully."
        });
    } catch (error) {
        console.error("Delete menu error:", error);

        return res.status(500).json({
            message: "Failed to delete menu."
        });
    }
};