# CollabCanvas

A portfolio-grade real-time collaborative canvas built with React, Node.js, Express, PostgreSQL, Socket.IO, and optional Redis/Memurai Pub/Sub.

## What is implemented

- Real JWT authentication with bcrypt password hashing
- Protected dashboard, workspace, and settings routes
- PostgreSQL-backed users, workspaces, members, documents, versions, and activities
- Data-driven dashboard with live workspace/document/activity queries
- Empty state for new accounts — no hard-coded demo workspaces or documents
- Workspace creation with owner membership and an initial empty canvas document
- Canvas persistence in PostgreSQL JSONB
- Real-time object creation, editing, movement, deletion, presence, and live cursors through Socket.IO
- Optional Redis adapter for multi-process Socket.IO scaling
- Undo/redo, duplicate, delete, zoom, grid, snap state, keyboard shortcuts, shapes, text, sticky notes, connectors, and freehand drawing
- Document rename, workspace member view, share-link copy, save status, online/offline status
- Responsive dark SaaS interface with account settings and theme preference
- Rate limiting, CORS, protected API routes, and environment-based configuration

## Run it

See `docs/SETUP.md` and `database/schema.sql`.

> The distributed source intentionally excludes `node_modules`, `.git`, and private `.env` values. Create `backend/.env` from `backend/.env.example` on your machine.
