# Phase 1 Requirements

Reference for Phase 1 scope only. Stripe and payments are **out of scope** —
promoted slots are assigned manually by an admin.

## Functional Requirements

### User

- Browse events.
- Save events.
- Mark attending.

### Organizer

- Register as an organizer.
- After admin verification, create events.

### Admin

- Verify organizers.
- Assign promoted slots manually (no payments):
  - **King of the Hive** = slot 1.
  - **Buzz Spots** = slots 2–8.

## Non-Functional Requirements

- TypeScript strict mode; no `any`.
- No unused variables.
- All input validated with the shared Zod schemas.
- Every PR passes CI: format, lint, typecheck, build.
- Env validated via Zod and fail-fast.
