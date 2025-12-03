# Implementation Plan

- [ ] 1. Implement get_league_standings tool
  - [x] 1.1 Create GraphQL query with all valid RegularTeamStats fields
    - Add `GET_LEAGUE_STANDINGS_QUERY` constant to `src/tools/leagues.ts`
    - Include all 11 fields: GP, W, L, T, OTW, OTL, PTS, GF, GA, GD, PPG
    - Query team information: id, name, slug
    - Query position field for standings rank
    - _Requirements: 1.1, 1.3, 2.2, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3_

  - [x] 1.2 Create tool definition with accurate description
    - Define `getLeagueStandingsTool` with proper input schema
    - Document all 11 available stat fields in description
    - Explicitly note that shot statistics are NOT available
    - Include example league slugs in description
    - _Requirements: 2.1, 2.3, 5.3_

  - [x] 1.3 Implement handler function
    - Create `handleGetLeagueStandings` async function
    - Validate required `leagueSlug` parameter
    - Execute GraphQL query with variables
    - Format response as JSON string
    - Handle errors with helpful messages
    - _Requirements: 1.2, 5.1, 5.2_

  - [x] 1.4 Write unit tests for standings tool
    - Test successful query with known league (e.g., "nhl")
    - Test that all 11 stat fields are present in response
    - Test with optional season parameter
    - Test error handling for invalid league slug
    - Test with limit parameter
    - _Requirements: 1.2, 1.3_

- [ ] 2. Register tool with MCP server
  - [x] 2.1 Export tool from leagues.ts
    - Export `getLeagueStandingsTool` constant
    - Export `handleGetLeagueStandings` function
    - _Requirements: 5.1_

  - [x] 2.2 Register tool in index.ts
    - Import the tool and handler from `src/tools/leagues.ts`
    - Add tool to server tools list
    - Add handler to tools/call request handler
    - _Requirements: 5.1_

- [ ] 3. Test and verify
  - [x] 3.1 Manual testing with MCP client
    - Test `get_league_standings` with "nhl" league
    - Verify all 11 stat fields are returned
    - Verify no GraphQL errors occur
    - Test with different leagues (ahl, shl, khl)
    - Test with season parameter
    - _Requirements: 1.2, 1.3, 5.2_

  - [x] 3.2 Rebuild and deploy
    - Run `npm run build`
    - Restart MCP server
    - Verify tool appears in tool list
    - Test through Claude Desktop or other MCP client
    - _Requirements: 5.1, 5.2_
