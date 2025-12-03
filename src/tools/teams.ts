/**
 * Team Convenience Tools
 * 
 * get_team - Get team profile including roster and basic info
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";
import { handleSearchEntities } from "./search.js";

const GET_TEAM_QUERY = `
  query GetTeam($id: ID!) {
    team(id: $id) {
      id
      name
      slug
      country
      league {
        id
        name
        slug
      }
      founded
      arena {
        name
        city
      }
    }
  }
`;

const GET_TEAM_ROSTER_QUERY = `
  query GetTeamRoster($id: ID!) {
    teamRoster(team: $id) {
      edges {
        id
        player {
          id
          name
          slug
          position
          nationality
        }
        jerseyNumber
        position
        status
      }
    }
  }
`;

export const getTeamTool: Tool = {
  name: "get_team",
  description: `Get team profile information including roster.
  
If a name is provided, this tool will automatically search for the team and return the first match.
If an ID is provided, it will directly fetch the team profile.

Returns: team info (name, country, league, arena) and current roster with player details.`,
  inputSchema: {
    type: "object",
    properties: {
      teamId: {
        type: "string",
        description: "Team ID (numeric string)",
      },
      teamName: {
        type: "string",
        description: "Team name (will search and use first match)",
      },
      includeRoster: {
        type: "boolean",
        description: "Whether to include the team roster (default: true)",
        default: true,
      },
    },
  },
};

export async function handleGetTeam(args: {
  teamId?: string;
  teamName?: string;
  includeRoster?: boolean;
}): Promise<string> {
  const { teamId, teamName, includeRoster = true } = args;

  if (!teamId && !teamName) {
    throw new Error("Either teamId or teamName must be provided");
  }

  let id = teamId;

  // If name provided, search for team
  if (!id && teamName) {
    const searchResult = await handleSearchEntities({
      searchTerm: teamName,
      entityType: "team",
      limit: 1,
    });
    const parsed = JSON.parse(searchResult);
    const teams = parsed.results?.teams || [];
    if (teams.length === 0) {
      throw new Error(`No team found matching "${teamName}"`);
    }
    id = (teams[0] as { id: string }).id;
  }

  if (!id) {
    throw new Error("Could not resolve team ID");
  }

  try {
    const [teamResult, rosterResult] = await Promise.all([
      executeQuery<{ team: unknown }>(GET_TEAM_QUERY, { id }),
      includeRoster
        ? executeQuery<{ teamRoster: { edges: unknown[] } }>(GET_TEAM_ROSTER_QUERY, { id })
        : Promise.resolve({ teamRoster: { edges: [] } }),
    ]);

    return JSON.stringify(
      {
        ...teamResult.team,
        roster: includeRoster ? rosterResult.teamRoster?.edges || [] : undefined,
        rosterCount: includeRoster ? rosterResult.teamRoster?.edges?.length || 0 : undefined,
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch team: ${error.message}`);
    }
    throw error;
  }
}

