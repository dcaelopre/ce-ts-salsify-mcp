import type { SalsifyClient } from "./client.js";
import {
  buildOrFilter,
  buildPropertyEqualsFilter,
} from "./filters.js";
import { readProducts } from "./products.js";
import { DEFAULT_PER_PAGE, MAX_PER_PAGE } from "./read-mode.js";

export type SearchProductsByAssetInput = {
  assetId: string;
  assetProperty?: string;
  assetProperties?: string[];
  page?: number;
  perPage?: number;
};

function resolveAssetProperties(input: SearchProductsByAssetInput): string[] {
  const names = new Set<string>();

  if (input.assetProperty?.trim()) {
    names.add(input.assetProperty.trim());
  }

  for (const name of input.assetProperties ?? []) {
    if (name.trim()) {
      names.add(name.trim());
    }
  }

  if (names.size === 0) {
    throw new Error(
      "Provide assetProperty and/or assetProperties — the Salsify product property name(s) " +
        "that store digital asset IDs (e.g. Main Image, Hero Image, Gallery). " +
        "Salsify does not support a global reverse lookup by asset ID alone.",
    );
  }

  return [...names];
}

export function buildProductsByAssetFilter(
  assetId: string,
  propertyNames: string[],
): string {
  const clauses = propertyNames.map((propertyName) =>
    buildPropertyEqualsFilter(propertyName, assetId.trim()),
  );
  return buildOrFilter(clauses);
}

export async function searchProductsByAssetId(
  client: SalsifyClient,
  input: SearchProductsByAssetInput,
) {
  const assetId = input.assetId.trim();
  if (!assetId) {
    throw new Error("assetId is required");
  }

  const propertyNames = resolveAssetProperties(input);
  const filter = buildProductsByAssetFilter(assetId, propertyNames);
  const perPage = Math.min(input.perPage ?? DEFAULT_PER_PAGE, MAX_PER_PAGE);

  const result = await readProducts(client, {
    filter,
    page: input.page ?? 1,
    perPage,
  });

  return {
    assetId,
    searchedProperties: propertyNames,
    filter,
    ...((result as object) ?? {}),
  };
}
