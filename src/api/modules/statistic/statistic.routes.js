const express = require("express");
const controller = require("./statistic.controller");

module.exports = (server) => {
    const protectedRoutes = express.Router();
    server.use("/api/statistic", protectedRoutes);

    protectedRoutes.get("/getOrderPerDay", controller.graphicOrderPerDay);
    protectedRoutes.get("/getProfitPerDay", controller.graphicProfitPerDay);
    protectedRoutes.get("/getTotalOrden", controller.graphicTotalOrden);
};
