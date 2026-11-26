import {
  Actions,
  Button,
  Card,
  CardLink,
  CardText,
  Divider,
  Field,
  Fields,
  LinkButton,
  Select,
  SelectOption,
  Table,
  type CardElement,
} from "eve/channels/slack";

/** Marker on `show_ui_demo` output so the Slack renderer can post a card. */
export const UI_DEMO_KIND = "ui_sdk_slack_demo" as const;

export type UiDemoTopic = "gallery" | "selection" | "schedule" | "office-hours";

export type UiDemoOutput = {
  kind: typeof UI_DEMO_KIND;
  topic: UiDemoTopic;
  title: string;
  subtitle: string;
  summary: string;
};

export function isUiDemoOutput(value: unknown): value is UiDemoOutput {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return record.kind === UI_DEMO_KIND && typeof record.topic === "string";
}

/** Prefix for custom Block Kit action_ids (must not use Eve's `eve_input:`). */
export const UI_DEMO_ACTION_PREFIX = "beves_ui:";

export const UI_DEMO_ACTIONS = {
  surface: `${UI_DEMO_ACTION_PREFIX}surface`,
  thanks: `${UI_DEMO_ACTION_PREFIX}thanks`,
  again: `${UI_DEMO_ACTION_PREFIX}again`,
} as const;

/**
 * Build an Eve Slack Card for the UI SDK ↔ Slack demo.
 *
 * UI SDK (https://ui-sdk.dev/) is a browser behavior library — it does not
 * render in Slack. Eve Cards convert to Block Kit at post time, which is the
 * Eve-native way to show interactive surfaces in Slack.
 */
export function buildUiDemoCard(demo: UiDemoOutput): CardElement {
  const children = [
    CardText(demo.summary),
    CardText(
      "UI SDK runs in the browser (behaviors like `createSelection`, `createPopup`). Slack gets Eve Cards → Block Kit instead.",
      { style: "muted" },
    ),
    Divider(),
    ...topicBody(demo.topic),
    Divider(),
    Actions([
      Select({
        id: UI_DEMO_ACTIONS.surface,
        label: "Try a surface",
        placeholder: "Pick a UI SDK–inspired surface",
        dispatchAction: true,
        options: [
          SelectOption({
            label: "Gallery overview",
            value: "gallery",
            description: "What maps where",
          }),
          SelectOption({
            label: "Selection",
            value: "selection",
            description: "createSelection → buttons / select",
          }),
          SelectOption({
            label: "Schedule fields",
            value: "schedule",
            description: "Calendar-style fields + table",
          }),
          SelectOption({
            label: "Office hours",
            value: "office-hours",
            description: "Q&A card for this agent",
          }),
        ],
      }),
    ]),
    Actions([
      Button({
        id: UI_DEMO_ACTIONS.thanks,
        label: "Looks good",
        style: "primary",
        value: "thanks",
      }),
      Button({
        id: UI_DEMO_ACTIONS.again,
        label: "Ping me",
        value: "again",
      }),
      LinkButton({
        label: "Open UI SDK docs",
        url: "https://ui-sdk.dev/",
        style: "default",
      }),
    ]),
    CardLink({ label: "ui-sdk.dev", url: "https://ui-sdk.dev/" }),
  ];

  return Card({
    title: demo.title,
    subtitle: demo.subtitle,
    width: "full",
    children,
  });
}

function topicBody(topic: UiDemoTopic) {
  switch (topic) {
    case "selection":
      return [
        CardText("*Selection* — UI SDK `createSelection` becomes Slack buttons / a select menu."),
        Fields([
          Field({ label: "UI SDK", value: "`createSelection`" }),
          Field({ label: "Slack / Eve", value: "`Select` + `Button`" }),
          Field({ label: "Interaction", value: "`onInteraction` in slack.ts" }),
        ]),
      ];
    case "schedule":
      return [
        CardText("*Schedule* — calendar-style info as fields + a small table (not a browser Calendar)."),
        Fields([
          Field({ label: "Next slot", value: "Tue 2:00–2:25pm" }),
          Field({ label: "Room", value: "Virtual / Slack thread" }),
          Field({ label: "Host", value: "Beves Office Hours" }),
        ]),
        Table({
          headers: ["Day", "Focus"],
          rows: [
            ["Mon", "Onboarding & tools"],
            ["Wed", "PTO & process"],
            ["Fri", "Open Q&A"],
          ],
          align: ["left", "left"],
        }),
      ];
    case "office-hours":
      return [
        CardText("*Office hours* — ask about PTO, onboarding, or tools; or tap a control below."),
        Fields([
          Field({ label: "Docs tool", value: "`lookup_company_doc`" }),
          Field({ label: "UI demo", value: "`show_ui_demo`" }),
          Field({ label: "Try saying", value: '"show the UI demo"' }),
        ]),
      ];
    case "gallery":
    default:
      return [
        CardText("*Gallery* — a few UI SDK ideas mapped onto Eve Slack cards:"),
        Fields([
          Field({ label: "createSelection", value: "Select / buttons below" }),
          Field({ label: "createPopup", value: "Link out to ui-sdk.dev" }),
          Field({ label: "Calendar", value: "Fields + table on schedule topic" }),
          Field({ label: "Segmented control", value: "Primary / secondary buttons" }),
        ]),
      ];
  }
}

export function buildUiDemoAckCard(opts: {
  userId: string;
  actionId: string;
  picked?: string;
}): CardElement {
  const mention = `<@${opts.userId}>`;
  if (opts.actionId === UI_DEMO_ACTIONS.surface && opts.picked) {
    return Card({
      title: "Surface picked",
      children: [
        CardText(`${mention} chose *${opts.picked}*.`),
        CardText(
          "Ask me again with that topic (e.g. “show the selection UI demo”) to refresh the card.",
          { style: "muted" },
        ),
      ],
    });
  }
  if (opts.actionId === UI_DEMO_ACTIONS.thanks) {
    return Card({
      title: "Ack",
      children: [CardText(`${mention} — glad the Slack UI surface landed.`)],
    });
  }
  return Card({
    title: "Ping",
    children: [
      CardText(`${mention} tapped the demo card. Say “show the UI demo” anytime.`),
    ],
  });
}
