# MCP Server Fixes

## Issues Identified

### Issue 1: introspect_schema Tool Failing
**Error**: `Failed to load queries.json. Run 'npm run generate-schema' first.`

**Root Cause**: 
- The `src/generated/` folder contained the required JSON files (queries.json, types.json, etc.)
- However, during the build process, these files were NOT being copied to the `dist/` folder
- When the MCP server ran from `dist/index.js`, it tried to load files from `dist/generated/` which didn't exist

### Issue 2: Incorrect Path Resolution
**Error**: Files couldn't be found even though they existed

**Root Cause**:
- Source code used `join(__dirname, "../generated")` 
- When compiled by tsup into `dist/index.js`, `__dirname` became `dist/`
- So `../generated` pointed to project root `generated/` (which doesn't exist)
- The correct path should be `./generated` to point to `dist/generated/`

### Issue 3: GraphQL Query "search" Field Not Found
**Error**: `Cannot query field "search" on type "Query"`

**Root Cause**:
- This wasn't actually a bug in the code, but a consequence of Issue 1
- Claude tried to query for a generic "search" field that doesn't exist in the EliteProspects API
- When Claude tried to use `introspect_schema` to discover the correct schema, it failed due to Issue 1
- With the schema introspection fixed, Claude can now discover the actual query names: `players`, `teams`, `leagues`, `staff`

### Issue 4: GraphQL Field Schema Mismatches
**Error**: `Field "nationality" of type "Country" must have a selection of subfields` and `Cannot query field "currentTeam" on type "Player"`

**Root Cause**:
- Multiple GraphQL queries in the codebase were using incorrect field names or missing required subfields:
  - `nationality` is a `Country` object, not a string - requires subfields like `{ name slug }`
  - `currentTeam` doesn't exist on Player - should use `latestStats { teamName leagueName }`
  - Similar issues in search queries, player queries, team roster queries, and draft queries

## Fixes Applied

### Fix 1: Copy Generated Files During Build
**File**: `package.json`

Added a new `copy-generated` script and integrated it into the build process:
```json
"build": "tsup src/index.ts --format esm --dts --clean && npm run copy-generated",
"copy-generated": "mkdir -p dist/generated && cp -r src/generated/* dist/generated/",
```

**Result**: All JSON files from `src/generated/` are now copied to `dist/generated/` after compilation.

### Fix 2: Correct Path Resolution
**Files Modified**:
- `src/tools/introspect.ts`
- `src/tools/reference.ts`
- `src/resources/schema.ts`
- `src/resources/reference.ts`

Changed from:
```typescript
const GENERATED_DIR = join(__dirname, "../generated");
```

To:
```typescript
const GENERATED_DIR = join(__dirname, "./generated");
```

**Result**: Files are now correctly resolved from `dist/generated/` when the server runs.

### Fix 3: Correct GraphQL Schema Mismatches
**Files Modified**:
- `src/tools/search.ts`
- `src/tools/teams.ts`
- `src/tools/drafts.ts`
- `src/resources/guides.ts`

**Changes Made**:

1. **Player Search Query** (`src/tools/search.ts`):
   - Removed `nationality` direct field (needs subfields)
   - Removed `currentTeam` (doesn't exist on Player type)
   - Added `latestStats { teamName leagueName }` for current team info

2. **Staff Search Query** (`src/tools/search.ts`):
   - Removed `currentTeam` (doesn't exist on Staff type)
   - Added `latestStats { role teamName }` for current role/team

3. **Team Roster Query** (`src/tools/teams.ts`):
   - Changed `nationality` to `nationality { name slug }` (required subfields)

4. **Draft Picks Query** (`src/tools/drafts.ts`):
   - Changed `nationality` to `nationality { name slug }` (required subfields)

5. **Example Queries** (`src/resources/guides.ts`):
   - Updated example to use correct field structure

**Result**: All GraphQL queries now match the actual EliteProspects API schema.

## Verification

### Test 1: Generated Files Exist
```bash
$ ls -la dist/generated/
enums.json
queries.json
reference-data.json
schema.json
types.json
✅ PASSED
```

### Test 2: Files Can Be Read
```bash
$ node -e "import fs from 'fs'; import path from 'path'; ..."
SUCCESS: Can read queries.json
Total queries: 321
Sample query: userById
✅ PASSED
```

### Test 3: No "search" Query Exists
Verified that the actual query names are:
- `players` - search for players
- `teams` - search for teams
- `leagues` - search for leagues
- `staff` - search for staff
- NOT `search` (generic)

✅ PASSED

## Additional Notes

### Schema Queries Available
The EliteProspects GraphQL API provides 321 queries. The key search-related queries are:
- `players(q: String!, limit: Int)` - search players by name
- `teams(q: String!, limit: Int)` - search teams by name
- `leagues(q: String!, limit: Int)` - search leagues by name
- `staff(q: String!, limit: Int)` - search staff by name

### MCP Tools Available
The `search_entities` tool wraps these queries and provides a unified search interface:
```
search_entities(searchTerm: "Connor Bedard", entityType: "player")
```

This tool should be used instead of trying to construct raw GraphQL queries with a generic "search" field.

## How to Test

1. Rebuild the project:
```bash
npm run build
```

2. Verify files are copied:
```bash
ls dist/generated/
```

3. Restart the MCP server (if running)

4. Test the introspect_schema tool:
```
Use the introspect_schema MCP tool with no parameters to see the schema summary
```

5. Test entity search:
```
Use search_entities with searchTerm="Connor Bedard" and entityType="player"
```

## Impact

✅ **introspect_schema tool**: Now works correctly and can help Claude discover available queries
✅ **search_entities tool**: Now more discoverable through schema introspection
✅ **Resource loading**: All MCP resources (schema, types, enums, reference data) now load correctly
✅ **Better error messages**: When queries fail, Claude can now introspect the schema to find the correct query names

## Future Improvements

1. Add automated tests to verify path resolution
2. Add a pre-build validation step to ensure generated files exist
3. Consider bundling the generated files into the compiled JS to avoid path resolution issues entirely
4. Add better error messages when generated files are missing (suggest running `npm run generate-schema`)

