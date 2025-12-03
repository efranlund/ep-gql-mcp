/**
 * Draft Tools
 * 
 * get_draft_picks - Query draft selections
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

const GET_DRAFT_PICKS_QUERY = `
  query GetDraftPicks($draftTypeSlug: String!, $year: String, $team: ID, $player: ID, $round: Int, $limit: Int) {
    draftTypeSelections(slug: $draftTypeSlug, year: $year, team: $team, player: $player, round: $round, limit: $limit) {
      edges {
        id
        year
        round
        overall
        team {
          id
          name
          slug
        }
        player {
          id
          name
          slug
          position
          nationality
        }
      }
    }
  }
`;

export const getDraftPicksTool: Tool = {
  name: "get_draft_picks",
  description: `Query draft selections (e.g., NHL Entry Draft).
  
Common draft type slugs:
- NHL Entry Draft: "nhl-entry-draft"
- Other drafts available via list_draft_types tool

Filter by:
- year: Draft year (e.g., "2023")
- team: Team ID
- player: Player ID
- round: Round number (1-7 for NHL)

Returns: draft selections with team, player, round, and overall pick number.`,
  inputSchema: {
    type: "object",
    properties: {
      draftTypeSlug: {
        type: "string",
        description: "Draft type slug (e.g., 'nhl-entry-draft')",
        default: "nhl-entry-draft",
      },
      year: {
        type: "string",
        description: "Draft year (e.g., '2023')",
      },
      teamId: {
        type: "string",
        description: "Team ID to filter picks",
      },
      playerId: {
        type: "string",
        description: "Player ID to filter picks",
      },
      round: {
        type: "number",
        description: "Round number (1-7 for NHL)",
      },
      limit: {
        type: "number",
        description: "Maximum number of picks to return (default: 50)",
        default: 50,
      },
    },
  },
};

export async function handleGetDraftPicks(args: {
  draftTypeSlug?: string;
  year?: string;
  teamId?: string;
  playerId?: string;
  round?: number;
  limit?: number;
}): Promise<string> {
  const {
    draftTypeSlug = "nhl-entry-draft",
    year,
    teamId,
    playerId,
    round,
    limit = 50,
  } = args;

  try {
    const result = await executeQuery<{
      draftTypeSelections: { edges: unknown[] };
    }>(GET_DRAFT_PICKS_QUERY, {
      draftTypeSlug,
      year,
      team: teamId,
      player: playerId,
      round,
      limit,
    });

    return JSON.stringify(
      {
        draftType: draftTypeSlug,
        filters: {
          year,
          teamId,
          playerId,
          round,
        },
        picks: result.draftTypeSelections?.edges || [],
        totalPicks: result.draftTypeSelections?.edges?.length || 0,
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch draft picks: ${error.message}`);
    }
    throw error;
  }
}

