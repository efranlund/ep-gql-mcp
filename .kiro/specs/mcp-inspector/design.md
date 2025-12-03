# Design Document

## Overview

The MCP Inspector is a web-based debugging tool that provides an interactive interface for testing and validating MCP server implementations. The official MCP Inspector is available as an npm package (`@modelcontextprotocol/inspector`) and provides a complete solution for connecting to MCP servers via stdio transport, displaying available tools and resources, and executing test requests.

Rather than building a custom inspector from scratch, this design integrates the official MCP Inspector package into our development workflow, making it easily accessible for developers working on the EliteProspects MCP server.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Developer Machine                     │
│                                                          │
│  ┌────────────────┐         ┌──────────────────────┐   │
│  │  npm run       │ spawns  │  MCP Inspector       │   │
│  │  inspect       │────────▶│  (Web Server)        │   │
│  │                │         │  Port: 5173          │   │
│  └────────────────┘         └──────────┬───────────┘   │
│                                        │                │
│                                        │ stdio          │
│                                        │                │
│                             ┌──────────▼───────────┐   │
│                             │  EP MCP Server       │   │
│                             │  (stdio mode)        │   │
│                             └──────────┬───────────┘   │
│                                        │                │
│                                        │ GraphQL        │
│                                        │                │
│                             ┌──────────▼───────────┐   │
│                             │  EliteProspects API  │   │
│                             └──────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Component Architecture

1. **Inspector CLI Wrapper** (`scripts/inspect.ts`)
   - Thin wrapper script that launches the official MCP Inspector
   - Passes the correct path to our MCP server
   - Handles environment variable configuration

2. **Official MCP Inspector** (npm package)
   - Provides web UI on localhost:5173
   - Manages stdio communication with MCP server
   - Handles tool execution and resource fetching
   - Displays results and errors

3. **EP MCP Server** (existing `src/index.ts`)
   - Runs in stdio mode when launched by inspector
   - Exposes all tools and resources
   - Processes requests from inspector

## Components and Interfaces

### Inspector Launch Script

**Location**: `scripts/inspect.ts`

**Purpose**: Wrapper script to launch the official MCP Inspector with our server configuration

**Interface**:
```typescript
// Command-line interface
// Usage: npm run inspect
// or: npx tsx scripts/inspect.ts

// The script will:
// 1. Ensure the server is built
// 2. Launch the MCP Inspector with correct server path
// 3. Pass environment variables (EP_GQL_URL)
```

**Implementation Approach**:
- Use `npx @modelcontextprotocol/inspector` to run the inspector
- Pass server path as argument: `dist/index.js`
- Set environment variables from `.env` or `.env.local`
- Open browser automatically to inspector URL

### Package Configuration

**Location**: `package.json`

**New Dependencies**:
```json
{
  "devDependencies": {
    "@modelcontextprotocol/inspector": "^0.1.0"
  },
  "scripts": {
    "inspect": "tsx scripts/inspect.ts"
  }
}
```

### Server Compatibility

The existing MCP server (`src/index.ts`) already supports stdio mode and is fully compatible with the MCP Inspector. No changes are required to the server implementation.

**Existing Capabilities**:
- ✅ Stdio transport support
- ✅ Tool listing and execution
- ✅ Resource listing and reading
- ✅ Proper error handling
- ✅ JSON schema validation

## Data Models

### Inspector Configuration

```typescript
interface InspectorConfig {
  serverPath: string;        // Path to built MCP server (dist/index.js)
  serverArgs?: string[];     // Optional arguments to pass to server
  env?: Record<string, string>; // Environment variables
  port?: number;             // Inspector web server port (default: 5173)
}
```

### Server Metadata (from existing server)

```typescript
interface ServerInfo {
  name: string;              // "ep-gql-mcp"
  version: string;           // "1.0.0"
  capabilities: {
    tools: {};
    resources: {};
  };
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Acceptence Criteria Testing Prework

1.1 WHEN a developer runs the inspector command THEN the system SHALL start a local web server and open the Inspector interface in the default browser
Thoughts: This is testing that running a specific command results in a web server starting and a browser opening. We can test this by running the command and checking if the expected processes are spawned and the browser is opened.
Testable: yes - example

1.2 WHEN the Inspector starts THEN the system SHALL automatically connect to the MCP server using the appropriate transport mechanism
Thoughts: This is about the inspector establishing a connection. We can test this by starting the inspector and verifying that the MCP server receives an initialize request.
Testable: yes - example

1.3 WHEN the connection is established THEN the system SHALL display the server's name, version, and available capabilities
Thoughts: This is a UI requirement about what information is displayed. The official inspector handles this, so we're testing integration rather than implementation.
Testable: no

1.4 WHEN the MCP server is not running or unreachable THEN the system SHALL display a clear error message with troubleshooting guidance
Thoughts: This is handled by the official inspector package. We're not implementing error handling ourselves.
Testable: no

1.5 WHERE the server supports stdio transport THEN the system SHALL use stdio for communication
Thoughts: This is about transport selection. The official inspector handles this automatically.
Testable: no

2.1 WHEN the Inspector connects to an MCP server THEN the system SHALL retrieve and display a list of all available tools
Thoughts: This is handled by the official inspector. We can verify our server correctly responds to list_tools requests.
Testable: yes - example

2.2 WHEN displaying tools THEN the system SHALL show the tool name, description, and input schema for each tool
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

2.3 WHEN a developer selects a tool THEN the system SHALL display detailed information including all parameters, their types, and whether they are required or optional
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

2.4 WHEN the input schema contains nested objects or arrays THEN the system SHALL display the structure in a readable hierarchical format
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

2.5 WHEN a tool has no parameters THEN the system SHALL indicate that the tool accepts no input
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

3.1 WHEN a developer selects a tool to test THEN the system SHALL provide an input form based on the tool's input schema
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

3.2 WHEN the developer provides input parameters THEN the system SHALL validate the input against the tool's schema before execution
Thoughts: This is handled by the official inspector.
Testable: no

3.3 WHEN the developer submits a tool execution request THEN the system SHALL send the request to the MCP server and display the response
Thoughts: This is about the inspector sending requests and our server responding. We can test that our server correctly handles tool execution requests.
Testable: yes - example

3.4 WHEN a tool execution succeeds THEN the system SHALL display the result in a formatted, readable manner
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

3.5 WHEN a tool execution fails THEN the system SHALL display the error message and any additional error details provided by the server
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

3.6 WHEN the developer modifies input parameters THEN the system SHALL preserve the previous execution results for comparison
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

4.1 WHEN the Inspector connects to an MCP server THEN the system SHALL retrieve and display a list of all available resources
Thoughts: This is handled by the official inspector. We can verify our server correctly responds to list_resources requests.
Testable: yes - example

4.2 WHEN displaying resources THEN the system SHALL show the resource URI, name, description, and MIME type for each resource
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

4.3 WHEN a developer selects a resource THEN the system SHALL fetch and display the resource content
Thoughts: This is handled by the official inspector. We can verify our server correctly responds to read_resource requests.
Testable: yes - example

4.4 WHEN a resource contains JSON data THEN the system SHALL format and syntax-highlight the JSON for readability
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

4.5 WHEN a resource contains text data THEN the system SHALL display the text with appropriate formatting
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

4.6 WHEN a resource fetch fails THEN the system SHALL display an error message with details about the failure
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

5.1 WHEN a developer executes a tool THEN the system SHALL add the execution to a history log
Thoughts: This is a feature of the official inspector.
Testable: no

5.2 WHEN displaying execution history THEN the system SHALL show the timestamp, tool name, input parameters, and result status for each execution
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

5.3 WHEN a developer selects a history entry THEN the system SHALL display the full details including input and output
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

5.4 WHEN the history log exceeds a certain size THEN the system SHALL maintain only the most recent executions
Thoughts: This is a feature of the official inspector.
Testable: no

5.5 WHERE the developer clears the history THEN the system SHALL remove all history entries and reset the log
Thoughts: This is a feature of the official inspector.
Testable: no

6.1 WHEN the Inspector loads THEN the system SHALL display a navigation menu with sections for Tools, Resources, and History
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

6.2 WHEN displaying data THEN the system SHALL use syntax highlighting for code and JSON content
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

6.3 WHEN displaying long content THEN the system SHALL provide scrolling within appropriate containers without affecting the overall layout
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

6.4 WHEN the developer switches between sections THEN the system SHALL preserve the state of each section
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

6.5 WHEN displaying error messages THEN the system SHALL use clear visual indicators to distinguish errors from successful results
Thoughts: This is a UI requirement handled by the official inspector.
Testable: no

7.1 WHEN a developer runs the inspector command with the server path THEN the system SHALL start both the MCP server and the Inspector interface
Thoughts: This is testing that our launch script correctly spawns both processes. We can test this by running the command and verifying both processes start.
Testable: yes - example

7.2 WHEN the developer provides command-line arguments THEN the system SHALL pass those arguments to the MCP server
Thoughts: This is about argument forwarding. We can test this by passing arguments and verifying they reach the server.
Testable: yes - property

7.3 WHEN the Inspector process terminates THEN the system SHALL also terminate the MCP server process
Thoughts: This is about process lifecycle management. We can test this by terminating the inspector and checking if the server process also terminates.
Testable: yes - example

7.4 WHEN the MCP server process crashes THEN the system SHALL detect the failure and display an error in the Inspector interface
Thoughts: This is handled by the official inspector.
Testable: no

7.5 WHERE the developer specifies a custom port THEN the system SHALL run the Inspector web server on that port
Thoughts: This is about port configuration. We can test this by specifying a custom port and verifying the inspector runs on that port.
Testable: yes - example

8.1 WHEN a developer installs the MCP Inspector package THEN the system SHALL provide an executable command for launching the Inspector
Thoughts: This is testing that after installation, the command is available. We can test this by checking if the npm script exists.
Testable: yes - example

8.2 WHEN the Inspector is launched THEN the system SHALL be compatible with the official MCP protocol specification
Thoughts: This is about protocol compatibility. The official inspector ensures this by design.
Testable: no

8.3 WHEN testing tools and resources THEN the system SHALL handle all standard MCP message types correctly
Thoughts: This is about our server's MCP compliance, which is already tested by the existing server implementation.
Testable: no

8.4 WHEN the server uses stdio transport THEN the system SHALL properly manage stdin/stdout communication
Thoughts: This is handled by the official inspector and our existing server implementation.
Testable: no

8.5 WHEN the server uses SSE transport THEN the system SHALL properly manage HTTP connections and event streams
Thoughts: This is about HTTP transport, which is not used with the inspector (inspector uses stdio only).
Testable: no

### Property Reflection

After reviewing all testable properties, most are simple examples testing that specific commands work correctly. The properties can be grouped into:

1. **Launch and Connection** (1.1, 1.2, 7.1, 8.1) - Testing that the inspector starts correctly
2. **Server Integration** (2.1, 3.3, 4.1, 4.3) - Testing that our server responds correctly to inspector requests
3. **Configuration** (7.2, 7.5) - Testing that configuration options work

Property 7.2 (argument forwarding) is the only true property that applies across multiple inputs. The rest are specific examples.

We can consolidate:
- Launch tests (1.1, 7.1, 8.1) into a single "inspector launches successfully" example
- Server integration tests (2.1, 3.3, 4.1, 4.3) are already covered by existing server tests
- Process lifecycle (7.3) is a single example

### Correctness Properties

Property 1: Inspector launches and connects
*For the specific case* where a developer runs `npm run inspect`, the system should start the inspector web server, launch the MCP server in stdio mode, and establish a connection between them.
**Validates: Requirements 1.1, 1.2, 7.1, 8.1**

Property 2: Argument forwarding preserves values
*For any* set of command-line arguments passed to the inspector script, those arguments should be forwarded to the MCP server process without modification.
**Validates: Requirements 7.2**

Property 3: Custom port configuration
*For the specific case* where a developer specifies a custom port via environment variable, the inspector should run on that port.
**Validates: Requirements 7.5**

Property 4: Process cleanup on termination
*For the specific case* where the inspector process is terminated, the MCP server process should also be terminated.
**Validates: Requirements 7.3**

## Error Handling

### Launch Errors

**Server Not Built**:
- Check if `dist/index.js` exists
- If not, display error: "Server not built. Run 'npm run build' first."
- Exit with code 1

**Inspector Package Not Installed**:
- Check if `@modelcontextprotocol/inspector` is available
- If not, display error: "Inspector not installed. Run 'npm install' first."
- Exit with code 1

**Port Already in Use**:
- If default port 5173 is in use, the inspector will automatically try alternative ports
- Display the actual port being used

### Runtime Errors

**Server Crash**:
- The official inspector will detect when the server process terminates
- Display error message in inspector UI
- Allow developer to restart

**Connection Errors**:
- The official inspector handles stdio connection errors
- Display error message with troubleshooting steps

**Tool Execution Errors**:
- Errors from tool execution are returned by our server
- The inspector displays them in the UI
- Our server already has comprehensive error handling

## Testing Strategy

### Unit Tests

Since we're integrating an existing package rather than building custom functionality, unit tests will focus on:

1. **Launch Script Validation**
   - Test that the script correctly resolves the server path
   - Test that environment variables are properly set
   - Test that the inspector command is correctly constructed

2. **Configuration Validation**
   - Test that package.json has the correct script entry
   - Test that the inspector dependency is listed

### Integration Tests

Integration tests will verify the end-to-end workflow:

1. **Inspector Launch Test**
   - Run `npm run inspect` command
   - Verify inspector process starts
   - Verify server process starts
   - Verify connection is established
   - Verify inspector UI is accessible

2. **Tool Execution Test**
   - Launch inspector
   - Execute a simple tool (e.g., `get_current_season`)
   - Verify response is displayed correctly

3. **Resource Reading Test**
   - Launch inspector
   - Read a resource (e.g., `schema://queries`)
   - Verify content is displayed correctly

### Manual Testing

Manual testing checklist:

1. ✅ Inspector launches successfully
2. ✅ Server information is displayed (name, version)
3. ✅ All 15 tools are listed
4. ✅ All 9 resources are listed
5. ✅ Tool execution works (test with `get_current_season`)
6. ✅ Tool with parameters works (test with `search_entities`)
7. ✅ Resource reading works (test with `schema://queries`)
8. ✅ Error handling works (test with invalid tool parameters)
9. ✅ Browser opens automatically
10. ✅ Process cleanup works (Ctrl+C terminates both processes)

### Property-Based Testing

We will use a property-based testing library appropriate for TypeScript/Node.js. The recommended library is **fast-check**, which is the most mature and widely-used PBT library for JavaScript/TypeScript.

**Configuration**:
- Minimum 100 iterations per property test
- Each property test must reference its design document property using the format: `**Feature: mcp-inspector, Property {number}: {property_text}**`

**Property Tests**:

1. **Argument Forwarding Property** (Property 2)
   - Generate random sets of command-line arguments
   - Verify they are passed to the server process unchanged
   - Test with various argument types (flags, key-value pairs, paths)

## Implementation Notes

### Why Use the Official Inspector?

1. **Maintained by MCP Team**: The official inspector is maintained by the Model Context Protocol team and stays up-to-date with protocol changes
2. **Feature Complete**: Includes all necessary features (tool testing, resource viewing, history, etc.)
3. **Standard Tool**: Using the standard tool ensures compatibility and familiarity for developers
4. **Less Maintenance**: No need to maintain custom UI code
5. **Quick Integration**: Can be integrated with a simple wrapper script

### Alternative Approaches Considered

1. **Custom Web UI**: Building our own inspector
   - ❌ More development time
   - ❌ More maintenance burden
   - ❌ Risk of protocol incompatibility
   - ✅ Could customize for EP-specific features

2. **CLI-based Inspector**: Text-based interface
   - ❌ Less user-friendly
   - ❌ Harder to visualize complex data
   - ✅ No browser dependency

3. **Official Inspector** (chosen approach)
   - ✅ Quick to integrate
   - ✅ Maintained by MCP team
   - ✅ Feature complete
   - ✅ Standard tool
   - ❌ Less customization

### Future Enhancements

Potential future improvements:

1. **Custom Landing Page**: Add EP-specific documentation and quick-start guides
2. **Saved Test Cases**: Save common test scenarios for quick replay
3. **Performance Metrics**: Track and display tool execution times
4. **GraphQL Query Builder**: Visual query builder for the `execute_graphql` tool
5. **Response Diff Tool**: Compare responses across different executions

## Dependencies

### New Dependencies

```json
{
  "devDependencies": {
    "@modelcontextprotocol/inspector": "^0.1.0",
    "fast-check": "^3.15.0"
  }
}
```

### Existing Dependencies (no changes)

All existing dependencies remain the same. The inspector is a development tool and doesn't affect production deployment.

## Deployment Considerations

### Development Only

The MCP Inspector is a development tool and should only be used in development environments:

- ✅ Local development
- ✅ CI/CD testing pipelines
- ❌ Production deployments
- ❌ Staging environments (unless for debugging)

### CI/CD Integration

The inspector can be used in CI/CD pipelines for automated testing:

```bash
# Example CI test script
npm run build
npm run inspect -- --headless  # If headless mode is supported
# Run automated tests against inspector API
```

### Documentation Updates

The README.md should be updated to include:

1. New "Development Tools" section
2. Instructions for running the inspector
3. Link to official MCP Inspector documentation
4. Screenshots of the inspector UI (optional)

## Security Considerations

### Local Development Only

The inspector should only be used on trusted local networks:

- Runs on localhost by default
- No authentication required (assumes trusted environment)
- Should not be exposed to public internet

### Environment Variables

The inspector script will read environment variables from `.env` or `.env.local`:

- Ensure `.env.local` is in `.gitignore`
- Don't commit sensitive API keys
- Use placeholder values in `.env.example`

### Process Isolation

The inspector spawns the MCP server as a child process:

- Server runs with same permissions as inspector
- No privilege escalation
- Clean process termination on exit
