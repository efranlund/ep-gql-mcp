/**
 * League Convenience Tools
 * 
 * get_league_standings - Get current standings for any league/season
 * get_league_leaders - Get scoring leaders for skaters and goalies
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

const GET_LEAGUE_STANDINGS_QUERY = `
  query GetLeagueStandings($slug: String!, $season: String, $limit: Int, $offset: Int, $sort: String) {
    leagueStandings(slug: $slug, season: $season, limit: $limit, offset: $offset, sort: $sort) {
      position
      team {
        id
        name
        slug
      }
      stats {
        GP
        W
        L
        T
        OTW
        OTL
        PTS
        GF
        GA
        GD
        PPG
      }
    }
  }
`;

const GET_LEAGUE_SKATER_LEADERS_QUERY = `
  query GetLeagueSkaterLeaders($slug: String!, $season: String, $limit: Int) {
    leagueSkaterStats(slug: $slug, season: $season, limit: $limit, sort: "-regularStats.PTS") {
      edges {
        id
        player {
          id
          name
          slug
          position
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
          PM
          PIM
        }
      }
    }
  }
`;

const GET_LEAGUE_GOALIE_LEADERS_QUERY = `
  query GetLeagueGoalieLeaders($slug: String!, $season: String, $limit: Int) {
    leagueGoalieStats(slug: $slug, season: $season, limit: $limit, sort: "-regularStats.W") {
      edges {
        id
        player {
          id
          name
          slug
        }
        team {
          name
          slug
        }
        regularStats {
          GP
          W
          L
          GAA
          SVP
          SO
        }
      }
    }
  }
`;

export const getLeagueStandingsTool: Tool = {
  name: "get_league_standings",
  description: `Get league standings with team records and statistics.

Returns team standings including:
- Record: GP (games played), W (wins), L (losses), T (ties), OTW (overtime wins), OTL (overtime losses), PTS (points)
- Scoring: GF (goals for), GA (goals against), GD (goal differential)
- Efficiency: PPG (points per game)

Note: Shot statistics (shots for/against) are NOT available in the API.

League slugs examples: "nhl", "ahl", "shl", "khl"`,
  inputSchema: {
    type: "object",
    properties: {
      leagueSlug: {
        type: "string",
        description: "League slug (e.g., 'nhl', 'ahl', 'shl')",
      },
      season: {
        type: "string",
        description: "Season (e.g., '2023-2024'). If not provided, uses current season.",
      },
      limit: {
        type: "number",
        description: "Maximum number of teams to return (default: 50)",
        default: 50,
      },
    },
    required: ["leagueSlug"],
  },
};

export async function handleGetLeagueStandings(args: {
  leagueSlug: string;
  season?: string;
  limit?: number;
}): Promise<string> {
  const { leagueSlug, season, limit = 50 } = args;

  if (!leagueSlug) {
    throw new Error("leagueSlug is required");
  }

  try {
    const result = await executeQuery<{
      leagueStandings: unknown[];
    }>(GET_LEAGUE_STANDINGS_QUERY, { 
      slug: leagueSlug, 
      season, 
      limit 
    });

    return JSON.stringify(
      {
        league: leagueSlug,
        season: season || "current",
        standings: result.leagueStandings || [],
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch league standings: ${error.message}`);
    }
    throw error;
  }
}

export const getLeagueLeadersTool: Tool = {
  name: "get_league_leaders",
  description: `Get scoring leaders for skaters and goalies in a league.
  
Returns top players sorted by:
- Skaters: Points (PTS = Goals + Assists)
- Goalies: Wins

League slugs examples: "nhl", "ahl", "shl", "khl"`,
  inputSchema: {
    type: "object",
    properties: {
      leagueSlug: {
        type: "string",
        description: "League slug (e.g., 'nhl', 'ahl', 'shl')",
      },
      season: {
        type: "string",
        description: "Season (e.g., '2023-2024'). If not provided, uses current season.",
      },
      limit: {
        type: "number",
        description: "Number of leaders to return for each category (default: 10)",
        default: 10,
      },
    },
    required: ["leagueSlug"],
  },
};

export async function handleGetLeagueLeaders(args: {
  leagueSlug: string;
  season?: string;
  limit?: number;
}): Promise<string> {
  const { leagueSlug, season, limit = 10 } = args;

  if (!leagueSlug) {
    throw new Error("leagueSlug is required");
  }

  try {
    const [skaterResult, goalieResult] = await Promise.all([
      executeQuery<{
        leagueSkaterStats: { edges: unknown[] };
      }>(GET_LEAGUE_SKATER_LEADERS_QUERY, { slug: leagueSlug, season, limit }),
      executeQuery<{
        leagueGoalieStats: { edges: unknown[] };
      }>(GET_LEAGUE_GOALIE_LEADERS_QUERY, { slug: leagueSlug, season, limit }),
    ]);

    return JSON.stringify(
      {
        league: leagueSlug,
        season: season || "current",
        skaterLeaders: skaterResult.leagueSkaterStats?.edges || [],
        goalieLeaders: goalieResult.leagueGoalieStats?.edges || [],
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch league leaders: ${error.message}`);
    }
    throw error;
  }
}

