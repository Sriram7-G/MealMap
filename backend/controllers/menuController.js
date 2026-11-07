
exports.getMenus = async (req, res) => {
    try {
        const filter = {
            isAvailable: true
        };

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

            filter.pricePerPlate = {
                $lte: maxPrice
            };
        }

        const menus = await Menu.find(filter)
            .populate("provider", "businessName ownerName email")
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
