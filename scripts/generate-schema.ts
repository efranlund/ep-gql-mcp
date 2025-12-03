#!/usr/bin/env tsx

/**
 * Schema Generation Script
 * 
 * This script introspects the EliteProspects GraphQL API and generates
 * static JSON files for use in production (where introspection is disabled).
 * 
 * Run with: npm run generate-schema
 */

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const EP_GQL_URL = process.env.EP_GQL_URL || "https://dev-gql-41yd43jtq6.eliteprospects-assets.com";
const GENERATED_DIR = join(__dirname, "../src/generated");

// GraphQL introspection query
const INTROSPECTION_QUERY = `
  query IntrospectionQuery {
    __schema {
      queryType {
        name
        fields {
          name
          description
          args {
            name
            description
            type {
              name
              kind
              ofType {
                name
                kind
                ofType {
                  name
                  kind
                }
              }
            }
            defaultValue
          }
          type {
            name
            kind
            ofType {
              name
              kind
              ofType {
                name
                kind
              }
            }
          }
        }
      }
      types {
        name
        kind
        description
        fields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
        enumValues {
          name
          description
        }
        inputFields {
          name
          description
          type {
            name
            kind
            ofType {
              name
              kind
            }
          }
        }
      }
    }
  }
`;

// Query to fetch popular leagues for reference data
const LEAGUES_QUERY = `
  query GetLeagues {
    leagues(limit: 500, sort: "name") {
      edges {
        id
        slug
        name
        country {
          name
          slug
        }
        teamClass
        leagueLevel
      }
    }
  }
`;

// Query to fetch countries
const COUNTRIES_QUERY = `
  query GetCountries {
    countries(limit: 300) {
      edges {
        slug
        name
        iso_3166_1_alpha_2
      }
    }
  }
`;

interface IntrospectionResult {
  data: {
    __schema: {
      queryType: {
        name: string;
        fields: QueryField[];
      };
      types: SchemaType[];
    };
  };
}

interface QueryField {
  name: string;
  description: string | null;
  args: Argument[];
  type: TypeRef;
}

interface Argument {
  name: string;
  description: string | null;
  type: TypeRef;
  defaultValue: string | null;
}

interface TypeRef {
  name: string | null;
  kind: string;
  ofType?: TypeRef | null;
}

interface SchemaType {
  name: string;
  kind: string;
  description: string | null;
  fields?: Field[] | null;
  enumValues?: EnumValue[] | null;
  inputFields?: InputField[] | null;
}

interface Field {
  name: string;
  description: string | null;
  type: TypeRef;
}

interface EnumValue {
  name: string;
  description: string | null;
}

interface InputField {
  name: string;
  description: string | null;
  type: TypeRef;
}

async function fetchGraphQL<T>(query: string): Promise<T> {
  const response = await fetch(EP_GQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function getTypeName(type: TypeRef | null | undefined): string {
  if (!type) return "Unknown";
  if (type.name) return type.name;
  if (type.ofType) return getTypeName(type.ofType);
  return "Unknown";
}

function formatType(type: TypeRef | null | undefined): string {
  if (!type) return "Unknown";
  if (type.kind === "NON_NULL" && type.ofType) {
    return `${formatType(type.ofType)}!`;
  }
  if (type.kind === "LIST" && type.ofType) {
    return `[${formatType(type.ofType)}]`;
  }
  return type.name || "Unknown";
}

async function generateSchema() {
  console.log("🏒 EliteProspects GraphQL Schema Generator");
  console.log(`📡 Endpoint: ${EP_GQL_URL}\n`);

  // Ensure generated directory exists
  mkdirSync(GENERATED_DIR, { recursive: true });

  // 1. Fetch introspection data
  console.log("📥 Fetching schema introspection...");
  const introspection = await fetchGraphQL<IntrospectionResult>(INTROSPECTION_QUERY);
  const schema = introspection.data.__schema;

  // Save full schema
  writeFileSync(
    join(GENERATED_DIR, "schema.json"),
    JSON.stringify(introspection.data, null, 2)
  );
  console.log("✅ Saved schema.json");

  // 2. Generate queries.json
  console.log("📥 Processing queries...");
  const queries = schema.queryType.fields.map((field) => ({
    name: field.name,
    description: field.description,
    args: field.args.map((arg) => ({
      name: arg.name,
      description: arg.description,
      type: formatType(arg.type),
      required: arg.type.kind === "NON_NULL",
    })),
    returnType: formatType(field.type),
  }));

  writeFileSync(
    join(GENERATED_DIR, "queries.json"),
    JSON.stringify(queries, null, 2)
  );
  console.log(`✅ Saved queries.json (${queries.length} queries)`);

  // 3. Generate types.json (key object types)
  console.log("📥 Processing types...");
  const keyTypeNames = [
    "Player", "Team", "League", "Game", "Staff", "Award",
    "PlayerStats", "TeamStats", "Transfer", "DraftSelection",
    "GameLog", "Arena", "Country"
  ];
  
  const types = schema.types
    .filter((t) => 
      t.kind === "OBJECT" && 
      !t.name.startsWith("__") &&
      (keyTypeNames.some(name => t.name.includes(name)) || t.fields?.length)
    )
    .slice(0, 100) // Limit to avoid huge file
    .map((t) => ({
      name: t.name,
      kind: t.kind,
      description: t.description,
      fields: t.fields?.map((f) => ({
        name: f.name,
        description: f.description,
        type: formatType(f.type),
      })),
    }));

  writeFileSync(
    join(GENERATED_DIR, "types.json"),
    JSON.stringify(types, null, 2)
  );
  console.log(`✅ Saved types.json (${types.length} types)`);

  // 4. Generate enums.json
  console.log("📥 Processing enums...");
  const enums = schema.types
    .filter((t) => t.kind === "ENUM" && !t.name.startsWith("__"))
    .map((t) => ({
      name: t.name,
      description: t.description,
      values: t.enumValues?.map((v) => v.name) || [],
    }));

  writeFileSync(
    join(GENERATED_DIR, "enums.json"),
    JSON.stringify(enums, null, 2)
  );
  console.log(`✅ Saved enums.json (${enums.length} enums)`);

  // 5. Generate reference-data.json
  console.log("📥 Fetching reference data...");
  
  let leagues: unknown[] = [];
  let countries: unknown[] = [];
  
  try {
    const leaguesResult = await fetchGraphQL<{ data: { leagues: { edges: unknown[] } } }>(LEAGUES_QUERY);
    leagues = leaguesResult.data?.leagues?.edges || [];
  } catch (e) {
    console.warn("⚠️  Could not fetch leagues, using empty array", e);
  }

  try {
    const countriesResult = await fetchGraphQL<{ data: { countries: { edges: unknown[] } } }>(COUNTRIES_QUERY);
    countries = countriesResult.data?.countries?.edges || [];
  } catch (e) {
    console.warn("⚠️  Could not fetch countries, using empty array", e);
  }

  // Player positions (from enum or hardcoded)
  const positionsEnum = enums.find((e) => e.name === "PlayerPosition" || e.name === "PlayerPositionDetailed");
  const positions = positionsEnum?.values || [
    "C", "LW", "RW", "D", "G", "F", "W"
  ];

  const referenceData = {
    leagues,
    countries,
    positions,
    seasonFormat: "YYYY-YYYY (e.g., 2023-2024)",
    currentSeason: "2024-2025",
  };

  writeFileSync(
    join(GENERATED_DIR, "reference-data.json"),
    JSON.stringify(referenceData, null, 2)
  );
  console.log(`✅ Saved reference-data.json (${leagues.length} leagues, ${countries.length} countries)`);

  console.log("\n🎉 Schema generation complete!");
  console.log(`📁 Output directory: ${GENERATED_DIR}`);
}

// Run the generator
generateSchema().catch((error) => {
  console.error("❌ Schema generation failed:", error);
  process.exit(1);
});

