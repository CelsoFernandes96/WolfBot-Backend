const express = require("express");
const controller = require("./orderController");

module.exports = (server) => {
    const protectedRoutes = express.Router();
    server.use("/api/order", protectedRoutes);

    protectedRoutes.post("/buy", controller.buy);
    protectedRoutes.post("/sell", controller.sell);
    protectedRoutes.get("/historic", controller.getOrdersCloseByUserManual);
};
