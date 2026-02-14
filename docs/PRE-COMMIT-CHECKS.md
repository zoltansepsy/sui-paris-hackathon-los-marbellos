# Pre-commit checks

Pre-commit hooks run on every `git commit`. Do not skip them with `--no-verify`.

## 1. Lint-staged

Runs only on **staged** files:

- **apps/suipatron/**/*.{ts,tsx}**: ESLint + Prettier
- **\*.{ts,tsx}**: Prettier
- **\*.{json,md,yml,yaml}**: Prettier
- **packages/blockchain/**/*.move**: `sui move format --check` (if the SUI CLI supports it; otherwise the step is skipped)

## 2. Type-check

`pnpm type-check` runs TypeScript across all workspace packages (e.g. @hack/blockchain, suipatron, @hack/types, @hack/ui).

## 3. Architecture pattern checks

`pnpm check:patterns` runs [tools/scripts/check-patterns.ts](tools/scripts/check-patterns.ts). It enforces:

- **Service pattern**: Services under `apps/suipatron/src/app/lib/services/` should export functions (Phase 1), not only classes.
- **Separation of concerns**: API routes under `apps/suipatron/src/app/api/` should use service functions, not direct Supabase/DB calls.
- **Type organization**: Types used by services should live in shared types (`@hack/types` or `lib/shared/types`), not inline in service files.
- **Error handling**: Service functions should include error handling (try/catch or custom errors).
- **Type safety**: No `any` types in app code (use `unknown` or proper types; `// ALLOWED` on the line or next line to bypass if needed).
- **Function complexity**: Service functions should be ≤ 100 lines.
- **Feature structure**: Prefer feature-based layout (e.g. `lib/services/orders/`).

If pattern checks fail, fix the reported violations and run `pnpm check:patterns` manually, then commit again.

## Disabling or changing checks

- To **temporarily skip** all hooks (not recommended): `git commit --no-verify`.
- To **remove** the pattern check: delete the `pnpm run check:patterns` block from [.husky/pre-commit](.husky/pre-commit) and optionally the `check:patterns` script from [package.json](package.json).
