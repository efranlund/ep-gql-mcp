/**
 * Player Convenience Tools
 * 
 * get_player - Get comprehensive player profile by ID or name
 * get_player_stats - Get player statistics with flexible filtering
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";
import { handleSearchEntities } from "./search.js";

const GET_PLAYER_QUERY = `
  query GetPlayer($id: ID!) {
    player(id: $id) {
      id
      name
      slug
      position
      nationality {
        name
        slug
      }
      dateOfBirth
      placeOfBirth
      height {
        imperial
        metrics
      }
      weight {
        imperial
        metrics
      }
      shoots
      latestStats {
        teamName
        leagueName
        team {
          id
          name
          slug
        }
        league {
          name
          slug
        }
      }
      playerType
      status
    }
  }
`;

const GET_PLAYER_STATS_QUERY = `
  query GetPlayerStats($id: ID!, $season: String, $league: String, $limit: Int) {
    playerStats(player: $id, season: $season, league: $league, limit: $limit) {
      edges {
        id
        season {
          slug
        }
        league {
          name
          slug
        }
        team {
          name
          slug
        }
        regularStats {
          GP
          G
          A
          PTS
          PIM
          PM
          PPG
          TOI
        }
        postseasonStats {
          GP
          G
          A
          PTS
          PIM
          PM
        }
      }
    }
  }
`;

export const getPlayerTool: Tool = {
  name: "get_player",
  description: `Get comprehensive player profile information by player ID or name.
  
If a name is provided, this tool will automatically search for the player and return the first match.
If an ID is provided, it will directly fetch the player profile.

Returns: player bio, current team, position, nationality, physical attributes, and status.`,
  inputSchema: {
    type: "object",
    properties: {
      playerId: {
        type: "string",
        description: "Player ID (numeric string)",
      },
      playerName: {
        type: "string",
        description: "Player name (will search and use first match)",
      },
    },
  },
};

export async function handleGetPlayer(args: {
  playerId?: string;
  playerName?: string;
}): Promise<string> {
  const { playerId, playerName } = args;

  if (!playerId && !playerName) {
    throw new Error("Either playerId or playerName must be provided");
  }

  let id = playerId;

  // If name provided, search for player
  if (!id && playerName) {
    try {
      const searchResult = await handleSearchEntities({
        searchTerm: playerName,
        entityType: "player",
        limit: 1,
      });
      const parsed = JSON.parse(searchResult);
      const players = parsed.results?.players || [];
      
      // Check for errors in search response
      if (parsed.errors && parsed.errors.players) {
        throw new Error(
          `Search failed for player "${playerName}": ${parsed.errors.players}. ` +
          `This may indicate a GraphQL API error or connectivity issue.`
        );
      }
      
      if (players.length === 0) {
        throw new Error(
          `No player found matching "${playerName}". ` +
          `The search completed but returned no results. ` +
          `Try a different spelling or use a player ID directly.`
        );
      }
      id = (players[0] as { id: string }).id;
    } catch (error) {
      // Re-throw with context if it's already an Error with a message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `Failed to search for player "${playerName}": ${String(error)}. ` +
        `This may indicate a GraphQL API error or connectivity issue.`
      );
    }
  }

  if (!id) {
    throw new Error("Could not resolve player ID");
  }

  try {
    const result = await executeQuery<{ player: unknown }>(GET_PLAYER_QUERY, { id });
    return JSON.stringify(result.player, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch player: ${error.message}`);
    }
    throw error;
  }
}

export const getPlayerStatsTool: Tool = {
  name: "get_player_stats",
  description: `Get player statistics with flexible filtering.
  
Supports:
- Career totals (no filters)
- By season (e.g., "2023-2024")
- By league (e.g., "nhl", "ahl")
- Game logs (if available)

Returns: regular season stats (GP, G, A, PTS, PIM, etc.) and postseason stats if available.`,
  inputSchema: {
    type: "object",
    properties: {
      playerId: {
        type: "string",
        description: "Player ID (numeric string)",
      },
      playerName: {
        type: "string",
        description: "Player name (will search and use first match)",
      },
      season: {
        type: "string",
        description: "Season filter (e.g., '2023-2024')",
      },
      league: {
        type: "string",
        description: "League slug filter (e.g., 'nhl', 'ahl', 'shl')",
      },
      limit: {
        type: "number",
        description: "Maximum number of stat records to return (default: 50)",
        default: 50,
      },
    },
  },
};

export async function handleGetPlayerStats(args: {
  playerId?: string;
  playerName?: string;
  season?: string;
  league?: string;
  limit?: number;
}): Promise<string> {
  const { playerId, playerName, season, league, limit = 50 } = args;

  if (!playerId && !playerName) {
    throw new Error("Either playerId or playerName must be provided");
  }

  let id = playerId;

  // If name provided, search for player
  if (!id && playerName) {
    try {
      const searchResult = await handleSearchEntities({
        searchTerm: playerName,
        entityType: "player",
        limit: 1,
      });
      const parsed = JSON.parse(searchResult);
      const players = parsed.results?.players || [];
      
      // Check for errors in search response
      if (parsed.errors && parsed.errors.players) {
        throw new Error(
          `Search failed for player "${playerName}": ${parsed.errors.players}. ` +
          `This may indicate a GraphQL API error or connectivity issue.`
        );
      }
      
      if (players.length === 0) {
        throw new Error(
          `No player found matching "${playerName}". ` +
          `The search completed but returned no results. ` +
          `Try a different spelling or use a player ID directly.`
        );
      }
      id = (players[0] as { id: string }).id;
    } catch (error) {
      // Re-throw with context if it's already an Error with a message
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        `Failed to search for player "${playerName}": ${String(error)}. ` +
        `This may indicate a GraphQL API error or connectivity issue.`
      );
    }
  }

  if (!id) {
    throw new Error("Could not resolve player ID");
  }

  try {
    const result = await executeQuery<{ playerStats: { edges: unknown[] } }>(
      GET_PLAYER_STATS_QUERY,
      { id, season, league, limit }
    );
    return JSON.stringify(
      {
        playerId: id,
        season,
        league,
        stats: result.playerStats?.edges || [],
        totalRecords: result.playerStats?.edges?.length || 0,
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch player stats: ${error.message}`);
    }
    throw error;
  }
}

