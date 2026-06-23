# Environment

Runtime environment variables are app-scoped.

For the web app, put local secrets in:

```txt
apps/web/.env.local
```

Use this committed template:

```txt
apps/web/.env.example
```

The root `.env.local` file is ignored and is not the source of truth for the
Next.js web app. Keep service-specific env files beside the app that consumes
them.

The web app validates its runtime environment with Zod before rendering. Missing
or invalid required variables should fail fast instead of letting the app start
in a partial state.
