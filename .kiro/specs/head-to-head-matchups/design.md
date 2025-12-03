# Design Document: Head-to-Head Matchups

## Overview

This feature adds head-to-head comparison capabilities to the EliteProspects MCP server, enabling AI assistants to compare statistics between multiple players, teams, and goalies. The design leverages existing GraphQL queries and tools while adding new comparison-specific tools that format results for easy side-by-side analysis.

The implementation follows the existing MCP server architecture with new tool files in `src/tools/` that handle comparison logic, data normalization, and formatting. All comparison tools will support 2 or more entities and provide both raw statistics and normalized metrics (per-game averages, percentages) for fair comparisons.

## Architecture

### Component Structure

```
src/tools/
├── comparisons.ts          # New: Player and team comparison tools
│   ├── comparePlayersTool
│   ├── handleComparePlayers()
│   ├── compareTeamsTool
│   ├── handleCompareTeams()
│   ├── compareGoaliesTool
│   └── handleCompareGoalies()
└── [existing tools remain unchanged]

src/utils/
└── formatting.ts           # Enhanced: Add comparison formatting utilities
    ├── formatPlayerComparison()
    ├── formatTeamComparison()
    ├── formatGoalieComparison()
    └── calculateNormalizedStats()
```

### Integration Points

- **Existing Tools**: Comparison tools will call existing `handleGetPlayerStats()`, `handleGetTeam()`, and `handleSearchEntities()` functions
- **GraphQL Client**: Uses existing `executeQuery()` with parallel requests via `Promise.all()`
- **MCP Server**: New tools registered in `src/index.ts` alongside existing tools
- **Error Handling**: Follows existing patterns with partial results on individual entity failures

## Components and Interfaces

### Tool Definitions

#### 1. Compare Players Tool

```typescript
export const comparePlayersTool: Tool = {
  name: "compare_players",
  description: `Compare statistics between 2 or more players side-by-side.
  
Supports:
- Player IDs or names (will auto-search names)
- Season filtering (applies to all players)
- League filtering (applies to all players)
- Per-game normalization for fair comparison

Returns: Structured comparison with raw stats and normalized metrics (per-game averages).`,
  inputSchema: {
    type: "object",
    properties: {
      playerIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of player IDs (numeric strings)",
      },
      playerNames: {
        type: "array",
        items: { type: "string" },
        description: "Array of player names (will search and use first match for each)",
      },
      season: {
        type: "string",
        description: "Season filter (e.g., '2023-2024') - applies to all players",
      },
      league: {
        type: "string",
        description: "League slug filter (e.g., 'nhl', 'ahl') - applies to all players",
      },
    },
  },
};
```

#### 2. Compare Teams Tool

```typescript
export const compareTeamsTool: Tool = {
  name: "compare_teams",
  description: `Compare performance statistics between 2 or more teams side-by-side.
  
Supports:
- Team IDs or names (will auto-search names)
- Season filtering (applies to all teams)
- Normalized metrics (per-game, win percentage, etc.)

Returns: Structured comparison with standings data, records, and scoring statistics.`,
  inputSchema: {
    type: "object",
    properties: {
      teamIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of team IDs (numeric strings)",
      },
      teamNames: {
        type: "array",
        items: { type: "string" },
        description: "Array of team names (will search and use first match for each)",
      },
      season: {
        type: "string",
        description: "Season filter (e.g., '2023-2024') - applies to all teams",
      },
    },
  },
};
```

#### 3. Compare Goalies Tool

```typescript
export const compareGoaliesTool: Tool = {
  name: "compare_goalies",
  description: `Compare goaltender statistics between 2 or more goalies side-by-side.
  
Supports:
- Goalie IDs or names (will auto-search names)
- Season filtering (applies to all goalies)
- League filtering (applies to all goalies)
- Goalie-specific metrics (GAA, SVP, SO)

Returns: Structured comparison with goaltending statistics and normalized metrics.`,
  inputSchema: {
    type: "object",
    properties: {
      goalieIds: {
        type: "array",
        items: { type: "string" },
        description: "Array of goalie IDs (numeric strings)",
      },
      goalieNames: {
        type: "array",
        items: { type: "string" },
        description: "Array of goalie names (will search and use first match for each)",
      },
      season: {
        type: "string",
        description: "Season filter (e.g., '2023-2024') - applies to all goalies",
      },
      league: {
        type: "string",
        description: "League slug filter (e.g., 'nhl', 'ahl') - applies to all goalies",
      },
    },
  },
};
```

### Handler Function Signatures

```typescript
interface PlayerComparisonResult {
  players: Array<{
    id: string;
    name: string;
    stats: {
      raw: {
        GP: number;
        G: number;
        A: number;
        PTS: number;
        PIM: number;
        PM: number;
      };
      normalized: {
        GPG: number;  // Goals per game
        APG: number;  // Assists per game
        PPG: number;  // Points per game
        PIMPG: number; // PIM per game
      };
    };
    season?: string;
    league?: string;
    error?: string;
  }>;
  comparisonContext: {
    season?: string;
    league?: string;
    totalPlayers: number;
    successfulFetches: number;
  };
}

async function handleComparePlayers(args: {
  playerIds?: string[];
  playerNames?: string[];
  season?: string;
  league?: string;
}): Promise<string>

async function handleCompareTeams(args: {
  teamIds?: string[];
  teamNames?: string[];
  season?: string;
}): Promise<string>

async function handleCompareGoalies(args: {
  goalieIds?: string[];
  goalieNames?: string[];
  season?: string;
  league?: string;
}): Promise<string>
```

## Data Models

### Player Comparison Data Structure

```typescript
interface PlayerStats {
  id: string;
  name: string;
  position: string;
  team?: string;
  league?: string;
  season?: string;
  stats: {
    raw: {
      GP: number;
      G: number;
      A: number;
      PTS: number;
      PIM: number;
      PM: number;
      PPG?: number;
      TOI?: string;
    };
    normalized: {
      GPG: number;   // Goals per game
      APG: number;   // Assists per game
      PPG: number;   // Points per game
      PIMPG: number; // Penalty minutes per game
    };
  };
  error?: string;
}
```

### Team Comparison Data Structure

```typescript
interface TeamStats {
  id: string;
  name: string;
  league?: string;
  season?: string;
  stats: {
    raw: {
      GP: number;
      W: number;
      L: number;
      T?: number;
      OTW?: number;
      OTL?: number;
      PTS: number;
      GF: number;
      GA: number;
      GD: number;
    };
    normalized: {
      winPct: number;      // Win percentage
      pointsPct: number;   // Points percentage (PTS / (GP * 2))
      GFPerGame: number;   // Goals for per game
      GAPerGame: number;   // Goals against per game
      PPG: number;         // Points per game
    };
  };
  error?: string;
}
```

### Goalie Comparison Data Structure

```typescript
interface GoalieStats {
  id: string;
  name: string;
  team?: string;
  league?: string;
  season?: string;
  stats: {
    raw: {
      GP: number;
      W: number;
      L: number;
      GAA: number;  // Goals against average
      SVP: number;  // Save percentage
      SO: number;   // Shutouts
    };
    normalized: {
      winPct: number;      // Win percentage
      SOPerGame: number;   // Shutouts per game
    };
  };
  error?: string;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

