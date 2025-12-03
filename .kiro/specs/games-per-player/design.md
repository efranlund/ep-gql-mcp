# Design Document

## Overview

This feature enhances the EliteProspects MCP server's game querying capabilities by adding support for filtering games by player ID(s) and multiple team IDs. Since the EliteProspects GraphQL API's `games` query does not natively support player filtering, we will implement a two-step approach: first query player stats to determine which teams the player played for during the specified period, then query games for those teams. For multiple team IDs, we'll extend the existing games query to accept arrays.

## Architecture

### Current State

The existing `games.ts` tool provides:
- Single team ID filtering via `teamId` parameter
- League, season, and date range filtering
- Sorting by most recent games first (default)
- Result limiting (default 50 games)

### Proposed Changes

1. **Player-based filtering**: Add `playerId` and `playerIds` parameters that internally:
   - Query `playerStats` to get teams the player(s) played for
   - Filter games by those teams
   - Optionally cross-reference with player stats to ensure accuracy

2. **Multiple team filtering**: Extend `teamId` parameter to accept arrays (`teamIds`)

3. **Combined filtering**: Support combinations of player IDs, team IDs, league, season, and date filters

## Components and Interfaces

### Modified Tool Interface

```typescript
export const getGamesTool: Tool = {
  name: "get_games",
  description: `Get game schedules and results with enhanced filtering.
  
Filter by:
- playerId/playerIds: Single player ID or array of player IDs
- teamId/teamIds: Single team ID or array of team IDs  
- league: League slug (e.g., "nhl", "ahl")
- season: Season string (e.g., "2023-2024")
- dateFrom/dateTo: Date range (YYYY-MM-DD format)

Returns: game details including teams, scores, status, and date/time, sorted with most recent games first.`,
  inputSchema: {
    type: "object",
    properties: {
      playerId: {
        type: "string",
        description: "Single player ID to filter games",
      },
      playerIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of player IDs to filter games (returns games with any of these players)",
      },
      teamId: {
        type: "string",
        description: "Single team ID to filter games",
      },
      teamIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of team IDs to filter games (returns games with any of these teams)",
      },
      league: {
        type: "string",
        description: "League slug (e.g., 'nhl', 'ahl')",
      },
      season: {
        type: "string",
        description: "Season (e.g., '2023-2024')",
      },
      dateFrom: {
        type: "string",
        description: "Start date (YYYY-MM-DD format)",
      },
      dateTo: {
        type: "string",
        description: "End date (YYYY-MM-DD format)",
      },
      limit: {
        type: "number",
        description: "Maximum number of games to return (default: 50)",
        default: 50,
      },
    },
  },
};
```

### Handler Function Signature

```typescript
export async function handleGetGames(args: {
  playerId?: string;
  playerIds?: string[];
  teamId?: string;
  teamIds?: string[];
  league?: string;
  season?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}): Promise<string>
```

### Helper Functions

```typescript
/**
 * Get teams that a player played for during a specific period
 */
async function getPlayerTeams(
  playerId: string,
  filters: {
    league?: string;
    season?: string;
    dateFrom?: string;
    dateTo?: string;
  }
): Promise<string[]>

/**
 * Merge team IDs from multiple sources (direct teamIds, player-derived teams)
 */
function mergeTeamIds(
  directTeamIds: string[],
  playerDerivedTeamIds: string[]
): string[]

/**
 * Execute games query with multiple team IDs by making parallel requests
 */
async function queryGamesForMultipleTeams(
  teamIds: string[],
  filters: {
    league?: string;
    season?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
  }
): Promise<Game[]>
```

## Data Models

### Input Parameters

```typescript
interface GetGamesInput {
  playerId?: string;           // Single player ID
  playerIds?: string[];        // Multiple player IDs
  teamId?: string;             // Single team ID (backward compatible)
  teamIds?: string[];          // Multiple team IDs
  league?: string;             // League slug
  season?: string;             // Season string
  dateFrom?: string;           // ISO date string
  dateTo?: string;             // ISO date string
  limit?: number;              // Max results (default 50)
}
```

### Game Response

```typescript
interface Game {
  id: string;
  dateTime: string;
  homeTeam: {
    id: string;
    name: string;
    slug: string;
  };
  visitingTeam: {
    id: string;
    name: string;
    slug: string;
  };
  homeTeamScore: number | null;
  visitingTeamScore: number | null;
  status: string;
  league: {
    name: string;
    slug: string;
  };
  season: {
    slug: string;
  };
}
```

### Player Stats Response (for team extraction)

```typescript
interface PlayerStat {
  team: {
    id: string;
    name: string;
  };
  season: {
    slug: string;
  };
  league: {
    slug: string;
  };
}
```

## Corr
ectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Player filtering returns relevant games
*For any* valid player ID and optional filters (season, league, date range), all returned games should be games where that player participated, and all games should satisfy the additional filters if provided.
**Validates: Requirements 1.1, 2.1, 2.2, 2.3**

### Property 2: Response structure completeness
*For any* games query that returns results, each game object should include all required fields: id, dateTime, homeTeam (with id, name, slug), visitingTeam (with id, name, slug), scores, status, league, and season.
**Validates: Requirements 1.3**

### Property 3: Multiple filters use AND logic
*For any* combination of filters (player, team, league, season, date range), the returned games should satisfy ALL specified filters simultaneously (logical AND operation).
**Validates: Requirements 2.4, 5.4, 6.4**

### Property 4: Default sorting by most recent
*For any* games query without an explicit sort parameter, the returned games should be ordered by dateTime in descending order (most recent first).
**Validates: Requirements 3.1**

### Property 5: Limit parameter respected
*For any* games query with a limit parameter, the number of returned games should not exceed the specified limit. When no limit is specified, the default of 50 should apply.
**Validates: Requirements 4.1, 4.2**

### Property 6: Limit applied after sorting
*For any* games query with both sorting and limiting, the limit should be applied after sorting, ensuring the most relevant games (according to sort order) are returned.
**Validates: Requirements 4.3**

### Property 7: Multiple player IDs use OR logic
*For any* array of player IDs, the returned games should include all games where at least one of the specified players participated (logical OR operation for players, combined with AND for other filters).
**Validates: Requirements 5.1, 5.3, 5.4**

### Property 8: Multiple team IDs use OR logic
*For any* array of team IDs, the returned games should include all games where at least one of the specified teams participated (logical OR operation for teams, combined with AND for other filters).
**Validates: Requirements 6.1, 6.3, 6.4**

### Property 9: Schema compliance
*For any* generated GraphQL query, it should only use fields that exist in the API schema, include proper subfield selections for all object-type fields, and pass schema validation without errors.
**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

### Input Validation

1. **Invalid Player ID**: If a player ID doesn't exist or is malformed, return a clear error message
2. **Invalid Team ID**: If a team ID doesn't exist or is malformed, return a clear error message
3. **Invalid Date Format**: If dateFrom/dateTo are not in YYYY-MM-DD format, return a validation error
4. **Invalid Limit**: If limit is negative or not a number, use the default value of 50
5. **Conflicting Parameters**: If both `playerId` and `playerIds` are provided, prioritize `playerIds` and include `playerId` in the array

### API Errors

1. **GraphQL Errors**: Catch and format GraphQL errors with helpful context about which query failed
2. **Network Errors**: Retry once on network failures, then return a clear error message
3. **Empty Results**: When no games are found, return an empty array with metadata explaining the filters used
4. **Player Stats Query Failure**: If we can't fetch player teams, fall back to returning an error explaining the limitation

### Error Response Format

```typescript
interface ErrorResponse {
  error: string;
  details?: string;
  filters?: Record<string, unknown>;
}
```

## Testing Strategy

### Unit Tests

1. **Input parameter normalization**:
   - Test that `playerId` is correctly converted to `playerIds` array
   - Test that `teamId` is correctly converted to `teamIds` array
   - Test date format validation
   - Test limit parameter defaults and validation

2. **Helper function tests**:
   - Test `getPlayerTeams()` with various filter combinations
   - Test `mergeTeamIds()` with overlapping and non-overlapping arrays
   - Test `queryGamesForMultipleTeams()` with single and multiple teams

3. **Error handling**:
   - Test invalid player ID handling
   - Test invalid team ID handling
   - Test malformed date handling
   - Test API error handling

### Property-Based Tests

We will use **fast-check** (JavaScript/TypeScript property-based testing library) for property-based testing. Each test will run a minimum of 100 iterations.

1. **Property 1: Player filtering returns relevant games**
   - Generate: random player IDs, optional season/league/date filters
   - Test: all returned games match the player and filters
   - Tag: `**Feature: games-per-player, Property 1: Player filtering returns relevant games**`

2. **Property 2: Response structure completeness**
   - Generate: random valid query parameters
   - Test: all returned games have required fields with correct types
   - Tag: `**Feature: games-per-player, Property 2: Response structure completeness**`

3. **Property 3: Multiple filters use AND logic**
   - Generate: random combinations of 2-4 filters
   - Test: all results satisfy all filters
   - Tag: `**Feature: games-per-player, Property 3: Multiple filters use AND logic**`

4. **Property 4: Default sorting by most recent**
   - Generate: random query parameters without sort
   - Test: results are in descending dateTime order
   - Tag: `**Feature: games-per-player, Property 4: Default sorting by most recent**`

5. **Property 5: Limit parameter respected**
   - Generate: random limit values (1-100) and queries
   - Test: result count ≤ limit
   - Tag: `**Feature: games-per-player, Property 5: Limit parameter respected**`

6. **Property 6: Limit applied after sorting**
   - Generate: random queries with sort and limit
   - Test: results are top N according to sort order
   - Tag: `**Feature: games-per-player, Property 6: Limit applied after sorting**`

7. **Property 7: Multiple player IDs use OR logic**
   - Generate: arrays of 2-5 player IDs with optional filters
   - Test: each game has at least one of the players
   - Tag: `**Feature: games-per-player, Property 7: Multiple player IDs use OR logic**`

8. **Property 8: Multiple team IDs use OR logic**
   - Generate: arrays of 2-5 team IDs with optional filters
   - Test: each game has at least one of the teams
   - Tag: `**Feature: games-per-player, Property 8: Multiple team IDs use OR logic**`

9. **Property 9: Schema compliance**
   - Generate: random valid query parameters
   - Test: generated GraphQL queries pass schema validation
   - Tag: `**Feature: games-per-player, Property 9: Schema compliance**`

### Integration Tests

1. **End-to-end player games query**: Query games for a known player and verify results
2. **End-to-end multiple players query**: Query games for multiple known players
3. **End-to-end multiple teams query**: Query games for multiple known teams
4. **Combined filters**: Test player + season + league combination
5. **Backward compatibility**: Ensure existing single-team queries still work

### Test Configuration

```typescript
// fast-check configuration
const fcConfig = {
  numRuns: 100,  // Minimum 100 iterations per property test
  verbose: true,
  seed: Date.now(),  // Reproducible with seed
};
```

## Implementation Notes

### API Limitations

The EliteProspects GraphQL API's `games` query does not support direct player filtering. Our implementation works around this by:

1. Querying `playerStats` to find teams the player played for
2. Using those team IDs to query games
3. This may include games where the player didn't actually play (e.g., if they were on the roster but didn't dress)

### Performance Considerations

1. **Multiple API calls**: Player-based queries require 2 API calls (playerStats + games)
2. **Multiple teams**: Querying games for multiple teams may require multiple API calls if the API doesn't support OR logic for teams
3. **Caching opportunity**: Player-to-team mappings could be cached for a session to reduce API calls

### Backward Compatibility

The existing `teamId` parameter will continue to work. The new `teamIds` parameter is additive. If both are provided, they will be merged.

### Future Enhancements

1. **Caching layer**: Cache player-to-team mappings
2. **Player participation verification**: Cross-reference with player stats to confirm actual game participation
3. **Batch queries**: Optimize multiple team queries with GraphQL batching if supported
