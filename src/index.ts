import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  SALSIFY_CREDENTIAL_HEADERS,
  SalsifyConfigError,
  resolveConfig,
  type SalsifyConfig,
} from "./config.js";
import { SalsifyClient } from "./salsify/client.js";
import {
  SALSIFY_API_BASE_URL_PATTERN,
  SALSIFY_PIM_SCOPE,
} from "./salsify/scope.js";
import { registerReadSalsifyEnumeratedValuesTool } from "./tools/read-salsify-enumerated-values.js";
import { registerReadSalsifyAssetTool } from "./tools/read-salsify-asset.js";
import { registerReadSalsifyProductTool } from "./tools/read-salsify-product.js";
import { registerReadSalsifyPropertiesTool } from "./tools/read-salsify-properties.js";
import { registerRecommendSalsifyApiRoutesTool } from "./tools/recommend-salsify-api-routes.js";
import { registerSearchSalsifyProductsByAssetTool } from "./tools/search-salsify-products-by-asset.js";

const SERVER_VERSION = "1.2.0";

function createMcpServer(config: SalsifyConfig, client: SalsifyClient): McpServer {
  const server = new McpServer({
    name: "salsify-mcp-server",
    version: SERVER_VERSION,
  });

  registerReadSalsifyProductTool(server, client);
  registerReadSalsifyAssetTool(server, client);
  registerReadSalsifyPropertiesTool(server, client);
  registerReadSalsifyEnumeratedValuesTool(server, client);
  registerSearchSalsifyProductsByAssetTool(server, client);
  registerRecommendSalsifyApiRoutesTool(server, config);

  return server;
}

async function main(): Promise<void> {
  const app = express();
  app.use(express.json());

  app.get("/", (_req, res) => {
    res.json({
      name: "salsify-mcp-server",
      version: SERVER_VERSION,
      status: "running",
      scope: SALSIFY_PIM_SCOPE,
      apiBase: SALSIFY_API_BASE_URL_PATTERN,
      credentialSource:
        "Request headers (X-Salsify-Api-Token, X-Salsify-Org-Id) or server environment variables",
      tools: [
        "read_salsify_product",
        "read_salsify_asset",
        "read_salsify_properties",
        "read_salsify_enumerated_values",
        "search_salsify_products_by_asset",
        "recommend_salsify_api_routes",
      ],
    });
  });

  app.post("/mcp", async (req, res) => {
    let config: SalsifyConfig;

    try {
      config = resolveConfig(req.headers);
    } catch (error) {
      const message =
        error instanceof SalsifyConfigError ? error.message : "Missing Salsify credentials";

      if (!res.headersSent) {
        res.status(401).json({
          error: message,
          requiredHeaders: Object.values(SALSIFY_CREDENTIAL_HEADERS),
        });
      }
      return;
    }

    const client = new SalsifyClient(config);
    const server = createMcpServer(config, client);
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

    res.on("close", () => {
      transport.close().catch(() => undefined);
      server.close().catch(() => undefined);
    });

    try {
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP request failed:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, () => {
    console.log("Salsify MCP Server listening on port " + port);
    console.log("Salsify credentials: per-request headers or SALSIFY_* environment variables");
  });

  process.on("SIGINT", async () => {
    process.exit(0);
  });
}

main().catch((error) => {
  console.error("Fatal error starting MCP server:", error);
  process.exit(1);
});
