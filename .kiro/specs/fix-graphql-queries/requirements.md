# Requirements Document

## Introduction

The EliteProspects MCP server contains several GraphQL queries that are incompatible with the actual API schema. Users are experiencing errors when trying to query player statistics, search for teams, and introspect types. This feature will fix all GraphQL query errors by aligning queries with the actual API schema.

## Glossary

- **MCP Server**: The Model Context Protocol server that provides AI assistants access to EliteProspects data
- **GraphQL Query**: A request to the EliteProspects GraphQL API
- **Schema Introspection**: The process of discovering available types and fields in a GraphQL API
- **Field Selection**: The specific data fields requested in a GraphQL query

## Requirements

### Requirement 1

**User Story:** As an AI assistant user, I want to search for teams by name, so that I can find team IDs for further queries.

#### Acceptance Criteria

1. WHEN a user searches for teams THEN the system SHALL query the `country` field with proper subfield selection
2. WHEN the team search query executes THEN the system SHALL return team results without GraphQL errors
3. WHEN the `country` field is requested THEN the system SHALL include at least the `name` subfield

### Requirement 2

**User Story:** As an AI assistant user, I want to search for leagues by name, so that I can find league information for queries.

#### Acceptance Criteria

1. WHEN a user searches for leagues THEN the system SHALL query the `country` field with proper subfield selection
2. WHEN the league search query executes THEN the system SHALL return league results without GraphQL errors
3. WHEN the `country` field is requested THEN the system SHALL include at least the `name` subfield

### Requirement 3

**User Story:** As a developer, I want the schema introspection to work correctly, so that AI assistants can discover available types and fields.

#### Acceptance Criteria

1. WHEN introspecting types THEN the system SHALL use the correct type names from the generated schema
2. WHEN the `Player` type is requested THEN the system SHALL return the correct type information or indicate it's not available
3. WHEN listing available types THEN the system SHALL show types that actually exist in the schema

### Requirement 4

**User Story:** As an AI assistant user, I want to query league scoring leaders, so that I can see top performers in any league.

#### Acceptance Criteria

1. WHEN querying skater stats THEN the system SHALL use uppercase field names for all stat fields
2. WHEN querying goalie stats THEN the system SHALL use uppercase field names for all stat fields
3. WHEN the league leaders query executes THEN the system SHALL return results without GraphQL field name errors

### Requirement 5

**User Story:** As an AI assistant user, I want to query league standings, so that I can see team rankings and records.

#### Acceptance Criteria

1. WHEN querying league standings THEN the system SHALL use a query structure that exists in the API schema
2. WHEN the standings query executes THEN the system SHALL return results without GraphQL field errors
3. WHEN standings are unavailable THEN the system SHALL handle the error gracefully

### Requirement 6

**User Story:** As a developer, I want to verify all GraphQL queries against the actual schema, so that no invalid field queries exist in the codebase.

#### Acceptance Criteria

1. WHEN reviewing player queries THEN the system SHALL only use fields that exist on the Player type
2. WHEN reviewing team queries THEN the system SHALL only use fields that exist on the Team type
3. WHEN reviewing any query THEN the system SHALL ensure all object-type fields have proper subfield selections
4. WHEN reviewing stat queries THEN the system SHALL use correct field name casing as defined in the schema

### Requirement 7

**User Story:** As an AI assistant user, I want to query recent games for a player or team, so that I can see the most current game results.

#### Acceptance Criteria

1. WHEN querying games without explicit date filters THEN the system SHALL sort results by date in descending order (most recent first)
2. WHEN a user requests "latest games" or "recent games" THEN the system SHALL return games sorted with the most recent games first
3. WHEN the games query executes THEN the system SHALL use the `sort` parameter to control result ordering
