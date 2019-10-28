/* eslint-disable func-names */
const express = require("express");
const consign = require("consign");
const http = require("http");
const socket = require("socket.io");
const chalk = require("chalk");
const mongoose = require("./database/mongo");
const config = require("./config");
const User = require("./models/userModel");

const app = express();
mongoose.createConnection();

consign()
    .include("src/io/database")
    .then("src/io/config")
    .into(app);

const server = http.Server(app);
const io = socket(server);

io.on("connection", async function(socket) {
    console.log(
        `User connect to socket - socket id: ${socket.id}, Connections: ${
            io.engine.clientsCount
        }, User: ${socket.handshake.query.user}, Service: ${socket.handshake.query.service}`
    );

    if (socket.handshake.query.user) {
        const user = await User.findOne({ uid: socket.handshake.query.user }).lean();

        await User.findOneAndUpdate(
            { uid: socket.handshake.query.user },
            { sockets: [...user.sockets, socket.id] }
        );
    }

    socket.on("updates", async function(input) {
        await io.to(input.socketId).emit("updates", { ...input });
    });

    socket.on("disconnect", async function() {
        if (socket.handshake.query.user) {
            const userBySocket = await User.findOne({ sockets: { $in: [socket.id] } }).lean();

            console.log(
                `User disconnect to socket - socket id: ${socket.id}, Connections: ${
                    io.engine.clientsCount
                } User: ${userBySocket.uid}`
            );

            await User.findOneAndUpdate(
                { uid: userBySocket.uid },
                { sockets: userBySocket.sockets.filter((id) => id !== socket.id) }
            );
        } else console.log(`API disconnect to socket - socket id: ${socket.id}, Connections: ${io.engine.clientsCount}`);
    });
});

server.listen(Number(config.port), () =>
    console.log(`\n Server: ${chalk.blue("Wolfbot IO")}
Running on port: ${chalk.blue(config.port)} 
Environment: ${chalk.blue(config.environment)}`)
);
