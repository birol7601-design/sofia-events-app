# Sofia Buzz

Sofia Buzz is a Turborepo scaffold for a Sofia events app.

## Apps And Packages

- `apps/web` - Next.js app router web app.
- `packages/ui` - shared ShadCN-compatible UI.
- `packages/validators` - shared Zod schemas.
- `packages/typescript-config` - shared TypeScript config.
- `convex` - Convex backend functions and schema.

## Environment

The web app reads env from:

```txt
apps/web/.env.local
```

Use the template at:

```txt
apps/web/.env.example
```

Required keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CONVEX_DEPLOYMENT=
NEXT_PUBLIC_CONVEX_URL=
RESEND_API_KEY=
```

Env is parsed with Zod before app code uses it. Missing or invalid required env
fails fast.

## Development

Install dependencies:

```bash
npm install
```

Run the web app:

```bash
npm run dev
```

Run Convex in a second terminal:

```bash
npm run dev:convex
```

Open:

```txt
http://localhost:3000
```

Health endpoint:

```txt
http://localhost:3000/api/health
```

## Checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run build
```

Auto-fix formatting and lint where possible:

```bash
npm run format
npm run lint:fix
```
