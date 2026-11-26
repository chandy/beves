# Beves — Eve Slack office-hours agent

Minimal [Eve](https://eve.dev) agent for Slack Q&A (idea 2 from the Project sample list). Mentions and DMs become sessions; answers lean on a few seeded markdown notes under `knowledge/` via one light tool.

## What's in the box

| Path | Role |
| --- | --- |
| `agent/agent.ts` | Model (AI Gateway id) |
| `agent/instructions.md` | Office-hours personality |
| `agent/channels/slack.ts` | Slack via Vercel Connect |
| `agent/channels/eve.ts` | Default HTTP / TUI channel |
| `agent/tools/lookup_company_doc.ts` | Keyword lookup over `knowledge/` |
| `agent/tools/show_ui_demo.ts` | Slack UI demo card (Eve Cards → Block Kit) |
| `agent/lib/ui-demo-card.ts` | Card builders + interaction helpers |
| `knowledge/*.md` | Seeded company notes (demo content) |

## Quick start (local TUI)

Requires **Node.js 24+** and [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

In the TUI, run `/model` if needed, then chat. Slack itself only works against a **deployed** URL (Connect delivers events to Vercel, not localhost).

## Slack + deploy

Chris (or whoever owns the Vercel/Slack workspace) must finish Connect OAuth and deploy. Exact steps:

→ **[docs/eve-slack-agent-setup.md](./docs/eve-slack-agent-setup.md)** (also mirrored in the Project store). See [Eve Slack channel docs](https://eve.dev/docs/channels/slack).

```bash
pnpm run link          # or: eve link
npx eve add channel/slack --skip-install   # finishes Connect if not done
pnpm run deploy        # or: eve deploy
```

Then invite the bot to a private channel, @mention it, or DM it.

### UI demo in Slack

After deploy, `@mention` with **“show the UI demo”**. The bot posts an interactive Eve Card (Block Kit). Browser [UI SDK](https://ui-sdk.dev/) does not run in Slack — see [setup § UI demo](./docs/eve-slack-agent-setup.md#ui-demo-card-eve-cards--block-kit).

## Health check

```bash
curl https://<your-deployment>/eve/v1/health
```
