const express = require("express");
const { JSONRPCServer } = require("json-rpc-2.0");
const { readData, writeData } = require("../utils/fileHandler");

const router = express.Router();
const CHAT_FILE = "./data/chat.json";
const USERS_FILE = "./data/users.json";

const rpcServer = new JSONRPCServer();

rpcServer.addMethod("getUsers", async () => readData(USERS_FILE));

rpcServer.addMethod("getMessages", async ({ senderId, recipientId }) => {
    const messages = readData(CHAT_FILE);
    return messages.filter(
        msg => (msg.senderId === senderId && msg.recipientId === recipientId) ||
               (msg.senderId === recipientId && msg.recipientId === senderId)
    );
});

router.post("/", async (req, res) => {
    const jsonRPCRequest = req.body;
    const jsonRPCResponse = await rpcServer.receive(jsonRPCRequest);
    res.json(jsonRPCResponse);
});

module.exports = router;
