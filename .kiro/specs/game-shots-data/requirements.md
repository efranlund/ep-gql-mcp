# Requirements Document

## Introduction

This feature enhances the games tool to include shots data (shots for and shots against) when returning game information. The shots data will be retrieved from GameLogs in the GraphQL API, as this data is available for games in certain leagues that track shot statistics.

## Glossary

- **MCP Server**: The Model Context Protocol server that provides hockey data access
- **Games Tool**: The MCP tool that returns game schedules and results
- **GameLogs**: GraphQL type containing detailed game statistics including player-level data
- **SOG**: Shots on Goal - individual player statistic tracked in GameLogs
- **Shots For**: Total number of shots taken by a team in a game, calculated by summing all player SOG values for that team
- **Shots Against**: Total number of shots taken by the opposing team in a game, calculated by summing all opposing player SOG values

## Requirements

### Requirement 1

**User Story:** As an AI assistant user, I want to see shots data when querying game information, so that I can analyze team performance and shot statistics.

#### Acceptance Criteria

1. WHEN the games tool returns game data THEN the system SHALL include shotsFor and shotsAgainst fields when available from GameLogs
2. WHEN shots data is not available for a game THEN the system SHALL return null or omit the fields without causing errors
3. WHEN formatting game results THEN the system SHALL display shots data in a clear and readable format alongside other game statistics
4. WHEN multiple games are returned THEN the system SHALL include shots data for each game where available

### Requirement 2

**User Story:** As a developer, I want the games tool to query GameLogs data and calculate team shots from player SOG, so that shots statistics are accurately computed from individual player data.

#### Acceptance Criteria

1. WHEN querying game data THEN the system SHALL retrieve GameLogs data including player-level SOG statistics from the GraphQL API
2. WHEN processing GameLogs for a team THEN the system SHALL sum all player SOG values to calculate total shotsFor
3. WHEN processing GameLogs for the opposing team THEN the system SHALL sum all opposing player SOG values to calculate total shotsAgainst
4. WHEN the GraphQL query executes THEN the system SHALL handle cases where GameLogs data is unavailable or incomplete
5. WHEN processing GameLogs data THEN the system SHALL maintain backward compatibility with existing game data structure

### Requirement 3

**User Story:** As an AI assistant user, I want shots data to be available across all game query filters, so that I can analyze shots regardless of how I filter games.

#### Acceptance Criteria

1. WHEN filtering games by player THEN the system SHALL include shots data in the results
2. WHEN filtering games by team THEN the system SHALL include shots data in the results
3. WHEN filtering games by league THEN the system SHALL include shots data in the results
4. WHEN filtering games by date range THEN the system SHALL include shots data in the results
5. WHEN filtering games by season THEN the system SHALL include shots data in the results
