import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SalsifyClient } from "../salsify/client.js";
import { searchProductsByAssetId } from "../salsify/product-asset-search.js";
import { MAX_PER_PAGE } from "../salsify/read-mode.js";

const schema = z.object({
  assetId: z
    .string()
    .min(1)
    .describe(
      "Digital asset ID (salsify:id hash) to find on linked products, e.g. d10ecf415c8441a18cf4b46a00cea4a4",
    ),
  assetProperty: z
    .string()
    .min(1)
    .optional()
    .describe(
      "Single product property that stores digital asset IDs, e.g. Main Image",
    ),
  assetProperties: z
    .array(z.string().min(1))
    .optional()
    .describe(
      "Multiple product properties to search with OR logic when the asset may appear in any of them",
    ),
  page: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Page number for results (default 1)"),
  per_page: z
    .number()
    .int()
    .min(1)
    .max(MAX_PER_PAGE)
    .optional()
    .describe("Results per page (default 25, max 100)"),
});

export function registerSearchSalsifyProductsByAssetTool(
  server: McpServer,
  client: SalsifyClient,
): void {
  server.registerTool(
    "search_salsify_products_by_asset",
    {
      title: "Search Salsify Products by Asset",
      description:
        "Find products linked to a digital asset ID. Requires the product property name(s) that hold asset references " +
        "(digital_asset fields like Main Image). Provide assetProperty for one field or assetProperties for several (OR search). " +
        "Uses GET /orgs/{orgId}/products?filter=...",
      inputSchema: schema,
    },
    async (input) => {
      try {
        const result = await searchProductsByAssetId(client, {
          assetId: input.assetId,
          assetProperty: input.assetProperty,
          assetProperties: input.assetProperties,
          page: input.page,
          perPage: input.per_page,
        });
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: "Failed to search Salsify products by asset: " + message,
            },
          ],
        };
      }
    },
  );
}
