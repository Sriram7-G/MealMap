const express = require("express");
const router = express.Router();

const {
    createMenu,
    getMenus,
    getProviderMenus,
    updateMenu,
    deleteMenu
} = require("../controllers/menuController");

const {
    authenticateToken,
    requireProvider
} = require("../middleware/authMiddleware");

// Public: customers can browse available menus
router.get("/", getMenus);

// Protected: providers can manage their own menus
router.get(
    "/mine",
    authenticateToken,
    requireProvider,
    getProviderMenus
);

router.post(
    "/",
    authenticateToken,
    requireProvider,
    createMenu
);

router.put(
    "/:id",
    authenticateToken,
    requireProvider,
    updateMenu
);

router.delete(
    "/:id",
    authenticateToken,
    requireProvider,
    deleteMenu
);

module.exports = router;