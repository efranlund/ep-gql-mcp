/**
 * execute_graphql Tool
 * 
 * A flexible tool that executes any valid GraphQL query against the EliteProspects API.
 * This is the primary workhorse tool for answering user questions.
 */

import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { executeQuery } from "../graphql/client.js";

export const executeGraphQLTool: Tool = {
  name: "execute_graphql",
  description: `Execute any GraphQL query against the EliteProspects API. 
  
This is the primary tool for querying hockey data. You can construct any valid GraphQL query based on the available schema.

Examples:
- Query player stats: "{ player(id: 296251) { name stats { goals assists } } }"
- Query league standings: "{ league(slug: \"nhl\") { standings { team { name } points } } }"
- Query team roster: "{ team(id: 123) { name roster { player { name position } } } }"

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
      throw new Error(`GraphQL query failed: ${error.message}`);
    }
    throw error;
  }
}
