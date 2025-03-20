const express = require("express");
const http = require("http");
const cors = require("cors");
const { initializeSocket } = require("./socket");
const authRoutes = require("./routes/authRoutes");
const rpcRoutes = require("./routes/rpcRoutes");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/rpc", rpcRoutes);

initializeSocket(server);

server.listen(5000, () => console.log("Server running on port 5000"));
