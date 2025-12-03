# Implementation Plan

- [x] 1. Update Common Queries Guide with comprehensive examples
  - [x] 1.1 Add Scores & Results examples
    - Add example for recent game results for a team
    - Add example for specific game details by ID
    - Add example for season championship/playoff winners
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.2 Add Schedules examples
    - Add example for games today/tonight for a league
    - Add example for next game for a specific team
    - Add example for games in a date range
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.3 Add Standings examples
    - Add example for current league standings
    - Add example for team record lookup
    - Add example for historical season records
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.4 Add Stats - League Leaders examples
    - Add example for points leaders using `leagueSkaterStats`
    - Add example for goals leaders
    - Add example for assists leaders
    - Add example for goalie wins leaders using `leagueGoalieStats`
    - Add example for rookie leaders with age/GP filters
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [x] 1.5 Add Stats - Player Career examples
    - Add example for player career totals
    - Add example for player stats for specific season
    - Add example for player stats by league
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.6 Add Stats - Advanced examples
    - Add example for team shots on goal (via game logs or team stats)
    - Add example for faceoff percentage
    - Add example for power play percentage
    - Add example for penalty kill percentage
    - Add example for blocked shots leaders
    - Add example for hits leaders
    - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3_

  - [x] 1.7 Add Bios examples
    - Add example for player age, height, weight lookup
    - Add example for player position and nationality
    - Add example for career overview
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 1.8 Add Head-to-Head examples
    - Add example for last N games between two teams
    - Add example for win/loss record between teams
    - Add example for team home/away records
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2, 4.3, 4.4_

  - [ ]* 1.9 Write property test for query examples completeness
    - **Property 1: Query examples are complete and valid**
    - **Validates: Requirements 1.2**

  - [ ]* 1.10 Write property test for example descriptions
    - **Property 2: Query examples have descriptions**
    - **Validates: Requirements 1.3**

- [x] 2. Create Anti-Patterns Guide
  - [x] 2.1 Create getAntiPatternsGuide function
    - Add anti-pattern for `playerStatRecords` with alternatives
    - Add anti-pattern for `rookies` with filtering guidance
    - Add anti-pattern for `teamStats` with alternatives
    - Add anti-pattern for lowercase stat fields
    - Add anti-pattern for missing subfields on object types
    - Include explanations for why each is wrong
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 9.4_

  - [ ]* 2.2 Write property test for anti-pattern alternatives
    - **Property 3: Anti-patterns provide alternatives**
    - **Validates: Requirements 2.2**

  - [ ]* 2.3 Write property test for anti-pattern explanations
    - **Property 11: Anti-patterns include explanations**
    - **Validates: Requirements 9.4**

- [x] 3. Create Query Patterns Guide
  - [x] 3.1 Create getQueryPatternsGuide function
    - Add pattern for league leaders with sort options
    - Add pattern for head-to-head games with team filtering
    - Add pattern for player stats with filters
    - Add pattern for team statistics
    - Add pattern for rookie filtering
    - Document all available filter options for each pattern
    - Document customizable placeholders
    - Use uppercase for all stat fields
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 3.2 Write property test for pattern customization docs
    - **Property 4: Query patterns explain customization**
    - **Validates: Requirements 3.2**

  - [ ]* 3.3 Write property test for filter documentation
    - **Property 5: Patterns with filters document options**
    - **Validates: Requirements 3.3**

  - [ ]* 3.4 Write property test for stat field casing
    - **Property 6: Stat field names use uppercase**
    - **Validates: Requirements 3.4, 5.4, 8.3**

- [x] 4. Create Advanced Queries Guide
  - [x] 4.1 Create getAdvancedQueriesGuide function
    - Add example for rookie points leaders with age/GP filters
    - Add example for team shots statistics
    - Add example for last 10 games between teams
    - Add example for oldest/youngest active players
    - Add example for team home/away record splits
    - Add example for special teams percentages
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_

- [x] 5. Create Field Reference Guide
  - [x] 5.1 Create getFieldReferenceGuide function
    - Document Player type fields (scalar and object)
    - Document Team type fields
    - Document Game type fields
    - Document RegularStats fields (skater and goalie)
    - Document Connection type pattern
    - Indicate which fields require subfield selection
    - Use uppercase for stat field names
    - Show edges/node pattern for connections
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [ ]* 5.2 Write property test for object field indicators
    - **Property 10: Object fields indicate subfield requirement**
    - **Validates: Requirements 8.2**

- [x] 6. Register new guide resources
  - [x] 6.1 Update src/index.ts to register new guides
    - Register `guide://query-patterns` resource
    - Register `guide://anti-patterns` resource
    - Register `guide://advanced-queries` resource
    - Register `guide://field-reference` resource
    - _Requirements: 1.1, 2.1, 3.1, 5.1, 6.1, 8.1_

- [x] 7. Enhance error messages in execute_graphql tool
  - [x] 7.1 Update enhanceGraphQLError function
    - Add detection for `playerStatRecords` error
    - Add detection for `rookies` error
    - Add detection for `teamStats` error
    - Add detection for lowercase stat field errors
    - Add detection for missing subfield errors
    - Add hint to check `guide://anti-patterns`
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 8. Update tool descriptions with better examples
  - [x] 8.1 Update execute_graphql tool description
    - Add example for finding league leaders
    - Add example for head-to-head games
    - Add example for player career stats
    - Emphasize using introspect_schema for discovery
    - _Requirements: 7.1, 7.2, 7.4_

  - [x] 8.2 Update get_league_leaders tool description
    - Clarify it returns top scorers by points
    - Add note about rookie filtering
    - Show example response structure
    - Clarify when to use vs execute_graphql
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 8.3 Update get_games tool description
    - Emphasize default sort is most recent first
    - Show how to filter by team matchups using teamIds array
    - Clarify date filtering options
    - Clarify when to use vs execute_graphql
    - _Requirements: 7.1, 7.3, 7.4_

  - [x] 8.4 Update get_player_stats tool description
    - Add example query showing available filters
    - Clarify when to use vs execute_graphql
    - _Requirements: 7.1, 7.3, 7.4_

  - [ ]* 8.5 Write property test for tool description examples
    - **Property 7: Tool descriptions include examples**
    - **Validates: Requirements 7.1**

  - [ ]* 8.6 Write property test for tool example validity
    - **Property 8: Tool examples use valid queries**
    - **Validates: Requirements 7.4**

  - [ ]* 8.7 Write property test for convenience tool guidance
    - **Property 9: Convenience tools clarify usage**
    - **Validates: Requirements 7.3**

- [ ] 9. Validate all query examples against schema
  - [ ] 9.1 Test each query example in Common Queries Guide
    - Execute each example query against the API
    - Verify no GraphQL errors occur
    - Verify results match expected structure
    - Fix any invalid queries
    - _Requirements: 1.2, 7.4_

  - [ ] 9.2 Test query patterns with real data
    - Execute each pattern with sample values
    - Verify patterns work correctly
    - Verify all filter options are valid
    - _Requirements: 3.2, 3.3_

  - [ ] 9.3 Test advanced query examples
    - Execute each advanced example
    - Verify complex filters work correctly
    - Verify results are as expected
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 6.2, 6.3, 6.4_

  - [ ] 9.4 Verify anti-patterns actually fail
    - Attempt each anti-pattern query
    - Verify it produces expected error
    - Verify suggested alternatives work
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 10. Final verification and documentation review
  - [x] 10.1 Review all guide resources for completeness
    - Verify all use cases from requirements are covered
    - Verify all examples have descriptions
    - Verify all stat fields use uppercase
    - Verify all object fields have subfield selections
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 10.2 Test enhanced error messages
    - Trigger each error pattern
    - Verify enhanced messages appear
    - Verify hints are helpful
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 10.3 Test guide resource accessibility
    - Verify all guide URIs resolve correctly
    - Test accessing guides through MCP client
    - Verify JSON formatting is correct
    - _Requirements: 1.1, 2.1, 3.1, 5.1, 6.1, 8.1_

  - [x] 10.4 Build and deploy updated server
    - Run `npm run build`
    - Test in local MCP client
    - Verify all changes work correctly
    - _Requirements: All_

