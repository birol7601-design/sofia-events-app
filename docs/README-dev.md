# Developer Reference

## Useful commands

| Command              | Purpose                                   |
| -------------------- | ----------------------------------------- |
| `npm run dev`        | Run the web app.                          |
| `npm run dev:convex` | Run the Convex backend (second terminal). |
| `npm run format`     | Auto-format with Prettier.                |
| `npm run lint`       | Lint all workspaces.                      |
| `npm run typecheck`  | Type-check all workspaces.                |
| `npm run build`      | Build all workspaces.                     |

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `apps/web/.env.local` from the template at `apps/web/.env.example`
   and fill in the required keys.

3. Run the web app:

   ```bash
   npm run dev
   ```

4. In a second terminal, run Convex:

   ```bash
   npm run dev:convex
   ```

5. Open http://localhost:3000 (health endpoint at
   http://localhost:3000/api/health).
