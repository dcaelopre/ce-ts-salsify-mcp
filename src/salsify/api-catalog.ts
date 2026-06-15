export type ApiCatalogEntry = {
  id: string;
  title: string;
  method: string;
  pathTemplate: string;
  readOnly: boolean;
  description: string;
  queryParams?: string[];
  bodySchema?: string;
  exampleBody?: unknown;
  docUrl: string;
  tags: string[];
};

export const API_CATALOG: ApiCatalogEntry[] = [
  {
    id: "bulk-read-products",
    title: "Bulk Read Products (filter)",
    method: "GET",
    pathTemplate: "/orgs/{orgId}/products",
    readOnly: true,
    description: "Retrieve products matching a Salsify filter. Empty filter returns all products (paginated).",
    queryParams: ["filter", "page", "per_page"],
    docUrl: "https://developers.salsify.com/reference/bulk-read-products",
    tags: ["product", "read", "search", "filter", "list", "bulk"],
  },
  {
    id: "read-product",
    title: "Read Single Product",
    method: "GET",
    pathTemplate: "/orgs/{orgId}/products/{productId}",
    readOnly: true,
    description: "Retrieve one product by ID including property values and linked digital assets.",
    docUrl: "https://developers.salsify.com/docs/product-object",
    tags: ["product", "read", "get", "single"],
  },
  {
    id: "report-products",
    title: "Bulk Read Products by IDs",
    method: "REPORT",
    pathTemplate: "/orgs/{orgId}/products",
    readOnly: true,
    description: "Retrieve up to 100 products by ID array in request body.",
    bodySchema: "{ \"ids\": [\"product-id-1\", \"product-id-2\"] }",
    exampleBody: { ids: ["product-id-1", "product-id-2"] },
    docUrl: "https://developers.salsify.com/reference/read-multiple-products-report",
    tags: ["product", "read", "bulk", "report", "ids"],
  },
  {
    id: "create-product",
    title: "Create Product",
    method: "POST",
    pathTemplate: "/orgs/{orgId}/products",
    readOnly: false,
    description: "Create a new product. Property IDs map to values; unknown properties are created as strings.",
    bodySchema: "{ \"Product Name\": \"value\", \"additional_property\": \"value\" }",
    exampleBody: { "Product Name": "New Product", Manufacturer: "Acme" },
    docUrl: "https://developers.salsify.com/reference/add-a-product",
    tags: ["product", "create", "write", "post"],
  },
  {
    id: "update-product",
    title: "Update Product",
    method: "PUT",
    pathTemplate: "/orgs/{orgId}/products/{productId}",
    readOnly: false,
    description: "Update product property values or link a digital asset to a product property.",
    bodySchema: "{ \"Property ID\": \"value\" }",
    exampleBody: { "Main Image": "digital-asset-id-hash" },
    docUrl: "https://developers.salsify.com/docs/product-object",
    tags: ["product", "update", "write", "put", "link", "asset"],
  },
  {
    id: "delete-product",
    title: "Delete Product",
    method: "DELETE",
    pathTemplate: "/orgs/{orgId}/products/{productId}",
    readOnly: false,
    description: "Delete a product by ID.",
    docUrl: "https://developers.salsify.com/docs/product-object",
    tags: ["product", "delete", "write"],
  },
  {
    id: "bulk-read-digital-assets",
    title: "Bulk Read Digital Assets (filter)",
    method: "GET",
    pathTemplate: "/orgs/{orgId}/digital_assets",
    readOnly: true,
    description: "Retrieve digital assets matching a filter. Empty filter returns all assets (paginated).",
    queryParams: ["filter", "page", "per_page"],
    docUrl: "https://developers.salsify.com/reference/bulk-read-digital-assets",
    tags: ["digital asset", "asset", "dam", "read", "search", "filter", "list"],
  },
  {
    id: "read-digital-asset",
    title: "Read Single Digital Asset",
    method: "GET",
    pathTemplate: "/orgs/{orgId}/digital_assets/{assetId}",
    readOnly: true,
    description: "Retrieve one digital asset by ID with metadata (URL, filename, format, etc.).",
    docUrl: "https://developers.salsify.com/reference/bulk-read-digital-assets",
    tags: ["digital asset", "asset", "read", "get", "single"],
  },
  {
    id: "report-digital-assets",
    title: "Bulk Read Digital Assets by IDs",
    method: "REPORT",
    pathTemplate: "/orgs/{orgId}/digital_assets",
    readOnly: true,
    description: "Retrieve up to 100 digital assets by ID array.",
    bodySchema: "{ \"ids\": [\"asset-id-1\"] }",
    exampleBody: { ids: ["8d538dcbfd2d5547f7080f2408e7457e96c0451a"] },
    docUrl: "https://developers.salsify.com/reference/read-multiple-digital-assets-report",
    tags: ["digital asset", "asset", "read", "bulk", "report", "ids"],
  },
  {
    id: "create-digital-asset",
    title: "Create Digital Asset",
    method: "POST",
    pathTemplate: "/orgs/{orgId}/digital_assets",
    readOnly: false,
    description: "Create a digital asset from a source URL and optional metadata.",
    bodySchema: "{ \"salsify:id\": \"id\", \"salsify:source_url\": \"https://...\", \"salsify:name\": \"name\" }",
    exampleBody: {
      "salsify:id": "my-asset-id",
      "salsify:source_url": "https://cdn.example.com/image.jpg",
      "salsify:name": "Product Hero Image",
    },
    docUrl: "https://developers.salsify.com/reference/bulk-read-digital-assets",
    tags: ["digital asset", "asset", "create", "write", "post", "url", "source"],
  },
  {
    id: "read-property",
    title: "Read Property Schema",
    method: "GET",
    pathTemplate: "/orgs/{orgId}/properties/{propertyId}",
    readOnly: true,
    description: "Retrieve property metadata (data type, facetable, entity types, attribute group).",
    docUrl: "https://developers.salsify.com/reference/read-property",
    tags: ["property", "schema", "metadata", "read", "get"],
  },
  {
    id: "report-properties",
    title: "Bulk Read Properties by IDs",
    method: "REPORT",
    pathTemplate: "/orgs/{orgId}/properties",
    readOnly: true,
    description: "Retrieve up to 100 property definitions by ID array.",
    bodySchema: "{ \"ids\": [\"Product Name\", \"Manufacturer\"] }",
    exampleBody: { ids: ["Product Name", "Manufacturer"] },
    docUrl: "https://developers.salsify.com/reference/read-multiple-properties-report",
    tags: ["property", "schema", "read", "bulk", "report", "ids"],
  },
  {
    id: "filter-syntax",
    title: "Salsify Filter Language",
    method: "REFERENCE",
    pathTemplate: "N/A",
    readOnly: true,
    description: "Filter syntax: property name, operator, and quoted value. Example: ='Manufacturer':'equals':'Acme'",
    docUrl: "https://developers.salsify.com/reference/salsify-filtering-language-syntax",
    tags: ["filter", "syntax", "search", "query", "language"],
  },
];

function tokenize(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter((t) => t.length > 1);
}

export function recommendRoutes(intent: string, orgId?: string) {
  const tokens = tokenize(intent);
  const scored = API_CATALOG.map((entry) => {
    let score = 0;
    const haystack = (entry.title + " " + entry.description + " " + entry.tags.join(" ")).toLowerCase();
    for (const token of tokens) {
      if (haystack.includes(token)) score += 2;
      if (entry.tags.some((tag) => tag.includes(token) || token.includes(tag))) score += 3;
      if (entry.id.includes(token)) score += 1;
    }
    return { entry, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const baseUrl = "https://app.salsify.com/api/v1";
  return scored.map(({ entry, score }) => {
    const path = orgId
      ? entry.pathTemplate.replace("{orgId}", orgId).replace("{productId}", "{productId}").replace("{assetId}", "{assetId}").replace("{propertyId}", "{propertyId}")
      : entry.pathTemplate;
    const fullUrl = path.startsWith("/") ? baseUrl + path : path;
    const curlParts = [
      "curl -X " + entry.method,
      fullUrl.includes("{") ? '"' + fullUrl + '"' : '"' + fullUrl + '"',
      '-H "Authorization: Bearer <your-api-token>"',
    ];
    if (entry.method === "REPORT" || entry.method === "POST" || entry.method === "PUT") {
      curlParts.push('-H "Content-Type: application/json"');
      if (entry.exampleBody) {
        curlParts.push("-d '" + JSON.stringify(entry.exampleBody) + "'");
      }
    }
    return {
      relevanceScore: score,
      title: entry.title,
      method: entry.method,
      pathTemplate: entry.pathTemplate,
      fullUrlExample: fullUrl,
      readOnly: entry.readOnly,
      executableByThisServer: entry.readOnly,
      description: entry.description,
      queryParams: entry.queryParams,
      bodySchema: entry.bodySchema,
      exampleBody: entry.exampleBody,
      docUrl: entry.docUrl,
      exampleCurl: curlParts.join(" "),
    };
  });
}
