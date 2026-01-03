const express = require('express');
const http = require('http');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const createError = require('http-errors');
const path = require("path");
const xss = require("xss");
const passport = require('passport');
const cors = require('cors');
const config = require('./config');

const User = require('./models/user');
const Chat = require('./models/message');
const Group = require('./models/groups');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const groupsRouter = require('./routes/groupsRouter');

/* =======================
   DATABASE
======================= */
mongoose.connect(config.mongoUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ Database connected"))
.catch((err) => console.error("❌ DB Error:", err.message));

/* =======================
   SERVER + SOCKET
======================= */
const server = http.createServer(app);

/* =======================
   CORS CONFIG (SINGLE SOURCE OF TRUTH)
======================= */
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",")
  : [
      "http://localhost:8000",
      "http://localhost:3000",
	  "http://192.168.223.89:8000"
    ];

app.use(cors({
  origin: function (origin, callback) {
    // allow same-origin / Postman / curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error("❌ CORS BLOCKED:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"]
}));

app.use(bodyParser.json());
app.use(passport.initialize());

/* =======================
   SOCKET.IO
======================= */
const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

/* =======================
   SECURITY (XSS)
======================= */
const sanitizeString = (str) => xss(str);

/* =======================
   SOCKET STATE
======================= */
let connections = {};
let messages = {};
let timeOnline = {};

/* =======================
   SOCKET LOGIC
======================= */
io.on('connection', (socket) => {
  console.log("🟢 User connected:", socket.id);

  socket.on('join-call', async (data) => {
    try {
      let pathArr = data.path.split("/");
      const roomId = pathArr[pathArr.length - 1];
      const userId = data.userId;
      const roomPath = data.path;

      // user groups
      const user = await User.findOne({ username: userId });
      if (user && !user.groups.includes(roomId) && roomId.length === 5) {
        user.groups.push(roomId);
        await user.save();
      }

      // groups
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

      connections[roomPath].forEach(id =>
        io.to(id).emit('user-joined', socket.id, connections[roomPath])
      );

      if (messages[roomPath]) {
        messages[roomPath].forEach(msg => {
          io.to(socket.id).emit('chat-message', msg.data, msg.sender, msg.socketId);
        });
      }
    } catch (err) {
      console.error("join-call error:", err.message);
    }
  });

  socket.on('signal', (toId, message) => {
    io.to(toId).emit('signal', socket.id, message);
  });

  socket.on('chat-message', async (data, sender) => {
    data = sanitizeString(data);
    sender = sanitizeString(sender);

    let roomKey;
    for (const [k, v] of Object.entries(connections)) {
      if (v.includes(socket.id)) {
        roomKey = k;
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

    connections[roomKey].forEach(id =>
      io.to(id).emit("chat-message", data, sender, socket.id)
    );
  });

  socket.on('disconnect', () => {
    console.log("🔴 User disconnected:", socket.id);
    for (const [k, v] of Object.entries(connections)) {
      if (v.includes(socket.id)) {
        connections[k] = v.filter(id => id !== socket.id);
        connections[k].forEach(id =>
          io.to(id).emit("user-left", socket.id)
        );
        if (connections[k].length === 0) delete connections[k];
        break;
      }
    }
    delete timeOnline[socket.id];
  });
});

/* =======================
   API ROUTES
======================= */
app.use('/api', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/groups', groupsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: "OK", time: new Date() });
});

/* =======================
   ERROR HANDLING
======================= */
app.use((req, res, next) => next(createError(404)));

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ error: err.message });
});

/* =======================
   START SERVER (LAN SAFE)
======================= */
const PORT = process.env.PORT || 4001;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Backend running on port ${PORT}`);
  console.log("🌍 Allowed Origins:", allowedOrigins);
});