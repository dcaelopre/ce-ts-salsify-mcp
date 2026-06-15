import type { SalsifyClient } from "./client.js";
import {
  assertSingleReadMode,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
  validateBulkIds,
} from "./read-mode.js";

export type ReadProductsInput = {
  productId?: string;
  productIds?: string[];
  filter?: string;
  page?: number;
  perPage?: number;
};

export async function readProducts(client: SalsifyClient, input: ReadProductsInput) {
  const hasId = Boolean(input.productId?.trim());
  const hasBulk = Boolean(input.productIds?.length);
  const hasFilter = input.filter !== undefined;

  assertSingleReadMode(
    { byId: hasId, bulk: hasBulk, search: hasFilter },
    ["byId (productId)", "bulk (productIds)", "search (filter)"],
  );

  if (hasId) {
    return client.get("/products/" + encodeURIComponent(input.productId!.trim()));
  }

  if (hasBulk) {
    validateBulkIds(input.productIds!, "productIds");
    return client.report("/products", input.productIds!);
  }

  const perPage = Math.min(input.perPage ?? DEFAULT_PER_PAGE, MAX_PER_PAGE);
  return client.get("/products", {
    filter: input.filter,
    page: input.page ?? 1,
    per_page: perPage,
  });
}
