const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    date: { type: Date, require: true },
    amount: { type: Number, require: true },
    price: { type: Number, require: true },
    cost: { type: Number, require: true },
    currency: { type: String, require: true },
    type_operation: { type: String, fromd: true },
    action: { type: String, require: true },
    user: { type: String, fromd: true },
    identifier: { type: String, fromd: true },
    status: { type: String, require: true },
});

module.exports = mongoose.model("order", orderSchema);
