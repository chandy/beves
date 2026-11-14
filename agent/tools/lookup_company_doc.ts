import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineTool } from "eve/tools";
import { z } from "zod";

const knowledgeDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../knowledge",
);

/**
 * Light retrieval over a few in-repo markdown notes.
 * Enough for office-hours demos; not a full search stack.
 */
export default defineTool({
  description:
    "Look up a short company/office-hours note by topic keyword (e.g. pto, onboarding, tools).",
  inputSchema: z.object({
    topic: z
      .string()
      .min(1)
      .describe("Keyword or phrase to match against knowledge doc filenames and titles."),
  }),
  async execute({ topic }) {
    const needle = topic.trim().toLowerCase();
    let files: string[];
    try {
      files = (await readdir(knowledgeDir)).filter((name) => name.endsWith(".md"));
    } catch {
      return {
        found: false,
        reason: "Knowledge directory missing.",
        matches: [] as { file: string; content: string }[],
      };
    }

    const matches: { file: string; content: string }[] = [];
    for (const file of files) {
      const content = await readFile(path.join(knowledgeDir, file), "utf8");
      const haystack = `${file}\n${content}`.toLowerCase();
      if (haystack.includes(needle) || needle.split(/\s+/).every((w) => haystack.includes(w))) {
        matches.push({ file, content });
      }
    }

    if (matches.length === 0) {
      return {
        found: false,
        reason: `No knowledge doc matched "${topic}". Available: ${files.join(", ") || "(none)"}`,
        matches: [],
      };
    }

    return {
      found: true,
      matches: matches.slice(0, 3),
    };
  },
});
