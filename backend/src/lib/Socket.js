import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

export function getReciverSocketId(userId){
    return userSocketMap[userId]
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id; // <-- use square brackets

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Listen for disconnect for this socket
  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);

    // remove user from map
    for (const [key, value] of Object.entries(userSocketMap)) {
      if (value === socket.id) {
        delete userSocketMap[key];
        break;
      }
    }

    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { server, io, app };
