import { defineTool } from "eve/tools";
import { z } from "zod";
import {
  UI_DEMO_KIND,
  type UiDemoOutput,
  type UiDemoTopic,
} from "../lib/ui-demo-card";

const topicSchema = z.enum(["gallery", "selection", "schedule", "office-hours"]);

const copy: Record<
  UiDemoTopic,
  { title: string; subtitle: string; summary: string }
> = {
  gallery: {
    title: "UI SDK → Slack demo",
    subtitle: "Eve Cards · Block Kit",
    summary:
      "Interactive Slack card inspired by the UI SDK gallery. Tap the menu or buttons — this is the Eve-native Slack surface.",
  },
  selection: {
    title: "Selection surface",
    subtitle: "createSelection → Block Kit",
    summary:
      "A pick-one control in Slack. UI SDK would use `createSelection` in the browser; here Eve posts a select + buttons.",
  },
  schedule: {
    title: "Schedule surface",
    subtitle: "Calendar-style fields",
    summary:
      "Office-hours style schedule as fields and a table. Not a live UI SDK Calendar — Slack can’t host that — but the same idea as structured schedule UI.",
  },
  "office-hours": {
    title: "Office hours surface",
    subtitle: "Beves Q&A card",
    summary:
      "Quick pointers for this Slack office-hours agent, plus the same interactive controls as the gallery demo.",
  },
};

/**
 * Asks the Slack channel to post a rich Eve Card (Block Kit) demo.
 * The card itself is rendered by `agent/channels/slack.ts` on `call.settled`.
 */
export default defineTool({
  description:
    "Show an interactive Slack UI demo card (Eve Cards → Block Kit), inspired by UI SDK components. Call when the user asks for a UI demo, UI SDK demo, Slack card demo, richer Slack UI, or similar.",
  inputSchema: z.object({
    topic: topicSchema
      .default("gallery")
      .describe(
        "Which demo to show: gallery (overview), selection, schedule, or office-hours.",
      ),
  }),
  label: {
    start: ({ topic }) => `Show UI demo (${topic ?? "gallery"})`,
  },
  async execute({ topic }): Promise<UiDemoOutput> {
    const resolved = topic ?? "gallery";
    const meta = copy[resolved];
    return {
      kind: UI_DEMO_KIND,
      topic: resolved,
      ...meta,
    };
  },
  toModelOutput(output) {
    return {
      type: "text",
      value: `The Slack channel will post the "${output.topic}" UI demo card in this thread. Tell the user they can use the select menu and buttons on the card, or open https://ui-sdk.dev/ for the browser UI SDK.`,
    };
  },
});
