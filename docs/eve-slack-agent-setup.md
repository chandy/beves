# Eve Slack office-hours agent — setup for Chris Handy

Runnable agent lives in the **beves** GitHub repo (`agent/`, `knowledge/`). This doc is the exact checklist to go from clone → live Slack replies.

Official references: [Eve getting started](https://eve.dev/docs/getting-started), [Slack channel](https://eve.dev/docs/channels/slack), [Deploy to Vercel](https://eve.dev/docs/deployment/vercel).

---

## What you already have in the repo

- Eve agent scaffold (`agent/agent.ts`, `instructions.md`)
- Slack channel wired for **Vercel Connect** (`agent/channels/slack.ts`)
- One light tool: `lookup_company_doc` over seeded `knowledge/*.md` notes
- Scripts: `pnpm dev` / `pnpm link` / `pnpm deploy`

You still must do browser/OAuth steps (Vercel login, Slack install, Connect) yourself. No bot token belongs in git.

---

## Prerequisites

| Need | Notes |
| --- | --- |
| Node.js **24+** | Eve refuses older runtimes. |
| pnpm | `corepack enable` then use the repo `packageManager`. |
| Vercel account | Team/project you can link and deploy. |
| Slack workspace | Permission to install an app (or accept Vercel’s managed Slack app via Connect). |

---

## 1. Clone and install

```bash
git clone <beves-repo-url>
cd beves
pnpm install
```

Optional local smoke (TUI only — **not** Slack):

```bash
pnpm dev
```

In the TUI, `/model` if you need a provider, then ask a question like “What’s our PTO policy?” to exercise `lookup_company_doc`.

---

## 2. Link the Vercel project (`eve link`)

From the repo root:

```bash
pnpm link
# same as: npx eve link
```

- Signs you into Vercel if needed.
- Creates or links a Vercel project.
- Pulls env (including OIDC material for AI Gateway).

Non-interactive variant:

```bash
npx eve link --project beves --non-interactive
# add --team <team-slug> if you have multiple teams
```

Then:

```bash
npx vercel env pull   # optional; refreshes .env.local
```

Keep `.env` / `.env.local` gitignored.

---

## 3. Slack via Vercel Connect (recommended)

Connect manages the Slack bot token, rotation, workspace installs, and request verification. The channel file already expects a connector UID in `SLACK_CONNECTOR` (fallback `slack/beves`).

### Guided path (preferred)

```bash
npx eve add channel/slack --skip-install
```

(`--skip-install` because `agent/channels/slack.ts` is already in the repo.)

This flow typically:

1. Confirms the linked Vercel project.
2. Creates or reuses a Slack Connect client (UID like `slack/beves`).
3. Opens Slack authorization in the browser — **install / allow the app in your workspace**.
4. Registers the webhook trigger destination as **`/eve/v1/slack`** on the project.
5. Sets project env **`SLACK_CONNECTOR`** to that UID.

If setup stops midway, re-run the same command; Eve only finishes missing steps. Avoid repeatedly running raw `vercel connect create slack` — each create can install a **new** Slack app and clutter the @-mention list. Remove stale apps under [Slack Manage apps](https://app.slack.com/manage) if that happens.

### Manual Connect CLI (if you prefer)

```bash
npx vercel connect create slack --triggers
```

Copy the connector UID into the Vercel project env:

- Name: `SLACK_CONNECTOR`
- Value: e.g. `slack/beves`

Point the Connect trigger / webhook destination at:

`https://<your-deployment-host>/eve/v1/slack`

Align `agent/channels/slack.ts` fallback or env with the real UID.

---

## 4. Env secrets on Vercel

In the Vercel project → Settings → Environment Variables (Production + Preview as needed):

| Variable | Required? | Purpose |
| --- | --- | --- |
| `SLACK_CONNECTOR` | Yes (Connect path) | Connect client UID; used by `connectSlackCredentials(...)`. |
| AI Gateway / OIDC | Usually automatic after link | String model ids use Gateway via project OIDC — no provider key required on Vercel. |
| Provider API keys | Only if you switch off Gateway | e.g. direct Anthropic/OpenAI. |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Optional | Local `eve remote connect` / curl when Deployment Protection is on. |

Do **not** commit tokens. With Connect you should **not** need `SLACK_BOT_TOKEN` / `SLACK_SIGNING_SECRET` in the project.

---

## 5. Deploy (`eve deploy`)

```bash
pnpm deploy
# same as: npx eve deploy
```

Use **`eve deploy`**, not bare `vercel deploy` — it installs deps, runs production deploy, and pulls env afterward.

Non-interactive:

```bash
npx eve deploy --project beves --non-interactive --yes
```

Verify:

```bash
curl https://<your-host>/eve/v1/health
```

Optional TUI against the deployment:

```bash
npx eve remote connect --url https://<your-host>
```

---

## 6. Use it in Slack

1. Invite the bot to a **private** channel first (safer than public).
2. `@mention` it with a question (e.g. “@Beves what’s in the onboarding checklist?”).
3. Or open a **DM** with the bot.
4. Continue in the **same thread** so Eve keeps one session.

Slack events go Connect → your **deployed** `/eve/v1/slack` route. Local `pnpm dev` does not receive Slack webhooks.

---

## Alternative: portable Slack credentials (self-managed app)

Only if you cannot use Connect. Replace the channel file with:

```ts
import { slackChannel } from "eve/channels/slack";
export default slackChannel();
```

Then in [api.slack.com/apps](https://api.slack.com/apps):

1. Create an app; add bot scopes: `app_mentions:read`, `chat:write`, `channels:history`, `groups:history`, `im:history`, `mpim:history`, plus `files:read` / `files:write` if you want file support.
2. Install to the workspace; copy **Bot User OAuth Token** → `SLACK_BOT_TOKEN`.
3. Copy **Signing Secret** → `SLACK_SIGNING_SECRET`.
4. Event Subscriptions + Interactivity Request URL: `https://<host>/eve/v1/slack`.
5. Subscribe to `app_mention`, `message.channels`, `message.groups`, `message.im`, `message.mpim`.
6. Put both secrets in Vercel env (and `.env.local` for local non-Slack work).

---

## Troubleshooting

| Symptom | Likely fix |
| --- | --- |
| Mention, no reply | Bot not in channel; deploy not finished; trigger not aimed at `/eve/v1/slack`. Re-run `eve add channel/slack --skip-install`. |
| Multiple identical bots | Extra Connect creates; uninstall stale apps in Slack Manage apps. |
| Health 401 with Protection | Set `VERCEL_AUTOMATION_BYPASS_SECRET` locally or allow the request. |
| Model errors after deploy | Confirm project is linked and Gateway/OIDC is enabled; or set a provider key. |
| Tool finds nothing | Seed files are under `knowledge/`; ask with keywords like `pto`, `onboarding`, `tools`. |

---

## Remaining manual steps (checklist)

- [ ] `pnpm install` on a machine with Node 24+
- [ ] `eve link` (Vercel login + project)
- [ ] `eve add channel/slack --skip-install` and complete Slack OAuth / workspace install in the browser
- [ ] Confirm `SLACK_CONNECTOR` on the Vercel project
- [ ] `eve deploy`
- [ ] `curl …/eve/v1/health`
- [ ] Invite bot → @mention or DM in a private channel
- [ ] Replace `knowledge/*.md` sample notes with real company content when ready
