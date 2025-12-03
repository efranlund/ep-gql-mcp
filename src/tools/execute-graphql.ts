/**
 * execute_graphql Tool
 * 
 * A flexible tool that executes any valid GraphQL query against the EliteProspects API.
 * This is the primary workhorse tool for answering user questions.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

/**
 * Enhance GraphQL error messages with helpful hints and suggestions
 */
function enhanceGraphQLError(originalError: string): string {
  try {
    // Always preserve the original error message
    let enhanced = originalError;
    
    // Pattern 1: "Cannot query field X on type Query"
    if (originalError.includes('Cannot query field') && originalError.includes('on type "Query"')) {
      enhanced += '\n\nHint: Use the introspect_schema tool or check guide://anti-patterns for common mistakes.';
      
      // Specific anti-patterns
      if (originalError.toLowerCase().includes('playerstatrecords')) {
        enhanced += '\n\nNote: Use playerStats, playerStatsLeagues, playerStatsSeasons, or leagueSkaterStats instead.';
        enhanced += '\nExample: leagueSkaterStats(slug: "nhl", sort: "-regularStats.PTS") for points leaders.';
      }
      
      if (originalError.toLowerCase().includes('rookies')) {
        enhanced += '\n\nNote: There is no "rookies" query. Filter leagueSkaterStats by age and games played for rookie data.';
        enhanced += '\nExample: leagueSkaterStats(slug: "nhl", playerAge: 25, regularStatsGPMax: 82, sort: "-regularStats.PTS")';
      }
      
      if (originalError.toLowerCase().includes('teamstats')) {
        enhanced += '\n\nNote: Use leagueStandings for team statistics, not "teamStats".';
        enhanced += '\nExample: leagueStandings(slug: "nhl") returns team records and goal differentials.';
      }
    }
    
    // Pattern 2: Lowercase stat fields
    if (originalError.match(/Cannot query field "(gp|g|a|pts|pim|pm|gaa|svp|sog|toi)"/i)) {
      enhanced += '\n\nNote: Stat field names are UPPERCASE (GP, G, A, PTS, PIM, PM, GAA, SVP, SOG, TOI).';
      enhanced += '\nCheck guide://field-reference for correct field names.';
    }
    
    // Pattern 3: Missing subfields on object type
    if (originalError.includes('must have a selection of subfields') || 
        originalError.includes('must have a sub selection')) {
      enhanced += '\n\nNote: Object-type fields require subfield selection.';
      enhanced += '\nExample: country { name slug } instead of just "country".';
      enhanced += '\nCheck guide://field-reference for object field requirements.';
    }
    
    return enhanced;
  } catch (error) {
    // If enhancement fails, return original error
    return originalError;
  }
}

export const executeGraphQLTool: Tool = {
  name: "execute_graphql",
  description: `Execute any GraphQL query against the EliteProspects API. 
  
This is the primary tool for querying hockey data. The schema contains 321 available queries covering players, teams, leagues, games, drafts, and more.

**When to use this tool:**
- For complex queries not covered by convenience tools
- When you need specific fields or filters
- For head-to-head matchups, advanced stats, or custom queries

**Convenience Tools (use these first when applicable):**
- get_player, get_player_stats - Player information and statistics
- get_team - Team information and rosters
- get_league_standings - League standings and team records
- get_league_leaders - Top scorers and goalies in a league
- get_games - Game schedules and results
- get_game_logs - Detailed game-by-game player statistics

**Schema Discovery:**
Use introspect_schema tool or check guide://common-queries, guide://query-patterns, and guide://anti-patterns for examples.

**Example: Get NHL Points Leaders**
{
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    limit: 10,
    sort: "-regularStats.PTS"
  ) {
    edges {
      player { name }
      team { name }
      regularStats { GP G A PTS }
    }
  }
}

**Example: Head-to-Head Games**
{
  games(
    teamIds: ["<TEAM1_ID>", "<TEAM2_ID>"],
    league: "nhl",
    limit: 10,
    sort: "-dateTime"
  ) {
    edges {
      dateTime
      homeTeam { name }
      visitingTeam { name }
      homeScore
      visitingScore
    }
  }
}

**Critical Rules:**
- ALL stat field names are UPPERCASE (GP, G, A, PTS, not gp, g, a, pts)
- Object fields need subfields (e.g., team { name }, not just team)
- Most list queries use edges { ...fields } pattern
- Check guide://anti-patterns for common mistakes

The query should be a valid GraphQL query string. Variables can be provided as a JSON object.`,
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The GraphQL query string to execute",
      },
      variables: {
        type: "object",
        description: "Optional variables for the GraphQL query (as key-value pairs)",
        additionalProperties: true,
      },
    },
    required: ["query"],
  },
};

export async function handleExecuteGraphQL(args: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<string> {
  const { query, variables } = args;

  // Basic validation
  if (!query || typeof query !== "string") {
    throw new Error("Query must be a non-empty string");
  }

  // Check for basic GraphQL syntax
  const trimmedQuery = query.trim();
  if (!trimmedQuery.startsWith("{") && !trimmedQuery.startsWith("query") && !trimmedQuery.startsWith("mutation") && !trimmedQuery.startsWith("subscription")) {
    throw new Error("Query must be a valid GraphQL query (should start with '{', 'query', 'mutation', or 'subscription')");
  }

  try {
    const result = await executeQuery(query, variables);
    return JSON.stringify(result, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      // Enhance the error message with helpful hints
      const enhancedMessage = enhanceGraphQLError(error.message);
      throw new Error(`GraphQL query failed: ${enhancedMessage}`);
    }
    throw error;
  }
}
