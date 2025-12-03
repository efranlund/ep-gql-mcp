/**
 * Games Tool
 * 
 * get_games - Get game schedules and results
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

// GraphQL query to get player stats and extract team information
const GET_PLAYER_STATS_QUERY = `
  query GetPlayerStats($player: ID!, $league: String, $season: String) {
    playerStats(player: $player, league: $league, season: $season, limit: 100) {
      edges {
        team {
          id
          name
        }
        season {
          slug
        }
        league {
          slug
        }
      }
    }
  }
`;

const GET_GAMES_QUERY = `
  query GetGames($league: String, $season: String, $team: ID, $dateFrom: String, $dateTo: String, $limit: Int, $sort: String) {
    games(league: $league, season: $season, team: $team, dateFrom: $dateFrom, dateTo: $dateTo, limit: $limit, sort: $sort) {
      edges {
        id
        dateTime
        homeTeam {
          id
          name
          slug
        }
        visitingTeam {
          id
          name
          slug
        }
        homeTeamScore
        visitingTeamScore
        status
        league {
          name
          slug
        }
        season {
          slug
        }
        gameLogs {
          edges {
            player {
              id
            }
            team {
              id
            }
            SOG
          }
        }
      }
    }
  }
`;

export const getGamesTool: Tool = {
  name: "get_games",
  description: `Get game schedules and results with enhanced filtering. Results are sorted by most recent games first by default.
  
Filter by:
- playerId: Single player ID to filter games
- playerIds: Array of player IDs (returns games with any of these players)
- teamId: Single team ID to filter games
- teamIds: Array of team IDs (returns games with any of these teams)
- league: League slug (e.g., "nhl", "ahl")
- season: Season string (e.g., "2023-2024")
- dateFrom/dateTo: Date range (YYYY-MM-DD format)

Returns: game details including teams, scores, shots data (when available), status, and date/time, sorted with most recent games first.

Note: Shots data (homeTeamShots, visitingTeamShots) is calculated from player-level SOG (Shots on Goal) statistics and may be null for games/leagues where this data is not tracked.`,
  inputSchema: {
    type: "object",
    properties: {
      playerId: {
        type: "string",
        description: "Single player ID to filter games",
      },
      playerIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of player IDs to filter games (returns games with any of these players)",
      },
      teamId: {
        type: "string",
        description: "Single team ID to filter games",
      },
      teamIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of team IDs to filter games (returns games with any of these teams)",
      },
      league: {
        type: "string",
        description: "League slug (e.g., 'nhl', 'ahl')",
      },
      season: {
        type: "string",
        description: "Season (e.g., '2023-2024')",
      },
      dateFrom: {
        type: "string",
        description: "Start date (YYYY-MM-DD format)",
      },
      dateTo: {
        type: "string",
        description: "End date (YYYY-MM-DD format)",
      },
      limit: {
        type: "number",
        description: "Maximum number of games to return (default: 50)",
        default: 50,
      },
    },
  },
};

/**
 * GameLog interface matching GraphQL GameLog type
 */
interface GameLog {
  player: {
    id: string;
  };
  team: {
    id: string;
  };
  SOG: number | null;
}

/**
 * Calculate total shots for both teams from GameLogs data
 * @param gameLogs - Array of game log entries with player SOG data
 * @param homeTeamId - ID of the home team
 * @param visitingTeamId - ID of the visiting team
 * @returns Object with homeTeamShots and visitingTeamShots (null if no data)
 */
function calculateShotsFromGameLogs(
  gameLogs: GameLog[] | undefined | null,
  homeTeamId: string,
  visitingTeamId: string
): { homeTeamShots: number | null; visitingTeamShots: number | null } {
  // Return null for both if no gameLogs data
  if (!gameLogs || gameLogs.length === 0) {
    return { homeTeamShots: null, visitingTeamShots: null };
  }

  let homeTeamSOG = 0;
  let visitingTeamSOG = 0;
  let hasHomeTeamData = false;
  let hasVisitingTeamData = false;

  // Sum SOG values for each team
  for (const log of gameLogs) {
    if (!log.team?.id) continue;

    const sogValue = log.SOG ?? 0; // Treat null/undefined as 0

    if (log.team.id === homeTeamId) {
      homeTeamSOG += sogValue;
      hasHomeTeamData = true;
    } else if (log.team.id === visitingTeamId) {
      visitingTeamSOG += sogValue;
      hasVisitingTeamData = true;
    }
    // Ignore entries with team IDs that don't match either team
  }

  return {
    homeTeamShots: hasHomeTeamData ? homeTeamSOG : null,
    visitingTeamShots: hasVisitingTeamData ? visitingTeamSOG : null,
  };
}

/**
 * Get teams that a player played for during a specific period
 * @param playerId - The player's ID
 * @param filters - Optional filters (league, season, dateFrom, dateTo)
 * @returns Array of unique team IDs
 */
async function getPlayerTeams(
  playerId: string,
  filters: {
    league?: string;
    season?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<string[]> {
  try {
    const { league, season } = filters;
    
    // Query player stats to get teams
    const result = await executeQuery<{
      playerStats: {
        edges: Array<{
          team: { id: string; name: string };
          season: { slug: string };
          league: { slug: string };
        }>;
      };
    }>(GET_PLAYER_STATS_QUERY, {
      player: playerId,
      league,
      season,
    });

    if (!result.playerStats?.edges || result.playerStats.edges.length === 0) {
      return [];
    }

    // Extract unique team IDs
    const teamIds = new Set<string>();
    for (const stat of result.playerStats.edges) {
      if (stat.team?.id) {
        teamIds.add(stat.team.id);
      }
    }

    return Array.from(teamIds);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch player teams: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Merge team IDs from multiple sources (direct teamIds, player-derived teams)
 * @param directTeamIds - Team IDs provided directly by the user
 * @param playerDerivedTeamIds - Team IDs derived from player stats
 * @returns Array of unique team IDs
 */
function mergeTeamIds(
  directTeamIds: string[],
  playerDerivedTeamIds: string[]
): string[] {
  // Combine both arrays and remove duplicates
  const allTeamIds = new Set<string>([
    ...directTeamIds,
    ...playerDerivedTeamIds,
  ]);
  
  return Array.from(allTeamIds);
}

/**
 * Execute games query with multiple team IDs by making parallel requests
 * @param teamIds - Array of team IDs to query games for
 * @param filters - Optional filters (league, season, dateFrom, dateTo, limit)
 * @returns Array of games with shots data
 */
async function queryGamesForMultipleTeams(
  teamIds: string[],
  filters: {
    league?: string;
    season?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }
): Promise<Array<{
  id: string;
  dateTime: string;
  homeTeam: { id: string; name: string; slug: string };
  visitingTeam: { id: string; name: string; slug: string };
  homeTeamScore: number | null;
  visitingTeamScore: number | null;
  homeTeamShots: number | null;
  visitingTeamShots: number | null;
  status: string;
  league: { name: string; slug: string };
  season: { slug: string };
}>> {
  if (teamIds.length === 0) {
    return [];
  }

  try {
    // Make parallel requests for each team
    const promises = teamIds.map((teamId) =>
      executeQuery<{ games: { edges: Array<unknown> } }>(GET_GAMES_QUERY, {
        league: filters.league,
        season: filters.season,
        team: teamId,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        limit: filters.limit || 50,
        sort: "-dateTime",
      })
    );

    const results = await Promise.all(promises);

    // Merge all games and remove duplicates by game ID
    const gamesMap = new Map<string, any>();
    for (const result of results) {
      if (result.games?.edges) {
        for (const game of result.games.edges) {
          if (game && typeof game === 'object' && 'id' in game) {
            gamesMap.set((game as any).id, game);
          }
        }
      }
    }

    // Convert map to array and calculate shots for each game
    const games = Array.from(gamesMap.values()).map((game) => {
      const gameLogs = game.gameLogs?.edges;
      const shots = calculateShotsFromGameLogs(
        gameLogs,
        game.homeTeam?.id,
        game.visitingTeam?.id
      );
      
      return {
        ...game,
        homeTeamShots: shots.homeTeamShots,
        visitingTeamShots: shots.visitingTeamShots,
      };
    });

    // Sort by dateTime descending
    games.sort((a, b) => {
      const dateA = new Date(a.dateTime).getTime();
      const dateB = new Date(b.dateTime).getTime();
      return dateB - dateA; // Descending order (most recent first)
    });

    // Apply limit after merging and sorting
    const limit = filters.limit || 50;
    return games.slice(0, limit);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch games for multiple teams: ${error.message}`);
    }
    throw error;
  }
}

export async function handleGetGames(args: {
  playerId?: string;
  playerIds?: string[];
  teamId?: string;
  teamIds?: string[];
  league?: string;
  season?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<string> {
  const { 
    playerId, 
    playerIds, 
    teamId, 
    teamIds, 
    league, 
    season, 
    dateFrom, 
    dateTo, 
    limit = 50 
  } = args;

  try {
    // Normalize player IDs: convert single playerId to array, merge with playerIds
    let normalizedPlayerIds: string[] = [];
    if (playerIds && playerIds.length > 0) {
      normalizedPlayerIds = [...playerIds];
    }
    if (playerId) {
      // Add playerId to the array if not already present
      if (!normalizedPlayerIds.includes(playerId)) {
        normalizedPlayerIds.push(playerId);
      }
    }

    // Normalize team IDs: convert single teamId to array, merge with teamIds
    let normalizedTeamIds: string[] = [];
    if (teamIds && teamIds.length > 0) {
      normalizedTeamIds = [...teamIds];
    }
    if (teamId) {
      // Add teamId to the array if not already present
      if (!normalizedTeamIds.includes(teamId)) {
        normalizedTeamIds.push(teamId);
      }
    }

    // Validate and normalize limit
    const normalizedLimit = typeof limit === 'number' && limit > 0 ? limit : 50;

    // Validate date format (basic check for YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (dateFrom && !dateRegex.test(dateFrom)) {
      throw new Error(`Invalid dateFrom format: ${dateFrom}. Expected YYYY-MM-DD`);
    }
    if (dateTo && !dateRegex.test(dateTo)) {
      throw new Error(`Invalid dateTo format: ${dateTo}. Expected YYYY-MM-DD`);
    }

    // If player IDs are provided, get teams for those players
    if (normalizedPlayerIds.length > 0) {
      try {
        const playerTeamPromises = normalizedPlayerIds.map((pId) =>
          getPlayerTeams(pId, { league, season, dateFrom, dateTo })
        );
        const playerTeamResults = await Promise.all(playerTeamPromises);
        
        // Flatten and merge all player-derived team IDs
        const playerDerivedTeamIds = playerTeamResults.flat();
        normalizedTeamIds = mergeTeamIds(normalizedTeamIds, playerDerivedTeamIds);
        
        // If no teams found for any players, return empty result with explanation
        if (normalizedTeamIds.length === 0 && normalizedPlayerIds.length > 0) {
          return JSON.stringify(
            {
              filters: {
                playerIds: normalizedPlayerIds,
                league,
                season,
                dateFrom,
                dateTo,
              },
              games: [],
              totalGames: 0,
              message: "No teams found for the specified player(s) with the given filters. The player may not have stats in the specified league/season.",
            },
            null,
            2
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          // Check if it's a player-specific error
          if (error.message.includes("Failed to fetch player teams")) {
            throw new Error(`Invalid player ID or player data unavailable: ${error.message}`);
          }
          throw error;
        }
        throw error;
      }
    }

    // If we have team IDs (either direct or from players), query games
    if (normalizedTeamIds.length > 0) {
      try {
        const games = await queryGamesForMultipleTeams(normalizedTeamIds, {
          league,
          season,
          dateFrom,
          dateTo,
          limit: normalizedLimit,
        });

        return JSON.stringify(
          {
            filters: {
              playerIds: normalizedPlayerIds.length > 0 ? normalizedPlayerIds : undefined,
              teamIds: normalizedTeamIds,
              league,
              season,
              dateFrom,
              dateTo,
            },
            games,
            totalGames: games.length,
          },
          null,
          2
        );
      } catch (error) {
        if (error instanceof Error) {
          // Check if it's a team-specific error
          if (error.message.includes("Failed to fetch games for multiple teams")) {
            throw new Error(`Invalid team ID(s) or team data unavailable: ${error.message}`);
          }
          throw error;
        }
        throw error;
      }
    }

    // Fallback to original single-team query if no team IDs
    const result = await executeQuery<{ games: { edges: any[] } }>(
      GET_GAMES_QUERY,
      {
        league,
        season,
        team: undefined,
        dateFrom,
        dateTo,
        limit: normalizedLimit,
        sort: "-dateTime",
      }
    );

    // Calculate shots for each game in fallback results
    const gamesWithShots = (result.games?.edges || []).map((game) => {
      const gameLogs = game.gameLogs?.edges;
      const shots = calculateShotsFromGameLogs(
        gameLogs,
        game.homeTeam?.id,
        game.visitingTeam?.id
      );
      
      return {
        ...game,
        homeTeamShots: shots.homeTeamShots,
        visitingTeamShots: shots.visitingTeamShots,
      };
    });

    return JSON.stringify(
      {
        filters: {
          league,
          season,
          dateFrom,
          dateTo,
        },
        games: gamesWithShots,
        totalGames: gamesWithShots.length,
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch games: ${error.message}`);
    }
    throw error;
  }
}

