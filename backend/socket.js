const socketIo = require("socket.io");
const { saveMessage } = require("./services/chatservices");

const connectedUsers = {};

const initializeSocket = (server) => {
    const io = socketIo(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("register_user", (userId) => {
            connectedUsers[userId] = socket.id;
            console.log(`User ${userId} registered with socket ID ${socket.id}`);
        });

        socket.on("send_message", (msg) => {
            const { senderId, recipientId, text } = msg;
            if (!senderId || !recipientId || !text.trim()) return;

            const newMessage = { senderId, recipientId, text, time: new Date().toLocaleTimeString() };
            saveMessage(newMessage);

            if (connectedUsers[recipientId]) {
                io.to(connectedUsers[recipientId]).emit("receive_message", newMessage);
            }
        });

        socket.on("disconnect", () => {
            for (const userId in connectedUsers) {
                if (connectedUsers[userId] === socket.id) {
                    delete connectedUsers[userId];
                    console.log(`User ${userId} disconnected`);
                    break;
                }
            }
        });
    });

    return io;
};

module.exports = { initializeSocket };
