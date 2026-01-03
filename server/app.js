const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const createError = require("http-errors");
const xss = require("xss");
const passport = require("passport");
const cors = require("cors");
const { Server } = require("socket.io");

const config = require("./config");

const User = require("./models/user");
const Chat = require("./models/message");
const Group = require("./models/groups");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const groupsRouter = require("./routes/groupsRouter");

const app = express();
const server = http.createServer(app);

/* =======================
   ENV & CONFIG
======================= */
const PORT = process.env.PORT || 4001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:3000",
      "http://localhost:8000"
    ];

/* =======================
   DATABASE
======================= */
mongoose
  .connect(config.mongoUrl)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB error:", err.message));

/* =======================
   MIDDLEWARE
======================= */
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));

app.use(express.json());
app.use(passport.initialize());

/* =======================
   SOCKET.IO (v4)
======================= */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true
  }
});

/* =======================
   SECURITY
======================= */
const sanitize = (str) => xss(str);

/* =======================
   SOCKET STATE
======================= */
let connections = {};
let messages = {};
let timeOnline = {};

/* =======================
   SOCKET EVENTS
======================= */
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  socket.on("join-call", async (data) => {
    try {
      const pathArr = data.path.split("/");
      const roomId = pathArr[pathArr.length - 1];
      const roomPath = data.path;
      const userId = data.userId;

      const user = await User.findOne({ username: userId });
      if (user && !user.groups.includes(roomId) && roomId.length === 5) {
        user.groups.push(roomId);
        await user.save();
      }

      let group = await Group.findOne({ groupId: roomId });
      if (!group && roomId.length === 5) {
        group = await Group.create({ groupId: roomId, members: [userId] });
      } else if (group && !group.members.includes(userId)) {
        group.members.push(userId);
        await group.save();
      }

      if (!connections[roomPath]) connections[roomPath] = [];
      connections[roomPath].push(socket.id);
      timeOnline[socket.id] = new Date();

      connections[roomPath].forEach(id => {
        io.to(id).emit("user-joined", socket.id, connections[roomPath]);
      });

      if (messages[roomPath]) {
        messages[roomPath].forEach(msg => {
          io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg.socketId);
        });
      }
    } catch (err) {
      console.error("join-call error:", err.message);
    }
  });

  socket.on("signal", (toId, message) => {
    io.to(toId).emit("signal", socket.id, message);
  });

  socket.on("chat-message", async (data, sender) => {
    data = sanitize(data);
    sender = sanitize(sender);

    let roomKey;
    for (const [key, value] of Object.entries(connections)) {
      if (value.includes(socket.id)) {
        roomKey = key;
        break;
      }
    }
    if (!roomKey) return;

    if (!messages[roomKey]) messages[roomKey] = [];
    messages[roomKey].push({ data, sender, socketId: socket.id });

    try {
      const chatMsg = await Chat.create({ content: data, author: sender });
      const roomId = roomKey.split("/").pop();
      const group = await Group.findOne({ groupId: roomId });
      if (group) {
        group.messages.push(chatMsg);
        await group.save();
      }
    } catch (err) {
      console.error("chat save error:", err.message);
    }

    connections[roomKey].forEach(id => {
      io.to(id).emit("chat-message", data, sender, socket.id);
    });
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);

    for (const [key, value] of Object.entries(connections)) {
      if (value.includes(socket.id)) {
        connections[key] = value.filter(id => id !== socket.id);
        connections[key].forEach(id =>
          io.to(id).emit("user-left", socket.id)
        );
        if (connections[key].length === 0) delete connections[key];
        break;
      }
    }
    delete timeOnline[socket.id];
  });
});

/* =======================
   API ROUTES
======================= */
app.use("/api", indexRouter);
app.use("/api/users", usersRouter);
app.use("/api/groups", groupsRouter);

app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

/* =======================
   ERROR HANDLING
======================= */
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message
  });
});

/* =======================
   START SERVER
======================= */
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log("🌍 Allowed origins:", allowedOrigins);
});
