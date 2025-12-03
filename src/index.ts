#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { executeGraphQLTool, handleExecuteGraphQL } from "./tools/execute-graphql.js";
import { introspectSchemaTool, handleIntrospectSchema } from "./tools/introspect.js";
import { searchEntitiesTool, handleSearchEntities } from "./tools/search.js";
import { getPlayerTool, handleGetPlayer, getPlayerStatsTool, handleGetPlayerStats } from "./tools/players.js";
import { getTeamTool, handleGetTeam } from "./tools/teams.js";
import { getLeagueStandingsTool, handleGetLeagueStandings, getLeagueLeadersTool, handleGetLeagueLeaders } from "./tools/leagues.js";
import { getGamesTool, handleGetGames } from "./tools/games.js";
import { getDraftPicksTool, handleGetDraftPicks } from "./tools/drafts.js";
import { listLeaguesTool, handleListLeagues, listSeasonsTool, handleListSeasons, listDraftTypesTool, handleListDraftTypes, getCurrentSeasonTool, handleGetCurrentSeason } from "./tools/reference.js";
import { getSchemaQueriesResource, getSchemaTypesResource, getSchemaEnumsResource } from "./resources/schema.js";
import { getReferenceLeaguesResource, getReferenceCountriesResource, getReferencePositionsResource, getReferenceSeasonsResource } from "./resources/reference.js";
import { getCommonQueriesGuide, getHockeyTerminologyGuide } from "./resources/guides.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Create MCP server instance
function createMcpServer() {
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
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      executeGraphQLTool,
      introspectSchemaTool,
      searchEntitiesTool,
      getPlayerTool,
      getPlayerStatsTool,
      getTeamTool,
      getLeagueStandingsTool,
      getLeagueLeadersTool,
      getGamesTool,
      getDraftPicksTool,
      listLeaguesTool,
      listSeasonsTool,
      listDraftTypesTool,
      getCurrentSeasonTool,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
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

      case "get_player":
        return {
          content: [
            {
              type: "text",
              text: await handleGetPlayer(args as { playerId?: string; playerName?: string }),
            },
          ],
        };

      case "get_player_stats":
        return {
          content: [
            {
              type: "text",
              text: await handleGetPlayerStats(args as { playerId?: string; playerName?: string; season?: string; league?: string; limit?: number }),
            },
          ],
        };

      case "get_team":
        return {
          content: [
            {
              type: "text",
              text: await handleGetTeam(args as { teamId?: string; teamName?: string; includeRoster?: boolean }),
            },
          ],
        };

      case "get_league_standings":
        return {
          content: [
            {
              type: "text",
              text: await handleGetLeagueStandings(args as { leagueSlug: string; season?: string; limit?: number }),
            },
          ],
        };

      case "get_league_leaders":
        return {
          content: [
            {
              type: "text",
              text: await handleGetLeagueLeaders(args as { leagueSlug: string; season?: string; limit?: number }),
            },
          ],
        };

      case "get_games":
        return {
          content: [
            {
              type: "text",
              text: await handleGetGames(args as { 
                playerId?: string; 
                playerIds?: string[]; 
                teamId?: string; 
                teamIds?: string[]; 
                league?: string; 
                season?: string; 
                dateFrom?: string; 
                dateTo?: string; 
                limit?: number 
              }),
            },
          ],
        };

      case "get_draft_picks":
        return {
          content: [
            {
              type: "text",
              text: await handleGetDraftPicks(args as { draftTypeSlug?: string; year?: string; teamId?: string; playerId?: string; round?: number; limit?: number }),
            },
          ],
        };

      case "list_leagues":
        return {
          content: [
            {
              type: "text",
              text: await handleListLeagues(args as { limit?: number }),
            },
          ],
        };

      case "list_seasons":
        return {
          content: [
            {
              type: "text",
              text: await handleListSeasons(args as { leagueSlug: string }),
            },
          ],
        };

      case "list_draft_types":
        return {
          content: [
            {
              type: "text",
              text: await handleListDraftTypes(args as { limit?: number }),
            },
          ],
        };

      case "get_current_season":
        return {
          content: [
            {
              type: "text",
              text: await handleGetCurrentSeason(),
            },
          ],
        };

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  });

  // Register resources
  server.setRequestHandler(ListResourcesRequestSchema, async () => ({
    resources: [
      {
        uri: "schema://queries",
        name: "GraphQL Queries",
        description: "List of all 321 available GraphQL queries",
        mimeType: "application/json",
      },
      {
        uri: "schema://types",
        name: "GraphQL Types",
        description: "Key GraphQL types (Player, Team, League, etc.)",
        mimeType: "application/json",
      },
      {
        uri: "schema://enums",
        name: "GraphQL Enums",
        description: "All enumeration values (positions, statuses, etc.)",
        mimeType: "application/json",
      },
      {
        uri: "reference://leagues",
        name: "Leagues Reference",
        description: "Complete list of leagues with slugs",
        mimeType: "application/json",
      },
      {
        uri: "reference://countries",
        name: "Countries Reference",
        description: "Country codes and names",
        mimeType: "application/json",
      },
      {
        uri: "reference://positions",
        name: "Player Positions",
        description: "Valid player positions (C, LW, RW, D, G, etc.)",
        mimeType: "application/json",
      },
      {
        uri: "reference://seasons",
        name: "Season Format Guide",
        description: "Season format guide (YYYY-YYYY)",
        mimeType: "application/json",
      },
      {
        uri: "guide://common-queries",
        name: "Common Query Examples",
        description: "Examples of common GraphQL queries",
        mimeType: "application/json",
      },
      {
        uri: "guide://hockey-terminology",
        name: "Hockey Terminology",
        description: "Hockey stats abbreviations and terminology",
        mimeType: "application/json",
      },
    ],
  }));

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;

    switch (uri) {
      case "schema://queries":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getSchemaQueriesResource(),
            },
          ],
        };

      case "schema://types":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getSchemaTypesResource(),
            },
          ],
        };

      case "schema://enums":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getSchemaEnumsResource(),
            },
          ],
        };

      case "reference://leagues":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getReferenceLeaguesResource(),
            },
          ],
        };

      case "reference://countries":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getReferenceCountriesResource(),
            },
          ],
        };

      case "reference://positions":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getReferencePositionsResource(),
            },
          ],
        };

      case "reference://seasons":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getReferenceSeasonsResource(),
            },
          ],
        };

      case "guide://common-queries":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getCommonQueriesGuide(),
            },
          ],
        };

      case "guide://hockey-terminology":
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: getHockeyTerminologyGuide(),
            },
          ],
        };

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
  });

  return server;
}

// Start the server in stdio mode (for local use with Claude Desktop, Cursor, etc.)
async function runStdioServer() {
  const server = createMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Output MCP configuration for Claude Desktop / Cursor
  const serverPath = resolve(process.cwd(), "dist/index.js");
  
  const mcpConfig = {
    mcpServers: {
      "ep-gql-mcp": {
        command: "node",
        args: [serverPath],
        env: {
          EP_GQL_URL: process.env.EP_GQL_URL || "https://dev-gql-41yd43jtq6.eliteprospects-assets.com",
        },
      },
    },
  };
  
  console.error("=".repeat(60));
  console.error("EliteProspects GraphQL MCP Server (stdio mode)");
  console.error("=".repeat(60));
  console.error("\n✅ Server is running on stdio");
  console.error("\n📋 Add this to your Claude Desktop or Cursor MCP settings:\n");
  console.error(JSON.stringify(mcpConfig, null, 2));
  console.error("\n" + "=".repeat(60));
}

// Start the server in HTTP mode (for remote/cloud deployment like Fly.io)
async function runHttpServer() {
  const server = createMcpServer();
  const PORT = parseInt(process.env.PORT || "3000", 10);
  
  // Store transports by session ID for stateful connections
  const transports = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    const url = new URL(req.url || "/", `http://${req.headers.host}`);
    
    // Health check endpoint
    if (url.pathname === "/health" || url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ 
        status: "ok", 
        name: "ep-gql-mcp",
        version: "1.0.0",
        mode: "http",
        mcp_endpoint: "/mcp"
      }));
      return;
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      // Handle CORS preflight
      if (req.method === "OPTIONS") {
        res.writeHead(204, {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, mcp-session-id, Authorization",
          "Access-Control-Max-Age": "86400",
        });
        res.end();
        return;
      }

      // Add CORS headers to all responses
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, mcp-session-id, Authorization");
      res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");

      // Get session ID from header
      const sessionId = req.headers["mcp-session-id"] as string | undefined;
      
      // Check for existing transport
      let transport = sessionId ? transports.get(sessionId) : undefined;

      if (req.method === "POST") {
        // Parse request body
        const chunks: Buffer[] = [];
        for await (const chunk of req) {
          chunks.push(chunk as Buffer);
        }
        const body = Buffer.concat(chunks).toString();
        let parsedBody: unknown;
        
        try {
          parsedBody = JSON.parse(body);
        } catch {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
          return;
        }

        // Check if this is an initialization request
        const isInitRequest = Array.isArray(parsedBody) 
          ? parsedBody.some((msg: { method?: string }) => msg.method === "initialize")
          : (parsedBody as { method?: string }).method === "initialize";

        if (isInitRequest && !transport) {
          // Create new transport for initialization
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId) => {
              transports.set(newSessionId, transport!);
              console.error(`New session initialized: ${newSessionId}`);
            },
            onsessionclosed: (closedSessionId) => {
              transports.delete(closedSessionId);
              console.error(`Session closed: ${closedSessionId}`);
            },
          });

          // Connect the MCP server to this transport
          const newServer = createMcpServer();
          await newServer.connect(transport);
        }

        if (!transport) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No session. Send initialize request first." }));
          return;
        }

        await transport.handleRequest(req, res, parsedBody);
        return;
      }

      if (req.method === "GET") {
        // SSE stream for server-to-client notifications
        if (!transport) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "No session. Send initialize request first." }));
          return;
        }
        await transport.handleRequest(req, res);
        return;
      }

      if (req.method === "DELETE") {
        // Session termination
        if (transport) {
          await transport.handleRequest(req, res);
        } else {
          res.writeHead(404, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Session not found" }));
        }
        return;
      }

      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
      return;
    }

    // 404 for unknown paths
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  });

  httpServer.listen(PORT, () => {
    console.error("=".repeat(60));
    console.error("EliteProspects GraphQL MCP Server (HTTP mode)");
    console.error("=".repeat(60));
    console.error(`\n✅ Server is running on http://0.0.0.0:${PORT}`);
    console.error(`\n📋 MCP endpoint: http://0.0.0.0:${PORT}/mcp`);
    console.error(`\n🔗 Health check: http://0.0.0.0:${PORT}/health`);
    console.error("\n📝 To use with Cursor, add to .cursor/mcp.json:");
    console.error(JSON.stringify({
      mcpServers: {
        "ep-gql-mcp": {
          url: `https://ep-gql-mcp.fly.dev/mcp`
        }
      }
    }, null, 2));
    console.error("\n" + "=".repeat(60));
  });
}

// Main entry point - choose mode based on environment
async function main() {
  // Use HTTP mode if PORT is set (typical for cloud deployments)
  // or if --http flag is passed
  const useHttp = process.env.PORT || process.argv.includes("--http");
  
  if (useHttp) {
    await runHttpServer();
  } else {
    await runStdioServer();
  }
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
