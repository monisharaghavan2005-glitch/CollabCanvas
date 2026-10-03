// ======================================================
// COLLABCANVAS BACKEND SERVER
// ======================================================

// IMPORTANT:
// Load environment variables BEFORE importing the database pool.
const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const http = require("http");
const { Server } = require("socket.io");

// Optional Redis support
let createClient;
let createAdapter;

try {
  ({ createClient } = require("redis"));
  ({ createAdapter } = require("@socket.io/redis-adapter"));
} catch {
  // Redis is optional for local/single-server development.
}

// Database
const pool = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const workspaceRoutes = require("./routes/workspaceRoutes");
const advancedRoutes = require("./routes/advancedRoutes");

// ======================================================
// APP CONFIGURATION
// ======================================================

const app = express();

// Required when deployed behind Render's reverse proxy.
app.set("trust proxy", 1);

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
    origin: CLIENT_URL,
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

app.use(express.json({ limit: "10mb" }));

// ======================================================
// RATE LIMITING
// ======================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", apiLimiter);

// ======================================================
// BASIC ROOT ROUTE
// ======================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "CollabCanvas backend is running",
    realtime: "Socket.IO enabled",
  });
});

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
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Backend is running but database connection failed",
      error:
        process.env.NODE_ENV === "production"
          ? undefined
          : error.message,
    });
  }
});

// ======================================================
// REAL-TIME SOCKET.IO
// ======================================================

const connectedUsers = new Map();

// ======================================================
// REDIS CONFIGURATION
// ======================================================

async function configureRedis() {
  if (
    !createClient ||
    !createAdapter ||
    !process.env.REDIS_URL
  ) {
    console.log(
      "Redis not configured; using single-server Socket.IO mode"
    );

    return;
  }

  try {
    const pubClient = createClient({
      url: process.env.REDIS_URL,
    });

    const subClient = pubClient.duplicate();

    pubClient.on("error", (error) => {
      console.error(
        "Redis pub error:",
        error.message
      );
    });

    subClient.on("error", (error) => {
      console.error(
        "Redis sub error:",
        error.message
      );
    });

    await Promise.all([
      pubClient.connect(),
      subClient.connect(),
    ]);

    io.adapter(
      createAdapter(pubClient, subClient)
    );

    console.log(
      "Redis Pub/Sub adapter enabled"
    );
  } catch (error) {
    console.warn(
      "Redis unavailable; using single-server Socket.IO mode:",
      error.message
    );
  }
}

// ======================================================
// SOCKET CONNECTION
// ======================================================

io.on("connection", (socket) => {
  console.log(
    "Socket connected:",
    socket.id
  );

  // ====================================================
  // USER IDENTIFICATION
  // ====================================================

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
      `User connected: ${user.name}`
    );

    socket.emit("user:connected", {
      socketId: socket.id,
      user,
    });
  });

  // ====================================================
  // JOIN WORKSPACE
  // ====================================================

  socket.on(
    "workspace:join",
    (workspaceId) => {
      if (!workspaceId) {
        return;
      }

      const room = `workspace:${workspaceId}`;

      socket.join(room);

      console.log(
        `Socket ${socket.id} joined workspace ${workspaceId}`
      );

      const workspaceUsers = [];

      for (const user of connectedUsers.values()) {
        const connectedSocket =
          io.sockets.sockets.get(
            user.socketId
          );

        if (
          connectedSocket?.rooms.has(room)
        ) {
          workspaceUsers.push(user);
        }
      }

      socket.emit(
        "workspace:users",
        workspaceUsers
      );

      socket
        .to(room)
        .emit(
          "presence:user-joined",
          {
            socketId: socket.id,
            user: socket.user,
          }
        );
    }
  );

  // ====================================================
  // LEAVE WORKSPACE
  // ====================================================

  socket.on(
    "workspace:leave",
    (workspaceId) => {
      if (!workspaceId) {
        return;
      }

      const room = `workspace:${workspaceId}`;

      socket.leave(room);

      socket
        .to(room)
        .emit(
          "presence:user-left",
          {
            socketId: socket.id,
            user: socket.user,
          }
        );

      console.log(
        `Socket ${socket.id} left workspace ${workspaceId}`
      );
    }
  );

  // ====================================================
  // LIVE CURSOR
  // ====================================================

  socket.on(
    "cursor:move",
    (data) => {
      if (
        !data ||
        !data.workspaceId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "cursor:moved",
          {
            socketId: socket.id,
            userId: socket.user?.id,
            name: socket.user?.name,
            x: data.x,
            y: data.y,
          }
        );
    }
  );

  // ====================================================
  // CANVAS OBJECT CREATED
  // ====================================================

  socket.on(
    "canvas:object-created",
    (data) => {
      if (
        !data ||
        !data.workspaceId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "canvas:object-created",
          {
            ...data,
            createdBy:
              socket.user?.id,
          }
        );
    }
  );

  // ====================================================
  // CANVAS OBJECT UPDATED
  // ====================================================

  socket.on(
    "canvas:object-updated",
    (data) => {
      if (
        !data ||
        !data.workspaceId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "canvas:object-updated",
          {
            ...data,
            updatedBy:
              socket.user?.id,
          }
        );
    }
  );

  // ====================================================
  // CANVAS OBJECT DELETED
  // ====================================================

  socket.on(
    "canvas:object-deleted",
    (data) => {
      if (
        !data ||
        !data.workspaceId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "canvas:object-deleted",
          {
            ...data,
            deletedBy:
              socket.user?.id,
          }
        );
    }
  );

  // ====================================================
  // CANVAS STATE REQUEST
  // ====================================================

  socket.on(
    "canvas:state-request",
    (data) => {
      if (
        !data ||
        !data.workspaceId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "canvas:state-request",
          {
            requesterId:
              socket.id,
            userId:
              socket.user?.id,
          }
        );
    }
  );

  // ====================================================
  // CANVAS STATE RESPONSE
  // ====================================================

  socket.on(
    "canvas:state-response",
    (data) => {
      if (
        !data ||
        !data.targetSocketId
      ) {
        return;
      }

      io.to(
        data.targetSocketId
      ).emit(
        "canvas:state-response",
        {
          objects:
            data.objects || [],
          senderId: socket.id,
        }
      );
    }
  );

  // ====================================================
  // DOCUMENT TYPING
  // ====================================================

  socket.on(
    "document:typing",
    (data) => {
      if (
        !data ||
        !data.workspaceId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "document:user-typing",
          {
            userId:
              socket.user?.id,
            name:
              socket.user?.name,
            documentId:
              data.documentId,
          }
        );
    }
  );

  // ====================================================
  // WORKSPACE ACTIVITY
  // ====================================================

  socket.on(
    "workspace:activity",
    (data) => {
      if (
        !data ||
        !data.workspaceId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      const activity =
        data.activity || {
          ...data,
          userId:
            socket.user?.id,
          userName:
            socket.user?.name,
          timestamp:
            new Date().toISOString(),
        };

      socket
        .to(room)
        .emit(
          "workspace:activity",
          activity
        );
    }
  );

  // ====================================================
  // COMMENT ADDED
  // ====================================================

  socket.on(
    "document:comment-added",
    (data) => {
      if (
        !data?.workspaceId ||
        !data.comment
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "document:comment-added",
          data.comment
        );
    }
  );

  // ====================================================
  // COMMENT RESOLVED
  // ====================================================

  socket.on(
    "document:comment-resolved",
    (data) => {
      if (
        !data?.workspaceId ||
        !data.commentId
      ) {
        return;
      }

      const room =
        `workspace:${data.workspaceId}`;

      socket
        .to(room)
        .emit(
          "document:comment-resolved",
          {
            commentId:
              data.commentId,
          }
        );
    }
  );

  // ====================================================
  // DISCONNECT
  // ====================================================

  socket.on(
    "disconnect",
    () => {
      const user =
        connectedUsers.get(
          socket.id
        );

      if (user) {
        console.log(
          `User disconnected: ${user.name}`
        );

        for (const room of socket.rooms) {
          if (
            room.startsWith(
              "workspace:"
            )
          ) {
            socket
              .to(room)
              .emit(
                "presence:user-left",
                {
                  socketId:
                    socket.id,
                  user,
                }
              );
          }
        }

        connectedUsers.delete(
          socket.id
        );
      } else {
        console.log(
          "Socket disconnected:",
          socket.id
        );
      }
    }
  );
});

// ======================================================
// START SERVER
// ======================================================

server.listen(
  PORT,
  "0.0.0.0",
  () => {
    console.log(
      "========================================"
    );
    console.log(
      "       COLLABCANVAS BACKEND"
    );
    console.log(
      "========================================"
    );
    console.log(
      `Server listening on port ${PORT}`
    );
    console.log(
      `Health endpoint: /api/health`
    );
    console.log(
      `Client URL: ${CLIENT_URL}`
    );
    console.log(
      "Realtime: Socket.IO enabled"
    );
    console.log(
      "========================================"
    );

    configureRedis();
  }
);