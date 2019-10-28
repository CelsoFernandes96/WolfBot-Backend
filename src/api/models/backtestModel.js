const mongoose = require("mongoose");

const backtestSchema = new mongoose.Schema({
    dateTest: { type: Date, require: true },
    cost: { type: Number },
    currency: { type: String },
    ordersBuy: [],
    ordersSell: [],
    profit: { type: Number },
    percentage: { type: Number },
    user: { type: String },
});

module.exports = mongoose.model("backtest", backtestSchema);
