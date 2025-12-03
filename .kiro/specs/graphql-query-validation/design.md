# Design Document

## Overview

This feature enhances the `execute_graphql` tool with better error formatting and improved documentation. The approach is minimal - we improve the user experience through clearer error messages and better tool descriptions, without adding complex validation logic. The GraphQL API itself remains the source of truth for query validation.

## Architecture

The solution follows a thin-wrapper pattern:
1. **Enhanced Tool Description**: Update the tool's description to guide AI assistants toward schema discovery and convenience tools
2. **Error Message Enhancement**: Intercept GraphQL errors and append helpful suggestions based on error patterns
3. **No Pre-Validation**: Let the GraphQL API validate queries - we only improve the error messages after the fact

This keeps the MCP server simple and maintainable while improving the developer experience.

## Components and Interfaces

### 1. Enhanced Tool Description

**Location**: `src/tools/execute-graphql.ts`

The tool description will be updated to include:
- Reference to the `introspect_schema` tool for discovering available queries
- Mention of 321 available queries in the schema
- List of convenience tools (get_player, get_team, get_league_standings, get_league_leaders, get_games, get_game_logs)
- A working example query
- Guidance on when to use convenience tools vs raw GraphQL

### 2. Error Enhancement Function

**Location**: `src/tools/execute-graphql.ts`

```typescript
function enhanceGraphQLError(originalError: string): string {
  // Extract the base error message
  let enhanced = originalError;
  
  // Pattern 1: "Cannot query field X on type Query"
  if (originalError.includes('Cannot query field') && originalError.includes('on type "Query"')) {
    enhanced += '\n\nHint: Use the introspect_schema tool to see all available queries.';
    
    // Special case: rookies
    if (originalError.toLowerCase().includes('rookies')) {
      enhanced += '\n\nNote: There is no "rookies" query. To find rookie players (under 26, <25 games in preceding season), use leagueSkaterStats or leagueGoalieStats with age/games filters, or get_league_leaders to find top performers.';
    }
  }
  
  return enhanced;
}
```

### 3. Updated Error Handling Flow

```
User submits query
    ↓
execute_graphql handler
    ↓
GraphQL API (validates and executes)
    ↓
Error returned?
    ↓ Yes
Enhance error message with hints
    ↓
Return enhanced error to user
```

## Data Models

No new data models required. We work with existing types:

```typescript
// Existing GraphQL error structure (from graphql-request)
interface GraphQLError {
  message: string;
  locations?: Array<{ line: number; column: number }>;
  path?: Array<string | number>;
}

// Our error enhancement doesn't change the structure,
// just appends helpful text to the message string
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Error message preservation
*For any* GraphQL error message, enhancing it should preserve the original error text at the beginning of the enhanced message
**Validates: Requirements 1.3, 3.3**

### Property 2: Hint appending is idempotent
*For any* error message that already contains hints, enhancing it again should not duplicate the hints
**Validates: Requirements 1.1, 3.1**

### Property 3: Non-field errors pass through
*For any* GraphQL error that is not a "Cannot query field" error, the enhancement function should return it unchanged
**Validates: Requirements 3.4**

### Property 4: Tool description completeness
*For any* tool description update, it should include all required elements: introspect_schema reference, query count, convenience tools list, and example
**Validates: Requirements 2.1, 2.2, 2.3, 2.4**

### Property 5: Rookies hint accuracy
*For any* error message containing the word "rookies", the enhanced message should include the NHL rookie definition and correct query suggestions
**Validates: Requirements 7.2, 7.3, 7.4**

## Error Handling

### GraphQL API Errors
- **Pattern**: "Cannot query field X on type Y"
- **Handling**: Append hint about introspect_schema tool
- **Special cases**: Detect "rookies" and provide specific guidance

### Network Errors
- **Pattern**: Connection failures, timeouts
- **Handling**: Already handled by graphql-request library
- **No changes needed**: Current error messages are clear

### Malformed Queries
- **Pattern**: Syntax errors in GraphQL
- **Handling**: GraphQL API returns clear syntax errors
- **No changes needed**: Pass through as-is

### Unexpected Errors
- **Pattern**: Any error during error enhancement
- **Handling**: Wrap in try-catch, return original error if enhancement fails
- **Fallback**: Always prefer showing the original error over crashing

## Testing Strategy

### Unit Tests

Unit tests will verify specific error enhancement scenarios:

1. **Test: "Cannot query field" error gets hint**
   - Input: Error with "Cannot query field" text
   - Expected: Original error + introspect_schema hint

2. **Test: "rookies" error gets special hint**
   - Input: Error mentioning "rookies"
   - Expected: Original error + rookies-specific guidance

3. **Test: Other errors pass through**
   - Input: Syntax error, network error
   - Expected: Original error unchanged

4. **Test: Tool description includes all elements**
   - Verify: introspect_schema mention, 321 queries, convenience tools, example

### Property-Based Tests

Property-based tests will verify universal behaviors across many inputs:

1. **Property Test: Error message preservation**
   - Generate: Random error messages
   - Verify: Enhanced message starts with original message

2. **Property Test: Enhancement is safe**
   - Generate: Random strings (including malformed data)
   - Verify: Enhancement never throws, always returns a string

3. **Property Test: Idempotence**
   - Generate: Random error messages
   - Verify: enhance(enhance(msg)) == enhance(msg)

### Integration Testing

Manual testing with actual GraphQL queries:
- Query non-existent field "rookies" → verify helpful error
- Query non-existent field "foobar" → verify introspect hint
- Query with syntax error → verify pass-through
- Valid query → verify no interference

## Implementation Notes

### Minimal Changes
- Only modify `src/tools/execute-graphql.ts`
- No changes to GraphQL client
- No changes to other tools
- No new dependencies

### Performance
- Error enhancement is string manipulation only
- No API calls during error handling
- Negligible performance impact

### Maintainability
- Single function for error enhancement
- Easy to add new error patterns
- Clear separation: API validates, we enhance errors

### Future Extensibility
- Can add more error patterns as needed
- Can add more sport-specific hints (e.g., "playoffs", "draft")
- Pattern matching approach scales well
