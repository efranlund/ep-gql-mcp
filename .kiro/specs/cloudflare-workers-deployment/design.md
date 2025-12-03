# Design Document: Cloudflare Workers Deployment

## Overview

This design adapts the EliteProspects GraphQL MCP server from a Node.js-based HTTP server to run on Cloudflare Workers. The primary changes involve replacing Node.js-specific APIs with Web Standard APIs, restructuring the entry point to use the Workers fetch handler pattern, and configuring the build system for Workers deployment.

The core MCP functionality (14 tools, 12 resources) remains unchanged. Only the transport layer and runtime environment are adapted.

## Architecture

### Current Architecture (Node.js)
```
src/index.ts (Node.js entry point)
  ├─ createMcpServer() → MCP Server instance
  ├─ runStdioServer() → StdioServerTransport (local use)
  └─ runHttpServer() → Node.js http.createServer + Express
       └─ StreamableHTTPServerTransport
```

### New Architecture (Cloudflare Workers)
```
src/index.ts (Workers entry point)
  └─ export default { fetch() } → Workers fetch handler
       ├─ createMcpServer() → MCP Server instance (unchanged)
       └─ StreamableHTTPServerTransport (adapted for Workers)
            ├─ Uses Web Standard Request/Response
            ├─ Session management via Workers KV or in-memory Map
            └─ CORS handling
```

### Key Architectural Changes

1. **Entry Point**: Replace `main()` function with Workers `fetch()` export
2. **HTTP Handling**: Replace Node.js `http` module with Workers `fetch` API
3. **Session Storage**: Replace in-memory Map with Workers-compatible storage
4. **Environment Variables**: Access via `env` binding instead of `process.env`
5. **Build Output**: Single bundled file instead of multiple modules

## Components and Interfaces

### 1. Workers Entry Point

**File**: `src/index.ts`

**Interface**:
```typescript
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response>
}

interface Env {
  EP_GQL_URL: string;
  // Optional: KV namespace for session storage
  SESSIONS?: KVNamespace;
}
```

**Responsibilities**:
- Route incoming requests to appropriate handlers
- Initialize MCP server on first request
- Handle /health and /mcp endpoints
- Manage CORS headers

### 2. MCP Server Factory

**Function**: `createMcpServer()`

**Status**: No changes required - already runtime-agnostic

**Responsibilities**:
- Create MCP Server instance
- Register all 14 tools
- Register all 12 resources
- Set up request handlers

### 3. Request Router

**New Component**: `handleRequest(request, env, mcpServer)`

**Interface**:
```typescript
async function handleRequest(
  request: Request,
  env: Env,
  mcpServer: Server
): Promise<Response>
```

**Responsibilities**:
- Parse request URL and method
- Route to /health or /mcp handlers
- Return 404 for unknown paths

### 4. MCP Transport Adapter

**Component**: StreamableHTTPServerTransport integration

**Adaptations Required**:
- Accept Web Standard Request objects
- Return Web Standard Response objects
- Handle session management without Node.js crypto
- Process request bodies using Request.json()

### 5. Session Manager

**Options**:

**Option A: In-Memory Map** (simpler, stateless)
- Store sessions in a Map within the Worker instance
- Sessions lost on Worker restart (acceptable for MCP)
- No additional configuration needed

**Option B: Workers KV** (persistent, more complex)
- Store sessions in Cloudflare KV
- Survives Worker restarts
- Requires KV namespace binding

**Recommendation**: Start with Option A (in-memory Map) for simplicity

## Data Models

### Request Flow

```
Client Request
  ↓
Workers fetch() handler
  ↓
Parse URL pathname
  ↓
  ├─ /health → Return status JSON
  ├─ /mcp → Route to MCP handler
  └─ /* → Return 404
  ↓
MCP Handler
  ↓
  ├─ OPTIONS → CORS preflight response
  ├─ POST → Process MCP request
  ├─ GET → SSE stream for notifications
  └─ DELETE → Close session
  ↓
StreamableHTTPServerTransport
  ↓
MCP Server (tools/resources)
  ↓
Response
```

### Environment Variables

```typescript
interface Env {
  EP_GQL_URL: string;  // GraphQL API endpoint
  // Future: Add secrets for API authentication
}
```

## Cor
rectness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, most requirements for this feature are design constraints and deployment concerns rather than runtime properties. However, we can identify a few testable properties:

Property 1: Schema files accessibility
*For any* request that needs schema data, the system should be able to access and return the generated schema files (queries.json, types.json, enums.json, reference-data.json)
**Validates: Requirements 4.4**

Property 2: Session state persistence
*For any* valid session ID, when multiple requests are made with the same session ID, the system should maintain session state across those requests
**Validates: Requirements 5.2**

Property 3: CORS headers presence
*For any* HTTP request to the /mcp endpoint, the response should include appropriate CORS headers (Access-Control-Allow-Origin, Access-Control-Allow-Headers)
**Validates: Requirements 5.3**

Property 4: Health endpoint response
When the /health endpoint is accessed, the system should return a 200 status with JSON containing status, name, version, mode, and mcp_endpoint fields
**Validates: Requirements 5.4**

Property 5: MCP endpoint routing
When the /mcp endpoint is accessed with a valid MCP request, the system should route it to the MCP handler and return a valid MCP response
**Validates: Requirements 5.5**

Property 6: Tool registration completeness
When the MCP server is initialized, it should register exactly 14 tools with the expected names
**Validates: Requirements 6.1**

Property 7: Resource registration completeness
When the MCP server is initialized, it should register exactly 12 resources with the expected URIs
**Validates: Requirements 6.2**

Property 8: Tool response format consistency
*For any* registered MCP tool, when invoked with valid arguments, the response should match the expected MCP response format (content array with type and text fields)
**Validates: Requirements 6.4**

Property 9: Resource data consistency
*For any* registered MCP resource, when requested, the returned data should match the expected schema and reference data structure
**Validates: Requirements 6.5**

## Error Handling

### Workers-Specific Error Scenarios

1. **Request Parsing Errors**
   - Invalid JSON in request body
   - Missing required headers
   - Response: 400 Bad Request with error message

2. **Session Errors**
   - Invalid or expired session ID
   - Missing session for non-init requests
   - Response: 400 Bad Request with "No session" message

3. **GraphQL API Errors**
   - Network failures to EliteProspects API
   - Invalid GraphQL queries
   - Response: Propagate error from graphql-request library

4. **Unknown Routes**
   - Requests to undefined paths
   - Response: 404 Not Found

5. **Method Not Allowed**
   - Invalid HTTP methods for endpoints
   - Response: 405 Method Not Allowed

### Error Response Format

```typescript
{
  error: string;  // Human-readable error message
  details?: unknown;  // Optional additional context
}
```

## Testing Strategy

### Unit Tests

Given that most requirements are design constraints rather than runtime properties, unit testing will focus on:

1. **Request Routing**
   - Test that /health returns correct response
   - Test that /mcp routes to MCP handler
   - Test that unknown paths return 404

2. **CORS Handling**
   - Test that OPTIONS requests return correct CORS headers
   - Test that all responses include CORS headers

3. **Session Management**
   - Test session creation on initialize
   - Test session retrieval for subsequent requests
   - Test session cleanup on DELETE

4. **MCP Integration**
   - Test that all 14 tools are registered
   - Test that all 12 resources are registered
   - Test that tool invocations return correct format

### Property-Based Tests

We will use **fast-check** (JavaScript/TypeScript property-based testing library) for property tests.

Property tests will verify:

1. **Session Persistence** (Property 2)
   - Generate random session IDs and request sequences
   - Verify session state is maintained across requests

2. **CORS Headers** (Property 3)
   - Generate random request paths and methods
   - Verify all responses include required CORS headers

3. **Tool Response Format** (Property 8)
   - Generate random tool names and valid arguments
   - Verify all responses match MCP format

4. **Resource Data Consistency** (Property 9)
   - Generate random resource URIs
   - Verify returned data structure matches expected schema

### Integration Tests

1. **Local Development**
   - Use `wrangler dev` to test locally
   - Verify all endpoints work correctly
   - Test with actual MCP client (e.g., Claude Desktop)

2. **Deployment Verification**
   - Deploy to Workers
   - Test /health endpoint
   - Test /mcp endpoint with real MCP requests
   - Verify GraphQL queries work against live API

### Manual Testing Checklist

- [ ] `wrangler dev` starts successfully
- [ ] /health endpoint returns correct JSON
- [ ] /mcp endpoint accepts MCP requests
- [ ] All 14 tools are accessible
- [ ] All 12 resources are accessible
- [ ] GraphQL queries execute successfully
- [ ] CORS headers allow cross-origin requests
- [ ] Session management works across multiple requests

## Build Configuration

### Wrangler Configuration

**File**: `wrangler.toml`

```toml
name = "ep-gql-mcp"
main = "dist/index.js"
compatibility_date = "2024-12-01"
node_compat = false

[vars]
EP_GQL_URL = "https://dev-gql-41yd43jtq6.eliteprospects-assets.com"

# Optional: KV namespace for session storage
# [[kv_namespaces]]
# binding = "SESSIONS"
# id = "your-kv-namespace-id"
```

### Build System Changes

**Current**: tsup builds to dist/ with multiple files

**New**: Bundle everything into a single file for Workers

**Options**:

1. **Continue using tsup** with `--bundle` flag
2. **Switch to esbuild** (more control over bundling)
3. **Use wrangler's built-in bundling** (simplest)

**Recommendation**: Use wrangler's built-in bundling (option 3)

### Package.json Changes

```json
{
  "scripts": {
    "dev": "wrangler dev",
    "build": "tsc --noEmit",
    "deploy": "wrangler deploy",
    "typecheck": "tsc --noEmit"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.x",
    "wrangler": "^3.x"
  }
}
```

### TypeScript Configuration

Update `tsconfig.json` for Workers:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "WebWorker"],
    "types": ["@cloudflare/workers-types"],
    "moduleResolution": "bundler",
    "resolveJsonModule": true
  }
}
```

## Deployment Process

### Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Test endpoints
curl http://localhost:8787/health
```

### Deployment

```bash
# Type check
npm run typecheck

# Deploy to Cloudflare Workers
npm run deploy
```

### Environment Variables

Set secrets using Wrangler CLI:

```bash
# Set GraphQL API URL (if not in wrangler.toml)
wrangler secret put EP_GQL_URL

# Future: Add API authentication secrets
# wrangler secret put EP_API_KEY
```

## Migration Strategy

### Phase 1: Adapt Code
1. Modify `src/index.ts` to export Workers fetch handler
2. Remove Node.js-specific imports (http, Express)
3. Update environment variable access
4. Test locally with `wrangler dev`

### Phase 2: Configuration
1. Create `wrangler.toml`
2. Update `package.json` scripts
3. Update `tsconfig.json` for Workers
4. Add `@cloudflare/workers-types`

### Phase 3: Testing
1. Run unit tests
2. Run property-based tests
3. Test locally with wrangler dev
4. Deploy to Workers preview
5. Test deployed version

### Phase 4: Documentation
1. Update README with Workers deployment instructions
2. Document wrangler commands
3. Document environment variable setup
4. Add troubleshooting guide

### Phase 5: Cleanup
1. Remove Dockerfile (no longer needed)
2. Remove fly.toml (if exists)
3. Remove Express dependency
4. Update .gitignore for Workers artifacts

## Dependencies Analysis

### Keep (Workers-Compatible)
- `@modelcontextprotocol/sdk` - Core MCP functionality
- `graphql-request` - Uses fetch API (Workers-compatible)
- `graphql` - Type definitions only

### Remove (Node.js-Specific)
- `express` - Not needed for Workers
- `@types/express` - Not needed

### Add (Workers-Specific)
- `@cloudflare/workers-types` - TypeScript types for Workers
- `wrangler` - CLI for development and deployment

## Performance Considerations

### Cold Start Optimization
- Workers have fast cold starts (~10ms)
- Bundle size should be minimized
- Consider lazy-loading large schema files if needed

### Memory Usage
- Workers have 128MB memory limit
- In-memory session storage should be acceptable
- Monitor session Map size in production

### Request Limits
- Workers have 50ms CPU time limit per request
- GraphQL queries should complete within this limit
- Consider timeout handling for slow API responses

## Security Considerations

### API Key Management
- Store EliteProspects API credentials as Wrangler secrets
- Never commit secrets to git
- Use environment-specific secrets for dev/prod

### CORS Configuration
- Currently allows all origins (`*`)
- Consider restricting to specific domains in production
- Validate Origin header if needed

### Input Validation
- Validate all MCP request parameters
- Sanitize GraphQL query inputs
- Prevent injection attacks

## Future Enhancements

1. **Workers KV for Sessions**
   - Persistent session storage
   - Survives Worker restarts
   - Enables multi-region deployment

2. **Workers Analytics**
   - Track tool usage
   - Monitor query performance
   - Identify popular queries

3. **Rate Limiting**
   - Use Workers Rate Limiting API
   - Prevent abuse
   - Protect EliteProspects API

4. **Caching**
   - Cache GraphQL responses
   - Use Workers Cache API
   - Reduce API load

5. **Multiple Regions**
   - Deploy to multiple Cloudflare regions
   - Reduce latency for global users
   - Automatic failover
