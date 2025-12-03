# Implementation Plan

- [ ] 1. Create helper functions for player and team filtering
- [x] 1.1 Implement `getPlayerTeams()` function to query playerStats and extract team IDs
  - Query playerStats GraphQL endpoint with player ID and filters
  - Extract unique team IDs from the stats response
  - Handle cases where player has no stats for the given filters
  - _Requirements: 1.1, 1.4, 7.1, 7.2, 7.3_

- [x] 1.2 Implement `mergeTeamIds()` function to combine team IDs from multiple sources
  - Accept arrays of team IDs from direct input and player-derived sources
  - Remove duplicates and return unique team IDs
  - Handle empty arrays gracefully
  - _Requirements: 2.4, 5.4, 6.4_

- [x] 1.3 Implement `queryGamesForMultipleTeams()` function to fetch games for multiple teams
  - Make parallel or sequential API calls for multiple team IDs
  - Merge and deduplicate results
  - Apply sorting and limiting after merging
  - _Requirements: 6.1, 6.3_

- [ ]* 1.4 Write property test for getPlayerTeams function
  - **Property 1: Player filtering returns relevant games**
  - **Validates: Requirements 1.1, 2.1, 2.2, 2.3**

- [ ]* 1.5 Write property test for mergeTeamIds function
  - **Property 3: Multiple filters use AND logic**
  - **Validates: Requirements 2.4, 5.4, 6.4**

- [ ] 2. Update games tool interface and input validation
- [x] 2.1 Extend tool input schema to accept playerId, playerIds, teamIds parameters
  - Add playerId (string) parameter to input schema
  - Add playerIds (array of strings) parameter to input schema
  - Add teamIds (array of strings) parameter to input schema
  - Update tool description to document new parameters
  - _Requirements: 1.1, 5.1, 5.2, 6.1, 6.2_

- [x] 2.2 Implement input parameter normalization logic
  - Convert single playerId to playerIds array
  - Convert single teamId to teamIds array
  - Handle conflicts when both singular and plural parameters are provided
  - Validate date format for dateFrom/dateTo
  - Validate and apply default limit value
  - _Requirements: 4.1, 4.2_

- [ ]* 2.3 Write unit tests for input parameter normalization
  - Test playerId to playerIds conversion
  - Test teamId to teamIds conversion
  - Test date format validation
  - Test limit parameter defaults and validation
  - Test conflict resolution between singular and plural parameters
  - _Requirements: 4.1, 4.2_

- [ ] 3. Implement core games query logic with player filtering
- [x] 3.1 Update handleGetGames function to support player-based filtering
  - Check if playerIds are provided
  - For each player ID, call getPlayerTeams() with filters
  - Merge all team IDs from players with directly provided teamIds
  - Pass merged team IDs to queryGamesForMultipleTeams()
  - _Requirements: 1.1, 2.1, 2.2, 2.3, 5.1, 5.3_

- [x] 3.2 Implement multiple team ID filtering in games query
  - Modify games query to handle array of team IDs
  - Make API calls for each team (or use OR logic if API supports it)
  - Merge and deduplicate game results
  - _Requirements: 6.1, 6.3_

- [x] 3.3 Ensure proper filter combination (AND logic for different filter types)
  - Apply league filter to all queries
  - Apply season filter to all queries
  - Apply date range filters to all queries
  - Verify that player/team OR logic combines with other filters using AND
  - _Requirements: 2.4, 5.4, 6.4_

- [ ]* 3.4 Write property test for player filtering
  - **Property 1: Player filtering returns relevant games**
  - **Validates: Requirements 1.1, 2.1, 2.2, 2.3**

- [ ]* 3.5 Write property test for multiple player IDs OR logic
  - **Property 7: Multiple player IDs use OR logic**
  - **Validates: Requirements 5.1, 5.3, 5.4**

- [ ]* 3.6 Write property test for multiple team IDs OR logic
  - **Property 8: Multiple team IDs use OR logic**
  - **Validates: Requirements 6.1, 6.3, 6.4**

- [ ]* 3.7 Write property test for filter combination AND logic
  - **Property 3: Multiple filters use AND logic**
  - **Validates: Requirements 2.4, 5.4, 6.4**

- [ ] 4. Implement sorting and limiting logic
- [x] 4.1 Ensure default sort parameter is set to "-dateTime"
  - Set sort to "-dateTime" when not explicitly provided
  - Pass sort parameter to all games queries
  - _Requirements: 3.1_

- [x] 4.2 Apply limit after merging and sorting results
  - Sort merged game results by dateTime descending
  - Apply limit to sorted results
  - Ensure limit defaults to 50 when not specified
  - _Requirements: 4.1, 4.2, 4.3_

- [ ]* 4.3 Write property test for default sorting
  - **Property 4: Default sorting by most recent**
  - **Validates: Requirements 3.1**

- [ ]* 4.4 Write property test for limit parameter
  - **Property 5: Limit parameter respected**
  - **Validates: Requirements 4.1, 4.2**

- [ ]* 4.5 Write property test for limit applied after sorting
  - **Property 6: Limit applied after sorting**
  - **Validates: Requirements 4.3**

- [x] 5. Implement error handling and validation
- [x] 5.1 Add error handling for invalid player IDs
  - Catch errors from playerStats query
  - Return clear error message when player ID is invalid
  - _Requirements: 1.2_

- [x] 5.2 Add error handling for invalid team IDs
  - Catch errors from games query with invalid team IDs
  - Return clear error message when team ID is invalid
  - _Requirements: 1.2_

- [x] 5.3 Add error handling for GraphQL and network errors
  - Wrap all API calls in try-catch blocks
  - Format GraphQL errors with helpful context
  - Implement retry logic for network failures
  - _Requirements: 1.2, 7.3_

- [x] 5.4 Handle empty results gracefully
  - Return empty array with metadata when no games found
  - Include applied filters in response for debugging
  - _Requirements: 1.3_

- [ ]* 5.5 Write unit tests for error handling
  - Test invalid player ID error handling
  - Test invalid team ID error handling
  - Test GraphQL error formatting
  - Test network error retry logic
  - Test empty results handling
  - _Requirements: 1.2_

- [ ] 6. Ensure response format consistency and schema compliance
- [x] 6.1 Verify response includes all required game fields
  - Ensure GraphQL query selects all required fields
  - Validate response structure matches existing games tool format
  - _Requirements: 1.3, 1.5_

- [x] 6.2 Validate all GraphQL queries against schema
  - Review playerStats query for schema compliance
  - Review games query for schema compliance
  - Ensure all object fields have proper subfield selections
  - _Requirements: 7.1, 7.2, 7.3_

- [ ]* 6.3 Write property test for response structure
  - **Property 2: Response structure completeness**
  - **Validates: Requirements 1.3**

- [ ]* 6.4 Write property test for schema compliance
  - **Property 9: Schema compliance**
  - **Validates: Requirements 7.1, 7.2, 7.3**

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 8. Integration testing and backward compatibility verification
- [ ]* 8.1 Write integration test for end-to-end player games query
  - Test querying games for a known player
  - Verify results include expected games
  - _Requirements: 1.1, 1.3_

- [ ]* 8.2 Write integration test for multiple players query
  - Test querying games for multiple known players
  - Verify OR logic works correctly
  - _Requirements: 5.1, 5.3_

- [ ]* 8.3 Write integration test for multiple teams query
  - Test querying games for multiple known teams
  - Verify OR logic works correctly
  - _Requirements: 6.1, 6.3_

- [ ]* 8.4 Write integration test for combined filters
  - Test player + season + league combination
  - Verify AND logic works correctly
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ]* 8.5 Write integration test for backward compatibility
  - Test existing single-team queries still work
  - Verify response format hasn't changed for existing use cases
  - _Requirements: 1.5_

- [x] 9. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
