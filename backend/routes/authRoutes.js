const express = require("express");
const { readData, writeData } = require("../utils/fileHandler");

const router = express.Router();
const USERS_FILE = "./data/users.json";

router.post("/signup", (req, res) => {
    const { id, name, email, password } = req.body;
    let users = readData(USERS_FILE);

    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "User already exists" });
    }

    users.push({ id, name, email, password });
    writeData(USERS_FILE, users);

    res.json({ message: "Signup successful" });
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;
    let users = readData(USERS_FILE);

    const user = users.find(user => user.email === email && user.password === password);
    if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
    }

    res.json({ message: "Login successful", user });
});

module.exports = router;
