# Agent Handoff – SUI Paris Hack

**For:** AI coding agents and devs using different tools. Use this as the single source of truth so all agents follow the same stack, structure, and rules.

**Last updated:** 2026-02-13

---

## 1. Stack

- **Monorepo:** Turborepo, pnpm workspaces
- **App:** Next.js (App Router), React 19, TypeScript (strict)
- **Chain:** SUI – Move contracts in `packages/blockchain/contracts`, TypeScript SDK in `packages/blockchain/sdk`
- **Frontend:** `@mysten/dapp-kit`, `@mysten/sui`, Tailwind CSS
- **Shared:** `@hack/types`, `@hack/ui`, `@hack/blockchain`

---

## 2. Where things live

| What            | Location                          |
|-----------------|-----------------------------------|
| dApp UI/pages   | `apps/dapp/app/`                  |
| API routes      | `apps/dapp/app/api/`              |
| Services        | `apps/dapp/lib/services/` (by feature, e.g. `orders/`, `nft/`) |
| Shared types    | `packages/types` or `apps/dapp/lib/shared/types/` |
| Shared UI       | `packages/ui`                     |
| Move contracts  | `packages/blockchain/contracts/sources/` |
| Network config  | `packages/blockchain/sdk/networkConfig.ts` |

---

## 3. Move (on-chain)

- **Contracts:** `packages/blockchain/contracts/sources/`. All on-chain logic must follow **[docs/MOVE-PATTERNS.md](MOVE-PATTERNS.md)** (Capability, Hot Potato, Witness, etc.).
- **Before commit:** Ensure `pnpm --filter @hack/blockchain build:contracts` and `pnpm --filter @hack/blockchain test:contracts` pass.
- **After publish:** Add Package ID and object IDs to `packages/blockchain/sdk/networkConfig.ts` for the chosen network (e.g. testnet).

---

## 4. Architecture patterns (TypeScript / app – enforced by pre-commit)

These rules are checked by `pnpm check:patterns`. Follow them so commits don’t fail.

- **Services:** Export **functions** (Phase 1), not only classes. Put them under `apps/dapp/lib/services/<feature>/`.
- **API routes:** Call **service functions** from `@/lib/services/`. Do **not** call Supabase or other DB clients directly in route handlers.
- **Types:** Put shared types in `@hack/types` or `apps/dapp/lib/shared/types/`. Avoid defining them inline in service files.
- **No `any`:** Use proper types or `unknown`. To allow an exception, add `// ALLOWED` on that line or the next.
- **Error handling:** Service functions that do async work should use try/catch or throw custom errors.
- **Function size:** Keep service functions under ~100 lines; split or extract helpers if longer.
- **Feature structure:** Prefer one feature per directory (e.g. `lib/services/orders/index.ts`).

---

## 5. Before every commit

Pre-commit runs:

1. **Lint-staged** – ESLint + Prettier on staged files
2. **Type-check** – `pnpm type-check` (all packages)
3. **Pattern checks** – `pnpm check:patterns` (architecture rules above)

Do **not** use `git commit --no-verify`. If checks fail, fix the issues and run `pnpm check:patterns` and `pnpm type-check` locally, then commit again.

Full details: **[docs/PRE-COMMIT-CHECKS.md](PRE-COMMIT-CHECKS.md)**.

---

## 6. Useful links

- **Move patterns (required for contracts):** [docs/MOVE-PATTERNS.md](MOVE-PATTERNS.md)
- **Hackathon suggestions:** [docs/HACKATHON-SUGGESTIONS.md](HACKATHON-SUGGESTIONS.md)
- **Pre-commit checks (what runs on commit):** [docs/PRE-COMMIT-CHECKS.md](PRE-COMMIT-CHECKS.md)
- **Pre-hackathon checklist (env, Move, dApp, team):** [docs/PRE-HACKATHON-CHECKLIST.md](PRE-HACKATHON-CHECKLIST.md)
- **Quick start and commands:** [README.md](../README.md)
- **Pattern check script:** [tools/scripts/check-patterns.ts](../tools/scripts/check-patterns.ts)

---

## 7. After you finish a task

- Run `pnpm type-check` and `pnpm check:patterns` before committing.
- If you changed **Move**: run `pnpm --filter @hack/blockchain build:contracts` and `test:contracts` too.
- Briefly note what you did in your commit message so the next agent or dev has context.
