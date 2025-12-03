#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
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
            text: await handleGetLeagueStandings(args as { leagueSlug: string; season?: string }),
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
            text: await handleGetGames(args as { league?: string; season?: string; teamId?: string; dateFrom?: string; dateTo?: string; limit?: number }),
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
// @ts-expect-error - MCP SDK type definitions may be incomplete
server.setRequestHandler("resources/list", async () => ({
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

// @ts-expect-error - MCP SDK type definitions may be incomplete
server.setRequestHandler("resources/read", async (request) => {
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
