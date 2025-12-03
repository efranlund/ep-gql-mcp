/**
 * Schema Resources
 * 
 * schema://queries - List of all 321 available GraphQL queries
 * schema://types - Key GraphQL types
 * schema://enums - Enumeration values
 */

import queriesData from "../generated/queries.json";
import typesData from "../generated/types.json";
import enumsData from "../generated/enums.json";

export function getSchemaQueriesResource(): string {
  const queries = queriesData as unknown[];
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
  const types = typesData as unknown[];
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
  const enums = enumsData as unknown[];
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
