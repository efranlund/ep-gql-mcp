/**
 * GraphQL Client for EliteProspects API
 */

import { GraphQLClient } from "graphql-request";

const EP_GQL_URL =
  process.env.EP_GQL_URL || "https://dev-gql-41yd43jtq6.eliteprospects-assets.com";

export const graphqlClient = new GraphQLClient(EP_GQL_URL, {
  headers: {
    "Content-Type": "application/json",
  },
});

export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{ line: number; column: number }>;
    path?: Array<string | number>;
  }>;
}

export interface GraphQLError extends Error {
  response?: {
    errors?: Array<{ message: string }>;
  };
}

/**
 * Execute a GraphQL query with retry logic for network errors
 */
export async function executeQuery<T = unknown>(
  query: string,
  variables?: Record<string, unknown>,
  retries = 1
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const data = await graphqlClient.request<T>(query, variables);
      return data;
    } catch (error) {
      // Handle GraphQL errors
      if (error instanceof Error) {
        const graphqlError = error as GraphQLError;
        if (graphqlError.response?.errors) {
          // GraphQL errors are not retried
          throw new Error(
            `GraphQL Error: ${graphqlError.response.errors.map((e) => e.message).join(", ")}`
          );
        }
        // Handle network errors - retry once
        if (error.message.includes("fetch") || error.message.includes("network")) {
          lastError = new Error(
            `Network error: Unable to connect to EliteProspects GraphQL API at ${EP_GQL_URL}`
          );
          if (attempt < retries) {
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 500));
            continue;
          }
        } else {
          throw error;
        }
      }
      lastError = error as Error;
    }
  }
  
  throw lastError || new Error("Query failed after retries");
}

/**
 * Execute a GraphQL query with raw response (includes errors)
 */
export async function executeQueryRaw<T = unknown>(
  query: string,
  variables?: Record<string, unknown>
): Promise<GraphQLResponse<T>> {
  try {
    const data = await graphqlClient.request<T>(query, variables);
    return { data };
  } catch (error) {
    if (error instanceof Error) {
      const graphqlError = error as GraphQLError;
      if (graphqlError.response?.errors) {
        return {
          errors: graphqlError.response.errors.map((e) => ({
            message: e.message,
          })),
        };
      }
      throw new Error(
        `Network error: Unable to connect to EliteProspects GraphQL API at ${EP_GQL_URL}`
      );
    }
    throw error;
  }
}
