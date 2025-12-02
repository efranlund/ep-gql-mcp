/**
 * search_entities Tool
 * 
 * Universal search across players, teams, leagues, and staff.
 * Resolves natural language references like "McDavid" → player ID 296251
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

const SEARCH_QUERIES = {
  player: `
    query SearchPlayers($q: String!, $limit: Int) {
      players(q: $q, limit: $limit) {
        edges {
          id
          name
          slug
          position
          nationality
          currentTeam {
            name
            slug
          }
        }
      }
    }
  `,
  team: `
    query SearchTeams($q: String!, $limit: Int) {
      teams(q: $q, limit: $limit) {
        edges {
          id
          name
          slug
          country
          league {
            name
            slug
          }
        }
      }
    }
  `,
  league: `
    query SearchLeagues($q: String!, $limit: Int) {
      leagues(q: $q, limit: $limit) {
        edges {
          id
          name
          slug
          country
        }
      }
    }
  `,
  staff: `
    query SearchStaff($q: String!, $limit: Int) {
      staff(q: $q, limit: $limit) {
        edges {
          id
          name
          slug
          role
          currentTeam {
            name
            slug
          }
        }
      }
    }
  `,
};

export const searchEntitiesTool: Tool = {
  name: "search_entities",
  description: `Search for players, teams, leagues, or staff by name.
  
This tool resolves natural language references to entity IDs. For example:
- "McDavid" → Player ID 296251 (Connor McDavid)
- "Toronto Maple Leafs" → Team ID
- "NHL" → League slug "nhl"

Use this tool to find entity IDs before querying detailed information with other tools.`,
  inputSchema: {
    type: "object",
    properties: {
      searchTerm: {
        type: "string",
        description: "The search term (player name, team name, league name, etc.)",
      },
      entityType: {
        type: "string",
        enum: ["player", "team", "league", "staff", "all"],
        description: "Type of entity to search for. Use 'all' to search across all types.",
        default: "all",
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (default: 10)",
        default: 10,
      },
    },
    required: ["searchTerm"],
  },
};

export async function handleSearchEntities(args: {
  searchTerm: string;
  entityType?: "player" | "team" | "league" | "staff" | "all";
  limit?: number;
}): Promise<string> {
  const { searchTerm, entityType = "all", limit = 10 } = args;

  if (!searchTerm || typeof searchTerm !== "string") {
    throw new Error("searchTerm must be a non-empty string");
  }

  const results: Record<string, unknown[]> = {};

  if (entityType === "all" || entityType === "player") {
    try {
      const playerResult = await executeQuery<{
        players: { edges: unknown[] };
      }>(SEARCH_QUERIES.player, { q: searchTerm, limit });
      results.players = playerResult.players?.edges || [];
    } catch (error) {
      // Continue with other searches
    }
  }

  if (entityType === "all" || entityType === "team") {
    try {
      const teamResult = await executeQuery<{
        teams: { edges: unknown[] };
      }>(SEARCH_QUERIES.team, { q: searchTerm, limit });
      results.teams = teamResult.teams?.edges || [];
    } catch (error) {
      // Continue with other searches
    }
  }

  if (entityType === "all" || entityType === "league") {
    try {
      const leagueResult = await executeQuery<{
        leagues: { edges: unknown[] };
      }>(SEARCH_QUERIES.league, { q: searchTerm, limit });
      results.leagues = leagueResult.leagues?.edges || [];
    } catch (error) {
      // Continue with other searches
    }
  }

  if (entityType === "all" || entityType === "staff") {
    try {
      const staffResult = await executeQuery<{
        staff: { edges: unknown[] };
      }>(SEARCH_QUERIES.staff, { q: searchTerm, limit });
      results.staff = staffResult.staff?.edges || [];
    } catch (error) {
      // Continue with other searches
    }
  }

  return JSON.stringify(
    {
      searchTerm,
      entityType,
      results,
      totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
    },
    null,
    2
  );
}
