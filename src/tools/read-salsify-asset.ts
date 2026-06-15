import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SalsifyClient } from "../salsify/client.js";
import { readAssets } from "../salsify/assets.js";
import { MAX_PER_PAGE } from "../salsify/read-mode.js";

const schema = z
  .object({
    assetId: z.string().min(1).optional().describe("Single Salsify digital asset ID"),
    assetIds: z.array(z.string().min(1)).optional().describe("Up to 100 digital asset IDs for bulk REPORT lookup"),
    filter: z.string().optional().describe("Salsify filter expression for search. Empty string returns all assets (paginated)."),
    page: z.number().int().min(1).optional().describe("Page number for filter search (default 1)"),
    per_page: z.number().int().min(1).max(MAX_PER_PAGE).optional().describe("Results per page for filter search (default 25, max 100)"),
  })
  .refine(
    (data) => {
      const modes = [data.assetId, data.assetIds?.length, data.filter !== undefined].filter(Boolean);
      return modes.length === 1;
    },
    { message: "Provide exactly one of: assetId, assetIds, or filter" },
  );

export function registerReadSalsifyAssetTool(server: McpServer, client: SalsifyClient): void {
  server.registerTool(
    "read_salsify_asset",
    {
      title: "Read Salsify Asset",
      description:
        "Read Salsify digital asset data. Use assetId for one asset, assetIds (max 100) for bulk REPORT, or filter for paginated search.",
      inputSchema: schema,
    },
    async (input) => {
      try {
        const result = await readAssets(client, {
          assetId: input.assetId,
          assetIds: input.assetIds,
          filter: input.filter,
          page: input.page,
          perPage: input.per_page,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { isError: true, content: [{ type: "text" as const, text: "Failed to read Salsify asset: " + message }] };
      }
    },
  );
}
