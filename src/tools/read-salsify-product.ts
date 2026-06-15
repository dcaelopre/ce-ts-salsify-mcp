import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SalsifyClient } from "../salsify/client.js";
import { readProducts } from "../salsify/products.js";
import { MAX_PER_PAGE } from "../salsify/read-mode.js";

const schema = z
  .object({
    productId: z.string().min(1).optional().describe("Single Salsify product ID"),
    productIds: z.array(z.string().min(1)).optional().describe("Up to 100 product IDs for bulk REPORT lookup"),
    filter: z.string().optional().describe("Salsify filter expression for search. Empty string returns all products (paginated)."),
    page: z.number().int().min(1).optional().describe("Page number for filter search (default 1)"),
    per_page: z.number().int().min(1).max(MAX_PER_PAGE).optional().describe("Results per page for filter search (default 25, max 100)"),
  })
  .refine(
    (data) => {
      const modes = [data.productId, data.productIds?.length, data.filter !== undefined].filter(Boolean);
      return modes.length === 1;
    },
    { message: "Provide exactly one of: productId, productIds, or filter" },
  );

export function registerReadSalsifyProductTool(server: McpServer, client: SalsifyClient): void {
  server.registerTool(
    "read_salsify_product",
    {
      title: "Read Salsify Product",
      description:
        "Read Salsify product data. Use productId for one product, productIds (max 100) for bulk REPORT, or filter for paginated search. Do not request all pages unless the user asks.",
      inputSchema: schema,
    },
    async (input) => {
      try {
        const result = await readProducts(client, {
          productId: input.productId,
          productIds: input.productIds,
          filter: input.filter,
          page: input.page,
          perPage: input.per_page,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { isError: true, content: [{ type: "text" as const, text: "Failed to read Salsify product: " + message }] };
      }
    },
  );
}
