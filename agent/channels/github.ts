import { connectGitHubCredentials } from "@vercel/connect/eve";
import { githubChannel, defaultGitHubAuth } from "eve/channels/github";

export default githubChannel({
  botName: "beves-evee",
  credentials: connectGitHubCredentials("github/beves"),
  onIssue(ctx, issue) {
    if (issue.action !== "opened") return null;
    return { auth: defaultGitHubAuth(ctx) };
  },
  onPullRequest(ctx, pullRequest) {
    if (pullRequest.action !== "opened") return null;
    return { auth: defaultGitHubAuth(ctx) };
  },
});
