const express = require("express");
const controller = require("./configuration.controller");

module.exports = (server) => {
    const protectedRoutes = express.Router();
    server.use("/api/configuracao", protectedRoutes);

    protectedRoutes.get("/buscar", controller.get);
    protectedRoutes.post("/salvar", controller.post);
};
