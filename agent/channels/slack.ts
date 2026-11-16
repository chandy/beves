import { connectSlackCredentials } from "@vercel/connect/eve";
import { defaultSlackAuth, slackChannel } from "eve/channels/slack";

/**
 * Slack office-hours channel.
 *
 * Prefer Vercel Connect (see docs/eve-slack-agent-setup.md). The connector UID
 * is usually written to SLACK_CONNECTOR by `eve add channel/slack` / deploy.
 * Fallback name matches a connector named after this project.
 */
export default slackChannel({
  credentials: connectSlackCredentials(
    process.env.SLACK_CONNECTOR ?? "slack/beves",
  ),
  codeChannels: true,

  // Answer @mentions and DMs from people; ignore other bots.
  onAppMention: (ctx, message) =>
    message.author?.isBot ? null : { auth: defaultSlackAuth(message, ctx) },

  onDirectMessage: (ctx, message) =>
    message.author?.isBot ? null : { auth: defaultSlackAuth(message, ctx) },
});
