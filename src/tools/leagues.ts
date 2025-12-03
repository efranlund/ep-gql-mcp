/**
 * League Convenience Tools
 * 
 * get_league_standings - Get current standings for any league/season
 * get_league_leaders - Get scoring leaders for skaters and goalies
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

const GET_LEAGUE_STANDINGS_QUERY = `
  query GetLeagueStandings($slug: String!, $season: String) {
    league(slug: $slug) {
      id
      name
      slug
      standings(season: $season) {
        edges {
          id
          team {
            id
            name
            slug
          }
          gp
          w
          l
          otl
          points
          gf
          ga
          rank
        }
      }
    }
  }
`;

const GET_LEAGUE_SKATER_LEADERS_QUERY = `
  query GetLeagueSkaterLeaders($slug: String!, $season: String, $limit: Int) {
    leagueSkaterStats(slug: $slug, season: $season, limit: $limit, sort: "-regularStats.pts") {
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
          gp
          g
          a
          pts
          plusMinus
          pim
        }
      }
    }
  }
`;

const GET_LEAGUE_GOALIE_LEADERS_QUERY = `
  query GetLeagueGoalieLeaders($slug: String!, $season: String, $limit: Int) {
    leagueGoalieStats(slug: $slug, season: $season, limit: $limit, sort: "-regularStats.w") {
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
          gp
          w
          l
          gaa
          svp
          so
        }
      }
    }
  }
`;

export const getLeagueStandingsTool: Tool = {
  name: "get_league_standings",
  description: `Get current standings for any league and season.
  
League slugs examples:
- NHL: "nhl"
- AHL: "ahl"
- SHL: "shl"
- KHL: "khl"

If season is not provided, returns current season standings.`,
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
    },
    required: ["leagueSlug"],
  },
};

export async function handleGetLeagueStandings(args: {
  leagueSlug: string;
  season?: string;
}): Promise<string> {
  const { leagueSlug, season } = args;

  if (!leagueSlug) {
    throw new Error("leagueSlug is required");
  }

  try {
    const result = await executeQuery<{
      league: {
        id: string;
        name: string;
        slug: string;
        standings: { edges: unknown[] };
      };
    }>(GET_LEAGUE_STANDINGS_QUERY, { slug: leagueSlug, season });

    return JSON.stringify(
      {
        league: {
          id: result.league.id,
          name: result.league.name,
          slug: result.league.slug,
        },
        season: season || "current",
        standings: result.league.standings?.edges || [],
        totalTeams: result.league.standings?.edges?.length || 0,
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

