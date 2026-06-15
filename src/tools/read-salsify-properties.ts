import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SalsifyClient } from "../salsify/client.js";
import { readProperties } from "../salsify/properties.js";

const schema = z
  .object({
    propertyId: z.string().min(1).optional().describe("Single Salsify property ID (e.g. Product Name, Manufacturer)"),
    propertyIds: z.array(z.string().min(1)).optional().describe("Up to 100 property IDs for bulk REPORT lookup"),
  })
  .refine(
    (data) => Boolean(data.propertyId) !== Boolean(data.propertyIds?.length),
    { message: "Provide exactly one of: propertyId or propertyIds" },
  );

export function registerReadSalsifyPropertiesTool(server: McpServer, client: SalsifyClient): void {
  server.registerTool(
    "read_salsify_properties",
    {
      title: "Read Salsify Properties",
      description:
        "Read Salsify property schema/metadata. Use propertyId for one property or propertyIds (max 100) for bulk REPORT. Salsify has no filter-list endpoint for properties.",
      inputSchema: schema,
    },
    async (input) => {
      try {
        const result = await readProperties(client, {
          propertyId: input.propertyId,
          propertyIds: input.propertyIds,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { isError: true, content: [{ type: "text" as const, text: "Failed to read Salsify properties: " + message }] };
      }
    },
  );
}
