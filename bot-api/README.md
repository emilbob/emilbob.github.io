# bot-api — OpenRouter proxy for the portfolio chat bot

`emilbob.github.io` is static GitHub Pages. An OpenRouter key in that bundle —
including one injected as `VITE_…` — ships in plaintext to every visitor, who can
then read it out of the JS and spend your credits. So the key lives here instead,
in a Vercel Edge Function, and the site calls this endpoint.

```
emilbob.github.io  ──POST──▶  <this>/api/chat  ──▶  openrouter.ai/api/v1
  (no key)                    (key in env var)
```

## What the endpoint does

`POST /api/chat` with `{"messages": [{"role": "user", "content": "..."}]}` and
streams back **plain UTF-8 text** (not SSE) — the browser just reads the body.

Four things stand between the endpoint and a surprise bill:

| Guard | Where | Effect |
|---|---|---|
| Origin allowlist | `corsHeaders()` | Other sites get 403; a browser can't send a forged `Origin` |
| Server-side system prompt | `lib/context.ts` | The client sends only user/assistant turns, so nobody can repurpose this as a general LLM |
| Input caps | `parseMessages()` | ≤24 turns, ≤1500 chars/message, ≤12000 chars total, ≤700 output tokens |
| Per-IP rate limit | `rateLimited()` | 12 messages / 5 min |

**The rate limit is best-effort, not a guarantee.** It's an in-memory map scoped to
one edge isolate, so requests landing on different isolates each get their own
counter. It stops casual hammering; it is not a hard ceiling. **The real backstop is
a credit limit on the OpenRouter key** — set one (step 1 below). If this ever needs
to be strict, move the counter to Vercel KV or Upstash Redis.

Origin checks only bind browsers; `curl` can send any `Origin` it likes. That's
fine — the caps and the credit limit are what bound the damage, not the allowlist.

## Deploy

1. **Create the key.** <https://openrouter.ai/keys> → create a key →
   **set a credit limit on it** (e.g. $5). That limit is the hard stop on spend.

2. **Create the Vercel project.** Import `emilbob/emilbob.github.io`, then in the
   setup screen:
   - **Root Directory**: `bot-api`  ← the important one. It stops Vercel from
     building the whole Vite site just to serve one function.
   - **Framework Preset**: Other
   - Build/Output/Install commands: leave empty

3. **Add environment variables** (Settings → Environment Variables), for all environments:

   | Name | Value |
   |---|---|
   | `OPENROUTER_API_KEY` | the key from step 1 — **required** |
   | `OPENROUTER_MODEL` | optional, defaults to `anthropic/claude-haiku-4.5` |
   | `ALLOWED_ORIGINS` | optional, defaults to `https://emilbob.github.io` + localhost |

4. **Deploy**, then confirm the URL, e.g. `https://emil-bot.vercel.app/api/chat`.
   Per this repo's Lessons: use the stable production alias
   `<project>-<team-slug>.vercel.app`, **never** a per-deployment hash URL — those
   change on every push.

5. **Point the site at it.** In the GitHub repo → Settings → Secrets and variables →
   Actions → **Variables** → New repository variable:

   ```
   VITE_BOT_API_URL = https://emil-bot.vercel.app/api/chat
   ```

   It's a *variable*, not a secret: Vite inlines it into the public bundle, and it's
   only a URL. `deploy.yml` reads it at build time. Until it's set the widget
   renders nothing at all, so the site is never broken by a missing proxy.

6. **Push.** Pages rebuilds with the URL baked in and the bot goes live.

## Local development

```bash
# terminal 1 — the proxy
cd bot-api
npm install
npx vercel dev --listen 3001     # first run links the project and pulls env vars

# terminal 2 — the site
cd ..
echo 'VITE_BOT_API_URL=http://localhost:3001/api/chat' > .env.local
npm run dev
```

`localhost:5173` and `:4173` are already in the default origin allowlist.

## Tests

```bash
npm test        # mocks OpenRouter, runs the real handler — no API key needed, no spend
npm run typecheck
```

Covers stream reassembly (split frames, byte-at-a-time, keepalive comments), the
origin allowlist, every input-validation branch, the rate limiter, and upstream
failure. The suite has a watchdog because the characteristic bug here is a
*stalled* stream, which hangs a runner instead of failing it.

## Changing the model

Any slug from <https://openrouter.ai/models> — one env var, no redeploy of the site.
The default, `anthropic/claude-haiku-4.5`, is $1/$5 per million input/output tokens.
The grounding context is ~3k tokens and rides along on every message, so a typical
few-turn conversation costs on the order of a cent or two. Switching to a larger
model mostly multiplies that input cost, since the context dominates.

## Editing what the bot knows

`lib/context.ts`. It's a hand-maintained snapshot of the site's content — the same
hazard as `GROUPS` in `src/components/sections/Projects.tsx`: nothing breaks when it
goes stale, the bot just confidently says something out of date. Update it whenever
a project is added, renamed, or gets a live demo.
