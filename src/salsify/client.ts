import type { SalsifyConfig } from "../config.js";

export class SalsifyClient {
  private readonly orgBaseUrl: string;
  private readonly orgAppBaseUrl: string;

  constructor(private readonly config: SalsifyConfig) {
    this.orgBaseUrl = "https://app.salsify.com/api/v1/orgs/" + encodeURIComponent(config.orgId);
    this.orgAppBaseUrl = "https://app.salsify.com/api/orgs/" + encodeURIComponent(config.orgId);
  }

  get orgId(): string {
    return this.config.orgId;
  }

  private normalizeToken(token: string): string {
    return token.replace(/^Bearer\s+/i, "").trim();
  }

  private authHeaders(includeContentType: boolean): Record<string, string> {
    return {
      Authorization: "Bearer " + this.normalizeToken(this.config.apiToken),
      Accept: "application/json",
      ...(includeContentType ? { "Content-Type": "application/json" } : {}),
    };
  }

  private async requestJson<T>(
    baseUrl: string,
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = new URL(baseUrl + path);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    const response = await fetch(url, {
      method: "GET",
      headers: this.authHeaders(false),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error("Salsify API error (" + response.status + "): " + detail);
    }
    return (await response.json()) as T;
  }

  async get<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    return this.requestJson<T>(this.orgBaseUrl, path, query);
  }

  /** Org app API (non-v1) used for enumerated/picklist value reads. */
  async getOrgApp<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    return this.requestJson<T>(this.orgAppBaseUrl, path, query);
  }

  async report<T>(path: string, ids: string[]): Promise<T> {
    const response = await fetch(this.orgBaseUrl + path, {
      method: "REPORT",
      headers: this.authHeaders(true),
      body: JSON.stringify({ ids }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error("Salsify API error (" + response.status + "): " + detail);
    }
    return (await response.json()) as T;
  }
}
