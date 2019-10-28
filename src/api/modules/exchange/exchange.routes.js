const express = require("express");
const controller = require("./exchange.controller");

module.exports = (server) => {
    const protectedRoutes = express.Router();
    server.use("/api/exchange", protectedRoutes);

    // PRIVATE METHODS
    protectedRoutes.get("/balance", controller.fetchBalance);
};
