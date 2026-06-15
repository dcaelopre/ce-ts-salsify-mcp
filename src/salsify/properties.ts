import type { SalsifyClient } from "./client.js";
import { assertSingleReadMode, validateBulkIds } from "./read-mode.js";

export type ReadPropertiesInput = {
  propertyId?: string;
  propertyIds?: string[];
};

export async function readProperties(client: SalsifyClient, input: ReadPropertiesInput) {
  const hasId = Boolean(input.propertyId?.trim());
  const hasBulk = Boolean(input.propertyIds?.length);

  assertSingleReadMode(
    { byId: hasId, bulk: hasBulk },
    ["byId (propertyId)", "bulk (propertyIds)"],
  );

  if (hasId) {
    return client.get("/properties/" + encodeURIComponent(input.propertyId!.trim()));
  }

  validateBulkIds(input.propertyIds!, "propertyIds");
  return client.report("/properties", input.propertyIds!);
}
