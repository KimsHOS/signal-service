const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000", // Restrict to client URL
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

const users = new Map();

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:3000" }));
app.get("/", (req, res) => res.send("Server is running"));

io.on("connection", (socket) => {
  socket.emit("socketId", socket.id);

  socket.on("register", (username) => {
    if (typeof username !== "string" || username.trim().length === 0) {
      socket.emit("error", { message: "Invalid username" });
      return;
    }
    const user = { id: socket.id, username: username.trim(), isAvailable: true };
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
    if (!users.has(targetId)) {
      socket.emit("error", { message: "Target user not found" });
      return;
    }
    io.to(targetId).emit("incomingCall", {
      signal: signalData,
      from: senderId,
      name: senderName,
      mediaStatus,
    });
  });

  socket.on("answerCall", (data) => {
    if (!users.has(data.to)) {
      socket.emit("error", { message: "Target user not found" });
      return;
    }
    // Send media status to the caller only
    io.to(data.to).emit("mediaStatusChanged", {
      mediaType: "both",
      isActive: data.mediaStatus,
    });
    io.to(data.to).emit("callAnswered", {
      signal: data.signal,
      userName: data.userName,
      mediaStatus: data.mediaStatus,
    });
  });

  socket.on("changeMediaStatus", ({ mediaType, isActive }) => {
    // Broadcast to all connected clients except sender
    socket.broadcast.emit("mediaStatusChanged", {
      mediaType,
      isActive,
    });
  });

  socket.on("terminateCall", ({ targetId }) => {
    if (users.has(targetId)) {
      io.to(targetId).emit("callTerminated", { reason: "Call ended by user" });
    }
  });

  socket.on("sendMessage", ({ targetId, message, senderName }) => {
    if (typeof message !== "string" || message.trim().length === 0) {
      socket.emit("error", { message: "Invalid message" });
      return;
    }
    if (!users.has(targetId)) {
      socket.emit("error", { message: "Target user not found" });
      return;
    }
    io.to(targetId).emit("receiveMessage", { message: message.trim(), senderName });
  });

  socket.on("disconnect", () => {
    const user = users.get(socket.id);
    users.delete(socket.id);
    io.emit("userList", Array.from(users.values()));
    if (user) {
      console.log(`User disconnected: ${user.username} (ID: ${socket.id})`);
    }
  });
});

server.listen(PORT, "0.0.0.0", () => console.log(`Server is running on port ${PORT}`));
