import type { SalsifyConfig } from "../config.js";

export class SalsifyClient {
  private readonly orgBaseUrl: string;

  constructor(private readonly config: SalsifyConfig) {
    this.orgBaseUrl = "https://app.salsify.com/api/v1/orgs/" + encodeURIComponent(config.orgId);
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

  async get<T>(
    path: string,
    query?: Record<string, string | number | undefined>,
  ): Promise<T> {
    const url = new URL(this.orgBaseUrl + path);
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
