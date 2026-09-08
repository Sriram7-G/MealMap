const mongoose = require("mongoose");

const serviceProviderSchema = new mongoose.Schema(
    {
        businessName: {
            type: String,
            required: true,
            trim: true
        },

        ownerName: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        phone: {
            type: String,
            required: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        },

        businessType: {
            type: String,
            required: true,
            enum: [
                "Caterer",
                "Restaurant",
                "Bakery",
                "Event Food Service",
                "Other"
            ]
        },

        address: {
            type: String,
            required: true,
            trim: true
        },

        city: {
            type: String,
            required: true,
            trim: true
        },

        description: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "ServiceProvider",
    serviceProviderSchema
);