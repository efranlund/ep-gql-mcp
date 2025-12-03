# Implementation Plan

- [x] 1. Enhance execute_graphql tool description
  - Update the tool description to include introspect_schema reference
  - Add mention of 321 available queries
  - List convenience tools (get_player, get_team, get_league_standings, get_league_leaders, get_games, get_game_logs)
  - Include a working example query
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 6.4_

- [ ] 2. Implement error enhancement function
- [x] 2.1 Create enhanceGraphQLError function
  - Write function that takes an error message string and returns enhanced version
  - Preserve original error message at the start
  - Use try-catch to ensure enhancement never crashes
  - _Requirements: 1.1, 1.3, 5.3_

- [x] 2.2 Add "Cannot query field" detection and hint
  - Detect "Cannot query field" pattern in error messages
  - Append introspect_schema tool suggestion
  - Keep original error intact
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 2.3 Add rookies-specific error enhancement
  - Detect "rookies" keyword in error messages
  - Append NHL rookie definition (under 26, <25 games)
  - Suggest leagueSkaterStats/leagueGoalieStats queries
  - Mention get_league_leaders tool
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 2.4 Ensure other errors pass through unchanged
  - Check that non-field errors are not modified
  - Verify network errors remain clear
  - Test with syntax errors
  - _Requirements: 3.4, 5.1, 5.2_

- [ ]* 2.5 Write property test for error message preservation
  - **Property 1: Error message preservation**
  - **Validates: Requirements 1.3, 3.3**

- [ ]* 2.6 Write property test for idempotence
  - **Property 2: Hint appending is idempotent**
  - **Validates: Requirements 1.1, 3.1**

- [ ]* 2.7 Write property test for non-field error pass-through
  - **Property 3: Non-field errors pass through**
  - **Validates: Requirements 3.4**

- [ ]* 2.8 Write unit tests for error enhancement
  - Test "Cannot query field" gets hint
  - Test "rookies" gets special hint
  - Test other errors pass through unchanged
  - Test enhancement handles malformed input safely
  - _Requirements: 1.1, 3.1, 3.4, 5.2, 5.4, 7.1_

- [ ] 3. Integrate error enhancement into handler
- [x] 3.1 Update handleExecuteGraphQL to use enhancement
  - Catch errors from executeQuery
  - Apply enhanceGraphQLError to error messages
  - Preserve error stack traces for debugging
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2_

- [x] 3.2 Add fallback error handling
  - Wrap enhancement in try-catch
  - Return original error if enhancement fails
  - Log enhancement failures for debugging
  - _Requirements: 5.3, 5.4_

- [ ]* 3.3 Write unit tests for handler integration
  - Test handler with various error types
  - Verify enhanced errors are returned correctly
  - Test fallback behavior when enhancement fails
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 4. Manual testing with MCP server
- [x] 4.1 Test rookies query error
  - Use the connected ep-gql-mcp server to execute a query with "rookies" field
  - Verify the error message includes NHL rookie definition
  - Verify suggestions for leagueSkaterStats/leagueGoalieStats are present
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 4.2 Test non-existent field error
  - Execute a query with a non-existent field (not "rookies")
  - Verify the error includes introspect_schema hint
  - Verify original error message is preserved
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 4.3 Test valid query still works
  - Execute a valid query (e.g., player lookup)
  - Verify no interference with successful queries
  - Verify response format is unchanged
  - _Requirements: 5.1, 5.2_

- [ ] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
