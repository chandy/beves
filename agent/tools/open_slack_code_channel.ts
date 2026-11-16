import { openCodeChannel } from "eve/channels/slack";
import { defineTool } from "eve/tools";
import { z } from "zod";
import slack from "../channels/slack";

export default defineTool({
  description: [
    "Create a Slack code channel for a task when the person explicitly asks to create, open, or spin one up.",
    "Use only from a Slack conversation, not for ordinary coding help. Slack links the new channel in the original thread and invites the person who asked.",
    "If the result is unavailable or Slack refuses, relay the reason and do not retry.",
  ].join(" "),
  inputSchema: z.object({
    message: z
      .string()
      .min(1)
      .describe("A concise first message that states the requested task and where to start."),
    name: z
      .string()
      .min(1)
      .max(80)
      .describe("A short, task-focused Slack channel name."),
  }),
  async execute({ message, name }, ctx) {
    return await openCodeChannel(ctx, slack, message, { name });
  },
});
