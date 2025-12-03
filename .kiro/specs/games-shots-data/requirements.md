# Requirements Document

## Introduction

This feature enhances the `get_games` MCP tool to include shots on goal statistics for both home and visiting teams. Currently, the tool returns basic game information including scores, teams, dates, and status, but does not include shots data. This enhancement will provide users with more comprehensive game statistics by including shots on goal (SOG) data when available through the EliteProspects GraphQL API's livescore data.

## Glossary

- **MCP Tool**: Model Context Protocol tool that provides structured access to data for AI assistants
- **Games Tool**: The `get_games` MCP tool that retrieves game schedules and results
- **Shots on Goal (SOG)**: The number of shots that would have scored if not for the goaltender or if they did score
- **Livescore Data**: Real-time or post-game statistical data available through the EliteProspects GraphQL API
- **Home Team**: The team playing at their home venue
- **Visiting Team**: The team playing at an away venue
- **GraphQL Query**: A query to the EliteProspects GraphQL API to retrieve data

## Requirements

### Requirement 1

**User Story:** As an AI assistant user, I want to see shots on goal data for games, so that I can analyze team performance beyond just the final score.

#### Acceptance Criteria

1. WHEN a game has livescore data available THEN the system SHALL include shots on goal for the home team in the response
2. WHEN a game has livescore data available THEN the system SHALL include shots on goal for the visiting team in the response
3. WHEN a game does not have livescore data available THEN the system SHALL return null or omit the shots fields without causing errors
4. WHEN the GraphQL query is executed THEN the system SHALL request the livescore stats fields including shotsOnGoal for both teams
5. WHEN formatting game results THEN the system SHALL include shots data in a clear and consistent format alongside existing game information

### Requirement 2

**User Story:** As a developer maintaining the MCP server, I want the shots data integration to follow existing patterns, so that the codebase remains consistent and maintainable.

#### Acceptance Criteria

1. WHEN modifying the GraphQL query THEN the system SHALL follow the existing query structure and formatting conventions used in games.ts
2. WHEN adding new fields to the response THEN the system SHALL maintain backward compatibility with existing tool consumers
3. WHEN handling missing data THEN the system SHALL use the same null-handling patterns as other optional fields in the games tool
4. WHEN documenting the changes THEN the system SHALL update the tool description to reflect the new shots data availability

### Requirement 3

**User Story:** As an AI assistant, I want shots data to be clearly labeled and easy to interpret, so that I can accurately communicate game statistics to users.

#### Acceptance Criteria

1. WHEN shots data is present THEN the system SHALL label it clearly as "shotsOnGoal" or similar descriptive field name
2. WHEN shots data is null THEN the system SHALL handle it gracefully without displaying confusing or misleading information
3. WHEN returning game data THEN the system SHALL maintain consistent field naming conventions with other statistics in the response
