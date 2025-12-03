/**
 * Games Tool
 * 
 * get_games - Get game schedules and results
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

const GET_GAMES_QUERY = `
  query GetGames($league: String, $season: String, $team: ID, $dateFrom: String, $dateTo: String, $limit: Int) {
    games(league: $league, season: $season, team: $team, dateFrom: $dateFrom, dateTo: $dateTo, limit: $limit) {
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
        homeScore
        visitingScore
        status
        league {
          name
          slug
        }
        season
      }
    }
  }
`;

export const getGamesTool: Tool = {
  name: "get_games",
  description: `Get game schedules and results.
  
Filter by:
- league: League slug (e.g., "nhl", "ahl")
- season: Season string (e.g., "2023-2024")
- team: Team ID
- dateFrom/dateTo: Date range (YYYY-MM-DD format)

Returns: game details including teams, scores, status, and date/time.`,
  inputSchema: {
    type: "object",
    properties: {
      league: {
        type: "string",
        description: "League slug (e.g., 'nhl', 'ahl')",
      },
      season: {
        type: "string",
        description: "Season (e.g., '2023-2024')",
      },
      teamId: {
        type: "string",
        description: "Team ID to filter games",
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

export async function handleGetGames(args: {
  league?: string;
  season?: string;
  teamId?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<string> {
  const { league, season, teamId, dateFrom, dateTo, limit = 50 } = args;

  try {
    const result = await executeQuery<{ games: { edges: unknown[] } }>(
      GET_GAMES_QUERY,
      {
        league,
        season,
        team: teamId,
        dateFrom,
        dateTo,
        limit,
      }
    );

    return JSON.stringify(
      {
        filters: {
          league,
          season,
          teamId,
          dateFrom,
          dateTo,
        },
        games: result.games?.edges || [],
        totalGames: result.games?.edges?.length || 0,
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

