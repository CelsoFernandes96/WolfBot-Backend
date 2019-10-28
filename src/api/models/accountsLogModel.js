const mongoose = require("mongoose");

const accountLogSchema = new mongoose.Schema(
    {
        user: { type: String, require: false },
        verifiedEmail: { type: Boolean, require: true },
        expirationDate: { type: Date, default: null },
        verificationDate: { type: Date, fromd: true },
        logType: { type: String, default: true },
        pending: { type: Boolean, default: true },
        uid: { type: String, required: true },
        code: { type: String },
    },
    {
        timestamps: true,
        versionKey: false,
    }
);

module.exports = mongoose.model("accounts-logs", accountLogSchema);
