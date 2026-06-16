# Salsify MCP Server — Claude Desktop Setup

Connect **Claude Desktop** to the shared **Salsify** MCP server to read products, digital assets, property schemas, search products by linked assets, and get API route recommendations.

**Scope:** Salsify PIM read-only at `https://app.salsify.com/api/v1`. Write routes are documented via `recommend_salsify_api_routes` but not executed by this server.

---

## What you need

1. **Claude Desktop** — [claude.ai/download](https://claude.ai/download)
2. **Node.js 18+** (includes `npx`) — [nodejs.org](https://nodejs.org/)
3. **Salsify credentials:**
   - API token — **My Profile → API Access → Show API Key** (token only, do not include `Bearer `)
   - Organization ID — from your Salsify URL after `/orgs/` (e.g. `s-99c38f27-1a27-4e45-9f3d-f7f9824094fa`)
4. **MCP server URL:**

```
https://celopre-salsify-mcp-dev-g5ddb3ayf5dpgre0.eastus-01.azurewebsites.net/mcp
```

---

## Step 1 — Open Claude Desktop config

| Install type | Config file path |
|---|---|
| **Windows (Microsoft Store)** | `%LOCALAPPDATA%\Packages\Claude_pzs8sxrjxfjjc\LocalCache\Roaming\Claude\claude_desktop_config.json` |
| **Windows (standard)** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |

If missing, create: `{ "mcpServers": {} }`

---

## Step 2 — Add the Salsify MCP server

On Windows, use the full path to `npx.cmd` so Claude can find Node:

```json
{
  "mcpServers": {
    "salsify": {
      "command": "C:\\Program Files\\nodejs\\npx.cmd",
      "args": [
        "-y",
        "mcp-remote",
        "https://celopre-salsify-mcp-dev-g5ddb3ayf5dpgre0.eastus-01.azurewebsites.net/mcp",
        "--transport",
        "http-only",
        "--header",
        "X-Salsify-Api-Token:${SALSIFY_API_TOKEN}",
        "--header",
        "X-Salsify-Org-Id:${SALSIFY_ORG_ID}"
      ],
      "env": {
        "SALSIFY_API_TOKEN": "paste-your-api-token",
        "SALSIFY_ORG_ID": "s-99c38f27-1a27-4e45-9f3d-f7f9824094fa"
      }
    }
  }
}
```

Credentials are sent from **your Claude config** on each request. They are **not** stored in the shared Azure app.

---

## Step 3 — Restart Claude Desktop

Fully quit and reopen Claude so MCP servers reload.

---

## Step 4 — Verify

1. Open a new chat and check the tools/MCP indicator.
2. Confirm tools:
   - `read_salsify_product`
   - `read_salsify_asset`
   - `read_salsify_properties`
   - `search_salsify_products_by_asset`
   - `recommend_salsify_api_routes`
3. Example prompts:
   - "Read Salsify product SKU-12345"
   - "Read Salsify asset d10ecf415c8441a18cf4b46a00cea4a4"
   - "Find products linked to asset d10ecf415c8441a18cf4b46a00cea4a4 on Main Image"
   - "Recommend the Salsify API route to create a digital asset from a URL"

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Could not attach to MCP server | Use `C:\\Program Files\\nodejs\\npx.cmd` as `command` on Windows |
| MCP missing | Check Node.js (`node -v`), JSON syntax, restart Claude |
| 401 / auth errors | Verify token is the API key (not org ID); do not prefix with `Bearer ` |
| Empty results | Check Salsify permissions and filter syntax |
| Health check | `GET https://celopre-salsify-mcp-dev-g5ddb3ayf5dpgre0.eastus-01.azurewebsites.net/` → `"status": "running"` |

---

## Security

- Do not commit `claude_desktop_config.json` or share tokens.
- Rotate API keys in Salsify if exposed.

---

## Server details

| Item | Value |
|---|---|
| MCP endpoint | `…/mcp` |
| API base | `https://app.salsify.com/api/v1/orgs/{orgId}` |
| Auth | Bearer token (per user via config headers) |
| Source repo | [ce-ts-salsify-mcp](https://github.com/dcaelopre/ce-ts-salsify-mcp) |
