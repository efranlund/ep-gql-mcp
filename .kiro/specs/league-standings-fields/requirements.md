# Requirements Document

## Introduction

The EliteProspects GraphQL API's `leagueStandings` query returns team statistics through the `RegularTeamStats` type. AI assistants are attempting to query fields that don't exist (such as `shotsFor` and `shotsAgainst`), causing GraphQL errors. This feature will implement a proper standings tool that only queries valid fields and clearly documents what statistics are available.

## Glossary

- **MCP Server**: The Model Context Protocol server that provides AI assistants access to EliteProspects data
- **leagueStandings Query**: A GraphQL query that returns an array of TeamStats objects for league standings
- **TeamStats Type**: The GraphQL type that wraps team information and statistics
- **RegularTeamStats Type**: The GraphQL type containing actual team statistics fields (GP, W, L, etc.)
- **Field Selection**: The specific data fields requested in a GraphQL query

## Requirements

### Requirement 1

**User Story:** As an AI assistant user, I want to query league standings with team records, so that I can see team rankings and win/loss records.

#### Acceptance Criteria

1. WHEN querying league standings THEN the system SHALL use only fields that exist on the RegularTeamStats type
2. WHEN the standings query executes THEN the system SHALL return results without GraphQL field errors
3. WHEN standings data is returned THEN the system SHALL include team name, games played, wins, losses, and points

### Requirement 2

**User Story:** As a developer, I want clear documentation of available standings fields, so that I know what statistics can be queried.

#### Acceptance Criteria

1. WHEN reviewing the RegularTeamStats type THEN the system SHALL document all 11 available fields
2. WHEN a field is requested THEN the system SHALL only query fields that exist in the schema
3. WHEN the tool description is read THEN the system SHALL clearly list what statistics are available

### Requirement 3

**User Story:** As an AI assistant user, I want to query team offensive and defensive statistics, so that I can analyze team performance.

#### Acceptance Criteria

1. WHEN querying standings THEN the system SHALL include goals for (GF) and goals against (GA) fields
2. WHEN querying standings THEN the system SHALL include goal differential (GD) field
3. WHEN querying standings THEN the system SHALL include points per game (PPG) field

### Requirement 4

**User Story:** As an AI assistant user, I want to query overtime and tie statistics, so that I can see complete team records.

#### Acceptance Criteria

1. WHEN querying standings THEN the system SHALL include overtime wins (OTW) and overtime losses (OTL) fields
2. WHEN querying standings THEN the system SHALL include ties (T) field for leagues that use ties
3. WHEN the query executes THEN the system SHALL return these statistics without errors

### Requirement 5

**User Story:** As a developer, I want the MCP server to provide a working standings tool, so that AI assistants can query standings without constructing invalid queries.

#### Acceptance Criteria

1. WHEN the MCP server starts THEN the system SHALL register a get_league_standings tool
2. WHEN the tool is called with a valid league slug THEN the system SHALL return standings data with all available fields
3. WHEN the tool description is read THEN the system SHALL clearly explain what fields are returned and note that shot statistics are not available
