# Design Document: Game Shots Data

## Overview

This feature enhances the existing `get_games` tool to include shots data (shots for and shots against) for each game. The shots data will be calculated by summing individual player SOG (Shots on Goal) statistics from GameLogs data in the GraphQL API. This provides users with comprehensive game statistics including offensive performance metrics.

The implementation will extend the existing games query to fetch GameLogs data and compute team-level shot totals from player-level statistics. The solution maintains backward compatibility with the current games tool interface while adding optional shots fields to the response.

## Architecture

### High-Level Flow

1. User requests game data via `get_games` tool with existing filters
2. System executes existing games query to retrieve game information
3. For each game returned, system queries GameLogs to retrieve player-level statistics
4. System calculates shots totals by summing SOG values for each team
5. System merges shots data with game data and returns enhanced response

### Component Interaction

```
get_games handler
    ↓
Execute games query (existing)
    ↓
For each game:
    ↓
Query GameLogs for player stats
    ↓
Calculate shotsFor (sum home team player SOG)
Calculate shotsAgainst (sum visiting team player SOG)
    ↓
Merge shots data with game data
    ↓
Return enhanced game response
```

## Components and Interfaces

### Modified Components

#### 1. GET_GAMES_QUERY (GraphQL Query)

The existing query will be extended to include GameLogs data with player statistics.

**Current Query Structure:**
```graphql
query GetGames($league: String, $season: String, $team: ID, ...) {
  games(...) {
    edges {
      id
      dateTime
      homeTeam { id name slug }
      visitingTeam { id name slug }
      homeTeamScore
      visitingTeamScore
      status
      league { name slug }
      season { slug }
    }
  }
}
```

**Enhanced Query Structure:**
```graphql
query GetGames($league: String, $season: String, $team: ID, ...) {
  games(...) {
    edges {
      id
      dateTime
      homeTeam { id name slug }
      visitingTeam { id name slug }
      homeTeamScore
      visitingTeamScore
      status
      league { name slug }
      season { slug }
      gameLogs {
        edges {
          player {
            id
          }
          team {
            id
          }
          SOG
        }
      }
    }
  }
}
```

#### 2. handleGetGames Function

The handler will be extended to process GameLogs data and calculate shots totals.

**New Helper Function:**
```typescript
function calculateShotsFromGameLogs(
  gameLogs: Array<{ player: { id: string }, team: { id: string }, SOG: number | null }>,
  homeTeamId: string,
  visitingTeamId: string
): { shotsFor: number | null, shotsAgainst: number | null }
```

This function will:
- Filter gameLogs by team ID
- Sum SOG values for home team (shotsFor from home team perspective)
- Sum SOG values for visiting team (shotsAgainst from home team perspective)
- Return null if no data available

#### 3. Game Response Interface

**Enhanced Response Type:**
```typescript
interface GameWithShots {
  id: string;
  dateTime: string;
  homeTeam: { id: string; name: string; slug: string };
  visitingTeam: { id: string; name: string; slug: string };
  homeTeamScore: number | null;
  visitingTeamScore: number | null;
  status: string;
  league: { name: string; slug: string };
  season: { slug: string };
  // New fields
  homeTeamShots: number | null;
  visitingTeamShots: number | null;
}
```

## Data Models

### GameLog Type (from GraphQL API)

```typescript
interface GameLog {
  player: {
    id: string;
  };
  team: {
    id: string;
  };
  SOG: number | null;  // Shots on Goal
}
```

### Enhanced Game Type

```typescript
interface Game {
  // Existing fields
  id: string;
  dateTime: string;
  homeTeam: { id: string; name: string; slug: string };
  visitingTeam: { id: string; name: string; slug: string };
  homeTeamScore: number | null;
  visitingTeamScore: number | null;
  status: string;
  league: { name: string; slug: string };
  season: { slug: string };
  
  // New fields
  homeTeamShots: number | null;
  visitingTeamShots: number | null;
  
  // Raw data (not exposed in final response)
  gameLogs?: {
    edges: GameLog[];
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptance Criteria Testing Prework

1.1 WHEN the games tool returns game data THEN the system SHALL include shotsFor and shotsAgainst fields when available from GameLogs
Thoughts: This is about ensuring that when GameLogs data exists with SOG values, the calculated shots fields are present in the response. We can test this by generating random game data with GameLogs, processing it, and verifying the shots fields are included.
Testable: yes - property

1.2 WHEN shots data is not available for a game THEN the system SHALL return null or omit the fields without causing errors
Thoughts: This is an edge case about handling missing data gracefully. We should ensure the system doesn't crash when GameLogs are empty or SOG values are null.
Testable: edge case

1.3 WHEN formatting game results THEN the system SHALL display shots data in a clear and readable format alongside other game statistics
Thoughts: This is about the output format being human-readable. We can verify the JSON structure includes the shots fields in the expected format.
Testable: yes - property

1.4 WHEN multiple games are returned THEN the system SHALL include shots data for each game where available
Thoughts: This is testing that the calculation works across multiple games. We can generate multiple games with varying GameLogs data and verify each game has correctly calculated shots.
Testable: yes - property

2.1 WHEN querying game data THEN the system SHALL retrieve GameLogs data from the GraphQL API
Thoughts: This is about ensuring the GraphQL query includes the GameLogs field. We can verify the query string contains the necessary fields.
Testable: yes - example

2.2 WHEN accessing GameLogs THEN the system SHALL extract shotsFor and shotsAgainst fields from the response
Thoughts: This is actually about calculating shots from SOG values, not extracting pre-computed fields. We can test that the calculation function correctly sums SOG values.
Testable: yes - property

2.3 WHEN processing GameLogs for a team THEN the system SHALL sum all player SOG values to calculate total shotsFor
Thoughts: This is the core calculation logic. We can generate random player SOG values for a team and verify the sum is correct.
Testable: yes - property

2.4 WHEN processing GameLogs for the opposing team THEN the system SHALL sum all opposing player SOG values to calculate total shotsAgainst
Thoughts: Same as 2.3 but for the opposing team. This can be combined with 2.3 into a single property about correct calculation for both teams.
Testable: yes - property

2.5 WHEN the GraphQL query executes THEN the system SHALL handle cases where GameLogs data is unavailable or incomplete
Thoughts: This is about error handling and graceful degradation. Edge case for missing data.
Testable: edge case

2.6 WHEN processing GameLogs data THEN the system SHALL maintain backward compatibility with existing game data structure
Thoughts: This is about ensuring existing fields remain unchanged. We can verify the response still contains all original fields.
Testable: yes - property

3.1-3.5 WHEN filtering games by [player/team/league/date/season] THEN the system SHALL include shots data in the results
Thoughts: These are all variations of the same property - that shots data is included regardless of filter type. Can be combined into one property.
Testable: yes - property

### Property Reflection

After reviewing all properties, I've identified the following redundancies:

- Properties 2.3 and 2.4 can be combined into a single property about correct shot calculation for both teams
- Properties 3.1-3.5 are redundant with property 1.4 - if shots are included for multiple games, they're included regardless of filter
- Property 1.1 and 1.4 overlap significantly - both test that shots are included when available

Consolidated properties:

Property 1: Shots calculation correctness (combines 2.3, 2.4)
*For any* game with GameLogs data, the homeTeamShots should equal the sum of all SOG values for players on the home team, and visitingTeamShots should equal the sum of all SOG values for players on the visiting team
**Validates: Requirements 2.2, 2.3, 2.4**

Property 2: Shots data inclusion (combines 1.1, 1.4, 3.1-3.5)
*For any* game query result with GameLogs data available, each game should include homeTeamShots and visitingTeamShots fields with calculated values
**Validates: Requirements 1.1, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5**

Property 3: Response structure compatibility
*For any* game query result, the response should contain all original game fields (id, dateTime, teams, scores, status, league, season) in addition to any new shots fields
**Validates: Requirements 2.6**

Property 4: Output format consistency
*For any* game with shots data, the JSON response should include homeTeamShots and visitingTeamShots as numeric or null values at the same level as other game statistics
**Validates: Requirements 1.3**

## Error Handling

### Missing GameLogs Data

- If GameLogs data is not available for a game, set `homeTeamShots` and `visitingTeamShots` to `null`
- Continue processing other games normally
- Do not throw errors or fail the entire request

### Null or Invalid SOG Values

- If a player's SOG value is `null` or `undefined`, treat it as 0 in the sum
- If all players have null SOG values, return `null` for shots totals
- Log warnings for debugging but don't expose to end users

### GraphQL Query Errors

- If the enhanced query fails due to GameLogs field not being available, fall back to original query without GameLogs
- Return games data without shots fields rather than failing completely
- Log the error for monitoring

### Team ID Mismatches

- If GameLogs contain team IDs that don't match homeTeam or visitingTeam IDs, exclude those entries from calculation
- This handles edge cases where data might be inconsistent

## Testing Strategy

### Unit Testing

Unit tests will cover:

1. **calculateShotsFromGameLogs function**
   - Test with valid GameLogs data for both teams
   - Test with empty GameLogs array
   - Test with null SOG values
   - Test with mismatched team IDs
   - Test with only one team having data

2. **Response formatting**
   - Verify shots fields are included in JSON output
   - Verify null values are handled correctly
   - Verify backward compatibility with existing fields

3. **Edge cases**
   - Games with no GameLogs data
   - Games with partial GameLogs data (only one team)
   - Games with all null SOG values

### Property-Based Testing

Property-based tests will use **fast-check** (TypeScript property testing library) with a minimum of 100 iterations per test.

Each property-based test MUST be tagged with a comment explicitly referencing the correctness property using this format: `**Feature: game-shots-data, Property {number}: {property_text}**`

1. **Property 1: Shots calculation correctness**
   - Generate random GameLogs with varying SOG values
   - Verify homeTeamShots equals sum of home team player SOG
   - Verify visitingTeamShots equals sum of visiting team player SOG
   - Tag: `**Feature: game-shots-data, Property 1: Shots calculation correctness**`

2. **Property 2: Shots data inclusion**
   - Generate random game results with GameLogs
   - Verify all games include homeTeamShots and visitingTeamShots fields
   - Tag: `**Feature: game-shots-data, Property 2: Shots data inclusion**`

3. **Property 3: Response structure compatibility**
   - Generate random game data
   - Verify all original fields are present after enhancement
   - Tag: `**Feature: game-shots-data, Property 3: Response structure compatibility**`

4. **Property 4: Output format consistency**
   - Generate random games with shots data
   - Verify shots fields are numeric or null at correct level in JSON
   - Tag: `**Feature: game-shots-data, Property 4: Output format consistency**`

### Integration Testing

Integration tests will verify:

1. End-to-end flow with real GraphQL API (using test environment)
2. Shots data appears correctly for games that have GameLogs
3. Games without GameLogs still return successfully with null shots values
4. All existing filter combinations (player, team, league, date, season) work with shots data

## Implementation Notes

### Performance Considerations

- GameLogs can contain many player entries per game (20-40 players)
- Calculation is O(n) where n is number of player entries
- For multiple games, this is O(m*n) where m is number of games
- Consider caching if performance becomes an issue

### Data Availability

- Not all leagues track SOG statistics
- Older games may not have GameLogs data
- The system must gracefully handle missing data

### Future Enhancements

- Add other GameLog statistics (hits, blocked shots, etc.)
- Add filtering by shot count ranges
- Add shot differential calculations
- Cache calculated shots data to improve performance
