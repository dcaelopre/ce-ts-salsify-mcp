import type { SalsifyClient } from "./client.js";
import { readProperties } from "./properties.js";
import {
  assertSingleReadMode,
  DEFAULT_PER_PAGE,
  MAX_PER_PAGE,
} from "./read-mode.js";

export type EnumeratedValueItem = {
  id: string;
  name: string;
  localized_names: Record<string, string>;
  has_children: boolean;
  property_id: string;
  parent_id: string | null;
};

type EnumeratedValuesApiResponse = {
  data: EnumeratedValueItem | EnumeratedValueItem[];
  meta?: {
    current_page: number;
    per_page: number;
    total_entries: number;
  };
};

export type ReadEnumeratedValuesInput = {
  propertyId: string;
  enumeratedValueId?: string;
  page?: number;
  perPage?: number;
};

type PropertyMetadata = {
  "salsify:id"?: string;
  "salsify:data_type"?: string;
};

async function assertEnumeratedProperty(
  client: SalsifyClient,
  propertyId: string,
): Promise<void> {
  const property = (await readProperties(client, { propertyId })) as PropertyMetadata;
  const dataType = property["salsify:data_type"];

  if (dataType !== "enumerated") {
    throw new Error(
      `Property "${propertyId}" has data type "${dataType ?? "unknown"}", not "enumerated". ` +
        "Picklist/enumerated values are only available for enumerated properties.",
    );
  }
}

function normalizeListResponse(
  propertyId: string,
  response: EnumeratedValuesApiResponse,
) {
  const items = Array.isArray(response.data) ? response.data : [response.data];

  return {
    propertyId,
    items,
    meta: response.meta ?? null,
  };
}

function normalizeSingleResponse(
  propertyId: string,
  enumeratedValueId: string,
  response: EnumeratedValuesApiResponse,
) {
  const item = Array.isArray(response.data) ? response.data[0] : response.data;

  if (!item) {
    throw new Error(
      `Enumerated value "${enumeratedValueId}" was not found for property "${propertyId}".`,
    );
  }

  return {
    propertyId,
    item,
  };
}

export async function readEnumeratedValues(
  client: SalsifyClient,
  input: ReadEnumeratedValuesInput,
) {
  const propertyId = input.propertyId.trim();
  const enumeratedValueId = input.enumeratedValueId?.trim();
  const hasValueId = Boolean(enumeratedValueId);

  assertSingleReadMode(
    { byValueId: hasValueId, list: !hasValueId },
    ["byValueId (enumeratedValueId)", "list (paginated values for propertyId)"],
  );

  await assertEnumeratedProperty(client, propertyId);

  if (hasValueId) {
    const response = await client.getOrgApp<EnumeratedValuesApiResponse>(
      "/enumerated_values/" + encodeURIComponent(enumeratedValueId!),
      { property_id: propertyId },
    );
    return normalizeSingleResponse(propertyId, enumeratedValueId!, response);
  }

  const perPage = Math.min(input.perPage ?? DEFAULT_PER_PAGE, MAX_PER_PAGE);
  const response = await client.getOrgApp<EnumeratedValuesApiResponse>(
    "/enumerated_values",
    {
      property_id: propertyId,
      page: input.page ?? 1,
      per_page: perPage,
    },
  );

  return normalizeListResponse(propertyId, response);
}
