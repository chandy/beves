import { connectSlackCredentials } from "@vercel/connect/eve";
import {
  defaultSlackAuth,
  defineSlackRenderer,
  slackChannel,
} from "eve/channels/slack";
import {
  UI_DEMO_ACTION_PREFIX,
  buildUiDemoAckCard,
  buildUiDemoCard,
  isUiDemoOutput,
} from "../lib/ui-demo-card";

/**
 * Slack office-hours channel.
 *
 * Prefer Vercel Connect (see docs/eve-slack-agent-setup.md). The connector UID
 * is usually written to SLACK_CONNECTOR by `eve add channel/slack` / deploy.
 * Fallback name matches a connector named after this project.
 *
 * Rich UI: Eve Cards → Block Kit (not browser UI SDK). When `show_ui_demo`
 * settles, the renderer below posts an interactive card in the thread.
 */
const uiDemoRenderer = defineSlackRenderer({
  events: {
    async "call.settled"(event, ctx, next) {
      await next();
      if (event.data.outcome !== "completed") return;
      const output = event.data.output;
      if (!isUiDemoOutput(output)) return;
      await ctx.channel.thread.post({
        card: buildUiDemoCard(output),
        fallbackText: `${output.title}: ${output.summary}`,
      });
    },
  },
});

export default slackChannel({
  credentials: connectSlackCredentials(
    process.env.SLACK_CONNECTOR ?? "slack/beves",
  ),

  renderers: [uiDemoRenderer],

  // Answer @mentions and DMs from people; ignore other bots.
  onAppMention: (ctx, message) =>
    message.author?.isBot ? null : { auth: defaultSlackAuth(message, ctx) },

  onDirectMessage: (ctx, message) =>
    message.author?.isBot ? null : { auth: defaultSlackAuth(message, ctx) },

  // Custom demo buttons / select (action_ids use beves_ui:, not eve_input:).
  async onInteraction(action, ctx) {
    if (!action.actionId.startsWith(UI_DEMO_ACTION_PREFIX)) return;
    const picked = action.selectedOptionValue ?? action.value;
    await ctx.thread.post({
      card: buildUiDemoAckCard({
        userId: action.user.id,
        actionId: action.actionId,
        picked,
      }),
      fallbackText: picked
        ? `UI demo interaction: ${picked}`
        : "UI demo interaction",
    });
  },
});
