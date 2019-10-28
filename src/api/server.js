const bodyParser = require("body-parser");
const express = require("express");
const consign = require("consign");
const helmet = require("helmet");
const chalk = require("chalk");
const firebase = require("firebase");
const admin = require("firebase-admin");
const cors = require("cors");

const adminFirebaseAccount = require("./certificates/firebase-admin-production.json");
const mongoose = require("./database/mongo");
const config = require("./config");

const app = express();
mongoose.createConnection();

firebase.initializeApp(config.firebase);

admin.initializeApp({
    credential: admin.credential.cert(adminFirebaseAccount),
    databaseURL: config.firebase.databaseURL,
});

// middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(helmet());

consign()
    .include("src/api/database")
    .then("src/api/certificates")
    .then("src/api/modules")
    .then("src/api/config")
    .into(app);

app.listen(Number(config.port), () =>
    console.log(`\n API: ${chalk.blue("Wolfbot API")}
 Running on port: ${chalk.blue(config.port)} 
 Environment: ${chalk.blue(config.environment)}`)
);
