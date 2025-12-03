/**
 * introspect_schema Tool
 * 
 * Explore the GraphQL schema to understand available queries and types.
 * Uses pre-generated static schema data (introspection disabled in production).
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const GENERATED_DIR = join(__dirname, "./generated");

interface Query {
  name: string;
  description: string | null;
  args: Array<{
    name: string;
    description: string | null;
    type: string;
    required: boolean;
  }>;
  returnType: string;
}

function loadQueries(): Query[] {
  try {
    const content = readFileSync(join(GENERATED_DIR, "queries.json"), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error("Failed to load queries.json. Run 'npm run generate-schema' first.");
  }
}

function loadTypes(): unknown[] {
  try {
    const content = readFileSync(join(GENERATED_DIR, "types.json"), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error("Failed to load types.json. Run 'npm run generate-schema' first.");
  }
}

function loadEnums(): unknown[] {
  try {
    const content = readFileSync(join(GENERATED_DIR, "enums.json"), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    throw new Error("Failed to load enums.json. Run 'npm run generate-schema' first.");
  }
}

export const introspectSchemaTool: Tool = {
  name: "introspect_schema",
  description: `Explore the EliteProspects GraphQL schema to discover available queries, types, and enums.
  
This tool helps you understand what data is available and how to construct queries. The schema contains 321 queries covering players, teams, leagues, games, drafts, staff, awards, and more.

You can filter by:
- queryName: Get details about a specific query (e.g., "player", "leagueStandings")
- typeName: Get details about a specific type (e.g., "Player", "Team", "League")

If no filter is provided, returns summary information about all queries.`,
  inputSchema: {
    type: "object",
    properties: {
      queryName: {
        type: "string",
        description: "Optional: Filter to a specific query by name",
      },
      typeName: {
        type: "string",
        description: "Optional: Filter to a specific type by name",
      },
    },
  },
};

export async function handleIntrospectSchema(args: {
  queryName?: string;
  typeName?: string;
}): Promise<string> {
  const { queryName, typeName } = args;

  if (queryName) {
    const queries = loadQueries();
    const query = queries.find((q) => q.name === queryName);
    if (!query) {
      return JSON.stringify(
        {
          error: `Query '${queryName}' not found`,
          availableQueries: queries.slice(0, 20).map((q) => q.name),
        },
        null,
        2
      );
    }
    return JSON.stringify(query, null, 2);
  }

  if (typeName) {
    const types = loadTypes();
    const type = (types as Array<{ name: string }>).find((t) => t.name === typeName);
    if (!type) {
      return JSON.stringify(
        {
          error: `Type '${typeName}' not found`,
          availableTypes: (types as Array<{ name: string }>).slice(0, 20).map((t) => t.name),
        },
        null,
        2
      );
    }
    return JSON.stringify(type, null, 2);
  }

  // Return summary
  const queries = loadQueries();
  const types = loadTypes();
  const enums = loadEnums();

  return JSON.stringify(
    {
      summary: {
        totalQueries: queries.length,
        totalTypes: types.length,
        totalEnums: enums.length,
      },
      sampleQueries: queries.slice(0, 20).map((q) => ({
        name: q.name,
        description: q.description,
        returnType: q.returnType,
      })),
      sampleTypes: (types as Array<{ name: string; kind: string }>).slice(0, 10).map((t) => ({
        name: t.name,
        kind: t.kind,
      })),
      note: "Use queryName or typeName parameters to get detailed information about specific queries or types.",
    },
    null,
    2
  );
}
