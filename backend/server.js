const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");
let createClient;
let createAdapter;
try {
  ({ createClient } = require("redis"));
  ({ createAdapter } = require("@socket.io/redis-adapter"));
} catch {
  // Optional in single-server local development.
}
const pool = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const advancedRoutes = require("./routes/advancedRoutes");
dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";
// ======================================================
// HTTP SERVER
// ======================================================

const server = http.createServer(app);

// ======================================================
// SOCKET.IO SERVER
// ======================================================

const io = new Server(server, {
  cors: {
    origin: "origin: CLIENT_URL,",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ======================================================
// MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});

app.use("/api", apiLimiter);

// ======================================================
// API ROUTES
// ======================================================

app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/workspaces", workspaceRoutes);
app.use("/api/advanced", advancedRoutes);

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/api/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.status(200).json({
      success: true,
      message: "CollabCanvas backend is running",
      database: "connected",
      databaseTime: result.rows[0].now,
      realtime: "Socket.IO enabled",
    });
  } catch (error) {
    console.error(
      "Database health check failed:",
      error.message
    );

    res.status(500).json({
      success: false,
      message:
        "Backend is running but database connection failed",
    });
  }
});

// ======================================================
// REAL-TIME SOCKET.IO
// ======================================================

const connectedUsers = new Map();

async function configureRedis() {
  if (!createClient || !createAdapter || !process.env.REDIS_URL) return;
  try {
    const pubClient = createClient({ url: process.env.REDIS_URL });
    const subClient = pubClient.duplicate();
    pubClient.on("error", (error) => console.error("Redis pub error:", error.message));
    subClient.on("error", (error) => console.error("Redis sub error:", error.message));
    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    console.log("🔴 Redis Pub/Sub adapter enabled");
  } catch (error) {
    console.warn("Redis unavailable; using single-server Socket.IO mode:", error.message);
  }
}

io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);

  // ----------------------------------------------------
  // USER IDENTIFICATION
  // ----------------------------------------------------

  socket.on("user:join", (user) => {
    if (!user || !user.id) {
      return;
    }

    connectedUsers.set(socket.id, {
      socketId: socket.id,
      userId: user.id,
      name: user.name,
      email: user.email,
    });

    socket.user = user;

    console.log(
      `👤 ${user.name} connected`
    );

    socket.emit("user:connected", {
      socketId: socket.id,
      user,
    });
  });

  // ----------------------------------------------------
  // JOIN WORKSPACE
  // ----------------------------------------------------

  socket.on("workspace:join", (workspaceId) => {
    if (!workspaceId) {
      return;
    }

    socket.join(`workspace:${workspaceId}`);

    console.log(
      `🏢 Socket ${socket.id} joined workspace ${workspaceId}`
    );

    const workspaceUsers = [];

    for (const user of connectedUsers.values()) {
      if (
        io.sockets.sockets.get(user.socketId)?.rooms.has(
          `workspace:${workspaceId}`
        )
      ) {
        workspaceUsers.push(user);
      }
    }

    socket.emit("workspace:users", workspaceUsers);

    socket.to(`workspace:${workspaceId}`).emit(
      "presence:user-joined",
      {
        socketId: socket.id,
        user: socket.user,
      }
    );
  });

  // ----------------------------------------------------
  // LEAVE WORKSPACE
  // ----------------------------------------------------

  socket.on("workspace:leave", (workspaceId) => {
    if (!workspaceId) {
      return;
    }

    socket.leave(`workspace:${workspaceId}`);

    socket.to(`workspace:${workspaceId}`).emit(
      "presence:user-left",
      {
        socketId: socket.id,
        user: socket.user,
      }
    );

    console.log(
      `🚪 Socket ${socket.id} left workspace ${workspaceId}`
    );
  });

  // ----------------------------------------------------
  // LIVE CURSOR
  // ----------------------------------------------------

  socket.on("cursor:move", (data) => {
    if (!data || !data.workspaceId) {
      return;
    }

    socket.to(
      `workspace:${data.workspaceId}`
    ).emit("cursor:moved", {
      socketId: socket.id,
      userId: socket.user?.id,
      name: socket.user?.name,
      x: data.x,
      y: data.y,
    });
  });

  // ----------------------------------------------------
  // CANVAS OBJECT CREATED
  // ----------------------------------------------------

  socket.on("canvas:object-created", (data) => {
    if (!data || !data.workspaceId) {
      return;
    }

    socket.to(
      `workspace:${data.workspaceId}`
    ).emit("canvas:object-created", {
      ...data,
      createdBy: socket.user?.id,
    });
  });

  // ----------------------------------------------------
  // CANVAS OBJECT UPDATED
  // ----------------------------------------------------

  socket.on("canvas:object-updated", (data) => {
    if (!data || !data.workspaceId) {
      return;
    }

    socket.to(
      `workspace:${data.workspaceId}`
    ).emit("canvas:object-updated", {
      ...data,
      updatedBy: socket.user?.id,
    });
  });

  // ----------------------------------------------------
  // CANVAS OBJECT DELETED
  // ----------------------------------------------------

  socket.on("canvas:object-deleted", (data) => {
    if (!data || !data.workspaceId) {
      return;
    }

    socket.to(
      `workspace:${data.workspaceId}`
    ).emit("canvas:object-deleted", {
      ...data,
      deletedBy: socket.user?.id,
    });
  });

  // ----------------------------------------------------
  // CANVAS FULL STATE
  // ----------------------------------------------------

  socket.on("canvas:state-request", (data) => {
    if (!data || !data.workspaceId) {
      return;
    }

    socket.to(
      `workspace:${data.workspaceId}`
    ).emit("canvas:state-request", {
      requesterId: socket.id,
      userId: socket.user?.id,
    });
  });

  socket.on("canvas:state-response", (data) => {
    if (!data || !data.targetSocketId) {
      return;
    }

    io.to(data.targetSocketId).emit(
      "canvas:state-response",
      {
        objects: data.objects || [],
        senderId: socket.id,
      }
    );
  });

  // ----------------------------------------------------
  // TYPING / COLLABORATION ACTIVITY
  // ----------------------------------------------------

  socket.on("document:typing", (data) => {
    if (!data || !data.workspaceId) {
      return;
    }

    socket.to(
      `workspace:${data.workspaceId}`
    ).emit("document:user-typing", {
      userId: socket.user?.id,
      name: socket.user?.name,
      documentId: data.documentId,
    });
  });

  // ----------------------------------------------------
  // GENERIC ACTIVITY
  // ----------------------------------------------------

  socket.on("workspace:activity", (data) => {
    if (!data || !data.workspaceId) {
      return;
    }

    socket.to(
      `workspace:${data.workspaceId}`
    ).emit("workspace:activity", {
      ...data,
      userId: socket.user?.id,
      userName: socket.user?.name,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("document:comment-added", (data) => {
    if (!data?.workspaceId || !data.comment) return;
    socket.to(`workspace:${data.workspaceId}`).emit("document:comment-added", data.comment);
  });

  socket.on("document:comment-resolved", (data) => {
    if (!data?.workspaceId || !data.commentId) return;
    socket.to(`workspace:${data.workspaceId}`).emit("document:comment-resolved", { commentId: data.commentId });
  });

  socket.on("workspace:activity", (data) => {
    if (!data?.workspaceId || !data.activity) return;
    socket.to(`workspace:${data.workspaceId}`).emit("workspace:activity", data.activity);
  });

  // ----------------------------------------------------
  // DISCONNECT
  // ----------------------------------------------------

  socket.on("disconnect", () => {
    const user = connectedUsers.get(socket.id);

    if (user) {
      console.log(
        `🔴 ${user.name} disconnected`
      );

      for (const room of socket.rooms) {
        if (room.startsWith("workspace:")) {
          socket.to(room).emit(
            "presence:user-left",
            {
              socketId: socket.id,
              user,
            }
          );
        }
      }

      connectedUsers.delete(socket.id);
    } else {
      console.log(
        "🔴 Socket disconnected:",
        socket.id
      );
    }
  });
});

// ======================================================
// START SERVER
// ======================================================

server.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log("       COLLABCANVAS BACKEND");
  console.log("========================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Health: http://localhost:${PORT}/api/health`);
  console.log(`Realtime: Socket.IO enabled`);
  console.log("========================================");
  configureRedis();
});