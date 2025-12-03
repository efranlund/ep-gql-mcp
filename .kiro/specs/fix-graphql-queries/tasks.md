# Implementation Plan

- [x] 1. Fix country field selection in search queries
  - [x] 1.1 Update team search query to select country subfields
    - Modify `SEARCH_QUERIES.team` in `src/tools/search.ts`
    - Change `country` to `country { name slug }`
    - _Requirements: 1.1, 1.3, 6.3_

  - [x] 1.2 Update league search query to select country subfields
    - Modify `SEARCH_QUERIES.league` in `src/tools/search.ts`
    - Change `country` to `country { name slug }`
    - _Requirements: 2.1, 2.3, 6.3_

  - [ ]* 1.3 Write unit tests for search queries
    - Test team search returns results without errors
    - Test league search returns results without errors
    - Test country information is properly included in results
    - _Requirements: 1.2, 2.2_

- [x] 2. Fix field name casing in league stats queries
  - [x] 2.1 Update skater stats query field names to uppercase
    - Modify `GET_LEAGUE_SKATER_LEADERS_QUERY` in `src/tools/leagues.ts`
    - Change lowercase fields to uppercase: `gp` → `GP`, `g` → `G`, `a` → `A`, `pts` → `PTS`, `plusMinus` → `PM`, `pim` → `PIM`
    - _Requirements: 4.1, 4.3, 6.4_

  - [x] 2.2 Update goalie stats query field names to uppercase
    - Modify `GET_LEAGUE_GOALIE_LEADERS_QUERY` in `src/tools/leagues.ts`
    - Change lowercase fields to uppercase: `gp` → `GP`, `w` → `W`, `l` → `L`, `gaa` → `GAA`, `svp` → `SVP`, `so` → `SO`
    - _Requirements: 4.2, 4.3, 6.4_
    - ✅ Already correct - goalie stats were already using uppercase field names

  - [ ]* 2.3 Write unit tests for league leaders queries
    - Test skater leaders query returns results without errors
    - Test goalie leaders query returns results without errors
    - Test stat fields are properly populated
    - _Requirements: 4.3_

- [x] 3. Investigate and fix league standings query
  - [x] 3.1 Use schema introspection to find correct standings query structure
    - Use `execute_graphql` tool or check `src/generated/schema.json`
    - Determine if standings data is available and how to query it
    - Document findings
    - _Requirements: 5.1, 5.2, 6.1_

  - [x] 3.2 Fix or remove standings functionality
    - If standings query exists: update `GET_LEAGUE_STANDINGS_QUERY` with correct structure
    - If standings unavailable: remove or disable the `get_league_standings` tool
    - Update tool description to reflect actual capabilities
    - _Requirements: 5.1, 5.2, 5.3_

  - [ ]* 3.3 Write unit tests for standings query (if applicable)
    - Test standings query returns results without errors
    - Test error handling when standings unavailable
    - _Requirements: 5.2, 5.3_

- [x] 4. Investigate and fix list_leagues reference data
  - [x] 4.1 Check reference data file and path
    - Verify `src/generated/reference-data.json` exists and has league data
    - Check if file path is correct for built distribution
    - Test `list_leagues` tool to confirm it returns data
    - _Requirements: 6.1, 6.2_

  - [x] 4.2 Regenerate reference data if needed
    - Run `npm run generate-schema` if reference data is missing or empty
    - Verify leagues are populated in the generated file
    - Test that `list_leagues` returns expected results
    - _Requirements: 6.1, 6.2_

- [x] 5. Fix games query sorting to return recent games first
  - [x] 5.1 Add sort parameter to games query
    - Modify `GET_GAMES_QUERY` in `src/tools/games.ts`
    - Add `$sort: String` to query parameters
    - Pass `sort` variable to the games query
    - Determine correct sort value for descending date order (likely "-dateTime" or "dateTime:desc")
    - _Requirements: 7.1, 7.3_

  - [x] 5.2 Update games handler to use sort parameter
    - Modify `handleGetGames` function to pass sort parameter
    - Default to descending date sort when no explicit sort provided
    - Update tool description to clarify default sort behavior
    - _Requirements: 7.1, 7.2_

  - [ ]* 5.3 Write unit tests for games query sorting
    - Test that games are returned in descending date order by default
    - Test that most recent games appear first
    - Test with known team/league to verify correct ordering
    - _Requirements: 7.1, 7.2_

- [x] 6. Final verification and testing
  - [x] 6.1 Test all fixed tools with real queries
    - Test `get_team` with "Toronto Maple Leafs"
    - Test `get_league_leaders` with "nhl"
    - Test `get_league_standings` with "nhl" (if not removed)
    - Test `list_leagues` with default parameters
    - Verify no GraphQL errors occur
    - _Requirements: 1.2, 2.2, 4.3, 5.2_
    - ✅ All tools tested successfully - no GraphQL errors

  - [x] 6.2 Rebuild and verify in production
    - Run `npm run build`
    - Restart MCP server
    - Test all tools through MCP client
    - Verify all fixes work correctly
    - _Requirements: 1.2, 2.2, 4.3, 5.2_
    - ✅ Build successful, server restarted, all fixes verified working
