import express from "express";
import { Server } from "socket.io";
import { createServer } from "http";
import mongoose from "mongoose";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

const app = express();

// Middlewares
app.use(cors({ origin: "http://localhost:5173",methods:['POST','PUT','GET','DELETE', 'PATCH'], credentials: true }));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// MongoDB Local Connection
const DB = "mongodb://127.0.0.1:27017/chatapp"; // Local DB URL
mongoose.connect(DB)
  .then(() => console.log("✅ MongoDB connected locally"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const PORT = process.env.PORT || 3000;
const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

global.onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  // User login
  socket.on("login", (user) => {
    onlineUsers.set(user.uid, socket.id);
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  // Sending message
  socket.on("send message", (msg) => {
    const sendTo = onlineUsers.get(msg.receiver);
    if (sendTo) socket.to(sendTo).emit("message received", msg);
  });

  // Voice call request
  socket.on("request-voice-call", (details) => {
    const sendTo = onlineUsers.get(details.to);
    if (sendTo) socket.to(sendTo).emit("incoming-voice-call", details);
  });

  // Video call request
  socket.on("request-video-call", (details) => {
    const sendTo = onlineUsers.get(details.to);
    if (sendTo) socket.to(sendTo).emit("incoming-video-call", details);
  });

  // Call reject
  socket.on("reject-call", (details) => {
    const sendTo = onlineUsers.get(details.to);
    if (sendTo) socket.to(sendTo).emit("rejected-call");
  });

  // ICE candidate exchange
  socket.on("ice-candidate", ({ to, candidate }) => {
    const sendTo = onlineUsers.get(to);
    if (sendTo) socket.to(sendTo).emit("ice-candidate", { candidate });
  });

  // SDP Offer
  socket.on("sdp-offer", ({ to, offer }) => {
    const sendTo = onlineUsers.get(to);
    if (sendTo) socket.to(sendTo).emit("sdp-offer", { offer });
  });

  // SDP Answer
  socket.on("sdp-answer", ({ to, answer }) => {
    const sendTo = onlineUsers.get(to);
    if (sendTo) socket.to(sendTo).emit("sdp-answer", { answer });
  });

  // Logout
  socket.on("logout", (uid) => {
    onlineUsers.delete(uid);
    io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
  });

  // Disconnect
  socket.on("disconnect", () => {
    const user = [...onlineUsers.entries()].find(([, id]) => id === socket.id);
    if (user) {
      onlineUsers.delete(user[0]);
      io.emit("updateOnlineUsers", Array.from(onlineUsers.keys()));
    }
  });
});
