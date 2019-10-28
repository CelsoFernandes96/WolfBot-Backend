const express = require("express");
const auth = require("../../middlewares/authentication");
const controller = require("../perfil/perfilController");

// eslint-disable-next-line func-names
module.exports = function(server) {
    const protectedRoutes = express.Router();
    const openRoutes = express.Router();

    protectedRoutes.use(auth);

    server.use("/api", protectedRoutes);
    server.use("/account", openRoutes);

    protectedRoutes.get("/profile/user", controller.getPerfiUser);
    protectedRoutes.post("/profile/save", controller.savePerfilUser);
    protectedRoutes.post("/profile/changepassword", controller.changePassword);
    protectedRoutes.post("/profile/deleteAccount", controller.deleteAccount);
    protectedRoutes.get("/profile/activities", controller.getActivities);
};
