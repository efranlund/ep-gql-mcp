# Design Document

## Overview

This design addresses GraphQL query errors in the EliteProspects MCP server by fixing field selections to match the actual API schema. The primary issues are:

1. The `country` field on Team and League types is an object (Country type), not a scalar string ✅ FIXED
2. Lowercase field names in stat queries (should be uppercase: `GP`, `G`, `A`, `PTS`, etc.) ✅ FIXED
3. Non-existent `standings` field being queried on `League` type ✅ FIXED
4. Empty reference data causing `list_leagues` to return no results ✅ FIXED
5. Games query not using `sort` parameter, returning old games instead of recent ones

## Architecture

The fix involves updating GraphQL query strings in the tool files to properly select subfields for object-type fields. No architectural changes are needed - this is purely a query correction effort.

### Affected Components

- `src/tools/search.ts` - Team and League search queries ✅ FIXED
- `src/tools/teams.ts` - Team query with country field ✅ FIXED
- `src/tools/leagues.ts` - League leaders queries with incorrect field casing
- `src/tools/leagues.ts` - League standings query with non-existent field
- `src/tools/reference.ts` - List leagues returning empty data

## Components and Interfaces

### Search Tool Queries

The search queries for teams and leagues currently request `country` as a scalar:

```graphql
country  # WRONG - Country is an object type
```

They should request it with subfield selection:

```graphql
country {
  name
  slug
}
```

### Country Type Structure

Based on schema introspection, the Country type has these fields:
- `slug`: String
- `name`: String  
- `flagUrl`: String
- `iso_3166_1_alpha_2`: String
- `eliteprospectsUrlPath`: String

For search results, we only need `name` and optionally `slug` for identification.

### League Stats Field Casing

The API schema uses uppercase field names for statistics:

**Skater Stats (RegularStats type):**
- `GP` (not `gp`) - Games Played
- `G` (not `g`) - Goals
- `A` (not `a`) - Assists
- `PTS` (not `pts`) - Points
- `PM` (not `plusMinus`) - Plus/Minus
- `PIM` (not `pim`) - Penalty Minutes

**Goalie Stats (RegularStats type):**
- `GP` (not `gp`) - Games Played
- `W` (not `w`) - Wins
- `L` (not `l`) - Losses
- `GAA` (not `gaa`) - Goals Against Average
- `SVP` (not `svp`) - Save Percentage
- `SO` (not `so`) - Shutouts

### League Standings Issue

The `League` type does not have a `standings` field. We need to either:
1. Find the correct query structure for standings in the schema
2. Remove the `get_league_standings` tool if standings aren't available
3. Use an alternative approach (e.g., query teams with their records)

For now, we'll investigate the schema to find the correct approach.

### Reference Data Issue

The `list_leagues` tool reads from `src/generated/reference-data.json` but returns empty results. We need to verify if:
1. The file exists and has data
2. The file path is correct in the built distribution
3. The data needs to be regenerated

### Games Query Sorting Issue

The `games` query in the API schema supports a `sort` parameter, but our implementation doesn't use it. This causes games to be returned in chronological order (oldest first) by default. When users ask for "latest games" or "recent games", they expect the most recent games first.

**Available sort parameter:**
- `sort`: String parameter that controls result ordering

**Expected behavior:**
- Default to sorting by date descending (most recent first)
- This ensures users see current/recent games without having to specify date filters

**Implementation approach:**
- Add `sort` parameter to the `GET_GAMES_QUERY` GraphQL query
- Pass a sort value that orders by date descending (need to determine correct value from API)
- Update the tool description to clarify that results are sorted by most recent first

## Data Models

No data model changes required. The existing TypeScript interfaces remain valid.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Object fields have subfield selections

*For any* GraphQL query in the codebase that requests a field of object type, the query should include at least one subfield selection.

**Validates: Requirements 1.1, 2.1, 4.3**

### Property 2: Search queries return results without errors

*For any* valid search term, executing a search query should return results or an empty array without GraphQL field selection errors.

**Validates: Requirements 1.2, 2.2**

### Property 3: Country field queries include name subfield

*For any* query requesting the `country` field on Team or League types, the query should include the `name` subfield in the selection.

**Validates: Requirements 1.3, 2.3**

### Property 4: Stat field names use correct casing

*For any* GraphQL query requesting statistics fields, the field names should match the exact casing defined in the schema (uppercase for stat abbreviations).

**Validates: Requirements 4.1, 4.2, 6.4**

### Property 5: Queries only use fields that exist in schema

*For any* GraphQL query in the codebase, all requested fields should exist on their respective types in the API schema.

**Validates: Requirements 5.1, 5.2, 6.1, 6.2, 6.3**

### Property 6: Games are sorted by most recent first

*For any* games query without explicit date filters, the results should be sorted by date in descending order with the most recent games appearing first.

**Validates: Requirements 7.1, 7.2, 7.3**

## Error Handling

The existing error handling in `src/graphql/client.ts` is sufficient. GraphQL errors will be caught and wrapped with context. After fixing the queries, these errors should no longer occur for valid requests.

## Testing Strategy

### Unit Testing

- Test that search queries execute successfully for known entities
- Test that country information is properly returned in search results
- Test edge cases like teams/leagues without country information

### Property-Based Testing

Not applicable for this fix - these are query string corrections that can be validated through unit tests and manual verification.

### Manual Verification

1. Run the MCP server locally
2. Execute search queries for teams and leagues
3. Verify no GraphQL errors occur
4. Verify country information is returned in results

## Implementation Notes

### Files to Modify

1. **src/tools/search.ts** ✅ FIXED
   - Update `SEARCH_QUERIES.team` to select `country { name slug }`
   - Update `SEARCH_QUERIES.league` to select `country { name slug }`

2. **src/tools/leagues.ts** ✅ FIXED
   - Update `GET_LEAGUE_SKATER_LEADERS_QUERY` to use uppercase field names
   - Update `GET_LEAGUE_GOALIE_LEADERS_QUERY` to use uppercase field names
   - Investigate and fix or remove `GET_LEAGUE_STANDINGS_QUERY`

3. **src/tools/reference.ts** ✅ FIXED
   - Investigate why `list_leagues` returns empty data
   - Verify reference-data.json file exists and has content
   - Consider regenerating reference data if needed

4. **src/tools/games.ts**
   - Add `sort` parameter to `GET_GAMES_QUERY`
   - Pass sort value to order games by date descending
   - Update tool description to clarify default sort order

### Testing Approach

- Use the MCP server connection in Kiro to test queries directly
- Test each fixed query with real data (e.g., "nhl" league, "Connor McDavid" player)
- Verify against actual API responses
- Check that all tools return data without GraphQL errors
