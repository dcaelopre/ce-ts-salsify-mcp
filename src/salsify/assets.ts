import type { SalsifyClient } from "./client.js";
import {
  assertSingleReadMode,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
  validateBulkIds,
} from "./read-mode.js";

export type ReadAssetsInput = {
  assetId?: string;
  assetIds?: string[];
  filter?: string;
  page?: number;
  perPage?: number;
};

export async function readAssets(client: SalsifyClient, input: ReadAssetsInput) {
  const hasId = Boolean(input.assetId?.trim());
  const hasBulk = Boolean(input.assetIds?.length);
  const hasFilter = input.filter !== undefined;

  assertSingleReadMode(
    { byId: hasId, bulk: hasBulk, search: hasFilter },
    ["byId (assetId)", "bulk (assetIds)", "search (filter)"],
  );

  if (hasId) {
    return client.get("/digital_assets/" + encodeURIComponent(input.assetId!.trim()));
  }

  if (hasBulk) {
    validateBulkIds(input.assetIds!, "assetIds");
    return client.report("/digital_assets", input.assetIds!);
  }

  const perPage = Math.min(input.perPage ?? DEFAULT_PER_PAGE, MAX_PER_PAGE);
  return client.get("/digital_assets", {
    filter: input.filter,
    page: input.page ?? 1,
    per_page: perPage,
  });
}
