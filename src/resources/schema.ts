/**
 * Schema Resources
 * 
 * schema://queries - List of all 321 available GraphQL queries
 * schema://types - Key GraphQL types
 * schema://enums - Enumeration values
 */

import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const GENERATED_DIR = join(__dirname, "../generated");

function loadQueries(): unknown[] {
  try {
    const content = readFileSync(join(GENERATED_DIR, "queries.json"), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

function loadTypes(): unknown[] {
  try {
    const content = readFileSync(join(GENERATED_DIR, "types.json"), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

function loadEnums(): unknown[] {
  try {
    const content = readFileSync(join(GENERATED_DIR, "enums.json"), "utf-8");
    return JSON.parse(content);
  } catch (error) {
    return [];
  }
}

export function getSchemaQueriesResource(): string {
  const queries = loadQueries();
  return JSON.stringify(
    {
      totalQueries: queries.length,
      queries: queries.slice(0, 100), // Limit to first 100 for readability
      note: "This resource contains all available GraphQL queries. Use introspect_schema tool to get details about specific queries.",
    },
    null,
    2
  );
}

export function getSchemaTypesResource(): string {
  const types = loadTypes();
  return JSON.stringify(
    {
      totalTypes: types.length,
      types: types.slice(0, 50), // Limit to first 50 for readability
      note: "This resource contains key GraphQL types. Use introspect_schema tool with typeName parameter to get details about specific types.",
    },
    null,
    2
  );
}

export function getSchemaEnumsResource(): string {
  const enums = loadEnums();
  return JSON.stringify(
    {
      totalEnums: enums.length,
      enums: enums.slice(0, 50), // Limit to first 50 for readability
      note: "This resource contains all enum values. Use introspect_schema tool to get details about specific enums.",
    },
    null,
    2
  );
}

