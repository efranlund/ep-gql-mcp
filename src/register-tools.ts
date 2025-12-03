import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { handleExecuteGraphQL } from "./tools/execute-graphql.js";
import { handleIntrospectSchema } from "./tools/introspect.js";
import { handleSearchEntities } from "./tools/search.js";
import { handleGetPlayer, handleGetPlayerStats } from "./tools/players.js";
import { handleGetTeam } from "./tools/teams.js";
import { handleGetLeagueStandings, handleGetLeagueLeaders } from "./tools/leagues.js";
import { handleGetGames } from "./tools/games.js";
import { handleGetGameLogs } from "./tools/game-logs.js";
import { handleGetDraftPicks } from "./tools/drafts.js";
import { handleListLeagues, handleListSeasons, handleListDraftTypes, handleGetCurrentSeason } from "./tools/reference.js";

export function registerTools(server: McpServer) {
  server.registerTool(
    "execute_graphql",
    {
      description: "Execute any GraphQL query against the EliteProspects API",
      inputSchema: z.object({
        query: z.string().describe("The GraphQL query string to execute"),
        variables: z.record(z.string(), z.unknown()).optional().describe("Optional variables for the GraphQL query"),
      }),
    },
    async ({ query, variables }: { query: string; variables?: Record<string, unknown> }) => {
      const result = await handleExecuteGraphQL({ query, variables });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "introspect_schema",
    {
      description: "Explore the EliteProspects GraphQL schema to discover available queries, types, and enums",
      inputSchema: z.object({
        queryName: z.string().optional().describe("Optional: Filter to a specific query by name"),
        typeName: z.string().optional().describe("Optional: Filter to a specific type by name"),
      }),
    },
    async ({ queryName, typeName }: { queryName?: string; typeName?: string }) => {
      const result = await handleIntrospectSchema({ queryName, typeName });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "search_entities",
    {
      description: "Search for players, teams, leagues, or staff by name",
      inputSchema: z.object({
        searchTerm: z.string().describe("The search term (player name, team name, league name, etc.)"),
        entityType: z.enum(["player", "team", "league", "staff", "all"]).optional().default("all"),
        limit: z.number().optional().default(10),
      }),
    },
    async ({ searchTerm, entityType, limit }: { searchTerm: string; entityType?: "player" | "team" | "league" | "staff" | "all"; limit?: number }) => {
      const result = await handleSearchEntities({ searchTerm, entityType, limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_player",
    {
      description: "Get comprehensive player profile information by player ID or name",
      inputSchema: z.object({
        playerId: z.string().optional(),
        playerName: z.string().optional(),
      }),
    },
    async ({ playerId, playerName }: { playerId?: string; playerName?: string }) => {
      const result = await handleGetPlayer({ playerId, playerName });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_player_stats",
    {
      description: "Get player statistics with flexible filtering",
      inputSchema: z.object({
        playerId: z.string().optional(),
        playerName: z.string().optional(),
        season: z.string().optional(),
        league: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
    },
    async ({ playerId, playerName, season, league, limit }: { playerId?: string; playerName?: string; season?: string; league?: string; limit?: number }) => {
      const result = await handleGetPlayerStats({ playerId, playerName, season, league, limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_team",
    {
      description: "Get team profile information including roster",
      inputSchema: z.object({
        teamId: z.string().optional(),
        teamName: z.string().optional(),
        includeRoster: z.boolean().optional().default(true),
      }),
    },
    async ({ teamId, teamName, includeRoster }: { teamId?: string; teamName?: string; includeRoster?: boolean }) => {
      const result = await handleGetTeam({ teamId, teamName, includeRoster });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_league_standings",
    {
      description: "Get league standings with team records and statistics",
      inputSchema: z.object({
        leagueSlug: z.string(),
        season: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
    },
    async ({ leagueSlug, season, limit }: { leagueSlug: string; season?: string; limit?: number }) => {
      const result = await handleGetLeagueStandings({ leagueSlug, season, limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_league_leaders",
    {
      description: "Get scoring leaders for skaters and goalies in a league",
      inputSchema: z.object({
        leagueSlug: z.string(),
        season: z.string().optional(),
        limit: z.number().optional().default(10),
      }),
    },
    async ({ leagueSlug, season, limit }: { leagueSlug: string; season?: string; limit?: number }) => {
      const result = await handleGetLeagueLeaders({ leagueSlug, season, limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_games",
    {
      description: "Get game schedules and results with enhanced filtering",
      inputSchema: z.object({
        playerId: z.string().optional(),
        playerIds: z.array(z.string()).optional(),
        teamId: z.string().optional(),
        teamIds: z.array(z.string()).optional(),
        league: z.string().optional(),
        season: z.string().optional(),
        dateFrom: z.string().optional(),
        dateTo: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
    },
    async ({ playerId, playerIds, teamId, teamIds, league, season, dateFrom, dateTo, limit }: { 
      playerId?: string; 
      playerIds?: string[]; 
      teamId?: string; 
      teamIds?: string[]; 
      league?: string; 
      season?: string; 
      dateFrom?: string; 
      dateTo?: string; 
      limit?: number 
    }) => {
      const result = await handleGetGames({ playerId, playerIds, teamId, teamIds, league, season, dateFrom, dateTo, limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_game_logs",
    {
      description: "Get detailed game-by-game player statistics (game logs)",
      inputSchema: z.object({
        id: z.string().optional(),
        player: z.string().optional(),
        game: z.string().optional(),
        team: z.string().optional(),
        opponent: z.string().optional(),
        gameLeague: z.string().optional(),
        gameSeason: z.string().optional(),
        gameDateFrom: z.string().optional(),
        gameDateTo: z.string().optional(),
        limit: z.number().optional().default(50),
      }),
    },
    async ({ id, player, game, team, opponent, gameLeague, gameSeason, gameDateFrom, gameDateTo, limit }: {
      id?: string;
      player?: string;
      game?: string;
      team?: string;
      opponent?: string;
      gameLeague?: string;
      gameSeason?: string;
      gameDateFrom?: string;
      gameDateTo?: string;
      limit?: number;
    }) => {
      const result = await handleGetGameLogs({ id, player, game, team, opponent, gameLeague, gameSeason, gameDateFrom, gameDateTo, limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_draft_picks",
    {
      description: "Query draft selections (e.g., NHL Entry Draft)",
      inputSchema: z.object({
        draftTypeSlug: z.string().optional().default("nhl-entry-draft"),
        year: z.string().optional(),
        teamId: z.string().optional(),
        playerId: z.string().optional(),
        round: z.number().optional(),
        limit: z.number().optional().default(50),
      }),
    },
    async ({ draftTypeSlug, year, teamId, playerId, round, limit }: {
      draftTypeSlug?: string;
      year?: string;
      teamId?: string;
      playerId?: string;
      round?: number;
      limit?: number;
    }) => {
      const result = await handleGetDraftPicks({ draftTypeSlug, year, teamId, playerId, round, limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "list_leagues",
    {
      description: "Get a list of available leagues with their slugs",
      inputSchema: z.object({
        limit: z.number().optional().default(100),
      }),
    },
    async ({ limit }: { limit?: number }) => {
      const result = await handleListLeagues({ limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "list_seasons",
    {
      description: "Get available seasons for a specific league",
      inputSchema: z.object({
        leagueSlug: z.string(),
      }),
    },
    async ({ leagueSlug }: { leagueSlug: string }) => {
      const result = await handleListSeasons({ leagueSlug });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "list_draft_types",
    {
      description: "Get available draft types (e.g., NHL Entry Draft)",
      inputSchema: z.object({
        limit: z.number().optional().default(50),
      }),
    },
    async ({ limit }: { limit?: number }) => {
      const result = await handleListDraftTypes({ limit });
      return { content: [{ type: "text", text: result }] };
    }
  );

  server.registerTool(
    "get_current_season",
    {
      description: "Get the current active season string",
      inputSchema: z.object({}),
    },
    async () => {
      const result = await handleGetCurrentSeason();
      return { content: [{ type: "text", text: result }] };
    }
  );
}
