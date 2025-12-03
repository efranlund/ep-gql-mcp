# Design Document

## Overview

This design implements a proper `get_league_standings` tool for the EliteProspects MCP server. The tool will query only the fields that actually exist on the `RegularTeamStats` type, preventing GraphQL errors when AI assistants request standings data.

### The Problem

AI assistants are attempting to query fields like `shotsFor` and `shotsAgainst` on the `RegularTeamStats` type, but these fields don't exist in the schema. This causes GraphQL errors and prevents users from getting standings data.

### The Solution

Implement a standings tool that:
1. Queries only the 11 valid fields available on `RegularTeamStats`
2. Clearly documents what statistics are available
3. Provides helpful error messages when the query fails

## Architecture

No architectural changes needed. This is a new tool implementation in the existing MCP server structure.

### Affected Components

- `src/tools/leagues.ts` - Add new `get_league_standings` tool and handler
- `src/index.ts` - Register the new tool with the MCP server

## Components and Interfaces

### Available Fields on RegularTeamStats

Based on direct schema introspection, the `RegularTeamStats` type has exactly these 11 fields:

1. **GP** (Int) - Games Played
2. **W** (Int) - Wins
3. **L** (Int) - Losses
4. **T** (Int) - Ties
5. **OTW** (Int) - Overtime Wins
6. **OTL** (Int) - Overtime Losses
7. **PTS** (Int) - Points
8. **GF** (Int) - Goals For
9. **GA** (Int) - Goals Against
10. **GD** (Int) - Goal Differential
11. **PPG** (String) - Points Per Game

**Fields that DO NOT exist:**
- `shotsFor` / `SF` - Not available
- `shotsAgainst` / `SA` - Not available
- Any other shot-related statistics

### Query Structure

The `leagueStandings` query returns an array of `TeamStats` objects. Each `TeamStats` object has:
- `team` - Team object with id, name, slug
- `stats` - RegularTeamStats object with the 11 fields listed above
- `season` - Season information
- `league` - League information
- `position` - Standing position (string)

### GraphQL Query

```graphql
query GetLeagueStandings($slug: String!, $season: String, $limit: Int, $offset: Int, $sort: String) {
  leagueStandings(slug: $slug, season: $season, limit: $limit, offset: $offset, sort: $sort) {
    position
    team {
      id
      name
      slug
    }
    stats {
      GP
      W
      L
      T
      OTW
      OTL
      PTS
      GF
      GA
      GD
      PPG
    }
  }
}
```

## Data Models

No new data models required. The existing TypeScript interfaces can handle the response.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Only valid fields are queried

*For any* standings query constructed by the system, all requested fields on the `stats` object should exist in the `RegularTeamStats` type schema.

**Validates: Requirements 1.1, 2.2**

### Property 2: Standings queries return without errors

*For any* valid league slug and season combination, executing the standings query should return results or an empty array without GraphQL field selection errors.

**Validates: Requirements 1.2, 5.2**

### Property 3: All available statistics are included

*For any* standings query result, the response should include all 11 available fields from the `RegularTeamStats` type.

**Validates: Requirements 1.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3**

### Property 4: Tool description accurately reflects available fields

*For any* user reading the tool description, the documentation should list all available fields and explicitly note that shot statistics are not available.

**Validates: Requirements 2.1, 2.3, 5.3**

## Error Handling

The existing error handling in `src/graphql/client.ts` is sufficient. GraphQL errors will be caught and wrapped with context. The tool description should clearly state what fields are available to prevent users from expecting unavailable data.

## Testing Strategy

### Unit Testing

- Test that standings queries execute successfully for known leagues (e.g., "nhl", "shl")
- Test that all 11 stat fields are present in the response
- Test error handling when an invalid league slug is provided
- Test that the query works with and without optional season parameter

### Manual Verification

1. Run the MCP server locally
2. Execute standings query for NHL: `get_league_standings(leagueSlug: "nhl")`
3. Verify all 11 stat fields are returned
4. Verify no GraphQL errors occur
5. Test with different leagues and seasons

## Implementation Notes

### Tool Definition

The tool should:
- Accept `leagueSlug` (required), `season` (optional), `limit` (optional)
- Default limit to 50 teams
- Clearly document in the description that shot statistics are NOT available
- List all 11 available fields in the description

### Tool Description Example

```
Get league standings with team records and statistics.

Returns team standings including:
- Record: GP, W, L, T, OTW, OTL, PTS
- Scoring: GF (goals for), GA (goals against), GD (goal differential)
- Efficiency: PPG (points per game)

Note: Shot statistics (shots for/against) are not available in the API.

League slugs examples: "nhl", "ahl", "shl", "khl"
```

### Handler Implementation

The handler should:
1. Validate required `leagueSlug` parameter
2. Execute the GraphQL query with all 11 stat fields
3. Return formatted JSON with standings data
4. Handle errors gracefully with helpful messages

### Integration

1. Add the tool definition and handler to `src/tools/leagues.ts`
2. Export the tool from the file
3. Register it in `src/index.ts` with the other league tools
4. Update any documentation or README files
