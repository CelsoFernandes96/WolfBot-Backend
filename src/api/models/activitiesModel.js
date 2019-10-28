const mongoose = require("mongoose");

const activitiesSchema = new mongoose.Schema(
    {
        ip: { type: String },
        location: { type: String },
        osPlatform: { type: String },
        browser: { type: String },
        date: { type: String },
        userEmail: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("activities", activitiesSchema);
