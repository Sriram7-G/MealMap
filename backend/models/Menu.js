const mongoose = require("mongoose");

const menuSchema = new mongoose.Schema(
    {
        provider: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 1000,
            default: ""
        },

        category: {
            type: String,
            required: true,
            enum: [
                "Wedding",
                "Birthday",
                "Corporate",
                "Festival",
                "Other"
            ]
        },

        pricePerPlate: {
            type: Number,
            required: true,
            min: 1
        },

        foodType: {
            type: String,
            required: true,
            enum: ["Vegetarian", "Non-Vegetarian", "Both"]
        },

        minGuests: {
            type: Number,
            required: true,
            min: 1,
            default: 10
        },

        imageUrl: {
            type: String,
            trim: true,
            default: ""
        },

        isAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Menu", menuSchema);