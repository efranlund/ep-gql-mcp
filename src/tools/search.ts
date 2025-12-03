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
          latestStats {
            teamName
            leagueName
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
          country {
            name
            slug
          }
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
          country {
            name
            slug
          }
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
          latestStats {
            role
            teamName
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
  const errors: Record<string, string> = {};
  const isAllTypes = entityType === "all";

  if (entityType === "all" || entityType === "player") {
    try {
      const playerResult = await executeQuery<{
        players: { edges: unknown[] };
      }>(SEARCH_QUERIES.player, { q: searchTerm, limit });
      results.players = playerResult.players?.edges || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (isAllTypes) {
        // Log error but continue for "all" searches to allow partial results
        errors.players = errorMessage;
      } else {
        // Propagate error for single entity type searches
        throw new Error(`Failed to search players: ${errorMessage}`);
      }
    }
  }

  if (entityType === "all" || entityType === "team") {
    try {
      const teamResult = await executeQuery<{
        teams: { edges: unknown[] };
      }>(SEARCH_QUERIES.team, { q: searchTerm, limit });
      results.teams = teamResult.teams?.edges || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (isAllTypes) {
        errors.teams = errorMessage;
      } else {
        throw new Error(`Failed to search teams: ${errorMessage}`);
      }
    }
  }

  if (entityType === "all" || entityType === "league") {
    try {
      const leagueResult = await executeQuery<{
        leagues: { edges: unknown[] };
      }>(SEARCH_QUERIES.league, { q: searchTerm, limit });
      results.leagues = leagueResult.leagues?.edges || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (isAllTypes) {
        errors.leagues = errorMessage;
      } else {
        throw new Error(`Failed to search leagues: ${errorMessage}`);
      }
    }
  }

  if (entityType === "all" || entityType === "staff") {
    try {
      const staffResult = await executeQuery<{
        staff: { edges: unknown[] };
      }>(SEARCH_QUERIES.staff, { q: searchTerm, limit });
      results.staff = staffResult.staff?.edges || [];
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (isAllTypes) {
        errors.staff = errorMessage;
      } else {
        throw new Error(`Failed to search staff: ${errorMessage}`);
      }
    }
  }

  const response: {
    searchTerm: string;
    entityType: string;
    results: Record<string, unknown[]>;
    totalResults: number;
    errors?: Record<string, string>;
  } = {
    searchTerm,
    entityType,
    results,
    totalResults: Object.values(results).reduce((sum, arr) => sum + arr.length, 0),
  };

  // Include errors in response for debugging when searching all types
  if (isAllTypes && Object.keys(errors).length > 0) {
    response.errors = errors;
  }

  return JSON.stringify(response, null, 2);
}
