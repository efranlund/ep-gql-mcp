# Requirements Document

## Introduction

The EliteProspects MCP server's `execute_graphql` tool currently returns raw GraphQL API errors that can be cryptic and unhelpful for AI assistants. Additionally, the tool's description and documentation don't provide sufficient guidance on how to discover valid queries. This feature will improve error message formatting and enhance tool documentation to help AI assistants learn and use the GraphQL API effectively.

## Glossary

- **MCP Server**: The Model Context Protocol server that provides AI assistants access to EliteProspects data
- **execute_graphql Tool**: The MCP tool that allows raw GraphQL query execution against the EliteProspects API
- **GraphQL Error**: An error response returned by the GraphQL API when a query is invalid or fails
- **Tool Description**: The human-readable text that explains what an MCP tool does and how to use it
- **Schema Introspection**: The process of discovering available queries, types, and fields using the introspect_schema tool

## Requirements

### Requirement 1

**User Story:** As an AI assistant, I want to receive well-formatted error messages from GraphQL failures, so that I can understand what went wrong and adjust my queries.

#### Acceptance Criteria

1. WHEN the GraphQL API returns an error response THEN the system SHALL extract and format the error message clearly
2. WHEN multiple GraphQL errors are returned THEN the system SHALL combine them into a readable multi-line message
3. WHEN an error message is formatted THEN the system SHALL preserve the original error details for debugging
4. WHEN a network or connection error occurs THEN the system SHALL distinguish it from GraphQL query errors

### Requirement 2

**User Story:** As an AI assistant, I want the execute_graphql tool description to guide me toward schema discovery, so that I can learn what queries are available.

#### Acceptance Criteria

1. WHEN the tool description is displayed THEN the system SHALL include a reference to the introspect_schema tool
2. WHEN the tool description is displayed THEN the system SHALL mention that the schema contains 321 available queries
3. WHEN the tool description is displayed THEN the system SHALL suggest using convenience tools for common queries
4. WHEN the tool description is displayed THEN the system SHALL include an example of a valid query

### Requirement 3

**User Story:** As an AI assistant, I want error messages to suggest using schema introspection, so that I can discover valid queries when my attempts fail.

#### Acceptance Criteria

1. WHEN a "Cannot query field" error occurs THEN the system SHALL append a suggestion to use the introspect_schema tool
2. WHEN the suggestion is added THEN the system SHALL mention that introspect_schema can show available queries
3. WHEN the suggestion is added THEN the system SHALL keep the original GraphQL error message intact
4. WHEN other types of errors occur THEN the system SHALL return them without modification

### Requirement 4

**User Story:** As an AI assistant, I want the tool description to highlight convenience tools, so that I know when to use them instead of raw GraphQL.

#### Acceptance Criteria

1. WHEN the tool description is displayed THEN the system SHALL list the main convenience tools available
2. WHEN listing convenience tools THEN the system SHALL include at least: get_player, get_team, get_league_standings, get_league_leaders, get_games
3. WHEN describing convenience tools THEN the system SHALL explain they are easier to use for common queries
4. WHEN the description is formatted THEN the system SHALL keep it concise and scannable

### Requirement 5

**User Story:** As a developer, I want error handling to be robust and consistent, so that the MCP server remains stable regardless of API responses.

#### Acceptance Criteria

1. WHEN handling GraphQL responses THEN the system SHALL check for both error and data fields
2. WHEN an unexpected response format is received THEN the system SHALL handle it gracefully without crashing
3. WHEN formatting errors THEN the system SHALL use try-catch blocks to prevent formatting failures
4. WHEN an error occurs during error formatting THEN the system SHALL return a fallback error message

### Requirement 6

**User Story:** As an AI assistant, I want examples in the tool description, so that I can understand the query syntax and structure.

#### Acceptance Criteria

1. WHEN the tool description is displayed THEN the system SHALL include at least one complete example query
2. WHEN the example is shown THEN the system SHALL use a real, working query from the schema
3. WHEN the example is shown THEN the system SHALL demonstrate proper GraphQL syntax
4. WHEN the example is shown THEN the system SHALL be simple enough to understand quickly

### Requirement 7

**User Story:** As an AI assistant, I want helpful guidance when querying non-existent fields like "rookies", so that I can learn the correct approach for finding rookie player data.

#### Acceptance Criteria

1. WHEN a "Cannot query field" error message contains the word "rookies" THEN the system SHALL append a specific suggestion for finding rookie players
2. WHEN the rookies suggestion is added THEN the system SHALL include the NHL rookie definition: players under 26 who haven't played more than 25 games in any preceding season
3. WHEN the rookies suggestion is added THEN the system SHALL recommend using leagueSkaterStats or leagueGoalieStats queries with age and games played filters
4. WHEN the rookies suggestion is added THEN the system SHALL mention that the get_league_leaders tool can help identify top-performing rookies
5. WHEN the suggestion is formatted THEN the system SHALL keep it concise and actionable
