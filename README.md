# EliteProspects GraphQL MCP

A Model Context Protocol (MCP) server that interfaces with the EliteProspects.com GraphQL API, enabling natural language queries about hockey statistics, players, teams, leagues, drafts, and more.

## Features

- **321 GraphQL Queries**: Access to all EliteProspects data via flexible `execute_graphql` tool
- **Convenience Tools**: Pre-built tools for common queries (players, teams, leagues, games, drafts)
- **Entity Search**: Universal search across players, teams, leagues, and staff
- **Schema Introspection**: Explore available queries and types (uses pre-generated schema)
- **MCP Resources**: Access to schema documentation, reference data, and usage guides

## Installation

```bash
npm install
```

## Configuration

Create a `.env` file (or use the default):

```bash
EP_GQL_URL=https://dev-gql-41yd43jtq6.eliteprospects-assets.com
```

## Development

```bash
# Build the project
npm run build

# Run in development mode (with watch)
npm run dev

# Type check
npm run typecheck

# Generate schema data (run manually when API schema changes)
npm run generate-schema
```

## Usage

### With Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "ep-gql-mcp": {
      "command": "node",
      "args": ["/path/to/ep-gql-mcp/dist/index.js"]
    }
  }
}
```

### With Cursor

Configure in Cursor's MCP settings to use this server.

## Available Tools

### Core Tools

- **`execute_graphql`** - Execute any GraphQL query against the EliteProspects API
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

- **`get_games`** - Get game schedules and results (filter by date, team, league)

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

- **`guide://common-queries`** - Examples of common GraphQL queries
- **`guide://hockey-terminology`** - Hockey stats abbreviations

## Example Queries

### Using Convenience Tools

```
"Who leads the NHL in goals this season?"
→ Use get_league_leaders with leagueSlug: "nhl"

"What are Connor McDavid's career stats?"
→ Use search_entities to find player ID, then get_player_stats

"Show me the SHL standings"
→ Use get_league_standings with leagueSlug: "shl"
```

### Using execute_graphql

```graphql
{
  player(id: 296251) {
    name
    position
    currentTeam {
      name
    }
    stats {
      edges {
        regularStats {
          gp
          g
          a
          pts
        }
      }
    }
  }
}
```

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
│   ├── index.ts              # MCP server entry point
│   ├── tools/                # Tool implementations
│   ├── resources/            # MCP Resource providers
│   ├── generated/            # Pre-generated schema data
│   ├── graphql/              # GraphQL client
│   └── utils/                # Utilities
├── scripts/
│   └── generate-schema.ts    # Schema generation script
└── package.json
```

## License

MIT

## Contributing

This is a production MCP server for EliteProspects.com. For issues or questions, please contact the EliteProspects team.

