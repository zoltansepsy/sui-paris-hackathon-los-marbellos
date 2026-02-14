# Vercel deployment (SuiPatron)

## Required project settings

In **Vercel → Project → Settings → General**:

1. **Root Directory:** `apps/suipatron`  
   Must be set so Vercel builds this app, not the repo root.

2. **Framework Preset:** Next.js (or leave on Auto).

In **Settings → Git**:

3. **Production Branch:** Usually `main`. Pushes to this branch trigger production deploys.

4. **Ignore Build Step:** Leave empty (or use a script that returns non‑zero when you want to build).  
   If this is set and the script returns `0`, the build is skipped and the deploy won’t run.

## If pushes don’t trigger a deploy

- Confirm the project is connected to this repo and the correct branch (e.g. `main`).
- Check **Deployments**: if the commit appears but build was “Skipped”, check **Ignore Build Step**.
- Re-link the repo: **Settings → Git → Disconnect**, then **Import** the repo again and set **Root Directory** to `apps/suipatron`.

## Monorepo build

`vercel.json` in this directory sets:

- **installCommand:** `cd ../.. && pnpm install` (install from repo root so the whole workspace is available).
- **buildCommand:** `pnpm run build` (runs `next build` in this app).

Environment variables must be set in the Vercel dashboard (mirror `.env.example` and secrets from `.env.local`).

## Enoki 403: "The requested network is not enabled for this API key"

If zkLogin (Google sign-in) fails with a 403 from `api.enoki.mystenlabs.com`:

1. **Enable the network for your API key** in the [Enoki Developer Portal](https://portal.enoki.mystenlabs.com): open your app → API keys → select the key used by `NEXT_PUBLIC_ENOKI_PUBLIC_KEY` → ensure the network you use (e.g. **testnet**) is enabled for that key.
2. **Match env to the key:** set `NEXT_PUBLIC_SUI_NETWORK` to the same network (e.g. `testnet`). The app now passes this network explicitly when creating the zkLogin auth URL.
