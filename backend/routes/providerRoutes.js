const express = require("express");

const {
    registerServiceProvider
} = require("../controllers/providerController");

const router = express.Router();

router.post("/register", registerServiceProvider);

module.exports = router;