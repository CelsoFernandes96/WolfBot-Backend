const express = require("express");
const controller = require("./botController");

module.exports = (server) => {
    const protectedRoutes = express.Router();

    server.use("/api/bot", protectedRoutes);
    protectedRoutes.post("/acionarRobo", controller.acionarRobo);
};
