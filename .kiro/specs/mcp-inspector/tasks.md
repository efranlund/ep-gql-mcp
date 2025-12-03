# Implementation Plan

- [ ] 1. Install MCP Inspector dependency
  - Add `@modelcontextprotocol/inspector` to devDependencies in package.json
  - Add `fast-check` for property-based testing to devDependencies
  - Run npm install to install the new packages
  - _Requirements: 8.1_

- [ ] 2. Create inspector launch script
  - Create `scripts/inspect.ts` file
  - Implement logic to resolve server path (dist/index.js)
  - Implement logic to read environment variables from .env or .env.local
  - Implement logic to construct and execute the inspector command using npx
  - Add error handling for missing build artifacts
  - Add error handling for missing inspector package
  - _Requirements: 1.1, 1.2, 7.1, 7.2, 8.1_

- [ ]* 2.1 Write unit tests for launch script
  - Test server path resolution
  - Test environment variable loading
  - Test command construction
  - Test error handling for missing files
  - _Requirements: 1.1, 7.1_

- [ ] 3. Add npm script for inspector
  - Add "inspect" script to package.json that runs `tsx scripts/inspect.ts`
  - Update package.json with proper script configuration
  - _Requirements: 8.1_

- [ ] 4. Implement argument forwarding
  - Modify launch script to accept and forward command-line arguments to MCP server
  - Parse arguments from process.argv
  - Pass arguments to the inspector command
  - _Requirements: 7.2_

- [ ]* 4.1 Write property test for argument forwarding
  - **Property 2: Argument forwarding preserves values**
  - **Validates: Requirements 7.2**
  - Generate random sets of command-line arguments
  - Verify arguments are passed to server process unchanged
  - Test with various argument types (flags, key-value pairs, paths)
  - Configure test to run minimum 100 iterations

- [ ] 5. Implement custom port configuration
  - Add support for PORT environment variable in launch script
  - Pass port configuration to inspector if specified
  - Add fallback to default port (5173) if not specified
  - _Requirements: 7.5_

- [ ]* 5.1 Write example test for custom port
  - **Property 3: Custom port configuration**
  - **Validates: Requirements 7.5**
  - Test that specifying PORT environment variable results in inspector running on that port
  - Verify default port is used when PORT is not specified

- [ ] 6. Implement process lifecycle management
  - Add signal handlers (SIGINT, SIGTERM) to launch script
  - Ensure child processes (inspector and server) are terminated when parent terminates
  - Add cleanup logic for graceful shutdown
  - _Requirements: 7.3_

- [ ]* 6.1 Write example test for process cleanup
  - **Property 4: Process cleanup on termination**
  - **Validates: Requirements 7.3**
  - Test that terminating inspector process also terminates server process
  - Verify no orphaned processes remain after termination

- [ ] 7. Update documentation
  - Add "Development Tools" section to README.md
  - Document how to run the inspector (`npm run inspect`)
  - Add troubleshooting section for common inspector issues
  - Add link to official MCP Inspector documentation
  - Update .env.example if needed
  - _Requirements: 1.1, 8.1_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 9. Create integration test for inspector launch
  - **Property 1: Inspector launches and connects**
  - **Validates: Requirements 1.1, 1.2, 7.1, 8.1**
  - Test that running `npm run inspect` starts both inspector and server
  - Verify connection is established between inspector and server
  - Verify inspector UI is accessible
  - Test that server responds to list_tools request
  - Test that server responds to list_resources request

- [ ]* 10. Manual testing checklist
  - Verify inspector launches successfully
  - Verify server information is displayed (name, version)
  - Verify all 15 tools are listed
  - Verify all 9 resources are listed
  - Test tool execution with `get_current_season`
  - Test tool with parameters using `search_entities`
  - Test resource reading with `schema://queries`
  - Test error handling with invalid tool parameters
  - Verify browser opens automatically
  - Verify process cleanup works (Ctrl+C terminates both processes)
  - _Requirements: 1.1, 1.2, 2.1, 3.3, 4.1, 4.3, 7.3_

- [ ] 11. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
