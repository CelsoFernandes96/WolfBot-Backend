const config = require("../../config");

const index = (req, res, next) =>
    res.status(200).json({
        application: "Wolfbot API",
        environment: config.environment,
    });

module.exports = { index };
