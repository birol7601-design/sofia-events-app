<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

## Project conventions

- Runtime env is app-scoped. For the web app, use `apps/web/.env.local` and
  keep `apps/web/.env.example` updated. Do not rely on root `.env.local` for
  Next.js runtime configuration.
- Env must be parsed through Zod before app code uses it. Missing or invalid
  required env should fail fast.
- Export Zod schemas in PascalCase, for example `WebEnvSchema` and
  `EventInputSchema`. Export inferred types in PascalCase.
- Do not add Stripe code or env until payment flows are intentionally scoped.
