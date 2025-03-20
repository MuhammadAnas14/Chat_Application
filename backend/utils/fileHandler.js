const fs = require("fs");

const readData = (file) => {
    try {
        const data = fs.readFileSync(file, "utf8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeData = (file, data) => {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };
