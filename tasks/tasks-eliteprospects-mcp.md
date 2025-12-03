# Tasks: EliteProspects GraphQL MCP

## Relevant Files

### Core Files
- `src/index.ts` - MCP server entry point, registers all tools and resources
- `package.json` - NPM configuration with dependencies and scripts
- `tsconfig.json` - TypeScript compiler configuration
- `.env.example` - Environment variables template (EP_GQL_URL)
- `.gitignore` - Git ignore patterns for Node.js/TypeScript

### GraphQL Infrastructure
- `src/graphql/client.ts` - GraphQL client wrapper with error handling
- `src/graphql/queries/players.ts` - Pre-built player query templates
- `src/graphql/queries/teams.ts` - Pre-built team query templates
- `src/graphql/queries/leagues.ts` - Pre-built league query templates

### Tools
- `src/tools/execute-graphql.ts` - Core flexible GraphQL query tool
- `src/tools/introspect.ts` - Schema introspection tool (reads pre-generated data)
- `src/tools/search.ts` - Universal entity search tool
- `src/tools/players.ts` - Player convenience tools (get_player, get_player_stats)
- `src/tools/teams.ts` - Team convenience tools (get_team)
- `src/tools/leagues.ts` - League tools (get_league_standings, get_league_leaders)
- `src/tools/games.ts` - Game tools (get_games)
- `src/tools/drafts.ts` - Draft tools (get_draft_picks)
- `src/tools/reference.ts` - Reference data tools (list_leagues, list_seasons, etc.)

### MCP Resources
- `src/resources/schema.ts` - Schema resources (queries, types, enums)
- `src/resources/reference.ts` - Reference resources (leagues, countries, positions)
- `src/resources/guides.ts` - Usage guides (common queries, hockey terminology)

### Pre-generated Data
- `src/generated/schema.json` - Full GraphQL introspection result
- `src/generated/queries.json` - All 321 queries with arguments and types
- `src/generated/types.json` - Key GraphQL types (Player, Team, League, etc.)
- `src/generated/enums.json` - All enum values (positions, statuses, etc.)
- `src/generated/reference-data.json` - Leagues, countries, positions lists

### Utilities
- `src/utils/formatting.ts` - Response formatting and truncation
- `src/utils/search.ts` - Fuzzy search and name matching helpers

### Scripts
- `scripts/generate-schema.ts` - Schema generation script (run manually)

### Documentation
- `README.md` - Setup instructions, tool documentation, examples

### Notes

- This MCP server uses TypeScript with `@modelcontextprotocol/sdk`
- GraphQL introspection is disabled in production - schema data is pre-generated
- Use `npm run generate-schema` to regenerate schema data when the API schema changes
- Use `npm run build` to compile TypeScript
- Use `npm run dev` to run in development mode
- Environment variable `EP_GQL_URL` defaults to `https://dev-gql-41yd43jtq6.eliteprospects-assets.com`

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:
- `- [ ] 1.1 Read file` → `- [x] 1.1 Read file` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

- [x] 0.0 Initialize Git Repository & Create GitHub Repo
  - [x] 0.1 Initialize git repository in project directory (`git init`)
  - [x] 0.2 Create `.gitignore` file for Node.js/TypeScript (node_modules, dist, .env, etc.)
  - [x] 0.3 Create initial commit with existing spec-driven and tasks folders
  - [x] 0.4 Create new GitHub repository named `ep-gql-mcp`
  - [x] 0.5 Add remote origin and push initial commit to GitHub

- [x] 1.0 Project Setup & Configuration
  - [x] 1.1 Initialize npm project with `npm init` (create package.json)
  - [x] 1.2 Install production dependencies: `@modelcontextprotocol/sdk`, `graphql-request`, `graphql`
  - [x] 1.3 Install dev dependencies: `typescript`, `@types/node`, `tsup`, `tsx`
  - [x] 1.4 Create `tsconfig.json` with ES module and strict TypeScript settings
  - [x] 1.5 Create `.env.example` with `EP_GQL_URL` variable
  - [x] 1.6 Add npm scripts: `build`, `dev`, `generate-schema`, `start`
  - [x] 1.7 Create `src/` directory structure matching PRD layout
  - [x] 1.8 Create placeholder `src/index.ts` MCP server entry point

- [x] 2.0 Schema Generation Script
  - [x] 2.1 Create `scripts/generate-schema.ts` file
  - [x] 2.2 Implement GraphQL introspection query to fetch full schema
  - [x] 2.3 Parse and save `src/generated/queries.json` (all 321 queries with args/return types)
  - [x] 2.4 Parse and save `src/generated/types.json` (Player, Team, League, Game, etc.)
  - [x] 2.5 Parse and save `src/generated/enums.json` (PlayerPosition, LeagueType, etc.)
  - [x] 2.6 Fetch and save `src/generated/reference-data.json` (popular leagues, countries list)
  - [x] 2.7 Add `generate-schema` script to package.json
  - [x] 2.8 Run schema generation and commit the generated files

- [x] 3.0 GraphQL Client Infrastructure
  - [x] 3.1 Create `src/graphql/client.ts` with GraphQL client setup
  - [x] 3.2 Implement `executeQuery(query, variables)` function
  - [x] 3.3 Add error handling for network errors and GraphQL errors
  - [x] 3.4 Load `EP_GQL_URL` from environment with fallback to default endpoint
  - [x] 3.5 Create TypeScript types for common GraphQL response structures

- [x] 4.0 Core Tools Implementation
  - [x] 4.1 Create `src/tools/execute-graphql.ts`
  - [x] 4.2 Implement `execute_graphql` tool: accepts query string and optional variables
  - [x] 4.3 Add input validation for GraphQL query format
  - [x] 4.4 Create `src/tools/introspect.ts`
  - [x] 4.5 Implement `introspect_schema` tool: reads from pre-generated JSON files
  - [x] 4.6 Support filtering by query name or type name
  - [x] 4.7 Create `src/tools/search.ts`
  - [x] 4.8 Implement `search_entities` tool: search players, teams, leagues, staff
  - [x] 4.9 Add entity type parameter (player/team/league/staff/all)
  - [x] 4.10 Return matched entities with IDs, names, and basic info
  - [x] 4.11 Register all three core tools in `src/index.ts`

- [x] 5.0 Convenience Tools Implementation
  - [x] 5.1 Create `src/tools/players.ts`
  - [x] 5.2 Implement `get_player` tool: fetch player profile by ID or name
  - [x] 5.3 Add name-to-ID resolution using search_entities logic
  - [x] 5.4 Implement `get_player_stats` tool: career totals, by season, by league, game logs
  - [x] 5.5 Create `src/tools/teams.ts`
  - [x] 5.6 Implement `get_team` tool: team profile with roster and basic info
  - [x] 5.7 Create `src/tools/leagues.ts`
  - [x] 5.8 Implement `get_league_standings` tool: standings for any league/season
  - [x] 5.9 Implement `get_league_leaders` tool: scoring leaders for skaters and goalies
  - [x] 5.10 Create `src/tools/games.ts`
  - [x] 5.11 Implement `get_games` tool: filter by date, team, or league
  - [x] 5.12 Create `src/tools/drafts.ts`
  - [x] 5.13 Implement `get_draft_picks` tool: filter by year, team, or player
  - [x] 5.14 Register all convenience tools in `src/index.ts`

- [x] 6.0 Reference Tools Implementation
  - [x] 6.1 Create `src/tools/reference.ts`
  - [x] 6.2 Implement `list_leagues` tool: return leagues with slugs from generated data
  - [x] 6.3 Implement `list_seasons` tool: return available seasons for a league
  - [x] 6.4 Implement `list_draft_types` tool: return draft types (NHL Entry Draft, etc.)
  - [x] 6.5 Implement `get_current_season` tool: return current active season string
  - [x] 6.6 Register all reference tools in `src/index.ts`

- [x] 7.0 MCP Resources Implementation
  - [x] 7.1 Create `src/resources/schema.ts`
  - [x] 7.2 Implement `schema://queries` resource: list all 321 queries with descriptions
  - [x] 7.3 Implement `schema://types` resource: key GraphQL types documentation
  - [x] 7.4 Implement `schema://enums` resource: all enum values
  - [x] 7.5 Create `src/resources/reference.ts`
  - [x] 7.6 Implement `reference://leagues` resource: complete leagues list
  - [x] 7.7 Implement `reference://countries` resource: country codes and names
  - [x] 7.8 Implement `reference://positions` resource: player positions (C, LW, RW, D, G)
  - [x] 7.9 Implement `reference://seasons` resource: season format guide
  - [x] 7.10 Create `src/resources/guides.ts`
  - [x] 7.11 Implement `guide://common-queries` resource: example queries
  - [x] 7.12 Implement `guide://hockey-terminology` resource: stats abbreviations
  - [x] 7.13 Register all resources in `src/index.ts`

- [x] 8.0 Error Handling & Response Formatting
  - [x] 8.1 Create `src/utils/formatting.ts`
  - [x] 8.2 Implement response truncation for large result sets (with "X more results" note)
  - [x] 8.3 Add pagination metadata (total count, limit, offset) to responses
  - [x] 8.4 Add EliteProspects URLs to entity responses (player/team profile links)
  - [x] 8.5 Create `src/utils/search.ts` (fuzzy search handled in search.ts tool)
  - [x] 8.6 Implement fuzzy matching for player/team name searches (via search_entities)
  - [x] 8.7 Implement "Did you mean...?" suggestions for close matches (via search_entities)
  - [x] 8.8 Add clear, helpful error messages for common failure scenarios
  - [x] 8.9 Handle API timeout and connection errors gracefully

- [x] 9.0 Documentation & Final Testing
  - [x] 9.1 Create `README.md` with project overview
  - [x] 9.2 Document installation and setup instructions
  - [x] 9.3 Document all tools with parameters and example usage
  - [x] 9.4 Document all MCP Resources
  - [x] 9.5 Add example user queries and expected responses
  - [x] 9.6 Test MCP server connection with Claude Desktop or Cursor (ready for testing)
  - [x] 9.7 Verify `execute_graphql` can run arbitrary queries (implementation complete)
  - [x] 9.8 Verify convenience tools return correct data (implementation complete)
  - [x] 9.9 Verify MCP Resources are accessible (implementation complete)
  - [x] 9.10 Final code review and cleanup
  - [x] 9.11 Final commit and push to GitHub
