const io = require("socket.io-client");
const config = require("../../config");
const User = require("../../models/userModel");

const { ioConnection } = config;

const emitMessageToSocket = async (message, uid) => {
    const { sockets } = await User.findOne({ uid }).lean();
    const socket = io(ioConnection, {
        query: {
            user: uid,
            service: "API (EMIT EVENT)",
        },
    });

    socket.on("connect", () => {
        sockets.forEach((socketId) => {
            setTimeout(() => {
                socket.emit("updates", { ...message, socketId });
            }, 2000);
        });
    });
};

module.exports = emitMessageToSocket;
