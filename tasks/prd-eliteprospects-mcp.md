# Product Requirements Document: EliteProspects GraphQL MCP

## 1. Introduction/Overview

This document outlines the requirements for building a **Model Context Protocol (MCP) server** that interfaces with the EliteProspects.com GraphQL API. The MCP will power an **"Ask what you want"** feature on eliteprospects.com, enabling users to ask natural language questions about hockey statistics, players, staff, teams, leagues, drafts, and more.

EliteProspects is a comprehensive hockey database covering professional and amateur leagues worldwide. The GraphQL API exposes **321 queries** covering every aspect of hockey data. By creating this MCP, users can ask conversational questions like "Who are the top scorers in the SHL this season?" or "What is Connor McDavid's career stats?" and receive accurate, data-driven responses.

**Problem Solved:** Users currently need to navigate multiple pages and filters to find specific hockey data. This MCP enables a conversational interface where users simply ask questions in natural language and get immediate answers.

**Key Insight:** With 321 available GraphQL queries, the MCP should NOT pre-define rigid tools for each query. Instead, it should provide **flexible, dynamic tools** that allow the AI to construct and execute any GraphQL query based on the user's question.

---

## 2. Goals

1. **Enable Natural Language Hockey Queries:** Allow users to ask any hockey-related question and receive accurate data from EliteProspects.
2. **Comprehensive Data Access:** Support queries across all major data types: players, teams, leagues, statistics, drafts, and staff.
3. **Production-Ready Service:** Build a robust, well-documented MCP suitable for production deployment.
4. **Research & Analysis Support:** Enable data analysts and researchers to query hockey data efficiently for analysis purposes.

---

## 3. User Stories

### As a hockey fan:
- I want to ask "Who won the Calder Trophy last year?" and get an accurate answer.
- I want to look up a player's career statistics by simply asking about them.
- I want to compare players' stats across different seasons or leagues.

### As a data analyst/researcher:
- I want to query specific statistical data for analysis (e.g., "Get all goalies in the NHL with a save percentage above .920").
- I want to retrieve historical draft data for trend analysis.
- I want to access team rosters and lineup information.

### As a fantasy hockey player:
- I want to look up player injury status and recent performance.
- I want to find promising prospects in junior leagues.
- I want to compare player statistics across different leagues.

### As an AI assistant user:
- I want the MCP tools to be clearly named and documented so I understand what data I can request.
- I want error messages to be helpful when a query fails or returns no results.

---

## 4. Functional Requirements

### 4.1 Core MCP Structure

1. **FR-001:** The MCP must be built using TypeScript with the `@modelcontextprotocol/sdk` package.
2. **FR-002:** The MCP must connect to the EliteProspects GraphQL API endpoint (configured via environment variable `EP_GQL_URL`).
3. **FR-003:** The MCP must expose tools that can be invoked by AI assistants to query hockey data.
4. **FR-004:** The MCP must handle GraphQL query construction and response parsing internally.

### 4.2 Core Tools (Dynamic Architecture)

Given the API has **321 queries**, the MCP should use a **dynamic tool architecture** rather than creating hundreds of rigid tools:

5. **FR-005:** **`execute_graphql`** - A flexible tool that executes any valid GraphQL query against the EliteProspects API.
   - Input: GraphQL query string, optional variables object
   - Output: Query results in JSON format
   - This is the primary workhorse tool for answering user questions

6. **FR-006:** **`introspect_schema`** - Explore the GraphQL schema to understand available queries and types.
   - Input: Optional query name or type name to focus on
   - Output: Schema information (queries, fields, arguments, types)
   - Helps the AI discover what data is available
   - **Note:** Uses pre-generated static schema data (introspection disabled in production)

7. **FR-007:** **`search_entities`** - Universal search across players, teams, leagues, staff.
   - Input: Search term, entity type (player/team/league/staff/all)
   - Output: Matching entities with IDs and basic info
   - Resolves natural language references like "McDavid" → player ID 296251

### 4.3 Convenience Tools (High-Frequency Queries)

For the most common user questions, provide optimized convenience tools:

8. **FR-008:** **`get_player`** - Get comprehensive player profile by ID or name.
   - Auto-resolves names to IDs
   - Returns bio, current team, career stats summary

9. **FR-009:** **`get_player_stats`** - Get player statistics with flexible filtering.
   - Supports: career totals, by season, by league, game logs
   - Input: player ID/name, season, league, stat type

10. **FR-010:** **`get_team`** - Get team profile including roster and basic info.

11. **FR-011:** **`get_league_standings`** - Get current standings for any league/season.

12. **FR-012:** **`get_league_leaders`** - Get scoring leaders for skaters and goalies.

13. **FR-013:** **`get_games`** - Get game schedules and results.
    - Supports: by date, by team, by league

14. **FR-014:** **`get_draft_picks`** - Query draft selections.
    - Supports: by year, by team, by player

### 4.4 Reference Data Tools

15. **FR-015:** **`list_leagues`** - Get available leagues with their slugs.
    - Essential for constructing queries (NHL slug = "nhl", SHL = "shl", etc.)

16. **FR-016:** **`list_seasons`** - Get available seasons for a league.
    - Returns season format (e.g., "2023-2024")

17. **FR-017:** **`list_draft_types`** - Get available draft types (NHL Entry Draft, etc.)

18. **FR-018:** **`get_current_season`** - Get the current active season for queries.

### 4.5 Query Capabilities

19. **FR-019:** All tools must support pagination via `limit` and `offset` parameters.
20. **FR-020:** The MCP must return data in a structured, readable format suitable for AI interpretation.
21. **FR-021:** Large responses should be truncated with a note about additional results available.

### 4.6 Error Handling

22. **FR-022:** The MCP must return clear error messages when the GraphQL API is unreachable.
23. **FR-023:** The MCP must handle and report GraphQL query errors gracefully.
24. **FR-024:** The MCP must provide helpful suggestions when a query returns no results.
25. **FR-025:** Invalid entity names should trigger a search suggestion (e.g., "Did you mean...?")

### 4.7 Configuration

26. **FR-026:** The GraphQL endpoint URL must be configurable via the `EP_GQL_URL` environment variable.
27. **FR-027:** Default endpoint: `https://dev-gql-41yd43jtq6.eliteprospects-assets.com`

---

## 5. MCP Resources (Context for AI)

In addition to tools, the MCP should expose **Resources** that provide context to help the AI understand the data domain.

**Important:** All resources are **pre-generated at build time** since GraphQL introspection is disabled in production. A manual regeneration script is provided for schema updates.

### 5.1 Schema Resources (Pre-generated)

1. **`schema://queries`** - List of all 321 available GraphQL queries with descriptions
2. **`schema://types`** - Key GraphQL types (Player, Team, League, etc.)
3. **`schema://enums`** - Enumeration values (positions, league types, player statuses, etc.)

### 5.2 Reference Resources (Pre-generated)

4. **`reference://leagues`** - Complete list of leagues with slugs
5. **`reference://countries`** - Country codes and names for nationality filters
6. **`reference://positions`** - Valid player positions (C, LW, RW, D, G, etc.)
7. **`reference://seasons`** - Format guide for season strings (e.g., "2023-2024")

### 5.3 Usage Resources (Static)

8. **`guide://common-queries`** - Examples of common queries and how to construct them
9. **`guide://hockey-terminology`** - Hockey stats abbreviations (GP, G, A, PTS, PIM, GAA, SV%, etc.)

---

## 6. Non-Goals (Out of Scope)

The following items are explicitly **not** included in this version:

1. **Response Caching:** No caching layer will be implemented; all queries go directly to the API.
2. **Rate Limiting:** No rate limiting will be implemented on the MCP side.
3. **User Authentication:** The MCP assumes open access to the GraphQL API (no auth required).
4. **Data Mutation:** The MCP is read-only; no create, update, or delete operations.
5. **Real-time Updates:** No WebSocket or subscription support for live data.
6. **Data Visualization:** The MCP returns raw data; visualization is handled by consuming applications.
7. **Multi-language Support:** Tool names and descriptions will be in English only.

---

## 7. Design Considerations

### 7.1 Tool Naming Convention

Tools should follow a consistent naming pattern:
- `search_*` - Search/filter operations returning multiple results
- `get_*` - Single entity or specific data retrieval
- `list_*` - Reference data enumeration
- `execute_graphql` - Raw query execution
- `introspect_schema` - Schema exploration

### 7.2 Response Format

All tool responses should:
- Return structured JSON data
- Include metadata (total count, pagination info) where applicable
- Provide human-readable field names
- Include entity URLs where applicable (e.g., eliteprospects.com/player/296251/connor-mcdavid)

### 7.3 Tool Descriptions

Each tool must include:
- A clear description of what it does
- Documentation of all input parameters with examples
- Example use cases in the description
- Hockey context where helpful (e.g., "GP = Games Played")

### 7.4 AI-Friendly Design

Since this powers an "Ask what you want" feature:
- Responses should be **concise but complete** - include all relevant data
- Include **context** in responses (e.g., "Connor McDavid plays for Edmonton Oilers in the NHL")
- Use **natural identifiers** in addition to IDs (team names, player names)
- Support **fuzzy matching** for entity searches (handle typos, partial names)

---

## 8. Technical Considerations

### 8.1 Dependencies

- **Runtime:** Node.js 18+
- **MCP SDK:** `@modelcontextprotocol/sdk`
- **GraphQL Client:** `graphql-request` or native `fetch`
- **Build Tool:** TypeScript with `tsup` or similar bundler

### 8.2 Project Structure

```
ep-gql-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/                # Tool implementations
│   │   ├── execute-graphql.ts    # Core flexible query tool
│   │   ├── introspect.ts         # Schema introspection (uses pre-generated data)
│   │   ├── search.ts             # Entity search
│   │   ├── players.ts            # Player convenience tools
│   │   ├── teams.ts              # Team convenience tools
│   │   ├── leagues.ts            # League convenience tools
│   │   ├── drafts.ts             # Draft convenience tools
│   │   └── reference.ts          # Reference data tools
│   ├── resources/            # MCP Resource providers
│   │   ├── schema.ts             # Schema resources (reads from generated/)
│   │   ├── reference.ts          # Reference data resources
│   │   └── guides.ts             # Usage guide resources
│   ├── generated/            # Pre-generated schema data (committed to repo)
│   │   ├── schema.json           # Full introspection result
│   │   ├── queries.json          # All 321 queries with args/types
│   │   ├── types.json            # Key types (Player, Team, etc.)
│   │   ├── enums.json            # All enum values
│   │   └── reference-data.json   # Leagues, countries, positions
│   ├── graphql/              # GraphQL utilities
│   │   ├── client.ts             # GraphQL client wrapper
│   │   └── queries/              # Pre-built query templates
│   │       ├── players.ts
│   │       ├── teams.ts
│   │       └── leagues.ts
│   └── utils/                # Shared utilities
│       ├── search.ts             # Fuzzy search helpers
│       └── formatting.ts         # Response formatting
├── scripts/
│   └── generate-schema.ts    # Schema generation script (run manually)
├── package.json
├── tsconfig.json
├── README.md
└── .env.example
```

### 8.3 Pre-generated Schema Data

**Production Constraint:** GraphQL introspection is disabled in production.

**Solution:** Pre-generate schema data at build time:

1. **Schema Generation Script** (`scripts/generate-schema.ts`)
   - Runs introspection against dev endpoint
   - Generates static JSON files with schema data
   - Output: `src/generated/schema.json`, `src/generated/queries.json`, etc.

2. **Build Process:**
   ```bash
   # Run manually when schema changes
   npm run generate-schema
   
   # Regular build (uses pre-generated files)
   npm run build
   ```

3. **Runtime Behavior:**
   - `introspect_schema` tool reads from static JSON files
   - MCP Resources serve pre-generated data
   - No runtime dependency on GraphQL introspection

4. **Schema Update Process (Manual):**
   - When EliteProspects updates the GraphQL schema
   - Run `npm run generate-schema` against dev endpoint
   - Commit the updated generated files
   - Redeploy the MCP

### 8.4 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `EP_GQL_URL` | EliteProspects GraphQL endpoint | `https://dev-gql-41yd43jtq6.eliteprospects-assets.com` |

### 8.5 Key GraphQL Queries (from API introspection)

The API exposes **321 queries**. Key ones for "Ask what you want":

| Category | Key Queries |
|----------|-------------|
| **Players** | `players`, `player`, `playerStats`, `playerAwards`, `playerContracts`, `trendingPlayers`, `comparePlayerStatistics` |
| **Teams** | `teams`, `team`, `teamRoster`, `teamStats`, `teamDepthChart`, `teamDraftSelections` |
| **Leagues** | `leagues`, `league`, `leagueStandings`, `leagueSkaterStats`, `leagueGoalieStats`, `leagueSeasons` |
| **Games** | `games`, `game`, `gameLogs`, `groupedGames`, `liveEvents` |
| **Drafts** | `draftTypes`, `draftTypeSelections`, `draftTypeDraftRankings`, `playerDraftSelections` |
| **Staff** | `staff`, `staffStats`, `staffAwards`, `teamStaff` |
| **Awards** | `awards`, `awardPlayers`, `awardStaffs` |
| **Transfers** | `transfers`, `leagueFreeAgents` |
| **Search** | `players` (with q param), `teams` (with q param) |

---

## 9. Success Metrics

1. **Query Coverage:** The `execute_graphql` tool can successfully run any of the 321 available queries.
2. **Search Accuracy:** Entity search resolves player/team names to correct IDs at least 95% of the time.
3. **Response Quality:** AI can answer common hockey questions (top scorers, player stats, standings) accurately.
4. **Latency:** Tool responses return within 2 seconds for typical queries.
5. **Error Handling:** Graceful error messages with actionable suggestions when queries fail.
6. **Documentation:** README includes setup instructions, tool documentation, and example conversations.
7. **Production Ready:** The MCP can be deployed as part of the eliteprospects.com "Ask what you want" feature.

---

## 10. Open Questions

1. ~~**Schema Details:** What specific queries and fields are available?~~ ✅ Resolved: 321 queries discovered via introspection
2. ~~**Production Introspection:** How to handle schema discovery in production?~~ ✅ Resolved: Pre-generate schema at build time, manual regeneration when needed
3. **Pagination Limits:** What are the API's pagination limits and defaults?
4. **Data Freshness:** How frequently is the EliteProspects data updated?
5. **API Stability:** Is the GraphQL schema stable, or should we plan for potential breaking changes?
6. **Query Complexity:** Are there any query depth or complexity limits on the API?
7. **Production Environment:** Will there be a separate production GraphQL endpoint?
8. **Analytics:** Should the MCP log queries for analytics/improvement purposes?

---

## 11. Implementation Notes

### Phase 1: Foundation (Week 1)
- Set up TypeScript project with MCP SDK
- **Create `generate-schema.ts` script** to introspect and save schema data
- Run schema generation to populate `src/generated/` files
- Implement `execute_graphql` core tool
- Implement `introspect_schema` tool (reads from pre-generated files)

### Phase 2: Search & Resolution (Week 1-2)
- Implement `search_entities` universal search
- Build entity name → ID resolution
- Add fuzzy matching for typos/partial names

### Phase 3: Convenience Tools (Week 2)
- Implement high-frequency tools: `get_player`, `get_player_stats`, `get_team`
- Implement `get_league_standings`, `get_league_leaders`
- Implement `get_games`, `get_draft_picks`

### Phase 4: Reference & Resources (Week 2-3)
- Implement reference tools: `list_leagues`, `list_seasons`
- Create MCP Resources for schema, guides, terminology
- Pre-populate common query templates

### Phase 5: Polish & Production (Week 3)
- Comprehensive error handling
- Response formatting optimization
- README and example documentation
- Integration testing with eliteprospects.com frontend

---

## 12. Example User Queries

The MCP should enable answering questions like:

| User Question | Tools Used |
|--------------|------------|
| "Who leads the NHL in goals this season?" | `get_league_leaders` |
| "What are Connor McDavid's career stats?" | `search_entities` → `get_player_stats` |
| "Show me the SHL standings" | `get_league_standings` |
| "Who did the Oilers draft in 2015?" | `get_draft_picks` |
| "What's the roster for Toronto Maple Leafs?" | `search_entities` → `get_team` |
| "Compare Ovechkin and Crosby career goals" | `execute_graphql` (comparePlayerStatistics) |
| "Who won the Hart Trophy in 2023?" | `execute_graphql` (awardPlayers) |
| "What games are on today in the NHL?" | `get_games` |
| "Swedish players in the AHL this season" | `execute_graphql` (playerStats with filters) |

---

*Document Version: 2.1*  
*Created: December 2, 2025*  
*Updated: December 2, 2025 - Added dynamic architecture for 321-query API*  
*Updated: December 2, 2025 - Pre-generated schema approach (introspection disabled in prod)*

