import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getSchemaQueriesResource, getSchemaTypesResource, getSchemaEnumsResource } from "./resources/schema.js";
import { getReferenceLeaguesResource, getReferenceCountriesResource, getReferencePositionsResource, getReferenceSeasonsResource } from "./resources/reference.js";
import { getCommonQueriesGuide, getHockeyTerminologyGuide, getQueryPatternsGuide, getAntiPatternsGuide, getAdvancedQueriesGuide, getFieldReferenceGuide } from "./resources/guides.js";

export function registerResources(server: McpServer) {
  server.registerResource(
    "schema://queries",
    {
      name: "GraphQL Queries",
      description: "List of all 321 available GraphQL queries",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "schema://queries", mimeType: "application/json", text: getSchemaQueriesResource() }] };
    }
  );

  server.registerResource(
    "schema://types",
    {
      name: "GraphQL Types",
      description: "Key GraphQL types (Player, Team, League, etc.)",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "schema://types", mimeType: "application/json", text: getSchemaTypesResource() }] };
    }
  );

  server.registerResource(
    "schema://enums",
    {
      name: "GraphQL Enums",
      description: "All enumeration values (positions, statuses, etc.)",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "schema://enums", mimeType: "application/json", text: getSchemaEnumsResource() }] };
    }
  );

  server.registerResource(
    "reference://leagues",
    {
      name: "Leagues Reference",
      description: "Complete list of leagues with slugs",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "reference://leagues", mimeType: "application/json", text: getReferenceLeaguesResource() }] };
    }
  );

  server.registerResource(
    "reference://countries",
    {
      name: "Countries Reference",
      description: "Country codes and names",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "reference://countries", mimeType: "application/json", text: getReferenceCountriesResource() }] };
    }
  );

  server.registerResource(
    "reference://positions",
    {
      name: "Player Positions",
      description: "Valid player positions (C, LW, RW, D, G, etc.)",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "reference://positions", mimeType: "application/json", text: getReferencePositionsResource() }] };
    }
  );

  server.registerResource(
    "reference://seasons",
    {
      name: "Season Format Guide",
      description: "Season format guide (YYYY-YYYY)",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "reference://seasons", mimeType: "application/json", text: getReferenceSeasonsResource() }] };
    }
  );

  server.registerResource(
    "guide://common-queries",
    {
      name: "Common Query Examples",
      description: "Examples of common GraphQL queries organized by use case",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "guide://common-queries", mimeType: "application/json", text: getCommonQueriesGuide() }] };
    }
  );

  server.registerResource(
    "guide://hockey-terminology",
    {
      name: "Hockey Terminology",
      description: "Hockey stats abbreviations and terminology",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "guide://hockey-terminology", mimeType: "application/json", text: getHockeyTerminologyGuide() }] };
    }
  );

  server.registerResource(
    "guide://query-patterns",
    {
      name: "Query Pattern Templates",
      description: "Reusable query templates with placeholders and filter options",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "guide://query-patterns", mimeType: "application/json", text: getQueryPatternsGuide() }] };
    }
  );

  server.registerResource(
    "guide://anti-patterns",
    {
      name: "Common Query Mistakes",
      description: "Queries that DON'T exist and their correct alternatives",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "guide://anti-patterns", mimeType: "application/json", text: getAntiPatternsGuide() }] };
    }
  );

  server.registerResource(
    "guide://advanced-queries",
    {
      name: "Advanced Query Examples",
      description: "Complex queries for head-to-head, rookies, and advanced stats",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "guide://advanced-queries", mimeType: "application/json", text: getAdvancedQueriesGuide() }] };
    }
  );

  server.registerResource(
    "guide://field-reference",
    {
      name: "Field Reference Guide",
      description: "Documentation of field types and requirements",
      mimeType: "application/json",
    },
    async () => {
      return { contents: [{ uri: "guide://field-reference", mimeType: "application/json", text: getFieldReferenceGuide() }] };
    }
  );
}
