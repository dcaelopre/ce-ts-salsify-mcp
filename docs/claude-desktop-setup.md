# Salsify MCP Server — Claude Desktop Setup

Connect **Claude Desktop** to the shared **Salsify** MCP server to read products, digital assets, property schemas, and get API route recommendations.

**Scope:** Salsify PIM read-only at `https://app.salsify.com/api/v1`. Write routes are documented via `recommend_salsify_api_routes` but not executed by this server.

---

## What you need

1. **Claude Desktop** — [claude.ai/download](https://claude.ai/download)
2. **Node.js 18+** (includes `npx`) — [nodejs.org](https://nodejs.org/)
3. **Salsify credentials:**
   - API token — **My Profile → API Access → Show API Key**
   - Organization ID — from your Salsify URL after `/orgs/` (e.g. `s-999-999-999-999`)
4. **MCP server URL** (after Azure deploy):

```
https://celopre-salsify-mcp-dev.azurewebsites.net/mcp
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

```json
{
  "mcpServers": {
    "salsify": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "https://celopre-salsify-mcp-dev.azurewebsites.net/mcp",
        "--transport",
        "http-only",
        "--header",
        "X-Salsify-Api-Token:${SALSIFY_API_TOKEN}",
        "--header",
        "X-Salsify-Org-Id:${SALSIFY_ORG_ID}"
      ],
      "env": {
        "SALSIFY_API_TOKEN": "paste-your-api-token",
        "SALSIFY_ORG_ID": "s-999-999-999-999"
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
   - `recommend_salsify_api_routes`
3. Example prompts:
   - "Read Salsify product SKU-12345"
   - "Search Salsify products where Manufacturer equals Acme"
   - "Recommend the Salsify API route to create a digital asset from a URL"

---

## Troubleshooting

| Issue | Fix |
|---|---|
| MCP missing | Check Node.js (`node -v`), JSON syntax, restart Claude |
| 401 / missing credentials | Verify `SALSIFY_API_TOKEN` and `SALSIFY_ORG_ID` in `env` block |
| Empty results | Check Salsify permissions and filter syntax |
| Health check | `GET https://celopre-salsify-mcp-dev.azurewebsites.net/` → `"status": "running"` |

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
