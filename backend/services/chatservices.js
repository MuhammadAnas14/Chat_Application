const { readData, writeData } = require("../utils/fileHandler");
const CHAT_FILE = "./data/chat.json";

const saveMessage = (message) => {
    let messages = readData(CHAT_FILE);
    messages.push(message);
    writeData(CHAT_FILE, messages);
};

module.exports = { saveMessage };
