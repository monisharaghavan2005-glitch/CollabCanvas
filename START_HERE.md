# CollabCanvas — Start Here

This build preserves the existing CollabCanvas authentication, dashboard, workspaces, PostgreSQL persistence, canvas tools, real-time Socket.IO presence/cursors, undo/redo, zoom, grid, snap, members, sharing and properties panel, and adds an advanced collaboration layer.

## Added features

- Command Palette (`Ctrl + K`)
- Canvas Mini-map
- Collaborative comments attached to a selected canvas object
- Comment resolve flow
- Real-time comment events through Socket.IO
- Time Machine / document version history
- One-click restore of a saved version
- Version snapshots stored in PostgreSQL
- Live workspace activity panel
- Canvas Copilot with real board/object analysis (no fake cloud AI or API key required)
- Live insight counters for objects, members and unresolved threads
- JSON canvas export
- Quick actions and advanced workspace controls
- Mobile-friendly advanced side panel

## First setup on Windows

### 1. Backend environment

Open `backend/.env` and set your local PostgreSQL password. Do not commit your real `.env` to GitHub.

### 2. Database

Make sure PostgreSQL 17 is running. From PowerShell at the project root:

```powershell
powershell -ExecutionPolicy Bypass -File .\database\setup.ps1
```

Or manually run `database/schema.sql` against the `collabcanvas` database.

### 3. Backend

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

Backend: http://localhost:5000

### 4. Frontend

In another terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Frontend: http://localhost:5173

### 5. Optional one-click local start

After database setup and both `npm install` commands:

```text
run.bat
```

This opens separate backend/frontend terminals and launches the browser.

## Redis / Memurai

`REDIS_URL=redis://127.0.0.1:6379` is supported. If Redis/Memurai is unavailable, the backend automatically falls back to single-server Socket.IO mode for local development.

## Important

The project does not contain platform-specific `node_modules` in the source ZIP. Run `npm.cmd install` separately on Windows so Vite/React native optional dependencies are installed for the correct operating system.
