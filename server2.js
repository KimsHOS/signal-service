const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
});

const PORT = process.env.PORT || 5000;

const users = new Map();

app.use(cors());
app.get("/", (req, res) => res.send("Server is running"));

io.on("connection", (socket) => {
  socket.emit("socketId", socket.id);

  socket.on("register", (username) => {
    const user = { id: socket.id, username, isAvailable: true };
    users.set(socket.id, user);
    io.emit("userList", Array.from(users.values()));
    console.log(`User registered: ${username} (ID: ${socket.id})`);
  });

  socket.on("updateAvailability", (isAvailable) => {
    const user = users.get(socket.id);
    if (user) {
      user.isAvailable = isAvailable;
      io.emit("userList", Array.from(users.values()));
    }
  });

  socket.on("getUserList", () => {
    socket.emit("userList", Array.from(users.values()));
  });


  socket.on("initiateCall", ({ targetId, signalData, senderId, senderName, mediaStatus }) => {
    io.to(targetId).emit("incomingCall", { signal: signalData, from: senderId, name: senderName, mediaStatus });
  });
  
  socket.on("answerCall", (data) => {
    socket.broadcast.emit("mediaStatusChanged", {
      mediaType: data.mediaType,
      isActive: data.mediaStatus,
    });
    io.to(data.to).emit("callAnswered", { signal: data.signal, userName: data.userName, mediaStatus: data.mediaStatus });
  });

  socket.on("changeMediaStatus", ({ mediaType, isActive }) => {
    socket.broadcast.emit("mediaStatusChanged", {
      mediaType,
      isActive,
    });
  });
  
  socket.on("terminateCall", ({ targetId }) => {
    io.to(targetId).emit("callTerminated");
  });

  socket.on("sendMessage", ({ targetId, message, senderName }) => {
    io.to(targetId).emit("receiveMessage", { message, senderName });
  });

  socket.on("disconnect", () => {
    users.delete(socket.id);
    io.emit("userList", Array.from(users.values()));
    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(PORT, "0.0.0.0", () => console.log(`Server is running on port ${PORT}`));