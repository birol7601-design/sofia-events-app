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

- Run `npm run format:check`, `npm run lint`, and `npm run typecheck` after
  scaffold or shared-code changes. Run `npm run build` for app/runtime changes.
- Runtime env is app-scoped. For the web app, use `apps/web/.env.local`; keep
  `apps/web/.env.example` updated.
- Env is parsed once through Zod and exported as a valid `env` object. Do not add
  downstream fallback checks for required env.
- Export Zod schemas and inferred types in PascalCase, for example
  `WebEnvSchema`, `EventInputSchema`, and `WebEnv`.
- Shared UI belongs in `packages/ui`; import it as `@workspace/ui/...`.
- For React/Next.js performance-sensitive work, use the repo-local
  `.agents/skills/vercel-react-best-practices` skill.
- Do not add Stripe code or env until payment flows are intentionally scoped.
