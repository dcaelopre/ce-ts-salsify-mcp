import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SalsifyConfig } from "../config.js";
import { recommendRoutes } from "../salsify/api-catalog.js";

const schema = z.object({
  intent: z
    .string()
    .min(3)
    .describe(
      "Natural-language description of what you want to do with the Salsify API, e.g. create a digital asset from a URL or filter products by manufacturer",
    ),
});

export function registerRecommendSalsifyApiRoutesTool(
  server: McpServer,
  config: SalsifyConfig,
): void {
  server.registerTool(
    "recommend_salsify_api_routes",
    {
      title: "Recommend Salsify API Routes",
      description:
        "Advisory only — does not call Salsify. Given an intent, returns matching API routes with method, URL, payload schema, example curl, and documentation links. Write routes are recommended for guidance; this server only executes read operations.",
      inputSchema: schema,
    },
    async ({ intent }) => {
      try {
        const matches = recommendRoutes(intent, config.orgId);
        const payload = {
          intent,
          orgId: config.orgId,
          matchCount: matches.length,
          matches,
          note: matches.length === 0
            ? "No catalog matches. Try keywords like product, digital asset, property, filter, create, update, delete."
            : undefined,
        };
        return { content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { isError: true, content: [{ type: "text" as const, text: "Failed to recommend Salsify API routes: " + message }] };
      }
    },
  );
}
