import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SalsifyClient } from "../salsify/client.js";
import { readEnumeratedValues } from "../salsify/enumerated-values.js";
import { MAX_PER_PAGE } from "../salsify/read-mode.js";

const schema = z
  .object({
    propertyId: z
      .string()
      .min(1)
      .describe(
        "Salsify property ID for an enumerated/picklist property, e.g. Brand or subBrand",
      ),
    enumeratedValueId: z
      .string()
      .min(1)
      .optional()
      .describe("Single picklist/enumerated value ID to read for the property"),
    page: z
      .number()
      .int()
      .min(1)
      .optional()
      .describe("Page number when listing values (default 1)"),
    per_page: z
      .number()
      .int()
      .min(1)
      .max(MAX_PER_PAGE)
      .optional()
      .describe("Results per page when listing values (default 25, max 100)"),
  })
  .refine((data) => !(data.enumeratedValueId && (data.page || data.per_page)), {
    message: "Use either enumeratedValueId or page/per_page, not both",
  });

export function registerReadSalsifyEnumeratedValuesTool(
  server: McpServer,
  client: SalsifyClient,
): void {
  server.registerTool(
    "read_salsify_enumerated_values",
    {
      title: "Read Salsify Enumerated Values",
      description:
        "Read picklist/enumerated option values for an enumerated property. " +
        "Provide propertyId to list values (paginated) or propertyId + enumeratedValueId for one value. " +
        "Uses GET /api/orgs/{orgId}/enumerated_values and validates the property data type via v1 property schema.",
      inputSchema: schema,
    },
    async (input) => {
      try {
        const result = await readEnumeratedValues(client, {
          propertyId: input.propertyId,
          enumeratedValueId: input.enumeratedValueId,
          page: input.page,
          perPage: input.per_page,
        });
        return {
          content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return {
          isError: true,
          content: [
            {
              type: "text" as const,
              text: "Failed to read Salsify enumerated values: " + message,
            },
          ],
        };
      }
    },
  );
}
