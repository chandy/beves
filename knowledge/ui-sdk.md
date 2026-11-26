# UI SDK and Slack (Beves)

[UI SDK](https://ui-sdk.dev/) is a **browser** library of UI behaviors for agents
(`createSelection`, `createPopup`, `createRovingFocus`, and so on). It does **not**
render inside Slack messages.

In this Eve Slack agent, rich messages use **Eve Cards**, which convert to Slack
**Block Kit** when posted. The demo tool `show_ui_demo` posts an interactive card
inspired by UI SDK gallery ideas (selection, schedule fields, links).

## Try it in Slack

@mention the bot (or DM it):

- “show the UI demo”
- “show the selection UI demo”
- “show the schedule UI demo”

Then use the select menu or buttons on the card. Open https://ui-sdk.dev/ for the
real browser component gallery.
