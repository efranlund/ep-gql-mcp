# Implementation Plan

- [x] 1. Update GraphQL query to include GameLogs data
  - Modify GET_GAMES_QUERY constant to include gameLogs field with player, team, and SOG subfields
  - Ensure the query maintains backward compatibility with existing fields
  - _Requirements: 2.1, 2.5_

- [x] 2. Implement shots calculation function
  - [x] 2.1 Create calculateShotsFromGameLogs helper function
    - Accept gameLogs array, homeTeamId, and visitingTeamId as parameters
    - Filter gameLogs by team ID to separate home and visiting team entries
    - Sum SOG values for each team, treating null/undefined as 0
    - Return object with homeTeamShots and visitingTeamShots (null if no data)
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [ ]* 2.2 Write property test for shots calculation correctness
    - **Property 1: Shots calculation correctness**
    - **Validates: Requirements 2.2, 2.3, 2.4**
    - Generate random GameLogs with varying SOG values
    - Verify homeTeamShots equals sum of home team player SOG
    - Verify visitingTeamShots equals sum of visiting team player SOG
    - Run 100+ iterations with fast-check
  
  - [ ]* 2.3 Write unit tests for calculateShotsFromGameLogs edge cases
    - Test with empty GameLogs array (should return null for both)
    - Test with null SOG values (should treat as 0)
    - Test with mismatched team IDs (should exclude from calculation)
    - Test with only one team having data
    - _Requirements: 1.2, 2.5_

- [x] 3. Integrate shots calculation into handleGetGames
  - [x] 3.1 Update queryGamesForMultipleTeams function
    - Process gameLogs for each game in the results
    - Call calculateShotsFromGameLogs for each game
    - Add homeTeamShots and visitingTeamShots to game objects
    - Handle cases where gameLogs field is missing or null
    - _Requirements: 1.1, 1.4, 2.6_
  
  - [x] 3.2 Update fallback query path
    - Ensure fallback query (when no team IDs) also includes gameLogs
    - Apply same shots calculation logic
    - _Requirements: 1.1, 2.6_
  
  - [ ]* 3.3 Write property test for shots data inclusion
    - **Property 2: Shots data inclusion**
    - **Validates: Requirements 1.1, 1.4, 3.1, 3.2, 3.3, 3.4, 3.5**
    - Generate random game results with GameLogs
    - Verify all games include homeTeamShots and visitingTeamShots fields
    - Run 100+ iterations with fast-check

- [x] 4. Update TypeScript types and interfaces
  - [x] 4.1 Define GameLog interface
    - Create interface matching GraphQL GameLog type
    - Include player, team, and SOG fields
    - _Requirements: 2.1_
  
  - [x] 4.2 Update Game response type
    - Add homeTeamShots and visitingTeamShots fields (number | null)
    - Ensure type compatibility with existing code
    - _Requirements: 1.3, 2.6_
  
  - [ ]* 4.3 Write property test for response structure compatibility
    - **Property 3: Response structure compatibility**
    - **Validates: Requirements 2.6**
    - Generate random game data
    - Verify all original fields are present after enhancement
    - Run 100+ iterations with fast-check

- [x] 5. Update tool description and documentation
  - [x] 5.1 Update getGamesTool description
    - Add mention of shots data in tool description
    - Document that shots data may be null for some games/leagues
    - _Requirements: 1.3_
  
  - [ ]* 5.2 Write property test for output format consistency
    - **Property 4: Output format consistency**
    - **Validates: Requirements 1.3**
    - Generate random games with shots data
    - Verify shots fields are numeric or null at correct level in JSON
    - Run 100+ iterations with fast-check

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
