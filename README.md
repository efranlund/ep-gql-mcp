# EliteProspects GraphQL MCP

A Model Context Protocol (MCP) server that interfaces with the EliteProspects.com GraphQL API, enabling natural language queries about hockey statistics, players, teams, leagues, drafts, and more.

**Deployed on Cloudflare Workers** for global edge performance and automatic GitHub integration.

## Features

- **321 GraphQL Queries**: Access to all EliteProspects data via flexible `execute_graphql` tool
- **15 MCP Tools**: Pre-built tools for common queries (players, teams, leagues, games, drafts, reference data)
- **13 MCP Resources**: Schema documentation, reference data, and comprehensive usage guides
- **Player-Based Game Filtering**: Query games by player ID(s) with automatic team resolution
- **Multi-Entity Filtering**: Support for multiple players and teams in game queries
- **Entity Search**: Universal search across players, teams, leagues, and staff
- **Schema Introspection**: Explore available queries and types (uses pre-generated schema)
- **Enhanced Error Messages**: Helpful suggestions for common query mistakes

## Installation

```bash
npm install
```

## Configuration

Environment variables are configured in `wrangler.toml`:

```toml
[vars]
EP_GQL_URL = "https://dev-gql-41yd43jtq6.eliteprospects-assets.com"
```

For local development, you can also use a `.env` file (automatically loaded by Wrangler).

## Development

```bash
# Run local development server (Cloudflare Workers)
npm run dev

# Type check
npm run typecheck

# Deploy to Cloudflare Workers
npm run deploy

# Generate schema data (run manually when API schema changes)
npm run generate-schema
```

## Deployment

This server runs on **Cloudflare Workers** with automatic deployment via GitHub integration.

### Local Development

```bash
npm run dev
```

This starts a local Cloudflare Workers development server at `http://localhost:8787`.

### Production Deployment

```bash
npm run deploy
```

Or configure automatic deployment via GitHub:
1. Connect your repository to Cloudflare Pages/Workers
2. Push to main branch triggers automatic deployment
3. Access your deployed server at `https://ep-gql-mcp.<your-subdomain>.workers.dev`

### Usage with MCP Clients

The server runs on Cloudflare Workers and is accessible via HTTP.

#### With Cursor

Add to your project's `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ep-gql-mcp": {
      "url": "https://ep-gql-mcp.<your-subdomain>.workers.dev/mcp"
    }
  }
}
```

#### With Claude Desktop

Claude Desktop doesn't natively support remote MCP servers yet. Use a proxy like [supergateway](https://github.com/supercorp-ai/supergateway):

```json
{
  "mcpServers": {
    "ep-gql-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "supergateway",
        "--streamableHttp",
        "https://ep-gql-mcp.<your-subdomain>.workers.dev/mcp"
      ]
    }
  }
}
```

### Endpoints

- `GET /` or `GET /health` - Health check endpoint
- `POST /mcp` - MCP protocol endpoint (Streamable HTTP transport)
- `GET /mcp` - SSE stream for server notifications
- `DELETE /mcp` - Session termination

## Available Tools

### Core Tools

- **`execute_graphql`** - Execute any GraphQL query against the EliteProspects API (with enhanced error messages that suggest using introspect_schema for field discovery)
- **`introspect_schema`** - Explore the GraphQL schema (queries, types, enums)
- **`search_entities`** - Search for players, teams, leagues, or staff by name

### Player Tools

- **`get_player`** - Get comprehensive player profile by ID or name
- **`get_player_stats`** - Get player statistics (career, by season, by league)

### Team Tools

- **`get_team`** - Get team profile including roster

### League Tools

- **`get_league_standings`** - Get current standings for any league/season
- **`get_league_leaders`** - Get scoring leaders (skaters and goalies)

### Game Tools

- **`get_games`** - Get game schedules and results (filter by player, team, date, league, season). Note: For detailed player-level statistics including shots on goal (SOG), use the get_game_logs tool instead.
- **`get_game_logs`** - Get detailed game-by-game player statistics (skater and goalie stats)

### Draft Tools

- **`get_draft_picks`** - Query draft selections (by year, team, player, round)

### Reference Tools

- **`list_leagues`** - Get available leagues with slugs
- **`list_seasons`** - Get available seasons for a league
- **`list_draft_types`** - Get available draft types
- **`get_current_season`** - Get the current active season

## MCP Resources

### Schema Resources

- **`schema://queries`** - List of all 321 available GraphQL queries
- **`schema://types`** - Key GraphQL types (Player, Team, League, etc.)
- **`schema://enums`** - All enumeration values

### Reference Resources

- **`reference://leagues`** - Complete list of leagues with slugs
- **`reference://countries`** - Country codes and names
- **`reference://positions`** - Valid player positions
- **`reference://seasons`** - Season format guide

### Usage Guides

- **`guide://common-queries`** - Examples of common GraphQL queries organized by use case (Scores, Schedules, Standings, Stats, Bios, Head-to-Head)
- **`guide://hockey-terminology`** - Hockey stats abbreviations
- **`guide://query-patterns`** - Reusable query templates with placeholders and filter options
- **`guide://anti-patterns`** - Common query mistakes and their correct alternatives
- **`guide://advanced-queries`** - Complex queries for rookies, head-to-head matchups, and advanced stats
- **`guide://field-reference`** - Field types, requirements, and critical formatting rules

## Enhanced Game Filtering

The `get_games` tool now supports advanced filtering options:

### Filter by Player(s)
- **Single player**: `playerId: "296251"` - Returns games where Connor McDavid participated
- **Multiple players**: `playerIds: ["296251", "123456"]` - Returns games where any of these players participated

### Filter by Team(s)
- **Single team**: `teamId: "52"` - Returns games for Toronto Maple Leafs
- **Multiple teams**: `teamIds: ["52", "53"]` - Returns games involving any of these teams

### Combined Filters
All filters use AND logic (except multiple players/teams which use OR within their group):
- `playerId + season + league` - Player's games in a specific season and league
- `teamIds + dateFrom + dateTo` - Multiple teams' games within a date range
- `playerIds + league` - Multiple players' games in a specific league

### Automatic Features
- **Team Resolution**: When filtering by player, the system automatically queries player stats to determine which teams they played for
- **Default Sorting**: Games are sorted by most recent first (descending date order)
- **Deduplication**: When querying multiple players/teams, duplicate games are automatically removed
- **Result Limiting**: Default limit of 50 games, applied after sorting and deduplication

### Note on Shots Data
The `get_games` tool returns basic game information (teams, scores, dates, status) but does not include shots on goal statistics. For detailed player-level statistics including shots on goal (SOG), use the `get_game_logs` tool which provides comprehensive game-by-game player performance data.

## Game Logs (Detailed Player Statistics)

The `get_game_logs` tool provides detailed game-by-game player performance data:

### Available Statistics

**Skater Stats:**
- Goals (G), Assists (A), Points (PTS)
- Shots on Goal (SOG)
- Plus/Minus (PM)
- Penalty Minutes (PIM)
- Power Play Goals (PPG), Short-Handed Goals (SHG)
- Time on Ice (TOI)

**Goalie Stats:**
- Shots Against (SA), Saves (SV)
- Goals Against (GA)
- Save Percentage (SVP)
- Time on Ice (TOI)

**Game Context:**
- Opponent, score, outcome (W/L/T)
- Game type, jersey number, player role

### Filter Options
- `player` - Player ID for specific player's game logs
- `game` - Game ID to get all player logs for a specific game
- `team` - Team ID to filter by team
- `opponent` - Opponent team ID
- `gameLeague` - League slug (e.g., "nhl", "ahl")
- `gameSeason` - Season (e.g., "2023-2024")
- `gameDateFrom/gameDateTo` - Date range (YYYY-MM-DD format)
- `limit` - Maximum number of logs (default: 50)

## Error Handling

The `execute_graphql` tool includes enhanced error messages that provide helpful guidance:

- **Field not found errors**: Suggests using `introspect_schema` to discover available queries and checking `guide://anti-patterns`
- **Rookies query**: Provides specific guidance on how to find rookie players using `leagueSkaterStats` or `leagueGoalieStats` with age/games filters, plus NHL rookie definition
- **Lowercase stat fields**: Detects lowercase stat field errors and reminds that all stat fields are UPPERCASE
- **Missing subfields**: Detects object field errors and explains subfield selection requirement
- **Schema validation**: All errors preserve the original GraphQL error message with additional context

### Common Error Patterns

1. **"Cannot query field 'playerStatRecords'"** → Use `leagueSkaterStats`, `playerStats`, or `playerStatsLeagues` instead
2. **"Cannot query field 'rookies'"** → Filter `leagueSkaterStats` by `playerAge: 25` and `regularStatsGPMax: 82`
3. **"Cannot query field 'gp'"** → Use uppercase: `GP` (same for all stat fields)
4. **"Field 'nationality' must have a selection"** → Add subfields: `nationality { name slug }`

See `guide://anti-patterns` for complete list of common mistakes and corrections.

## Enhanced Documentation

The MCP server now includes comprehensive documentation resources to help AI assistants construct correct queries:

### Common Queries Guide (`guide://common-queries`)

Organized by use case with complete working examples:
- **Scores & Results**: Recent games, game details
- **Schedules**: Games today, next game for team
- **Standings**: League standings, team records
- **Stats - League Leaders**: Points leaders, goalie leaders, rookie leaders
- **Stats - Player Career**: Career totals, season stats
- **Stats - Advanced**: Shots leaders, hits leaders, blocked shots, team statistics
- **Bios**: Player age, height, weight, nationality
- **Head-to-Head**: Last N games between teams, home/away records
- **Search**: Player and team search examples

### Query Patterns Guide (`guide://query-patterns`)

Reusable templates with placeholders:
- League Leaders Pattern (with all sort options)
- Goalie Leaders Pattern
- Head-to-Head Games Pattern
- Player Stats Pattern
- Rookie Filter Pattern
- Team Games Pattern

### Anti-Patterns Guide (`guide://anti-patterns`)

Common mistakes and corrections:
- **playerStatRecords** doesn't exist → use `leagueSkaterStats` or `playerStats`
- **rookies** doesn't exist → filter by age and games played
- **teamStats** doesn't exist → use `leagueStandings`
- **Lowercase stat fields** → ALL stat fields are UPPERCASE (GP, G, A, PTS)
- **Missing subfields** → Object fields require subfield selection

### Advanced Queries Guide (`guide://advanced-queries`)

Complex real-world examples:
- Oldest/youngest active players
- Defensemen points leaders
- Team home/away records
- Career goal leaders (active players)
- Goals per game calculations

### Field Reference Guide (`guide://field-reference`)

Complete field documentation:
- Player, Team, Game, RegularStats, PostseasonStats types
- Scalar vs object fields
- Connection types pattern
- League standings fields
- Critical formatting rules

## Example Queries

### Using Convenience Tools

```
"Who leads the NHL in points this season?"
→ Use get_league_leaders with leagueSlug: "nhl"

"What are Connor McDavid's career stats?"
→ Use search_entities to find player ID, then get_player_stats

"Show me Connor McDavid's recent games"
→ Use search_entities to find player ID, then get_games with playerId

"Show me games between Toronto and Montreal this season"
→ Use search_entities to find team IDs, then get_games with teamIds array

"Show me Connor McDavid's game-by-game stats this season"
→ Use search_entities to find player ID, then get_game_logs with player ID and season

"Show me the SHL standings"
→ Use get_league_standings with leagueSlug: "shl"

"Who are the NHL rookie points leaders?"
→ Use execute_graphql with leagueSkaterStats filtered by playerAge and regularStatsGPMax
```

### Using execute_graphql

```graphql
query GetPlayerProfile {
  player(id: "296251") {
    name
    position
    nationality { name }
    latestStats {
      teamName
      leagueName
    }
  }
}
```

**Note**: All stat field names are UPPERCASE (GP, G, A, PTS, not gp, g, a, pts). Object fields require subfield selection (e.g., `nationality { name }`, not just `nationality`).

## Schema Generation

The GraphQL schema is pre-generated at build time (introspection is disabled in production). To regenerate:

```bash
npm run generate-schema
```

This creates files in `src/generated/`:
- `schema.json` - Full introspection result
- `queries.json` - All 321 queries with arguments
- `types.json` - Key GraphQL types
- `enums.json` - All enum values
- `reference-data.json` - Leagues, countries, positions

## Project Structure

```
ep-gql-mcp/
├── src/
│   ├── index.ts              # Cloudflare Workers entry point (fetch handler)
│   ├── register-tools.ts     # Tool registration (all 15 MCP tools)
│   ├── register-resources.ts # Resource registration (all 13 MCP resources)
│   ├── tools/                # Tool implementations
│   │   ├── execute-graphql.ts
│   │   ├── introspect.ts
│   │   ├── search.ts
│   │   ├── players.ts
│   │   ├── teams.ts
│   │   ├── leagues.ts
│   │   ├── games.ts
│   │   ├── game-logs.ts      # Game-by-game player statistics
│   │   ├── drafts.ts
│   │   └── reference.ts
│   ├── resources/            # MCP Resource providers
│   │   ├── schema.ts         # Schema documentation resources
│   │   ├── reference.ts      # Reference data resources
│   │   └── guides.ts         # Usage guide resources
│   ├── generated/            # Pre-generated schema data
│   ├── graphql/              # GraphQL client
│   └── utils/                # Utilities
├── scripts/
│   └── generate-schema.ts    # Schema generation script
├── wrangler.toml             # Cloudflare Workers configuration
└── package.json
```

## Architecture

### Cloudflare Workers Runtime

This server runs on Cloudflare Workers, providing:
- **Global edge deployment**: Low latency worldwide
- **Automatic scaling**: Handles traffic spikes seamlessly
- **Zero cold starts**: Sub-10ms startup times
- **GitHub integration**: Automatic deployment on push

### Key Technical Details

- **Runtime**: Cloudflare Workers (V8 isolate, not Node.js)
- **Transport**: Streamable HTTP (MCP over HTTP with SSE)
- **Session Management**: In-memory Map (stateless, per-worker instance)
- **Environment Variables**: Configured in `wrangler.toml`
- **Build**: TypeScript compiled by Wrangler's built-in bundler
- **Tool Registration**: Modular registration via `registerTools()` function
- **Resource Registration**: Modular registration via `registerResources()` function

### Code Organization

The server uses a modular architecture:
- **`src/index.ts`**: Entry point with fetch handler and routing
- **`src/register-tools.ts`**: Centralized tool registration (15 tools)
- **`src/register-resources.ts`**: Centralized resource registration (13 resources)
- **`src/tools/*.ts`**: Individual tool implementations
- **`src/resources/*.ts`**: Resource provider functions

### Differences from Node.js

- Uses Web Standard APIs (fetch, Request, Response, crypto.randomUUID)
- No Node.js-specific modules (http, fs, path)
- No stdio transport (HTTP only)
- Environment variables accessed via `env` binding, not `process.env`

## License

MIT

## Contributing

This is a production MCP server for EliteProspects.com. For issues or questions, please contact the EliteProspects team.

