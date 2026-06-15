import type { IncomingHttpHeaders } from "node:http";
import { z } from "zod";

export const SALSIFY_CREDENTIAL_HEADERS = {
  apiToken: "x-salsify-api-token",
  orgId: "x-salsify-org-id",
} as const;

const configSchema = z.object({
  apiToken: z.string().min(1, "SALSIFY_API_TOKEN is required"),
  orgId: z.string().min(1, "SALSIFY_ORG_ID is required"),
});

export type SalsifyConfig = z.infer<typeof configSchema>;

function getHeaderValue(
  headers: IncomingHttpHeaders | undefined,
  name: string,
): string | undefined {
  if (!headers) return undefined;
  const value = headers[name];
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }
  return undefined;
}

export class SalsifyConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SalsifyConfigError";
  }
}

export function resolveConfig(headers?: IncomingHttpHeaders): SalsifyConfig {
  const apiToken =
    getHeaderValue(headers, SALSIFY_CREDENTIAL_HEADERS.apiToken) ??
    process.env.SALSIFY_API_TOKEN;
  const orgId =
    getHeaderValue(headers, SALSIFY_CREDENTIAL_HEADERS.orgId) ??
    process.env.SALSIFY_ORG_ID;
  const result = configSchema.safeParse({ apiToken, orgId });
  if (!result.success) {
    const messages = result.error.issues.map((issue) => issue.message).join("; ");
    throw new SalsifyConfigError(
      messages + ". Provide credentials via Claude MCP config headers (" +
        SALSIFY_CREDENTIAL_HEADERS.apiToken + ", " + SALSIFY_CREDENTIAL_HEADERS.orgId +
        ") or server environment variables.",
    );
  }
  return result.data;
}
