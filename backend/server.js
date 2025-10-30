require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Message = require("./models/Message");

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please set these in your Render dashboard Environment section');
  process.exit(1);
}

const JWT_SECRET = process.env.JWT_SECRET;
const MONGODB_URI = process.env.MONGODB_URI;
const { setIO, getUserSocketMap } = require("./socket");

const app = express();

// Security Middleware
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Body parsing middleware with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/match", require("./routes/match"));
app.use("/api/events", require("./routes/events"));
app.use("/api/wellness", require("./routes/wellness"));
app.use("/api/xp", require("./routes/xp"));
app.use("/api/tips", require("./routes/tips"));
app.use("/api/connections", require("./routes/connections"));
app.use("/api/conversations", require("./routes/conversations"));
app.use("/api/profile", require("./routes/profile"));

// MongoDB Connection
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined. Please set it in your environment variables.");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    console.error("Please check your MONGODB_URI in Render environment variables");
    process.exit(1);
  });

// Set up server and Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
});
setIO(io);

// In-memory map for userId <-> socketId (from socket module)
const userSocketMap = getUserSocketMap();

// Socket.IO connection logic
io.on("connection", (socket) => {
  console.log("New socket connection:", socket.id);

  socket.on("authenticate", async (token) => {
    try {
      if (!JWT_SECRET) throw new Error("JWT_SECRET missing");
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      const user = await User.findById(userId);
      if (!user) {
        socket.emit("unauthorized", { message: "Invalid user." });
        socket.disconnect();
        return;
      }
      userSocketMap.set(userId.toString(), socket.id);
      socket.userId = userId.toString();
      console.log("Socket authenticated for user:", userId);
      socket.emit("authenticated", { userId });
    } catch (err) {
      console.error("Socket auth error:", err);
      socket.emit("unauthorized", { message: "JWT invalid." });
      socket.disconnect();
    }
  });

  // Join conversation room for realtime messaging
  socket.on("join_conversation", async (conversationId) => {
    try {
      if (!socket.userId) return;
      const convo = await Conversation.findById(conversationId);
      if (!convo) return;
      const isParticipant = convo.participants
        .map((p) => p.toString())
        .includes(socket.userId);
      if (!isParticipant) return;
      socket.join(conversationId.toString());
      console.log(`User ${socket.userId} joined convo ${conversationId}`);
    } catch (e) {
      console.error("[Socket][join_conversation][ERROR]", e);
    }
  });

  // Send message via socket; persist then broadcast to room
  socket.on("send_message", async ({ conversationId, text }) => {
    try {
      if (!socket.userId) return;
      const convo = await Conversation.findById(conversationId);
      if (!convo) return;
      const isParticipant = convo.participants
        .map((p) => p.toString())
        .includes(socket.userId);
      if (!isParticipant) return;
      const trimmed = (text || "").trim();
      if (!trimmed) return;
      const msg = await Message.create({
        conversationId,
        sender: socket.userId,
        text: trimmed,
      });
      convo.lastMessage = trimmed;
      await convo.save();
      io.to(conversationId.toString()).emit("receive_message", {
        message: msg,
      });
    } catch (e) {
      console.error("[Socket][send_message][ERROR]", e);
    }
  });

  // Typing indicators
  socket.on("typing", ({ conversationId }) => {
    try {
      if (!socket.userId) return;
      io.to(conversationId.toString()).emit("user_typing", {
        conversationId,
        userId: socket.userId,
      });
    } catch {}
  });
  // Mark messages as read by current user
  socket.on("mark_read", async ({ conversationId }) => {
    try {
      if (!socket.userId) return;
      const convo = await Conversation.findById(conversationId);
      if (!convo) return;
      const isParticipant = convo.participants
        .map((p) => p.toString())
        .includes(socket.userId);
      if (!isParticipant) return;
      await Message.updateMany(
        { conversationId, sender: { $ne: socket.userId }, delivered: false },
        { $set: { delivered: true } }
      );
      // Optionally notify other user so their outgoing pending count drops
      const other = convo.participants
        .map((p) => p.toString())
        .find((p) => p !== socket.userId);
      io.to(conversationId.toString()).emit("read_receipt", {
        conversationId,
        readerId: socket.userId,
      });
    } catch (e) {
      console.error("[Socket][mark_read][ERROR]", e);
    }
  });
  socket.on("stop_typing", ({ conversationId }) => {
    try {
      if (!socket.userId) return;
      io.to(conversationId.toString()).emit("user_stop_typing", {
        conversationId,
        userId: socket.userId,
      });
    } catch {}
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      userSocketMap.delete(socket.userId);
      console.log("Socket disconnected for user:", socket.userId);
    } else {
      console.log("Socket disconnected:", socket.id);
    }
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running (w/Socket.IO) on port ${PORT}`);
});
