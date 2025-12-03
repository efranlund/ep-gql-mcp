# Requirements Document

## Introduction

The EliteProspects MCP server needs comprehensive documentation and query examples to help AI assistants correctly query hockey data. Users are experiencing errors because AI assistants don't have clear guidance on available queries, common patterns, and how to answer typical hockey questions. This feature will provide extensive documentation with real-world query examples organized by use case.

## Glossary

- **MCP Server**: The Model Context Protocol server that provides AI assistants access to EliteProspects data
- **Query Example**: A complete, working GraphQL query demonstrating how to retrieve specific data
- **Use Case**: A category of user questions (e.g., "Scores", "Stats", "Schedules")
- **Query Pattern**: A reusable template for constructing similar queries
- **Anti-Pattern**: A common mistake or non-existent query that should be avoided
- **Tool Description**: The documentation text that AI assistants read when deciding which tool to use

## Requirements

### Requirement 1

**User Story:** As an AI assistant, I want comprehensive query examples for common hockey questions, so that I can correctly answer user questions without trial and error.

#### Acceptance Criteria

1. WHEN the AI assistant accesses documentation THEN the system SHALL provide query examples for all major use cases (scores, schedules, standings, stats, bios, head-to-head)
2. WHEN a query example is provided THEN the system SHALL include the complete GraphQL query with all required fields
3. WHEN a query example is provided THEN the system SHALL include a description of what question it answers
4. WHEN query examples are organized THEN the system SHALL group them by use case category
5. WHEN the AI assistant needs to find scoring leaders THEN the system SHALL provide examples using the correct `playerStats` queries (not `playerStatRecords`)

### Requirement 2

**User Story:** As an AI assistant, I want to know which queries DON'T exist in the schema, so that I don't waste time trying invalid query names.

#### Acceptance Criteria

1. WHEN the AI assistant accesses documentation THEN the system SHALL list common anti-patterns (queries that don't exist)
2. WHEN an anti-pattern is documented THEN the system SHALL provide the correct alternative query to use
3. WHEN the `playerStatRecords` query is attempted THEN the system SHALL indicate it doesn't exist and suggest `playerStats`, `playerStatsLeagues`, or `playerStatsSeasons`
4. WHEN the `rookies` query is attempted THEN the system SHALL indicate it doesn't exist and suggest filtering player stats by age and games played

### Requirement 3

**User Story:** As an AI assistant, I want query pattern templates, so that I can construct similar queries for different teams, players, or leagues.

#### Acceptance Criteria

1. WHEN the AI assistant accesses documentation THEN the system SHALL provide query patterns with variable placeholders
2. WHEN a query pattern is provided THEN the system SHALL explain which parts can be customized
3. WHEN a query pattern uses filters THEN the system SHALL document all available filter options
4. WHEN a query pattern requires specific field names THEN the system SHALL document the correct casing (e.g., uppercase stat fields)

### Requirement 4

**User Story:** As an AI assistant, I want examples for head-to-head matchup queries, so that I can answer questions about team records against each other.

#### Acceptance Criteria

1. WHEN the AI assistant needs head-to-head data THEN the system SHALL provide query examples for team matchup records
2. WHEN querying head-to-head records THEN the system SHALL show how to filter games by two specific teams
3. WHEN querying head-to-head records THEN the system SHALL show how to limit results to recent games (e.g., last 10 games)
4. WHEN the query example is provided THEN the system SHALL demonstrate how to extract win/loss records from game results

### Requirement 5

**User Story:** As an AI assistant, I want examples for advanced stat queries, so that I can answer questions about team statistics like shots, faceoffs, and special teams.

#### Acceptance Criteria

1. WHEN the AI assistant needs team statistics THEN the system SHALL provide examples for querying team-level stats
2. WHEN querying advanced stats THEN the system SHALL show examples for shots on goal, blocked shots, hits, and faceoff percentages
3. WHEN querying special teams stats THEN the system SHALL show examples for power play and penalty kill percentages
4. WHEN the stat fields are documented THEN the system SHALL use the correct field names from the schema

### Requirement 6

**User Story:** As an AI assistant, I want examples for rookie and age-based queries, so that I can answer questions about youngest/oldest players and rookie leaders.

#### Acceptance Criteria

1. WHEN the AI assistant needs rookie data THEN the system SHALL provide examples for filtering players by rookie status or games played
2. WHEN querying by age THEN the system SHALL show examples for filtering players by age ranges
3. WHEN querying active players THEN the system SHALL show examples for filtering by player status
4. WHEN rookie leaders are needed THEN the system SHALL show how to combine age/games filters with stat sorting

### Requirement 7

**User Story:** As an AI assistant, I want improved tool descriptions with inline examples, so that I can quickly understand what each tool does without reading separate documentation.

#### Acceptance Criteria

1. WHEN the AI assistant views a tool description THEN the system SHALL include at least one inline query example
2. WHEN the `execute_graphql` tool is described THEN the system SHALL include examples for the most common query types
3. WHEN convenience tools are described THEN the system SHALL clarify when to use them versus `execute_graphql`
4. WHEN a tool description includes examples THEN the system SHALL use queries that actually exist in the schema

### Requirement 8

**User Story:** As an AI assistant, I want documentation about available fields and their data types, so that I can construct valid queries without errors.

#### Acceptance Criteria

1. WHEN the AI assistant needs field information THEN the system SHALL document commonly used fields for each major type (Player, Team, Game, etc.)
2. WHEN object-type fields are documented THEN the system SHALL indicate they require subfield selection
3. WHEN stat fields are documented THEN the system SHALL indicate the correct casing (uppercase abbreviations)
4. WHEN connection types are documented THEN the system SHALL show the edges/node pattern for accessing results

### Requirement 9

**User Story:** As a developer, I want the documentation to be maintainable and generated from the actual schema, so that it stays accurate as the API evolves.

#### Acceptance Criteria

1. WHEN query examples are added THEN the system SHALL validate them against the actual schema
2. WHEN the schema changes THEN the system SHALL make it easy to identify which examples need updating
3. WHEN examples are organized THEN the system SHALL use a clear file structure that's easy to navigate
4. WHEN anti-patterns are documented THEN the system SHALL include comments explaining why they're wrong

