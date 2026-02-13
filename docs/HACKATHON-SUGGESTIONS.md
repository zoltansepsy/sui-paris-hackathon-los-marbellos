# Hackathon suggestions – SUI Paris Hack

Suggestions to make the 24h hackathon work well, with a **heavy focus on Move patterns**.

---

## 1. Move patterns – align the team

- **Decide which patterns you’ll use** (e.g. Capability, Hot Potato, Witness, One-Time Witness) and document them in the repo so every agent and dev follows the same style.
- **Use [docs/MOVE-PATTERNS.md](MOVE-PATTERNS.md)** for:
  - When to use each pattern (access control, one-time actions, init).
  - One small code snippet per pattern from your contracts or official Sui samples.
  - Naming and file layout (e.g. one module per feature or per pattern).
- **Point agents at it:** [docs/AGENT-HANDOFF.md](AGENT-HANDOFF.md) states that Move code must follow docs/MOVE-PATTERNS.md.

---

## 2. Move-first prep (before the clock starts)

- **Run the full flow once:** `sui move build`, `sui move test`, `sui client publish` (testnet), then call one entry from the dApp so the path Move → SDK → UI is clear.
- **Pin Sui / Move version** in `Move.toml` (e.g. a specific `rev` for the framework) so everyone and CI use the same version.
- **Add 1–2 tiny example modules** in `packages/blockchain/contracts/sources/` (e.g. “counter” or “capability + one function”) that show your chosen patterns; keep them as reference, not production.
- **List 2–3 official references** in the repo (e.g. [Sui Move by Example](https://examples.sui.io/), [Sui Move Patterns](https://docs.sui.io/standards/patterns), [Sui Docs](https://docs.sui.io/)) so everyone uses the same source of truth.

---

## 3. Repo and tooling

- **README “Move” section:** Add a short “Move patterns we use” plus commands (`build`, `test`, `publish`) and where contract IDs go (`networkConfig.ts`, `.env`).
- **Agent handoff:** In [AGENT-HANDOFF.md](AGENT-HANDOFF.md), the Move subsection states that all on-chain logic must follow docs/MOVE-PATTERNS.md and that `pnpm --filter @hack/blockchain build:contracts` and `test:contracts` must pass before commit.
- **Pre-commit:** Keep Move checks as “build + test” in CI or a single script so broken Move doesn’t get pushed.

---

## 4. Team and process

- **Roles:** e.g. 2 people “Move owners” (design + implement patterns, publish, update `networkConfig`), 2 “integration” (SDK, API, UI, calling the contracts).
- **Contract lead:** One person approves Move changes and is the main one who runs `sui client publish` and updates package/object IDs.
- **Branching:** Short-lived feature branches; merge to `main` often so the dApp and SDK always point at the latest published packages.
- **Checklist:** Use [PRE-HACKATHON-CHECKLIST.md](PRE-HACKATHON-CHECKLIST.md) at kickoff; add “Move patterns doc read and agreed (docs/MOVE-PATTERNS.md).”

---

## 5. During the hackathon

- **Start with types and entry points:** Define shared structs and `public entry` / `public fun` signatures first; then implement and test in Move, then wire SDK and UI.
- **Test in Move first:** Use `sui move test` for every new function; add small tests for capability checks, one-time logic, and access control.
- **One network:** Agree on one network (e.g. testnet) and one `defaultNetwork` in the dApp; document it in README or agent handoff.
- **Version contracts clearly:** e.g. a `VERSION` or comment in `Move.toml` or the main module so you know which deployment the frontend is talking to.

---

## 6. Risk reduction

- **Gas budget:** Use a fixed, generous budget for publish (e.g. `100000000`) and document it so re-publishes don’t fail with “out of gas.”
- **Upgradability:** If the contest allows, consider a simple “package upgrade” path (e.g. one admin capability) so you can fix bugs without redeploying from scratch.
- **No secrets in repo:** Keep keys in env only; never commit private keys or `.env`; use `.env.example` and docs for setup.

---

## 7. Quick wins

- **CI (e.g. GitHub Actions):** Run `pnpm install`, `pnpm type-check`, `pnpm check:patterns`, and `pnpm --filter @hack/blockchain build:contracts` (and optionally `test:contracts`) on every push.
- **Single “how we call the chain” doc:** One page listing package ID, main modules, and which SDK helpers map to which `public entry` / `public fun`; link it from README and agent handoff.

---

## Summary table

| Area          | Suggestion |
|---------------|------------|
| Move patterns | Use [docs/MOVE-PATTERNS.md](MOVE-PATTERNS.md); reference in agent handoff. |
| Prep          | Run build → test → publish → one dApp call once; pin Move/Sui version. |
| Repo          | README Move section; agent handoff Move subsection; optional CI for Move. |
| Team          | Move owners vs integration; one contract lead; short-lived branches. |
| During hack   | Types/entries first; `sui move test` for every change; one network. |
| Risk          | Fixed gas budget; no keys in repo; optional upgrade strategy. |
