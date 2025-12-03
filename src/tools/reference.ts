/**
 * Reference Data Tools
 * 
 * list_leagues - Get available leagues with their slugs
 * list_seasons - Get available seasons for a league
 * list_draft_types - Get available draft types
 * get_current_season - Get the current active season
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { executeQuery } from "../graphql/client.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const GENERATED_DIR = join(__dirname, "./generated");

function loadReferenceData(): {
  leagues: unknown[];
  countries: unknown[];
  positions: string[];
  seasonFormat: string;
  currentSeason: string;
} {
  try {
    const content = readFileSync(join(GENERATED_DIR, "reference-data.json"), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return {
      leagues: [],
      countries: [],
      positions: ["C", "LW", "RW", "D", "G"],
      seasonFormat: "YYYY-YYYY (e.g., 2023-2024)",
      currentSeason: "2024-2025",
    };
  }
}

const GET_LEAGUE_SEASONS_QUERY = `
  query GetLeagueSeasons($slug: String!) {
    league(slug: $slug) {
      id
      name
      slug
      seasons {
        edges {
          id
          slug
        }
      }
    }
  }
`;

const GET_DRAFT_TYPES_QUERY = `
  query GetDraftTypes {
    draftTypes(limit: 50) {
      edges {
        id
        slug
        name
      }
    }
  }
`;

export const listLeaguesTool: Tool = {
  name: "list_leagues",
  description: `Get a list of available leagues with their slugs.
  
League slugs are essential for constructing queries. Common examples:
- NHL: "nhl"
- AHL: "ahl"
- SHL: "shl"
- KHL: "khl"
- OHL: "ohl"

Returns: list of leagues with id, slug, name, country, and league level.`,
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of leagues to return (default: 100)",
        default: 100,
      },
    },
  },
};

export async function handleListLeagues(args: { limit?: number }): Promise<string> {
  const { limit = 100 } = args;
  const refData = loadReferenceData();
  const leagues = (refData.leagues as Array<unknown>).slice(0, limit);

  return JSON.stringify(
    {
      leagues,
      total: refData.leagues.length,
      note: "Use league slugs (e.g., 'nhl', 'ahl') in queries. Run with higher limit to see more leagues.",
    },
    null,
    2
  );
}

export const listSeasonsTool: Tool = {
  name: "list_seasons",
  description: `Get available seasons for a specific league.
  
Season format: YYYY-YYYY (e.g., "2023-2024")
  
Returns: list of seasons available for the specified league.`,
  inputSchema: {
    type: "object",
    properties: {
      leagueSlug: {
        type: "string",
        description: "League slug (e.g., 'nhl', 'ahl', 'shl')",
      },
    },
    required: ["leagueSlug"],
  },
};

export async function handleListSeasons(args: { leagueSlug: string }): Promise<string> {
  const { leagueSlug } = args;

  if (!leagueSlug) {
    throw new Error("leagueSlug is required");
  }

  try {
    const result = await executeQuery<{
      league: {
        id: string;
        name: string;
        slug: string;
        seasons: { edges: Array<{ id: string; slug: string }> };
      };
    }>(GET_LEAGUE_SEASONS_QUERY, { slug: leagueSlug });

    return JSON.stringify(
      {
        league: {
          id: result.league.id,
          name: result.league.name,
          slug: result.league.slug,
        },
        seasons: result.league.seasons?.edges?.map((e) => e.slug) || [],
        totalSeasons: result.league.seasons?.edges?.length || 0,
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch seasons: ${error.message}`);
    }
    throw error;
  }
}

export const listDraftTypesTool: Tool = {
  name: "list_draft_types",
  description: `Get available draft types (e.g., NHL Entry Draft).
  
Returns: list of draft types with slugs that can be used in get_draft_picks tool.
  
Common draft types:
- NHL Entry Draft: "nhl-entry-draft"`,
  inputSchema: {
    type: "object",
    properties: {
      limit: {
        type: "number",
        description: "Maximum number of draft types to return (default: 50)",
        default: 50,
      },
    },
  },
};

export async function handleListDraftTypes(args: { limit?: number }): Promise<string> {
  const { limit = 50 } = args;

  try {
    const result = await executeQuery<{
      draftTypes: { edges: unknown[] };
    }>(GET_DRAFT_TYPES_QUERY);

    const draftTypes = (result.draftTypes?.edges || []).slice(0, limit);

    return JSON.stringify(
      {
        draftTypes,
        total: result.draftTypes?.edges?.length || 0,
        note: "Use the 'slug' field in get_draft_picks tool.",
      },
      null,
      2
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to fetch draft types: ${error.message}`);
    }
    throw error;
  }
}

export const getCurrentSeasonTool: Tool = {
  name: "get_current_season",
  description: `Get the current active season string.
  
Returns: current season in YYYY-YYYY format (e.g., "2024-2025").
This is useful for queries that need the current season when not specified.`,
  inputSchema: {
    type: "object",
    properties: {},
  },
};

export async function handleGetCurrentSeason(): Promise<string> {
  const refData = loadReferenceData();
  const currentSeason = refData.currentSeason || "2024-2025";

  return JSON.stringify(
    {
      currentSeason,
      seasonFormat: refData.seasonFormat || "YYYY-YYYY (e.g., 2023-2024)",
      note: "Use this season string in queries when you need the current season.",
    },
    null,
    2
  );
}

