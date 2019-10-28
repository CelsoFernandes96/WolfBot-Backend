const express = require("express");
const controller = require("./backtest.controller");

module.exports = (server) => {
    const protectedRoutes = express.Router();
    server.use("/api/backtest", protectedRoutes);

    protectedRoutes.post("/testConfiguration", controller.testSetup);
    protectedRoutes.get("/getBacktest", controller.getBacktest);
};
