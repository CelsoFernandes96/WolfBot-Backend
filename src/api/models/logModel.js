const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
    {
        logAction: { type: String },
        logEvent: { type: String },
        logMoeda: { type: String },
        logPrice: { type: String },
        previousPrice: { type: String },
        logInfoOne: { type: String },
        logInfoTwo: { type: String },
        logInfoThree: { type: String },
        date: { type: String },
        user: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("bot-logs", LogSchema);
