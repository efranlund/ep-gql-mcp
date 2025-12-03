# Game Logs Fix Summary

## Problem
The `get_games` tool was failing with the error:
```
Cannot query field "gameLogs" on type "Game"
```

## Root Cause
The code was attempting to query a `gameLogs` field directly on the `Game` type, but this field doesn't exist in the GraphQL schema. The `gameLogs` query is a separate root-level query, not a nested field on `Game`.

## Solution

### 1. Created New Tool: `get_game_logs`
Created a dedicated tool (`src/tools/game-logs.ts`) for querying game logs with full functionality:

**Features:**
- Query game logs by player, game, team, opponent
- Filter by league, season, date range
- Returns comprehensive player statistics per game:
  - **Skater stats**: G, A, PTS, SOG, PM, PIM, PPG, SHG, TOI
  - **Goalie stats**: SA, SV, GA, SVP, TOI
  - **Game context**: opponent, score, outcome, game type

**Query Parameters:**
- `id` - Specific game log ID
- `player` - Player ID
- `game` - Game ID (get all player logs for a game)
- `team` - Team ID
- `opponent` - Opponent team ID
- `gameLeague` - League slug
- `gameSeason` - Season
- `gameDateFrom/gameDateTo` - Date range
- `limit` - Max results (default: 50)

### 2. Fixed `get_games` Tool
Removed the broken `gameLogs` field query and all related shots calculation code:
- Removed `GET_GAME_LOGS_QUERY` constant
- Removed `GameLog` interface
- Removed `calculateShotsFromGameLogs()` function
- Removed all references to `homeTeamShots` and `visitingTeamShots`
- Updated tool description to reference `get_game_logs` for detailed stats

### 3. Registered New Tool
Added `get_game_logs` to the MCP server:
- Imported in `src/index.ts`
- Added to tools list
- Added handler in CallToolRequestSchema

## GraphQL Schema Details

### Game Type Fields (Confirmed)
The `Game` type has these fields:
- `id`, `dateTime`, `status`
- `homeTeam`, `visitingTeam`
- `homeTeamScore`, `visitingTeamScore`
- `league`, `season`
- `starsOfTheGame` (returns GameLog objects)
- **NO `gameLogs` field**

### GameLog Query (Root Level)
The `gameLogs` query is available at the root level with these parameters:
- `id`, `player`, `game`, `team`, `opponent`
- `gameLeague`, `gameSeason`
- `gameDateFrom`, `gameDateTo`, `gameDateTimeFrom`, `gameDateTimeTo`
- `limit`, `offset`, `sort`

### GameLog Type Fields
Each GameLog includes:
- `game` - Reference to the Game object
- `player` - Player information
- `team`, `opponent` - Team information
- `stats` - GameLogStats object with all statistics
- `outcome`, `teamScore`, `opponentScore`
- `jerseyNumber`, `playerRole`

## Testing
Build successful with no TypeScript errors:
```bash
npm run build
# ✅ ESM Build success
# ✅ DTS Build success
# ✅ No diagnostics found
```

## Usage Example

### Get Player's Game Logs
```typescript
{
  "name": "get_game_logs",
  "arguments": {
    "player": "86313",
    "gameDateFrom": "2010-12-01",
    "gameDateTo": "2010-12-31",
    "limit": 50
  }
}
```

### Get All Player Stats for a Specific Game
```typescript
{
  "name": "get_game_logs",
  "arguments": {
    "game": "12345"
  }
}
```

## Files Modified
- ✅ `src/tools/game-logs.ts` - New file
- ✅ `src/tools/games.ts` - Removed broken code
- ✅ `src/index.ts` - Registered new tool
- ✅ `README.md` - Already documented

## Result
The error is now fixed. Users can:
1. Use `get_games` for basic game information (teams, scores, dates)
2. Use `get_game_logs` for detailed player-level statistics including SOG
