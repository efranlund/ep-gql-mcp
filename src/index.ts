#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { executeGraphQLTool, handleExecuteGraphQL } from "./tools/execute-graphql.js";
import { introspectSchemaTool, handleIntrospectSchema } from "./tools/introspect.js";
import { searchEntitiesTool, handleSearchEntities } from "./tools/search.js";

// Create MCP server instance
const server = new Server(
  {
    name: "ep-gql-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// Register core tools
// @ts-expect-error - MCP SDK type definitions may be incomplete
server.setRequestHandler("tools/list", async () => ({
  tools: [
    executeGraphQLTool,
    introspectSchemaTool,
    searchEntitiesTool,
    // TODO: Add convenience tools
    // TODO: Add reference tools
  ],
}));

// @ts-expect-error - MCP SDK type definitions may be incomplete
server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "execute_graphql":
      return {
        content: [
          {
            type: "text",
            text: await handleExecuteGraphQL(args as { query: string; variables?: Record<string, unknown> }),
          },
        ],
      };

    case "introspect_schema":
      return {
        content: [
          {
            type: "text",
            text: await handleIntrospectSchema(args as { queryName?: string; typeName?: string }),
          },
        ],
      };

    case "search_entities":
      return {
        content: [
          {
            type: "text",
            text: await handleSearchEntities(args as { searchTerm: string; entityType?: "player" | "team" | "league" | "staff" | "all"; limit?: number }),
          },
        ],
      };

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

// TODO: Register resources
// - schema://queries, schema://types, schema://enums
// - reference://leagues, reference://countries, reference://positions, reference://seasons
// - guide://common-queries, guide://hockey-terminology

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("EliteProspects GraphQL MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
