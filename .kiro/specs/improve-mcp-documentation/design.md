# Design Document

## Overview

This design creates comprehensive documentation for the EliteProspects MCP server to help AI assistants correctly query hockey data. The documentation will include:

1. **Extensive query examples** organized by use case (scores, schedules, standings, stats, bios, head-to-head)
2. **Anti-patterns guide** listing queries that don't exist and their correct alternatives
3. **Query pattern templates** showing how to construct similar queries
4. **Enhanced tool descriptions** with inline examples
5. **Field reference guide** documenting commonly used fields and their types

The goal is to reduce query errors and improve the AI assistant's ability to answer hockey questions correctly on the first try.

## Architecture

### Documentation Structure

We'll organize documentation into multiple guide resources:

```
src/resources/guides.ts
├── getCommonQueriesGuide()          # Updated with comprehensive examples
├── getHockeyTerminologyGuide()      # Existing, minor updates
├── getQueryPatternsGuide()          # NEW: Reusable query templates
├── getAntiPatternsGuide()           # NEW: Common mistakes to avoid
├── getAdvancedQueriesGuide()        # NEW: Complex queries (head-to-head, advanced stats)
└── getFieldReferenceGuide()         # NEW: Field types and requirements
```

### Resource Registration

Resources are registered in `src/index.ts` and accessible via URIs:
- `guide://common-queries` - Basic query examples
- `guide://hockey-terminology` - Stats abbreviations
- `guide://query-patterns` - Reusable templates
- `guide://anti-patterns` - What NOT to do
- `guide://advanced-queries` - Complex use cases
- `guide://field-reference` - Field documentation

## Components and Interfaces

### 1. Common Queries Guide (Updated)

Comprehensive examples organized by use case category:

**Scores & Results:**
- Recent game results for a team
- Specific game details
- Season championship winners

**Schedules:**
- Games today/tonight for a league
- Next game for a specific team
- Games in a date range

**Standings:**
- Current league standings
- Team record (W-L-OTL)
- Historical best records

**Stats - League Leaders:**
- Points leaders (using `leagueSkaterStats`)
- Goals leaders
- Assists leaders
- Goalie wins leaders
- Rookie leaders (filtered by age/GP)

**Stats - Player Career:**
- Player career totals
- Player stats for specific season
- Player stats by league

**Stats - Advanced:**
- Team shots on goal leaders
- Faceoff percentage
- Power play percentage
- Penalty kill percentage
- Blocked shots leaders
- Hits leaders

**Bios:**
- Player age, height, weight
- Player position and nationality
- Career overview

**Head-to-Head:**
- Last N games between two teams
- Win/loss record between teams
- Team home/away records

### 2. Anti-Patterns Guide (NEW)

Documents queries that DON'T exist and their correct alternatives:

```typescript
{
  title: "Common Query Mistakes and Corrections",
  antiPatterns: [
    {
      incorrect: "playerStatRecords",
      reason: "This query does not exist in the schema",
      correct: [
        "playerStats - for individual player statistics",
        "playerStatsLeagues - for player stats grouped by league",
        "playerStatsSeasons - for player stats grouped by season",
        "leagueSkaterStats - for league-wide skater statistics",
        "leagueGoalieStats - for league-wide goalie statistics"
      ],
      example: "To find NHL points leaders, use leagueSkaterStats with sort: '-regularStats.PTS'"
    },
    {
      incorrect: "rookies",
      reason: "There is no dedicated rookies query",
      correct: [
        "leagueSkaterStats with filters for age and games played",
        "playerStats with rookie status filters"
      ],
      example: "Filter leagueSkaterStats by playerAge < 26 and regularStats.GP < 25 in previous season"
    },
    {
      incorrect: "teamStats",
      reason: "Team-level statistics are accessed through leagueStandings",
      correct: [
        "leagueStandings - includes team records and goal differentials",
        "teamSeasonComparison - for comparing team performance across seasons"
      ]
    },
    {
      incorrect: "Lowercase stat fields (gp, g, a, pts)",
      reason: "All stat field names use UPPERCASE abbreviations",
      correct: [
        "GP (not gp) - Games Played",
        "G (not g) - Goals",
        "A (not a) - Assists",
        "PTS (not pts) - Points",
        "PIM (not pim) - Penalty Minutes",
        "PM (not plusMinus) - Plus/Minus"
      ]
    }
  ]
}
```

### 3. Query Patterns Guide (NEW)

Reusable templates with placeholders:

**Pattern: League Leaders**
```graphql
query GetLeagueLeaders {
  leagueSkaterStats(
    slug: "<LEAGUE_SLUG>",     # e.g., "nhl", "ahl", "shl"
    season: "<SEASON>",         # e.g., "2024-2025" or omit for current
    limit: <NUMBER>,            # e.g., 10, 20, 50
    sort: "<SORT_FIELD>"        # e.g., "-regularStats.PTS", "-regularStats.G"
  ) {
    edges {
      player {
        id
        name
        position
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PM
        PIM
      }
    }
  }
}
```

**Available sort options:**
- `-regularStats.PTS` - Points (descending)
- `-regularStats.G` - Goals (descending)
- `-regularStats.A` - Assists (descending)
- `-regularStats.PM` - Plus/Minus (descending)

**Pattern: Head-to-Head Games**
```graphql
query GetHeadToHeadGames {
  games(
    teamIds: ["<TEAM1_ID>", "<TEAM2_ID>"],
    league: "<LEAGUE_SLUG>",
    season: "<SEASON>",
    limit: <NUMBER>,
    sort: "-dateTime"           # Most recent first
  ) {
    edges {
      id
      dateTime
      homeTeam {
        id
        name
      }
      visitingTeam {
        id
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}
```

**Pattern: Player Stats with Filters**
```graphql
query GetPlayerStats {
  playerStats(
    player: "<PLAYER_ID>",
    season: "<SEASON>",         # Optional
    league: "<LEAGUE_SLUG>",    # Optional
    limit: <NUMBER>
  ) {
    edges {
      season {
        slug
      }
      league {
        name
        slug
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PIM
        PM
        PPG
        SHG
        GWG
        SOG
        TOI
      }
      postseasonStats {
        GP
        G
        A
        PTS
      }
    }
  }
}
```

### 4. Advanced Queries Guide (NEW)

Complex real-world examples:

**Example: Rookie Points Leaders**
```graphql
query GetRookieLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    playerAge: 25,              # Under 26 years old
    regularStatsGPMax: 82,      # First or second season
    limit: 20,
    sort: "-regularStats.PTS"
  ) {
    edges {
      player {
        id
        name
        dateOfBirth
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
      }
    }
  }
}
```

**Example: Team Shots Statistics**
```graphql
query GetTeamShotsLeaders {
  leagueStandings(
    slug: "nhl",
    season: "2024-2025",
    sort: "-stats.SF",          # Shots For (if available)
    limit: 31
  ) {
    position
    team {
      name
    }
    stats {
      GP
      GF                        # Goals For
      GA                        # Goals Against
      # Note: Shots data may not be available in standings
    }
  }
}
```

**Example: Last 10 Games Between Teams**
```graphql
query GetLast10GamesBetweenTeams {
  games(
    teamIds: ["<TEAM1_ID>", "<TEAM2_ID>"],
    league: "nhl",
    limit: 10,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        id
        name
      }
      visitingTeam {
        id
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}
```

**Example: Oldest/Youngest Active Players**
```graphql
query GetOldestActivePlayers {
  players(
    playerStatus: "ACTIVE",
    league: "nhl",
    sort: "dateOfBirth",        # Ascending = oldest first
    limit: 20
  ) {
    edges {
      id
      name
      dateOfBirth
      position
      latestStats {
        teamName
        leagueName
      }
    }
  }
}
```

### 5. Field Reference Guide (NEW)

Documents commonly used fields and their requirements:

```typescript
{
  title: "Field Reference Guide",
  types: {
    Player: {
      scalarFields: ["id", "name", "slug", "position", "dateOfBirth", "placeOfBirth", "shoots", "status"],
      objectFields: {
        nationality: "Country type - requires subfields like { name slug }",
        height: "Height type - requires subfields like { imperial metrics }",
        weight: "Weight type - requires subfields like { imperial metrics }",
        latestStats: "LatestStats type - requires subfields like { teamName leagueName }"
      },
      note: "All object-type fields MUST have subfield selections"
    },
    Team: {
      scalarFields: ["id", "name", "slug"],
      objectFields: {
        country: "Country type - requires subfields like { name slug }",
        league: "League type - requires subfields like { name slug }"
      }
    },
    Game: {
      scalarFields: ["id", "dateTime", "homeScore", "visitingScore", "status"],
      objectFields: {
        homeTeam: "Team type - requires subfields like { id name }",
        visitingTeam: "Team type - requires subfields like { id name }",
        league: "League type - requires subfields like { name slug }"
      }
    },
    RegularStats: {
      skaterFields: ["GP", "G", "A", "PTS", "PIM", "PM", "PPG", "SHG", "GWG", "SOG", "TOI"],
      goalieFields: ["GP", "W", "L", "GAA", "SVP", "SO", "SA", "SVS"],
      note: "ALL stat field names are UPPERCASE"
    },
    ConnectionTypes: {
      pattern: "edges { node { ...fields } }",
      examples: [
        "playerStats { edges { ...statFields } }",
        "games { edges { ...gameFields } }",
        "leagueSkaterStats { edges { ...playerStatFields } }"
      ],
      note: "Most list queries return Connection types with edges/node pattern"
    }
  }
}
```

### 6. Enhanced Tool Descriptions

Update tool descriptions with better inline examples:

**execute_graphql tool:**
- Add example for finding league leaders
- Add example for head-to-head games
- Add example for player career stats
- Emphasize using introspect_schema for discovery

**get_league_leaders tool:**
- Clarify it returns top scorers by points
- Add note about rookie filtering
- Show example response structure

**get_games tool:**
- Emphasize default sort is most recent first
- Show how to filter by team matchups
- Clarify date filtering options

## Data Models

No new data models required. All changes are to documentation strings and guide resources.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Query examples are complete and valid

*For any* query example in the documentation, the example should include a complete GraphQL query with all required fields.

**Validates: Requirements 1.2**

### Property 2: Query examples have descriptions

*For any* query example in the documentation, the example should include a non-empty description field explaining what question it answers.

**Validates: Requirements 1.3**

### Property 3: Anti-patterns provide alternatives

*For any* anti-pattern documented in the guide, the entry should include at least one correct alternative query to use.

**Validates: Requirements 2.2**

### Property 4: Query patterns explain customization

*For any* query pattern in the documentation, the pattern should include explanations of which parts can be customized.

**Validates: Requirements 3.2**

### Property 5: Patterns with filters document options

*For any* query pattern that uses filters, the documentation should list all available filter options for those filters.

**Validates: Requirements 3.3**

### Property 6: Stat field names use uppercase

*For any* query example or pattern that includes statistics fields, all stat field names should be uppercase (GP, G, A, PTS, etc.).

**Validates: Requirements 3.4, 5.4, 8.3**

### Property 7: Tool descriptions include examples

*For any* tool description in the codebase, the description should include at least one inline query example.

**Validates: Requirements 7.1**

### Property 8: Tool examples use valid queries

*For any* query example in a tool description, the query should use field names and query names that actually exist in the schema.

**Validates: Requirements 7.4**

### Property 9: Convenience tools clarify usage

*For any* convenience tool description, the description should include guidance on when to use it versus the `execute_graphql` tool.

**Validates: Requirements 7.3**

### Property 10: Object fields indicate subfield requirement

*For any* object-type field documented in the field reference, the documentation should indicate that subfield selection is required.

**Validates: Requirements 8.2**

### Property 11: Anti-patterns include explanations

*For any* anti-pattern documented in the guide, the entry should include an explanation of why it's wrong or doesn't exist.

**Validates: Requirements 9.4**

## Error Handling

### Enhanced Error Messages

Update `enhanceGraphQLError()` function in `execute-graphql.ts` to detect more anti-patterns:

```typescript
function enhanceGraphQLError(originalError: string): string {
  let enhanced = originalError;
  
  // Pattern: Cannot query field X
  if (originalError.includes('Cannot query field')) {
    enhanced += '\n\nHint: Use the introspect_schema tool or check guide://anti-patterns for common mistakes.';
    
    // Specific anti-patterns
    if (originalError.includes('playerStatRecords')) {
      enhanced += '\n\nNote: Use playerStats, playerStatsLeagues, or leagueSkaterStats instead.';
    }
    if (originalError.includes('rookies')) {
      enhanced += '\n\nNote: Filter leagueSkaterStats by age and games played for rookie data.';
    }
    if (originalError.includes('teamStats')) {
      enhanced += '\n\nNote: Use leagueStandings for team statistics.';
    }
  }
  
  // Pattern: Lowercase stat fields
  if (originalError.match(/Cannot query field "(gp|g|a|pts|pim|pm|gaa|svp)"/i)) {
    enhanced += '\n\nNote: Stat field names are UPPERCASE (GP, G, A, PTS, PIM, PM, GAA, SVP).';
  }
  
  // Pattern: Missing subfields on object type
  if (originalError.includes('must have a selection of subfields')) {
    enhanced += '\n\nNote: Object-type fields require subfield selection. Example: country { name slug }';
  }
  
  return enhanced;
}
```

## Testing Strategy

### Manual Validation

1. **Query Example Validation:**
   - Execute each query example against the actual API
   - Verify no GraphQL errors occur
   - Verify results match expected structure

2. **Anti-Pattern Verification:**
   - Attempt each anti-pattern query
   - Verify it produces an error
   - Verify the suggested alternative works

3. **Use Case Coverage:**
   - Test examples for each user question category
   - Verify AI assistant can answer questions from the provided list
   - Identify any gaps in coverage

### Integration Testing

- Test that all guide resources are accessible via MCP
- Verify resource URIs resolve correctly
- Test that enhanced error messages appear when expected

## Implementation Notes

### Files to Modify

1. **src/resources/guides.ts**
   - Update `getCommonQueriesGuide()` with comprehensive examples
   - Add `getQueryPatternsGuide()`
   - Add `getAntiPatternsGuide()`
   - Add `getAdvancedQueriesGuide()`
   - Add `getFieldReferenceGuide()`

2. **src/tools/execute-graphql.ts**
   - Enhance `enhanceGraphQLError()` function
   - Update tool description with better examples

3. **src/tools/leagues.ts**
   - Update tool descriptions with clearer examples
   - Add notes about rookie filtering

4. **src/tools/games.ts**
   - Update tool description to emphasize head-to-head capability
   - Clarify sorting behavior

5. **src/tools/players.ts**
   - Update tool descriptions with example queries
   - Clarify search vs direct ID lookup

6. **src/index.ts**
   - Register new guide resources

### Organization Strategy

**Common Queries Guide:**
- Organize by use case (Scores, Schedules, Standings, Stats, Bios, Head-to-Head)
- Include 3-5 examples per category
- Focus on most frequently asked questions

**Query Patterns Guide:**
- Provide templates with clear placeholder syntax
- Document all available filter options
- Show multiple variations of each pattern

**Advanced Queries Guide:**
- Focus on complex multi-filter queries
- Include rookie leaders, age-based queries, head-to-head
- Show how to combine multiple filters

**Anti-Patterns Guide:**
- List top 10 most common mistakes
- Provide clear explanations of why they're wrong
- Always include working alternatives

### Example Query Selection

Based on the user's question list, prioritize examples for:

1. **Head-to-head matchups** (most common pattern in the list)
   - Last N games between two teams
   - Win/loss records
   - Home/away splits

2. **League leaders** (second most common)
   - Points, goals, assists leaders
   - Rookie leaders
   - Advanced stats leaders (shots, hits, blocks)

3. **Team statistics**
   - Goals for/against per game
   - Power play/penalty kill percentages
   - Home/away records

4. **Player information**
   - Age, height, weight
   - Career stats
   - Current season performance

### Validation Approach

Before finalizing documentation:
1. Test each query example against the actual API
2. Verify field names match schema exactly
3. Ensure all object fields have subfield selections
4. Confirm stat fields use uppercase
5. Test that anti-patterns actually fail as expected

