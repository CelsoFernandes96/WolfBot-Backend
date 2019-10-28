const express = require("express");
const dashboardController = require("./dashboard.controller");

const routes = (server) => {
    const protectedRoutes = express.Router();

    server.use("/api/dashboard", protectedRoutes);
    protectedRoutes.get("/updateDashboard", dashboardController.dataDashboard);
};

module.exports = routes;
