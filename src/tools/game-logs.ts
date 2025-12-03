/**
 * Game Logs Tool
 * 
 * get_game_logs - Get detailed game-by-game player statistics
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

const GET_GAME_LOGS_QUERY = `
  query GetGameLogs(
    $id: ID
    $player: ID
    $game: ID
    $gameLeague: String
    $gameSeason: String
    $gameDateFrom: String
    $gameDateTo: String
    $team: ID
    $opponent: ID
    $limit: Int
    $sort: String
  ) {
    gameLogs(
      id: $id
      player: $player
      game: $game
      gameLeague: $gameLeague
      gameSeason: $gameSeason
      gameDateFrom: $gameDateFrom
      gameDateTo: $gameDateTo
      team: $team
      opponent: $opponent
      limit: $limit
      sort: $sort
    ) {
      edges {
        id
        game {
          id
          dateTime
          status
          homeTeamScore
          visitingTeamScore
        }
        team {
          id
          name
          slug
        }
        teamName
        opponent {
          id
          name
          slug
        }
        opponentName
        gameType
        teamScore
        opponentScore
        outcome
        teamScoreSo
        opponentScoreSo
        player {
          id
          name
          position
        }
        jerseyNumber
        playerRole
        stats {
          TOI
          SOG
          G
          A
          PTS
          PIM
          PM
          PPG
          SHG
          SA
          SV
          GA
          SVP
        }
        updatedAt
      }
    }
  }
`;

export const getGameLogsTool: Tool = {
  name: "get_game_logs",
  description: `Get detailed game-by-game player statistics (game logs).
  
Game logs provide individual player performance data for each game, including:
- Skater stats: Goals (G), Assists (A), Points (PTS), Shots on Goal (SOG), Plus/Minus (PM), Penalty Minutes (PIM), Power Play Goals (PPG), Short-Handed Goals (SHG), Time on Ice (TOI)
- Goalie stats: Shots Against (SA), Saves (SV), Goals Against (GA), Save Percentage (SVP), Time on Ice (TOI)
- Game context: opponent, score, outcome (W/L/T), game type

Filter by:
- player: Player ID to get game logs for a specific player
- game: Game ID to get all player logs for a specific game
- team: Team ID to filter by team
- opponent: Team ID to filter by opponent
- gameLeague: League slug (e.g., "nhl", "ahl")
- gameSeason: Season (e.g., "2023-2024")
- gameDateFrom/gameDateTo: Date range (YYYY-MM-DD format)
- limit: Maximum number of logs to return (default: 50)

Returns: Detailed game-by-game statistics for players, sorted by most recent games first by default.`,
  inputSchema: {
    type: "object",
    properties: {
      id: {
        type: "string",
        description: "Specific game log ID",
      },
      player: {
        type: "string",
        description: "Player ID to get game logs for",
      },
      game: {
        type: "string",
        description: "Game ID to get all player logs for a specific game",
      },
      team: {
        type: "string",
        description: "Team ID to filter by team",
      },
      opponent: {
        type: "string",
        description: "Opponent team ID",
      },
      gameLeague: {
        type: "string",
        description: "League slug (e.g., 'nhl', 'ahl')",
      },
      gameSeason: {
        type: "string",
        description: "Season (e.g., '2023-2024')",
      },
      gameDateFrom: {
        type: "string",
        description: "Start date (YYYY-MM-DD format)",
      },
      gameDateTo: {
        type: "string",
        description: "End date (YYYY-MM-DD format)",
      },
      limit: {
        type: "number",
        description: "Maximum number of game logs to return (default: 50)",
        default: 50,
      },
    },
  },
};

export async function handleGetGameLogs(args: {
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
}): Promise<string> {
  const {
    id,
    player,
    game,
    team,
    opponent,
    gameLeague,
    gameSeason,
    gameDateFrom,
    gameDateTo,
    limit = 50,
  } = args;

  try {
    // Validate date format (basic check for YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (gameDateFrom && !dateRegex.test(gameDateFrom)) {
      throw new Error(
        `Invalid gameDateFrom format: ${gameDateFrom}. Expected YYYY-MM-DD`
      );
    }
    if (gameDateTo && !dateRegex.test(gameDateTo)) {
      throw new Error(
        `Invalid gameDateTo format: ${gameDateTo}. Expected YYYY-MM-DD`
      );
    }

    const result = await executeQuery<{
      gameLogs: {
        edges: Array<{
          id: string;
          game: {
            id: string;
            dateTime: string;
            status: string;
            homeTeamScore: number | null;
            visitingTeamScore: number | null;
          };
          team: { id: string; name: string; slug: string };
          teamName: string;
          opponent: { id: string; name: string; slug: string };
          opponentName: string;
          gameType: string;
          teamScore: number | null;
          opponentScore: number | null;
          outcome: string;
          teamScoreSo: number | null;
          opponentScoreSo: number | null;
          player: { id: string; name: string; position: string };
          jerseyNumber: number | null;
          playerRole: string | null;
          stats: {
            TOI: string | null;
            SOG: number | null;
            G: number | null;
            A: number | null;
            PTS: number | null;
            PIM: number | null;
            PM: number | null;
            PPG: number | null;
            SHG: number | null;
            SA: number | null;
            SV: number | null;
            GA: number | null;
            SVP: string | null;
          } | null;
          updatedAt: string;
        }>;
      };
    }>(GET_GAME_LOGS_QUERY, {
      id,
      player,
      game,
      team,
      opponent,
      gameLeague,
      gameSeason,
      gameDateFrom,
      gameDateTo,
      limit,
      sort: "-game.dateTime", // Sort by most recent games first
    });

    return JSON.stringify(
      {
        filters: {
          id,
          player,
          game,
          team,
          opponent,
          gameLeague,
          gameSeason,
          gameDateFrom,
          gameDateTo,
        },
        gameLogs: result.gameLogs?.edges || [],
        totalLogs: result.gameLogs?.edges?.length || 0,
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch game logs: ${error.message}`);
    }
    throw error;
  }
}
