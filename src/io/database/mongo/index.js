const mongoose = require("mongoose");
const chalk = require("chalk");
const config = require("../../config");

mongoose.Promise = global.Promise;

const createConnection = () => {
    mongoose.connect(config.mongo.connection, { useNewUrlParser: true, auth: { authdb: "admin" } });
    const db = mongoose.connection;

    db.on("error", console.error.bind(console, "connection error"));
    db.once("open", () => console.log(` Connected to dabase: ${chalk.blue("Mongodb")} \n`));
};

module.exports = { createConnection };
