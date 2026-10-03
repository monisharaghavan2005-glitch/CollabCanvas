# CollabCanvas — Local Setup

## 1. PostgreSQL
Create the database first:

```sql
CREATE DATABASE collabcanvas;
```

Then run `database/schema.sql` against that database.

## 2. Backend
Copy `backend/.env.example` to `backend/.env` and set the PostgreSQL password.

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

Health check: `http://localhost:5000/api/health`

## 3. Redis / Memurai
CollabCanvas supports Redis-compatible Pub/Sub through `REDIS_URL`. Memurai on Windows can be used with the default URL shown above.

If Redis is unavailable, the application still runs with Socket.IO's single-server realtime mode.

## 4. Frontend
```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Data model
- A newly registered user has no workspace, document, member, or activity records.
- Creating a workspace creates its owner membership and one empty canvas document.
- Canvas content is persisted in PostgreSQL as JSONB.
- Socket.IO synchronizes object creation, updates, deletion, presence, and cursors.
- Redis is optional for local single-server use and can be enabled for multi-process Socket.IO scaling.
