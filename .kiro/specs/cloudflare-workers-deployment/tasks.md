# Implementation Plan

- [x] 1. Set up Cloudflare Workers configuration and dependencies
  - Create wrangler.toml with worker name, compatibility date, and environment variables
  - Update package.json to add wrangler and @cloudflare/workers-types dependencies
  - Remove Express and @types/express dependencies
  - Update package.json scripts for Workers development and deployment
  - _Requirements: 2.5, 3.1, 3.2_

- [x] 2. Update TypeScript configuration for Workers runtime
  - Modify tsconfig.json to target ES2022 with WebWorker lib
  - Add @cloudflare/workers-types to types array
  - Change moduleResolution to "bundler"
  - _Requirements: 4.2_

- [x] 3. Refactor entry point for Workers fetch handler
  - Replace main() function with Workers fetch() export
  - Remove Node.js http and Express imports
  - Implement request router for /health and /mcp endpoints
  - Update environment variable access to use env binding
  - Replace crypto.randomUUID() with Web Crypto API version
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 2.4_

- [x] 4. Implement health endpoint handler
  - Create handler function that returns status JSON
  - Include server name, version, mode, and mcp_endpoint in response
  - Return 200 status code
  - _Requirements: 5.4_

- [ ]* 4.1 Write unit test for health endpoint
  - Test that /health returns 200 status
  - Test that response includes all required fields
  - _Requirements: 5.4_

- [ ]* 4.2 Write property test for health endpoint
  - **Property 4: Health endpoint response**
  - **Validates: Requirements 5.4**

- [x] 5. Implement CORS handling
  - Add CORS headers to all responses (Access-Control-Allow-Origin, Access-Control-Allow-Headers, Access-Control-Expose-Headers)
  - Handle OPTIONS preflight requests
  - Return 204 status for OPTIONS
  - _Requirements: 5.3_

- [ ]* 5.1 Write property test for CORS headers
  - **Property 3: CORS headers presence**
  - **Validates: Requirements 5.3**

- [x] 6. Adapt MCP transport for Workers
  - Integrate StreamableHTTPServerTransport with Web Standard Request/Response
  - Implement session management using in-memory Map
  - Handle POST requests for MCP operations
  - Handle GET requests for SSE streams
  - Handle DELETE requests for session cleanup
  - _Requirements: 5.1, 5.2, 5.5_

- [ ]* 6.1 Write property test for session persistence
  - **Property 2: Session state persistence**
  - **Validates: Requirements 5.2**

- [ ]* 6.2 Write unit test for MCP endpoint routing
  - Test that /mcp routes to MCP handler
  - Test that valid MCP requests are processed
  - _Requirements: 5.5_

- [ ]* 6.3 Write property test for MCP endpoint routing
  - **Property 5: MCP endpoint routing**
  - **Validates: Requirements 5.5**

- [x] 7. Verify MCP server registration
  - Ensure createMcpServer() registers all 14 tools
  - Ensure createMcpServer() registers all 12 resources
  - Test that tool and resource handlers work unchanged
  - _Requirements: 6.1, 6.2, 6.4, 6.5_

- [ ]* 7.1 Write unit test for tool registration
  - Test that exactly 14 tools are registered
  - Test that all expected tool names are present
  - _Requirements: 6.1_

- [ ]* 7.2 Write property test for tool registration
  - **Property 6: Tool registration completeness**
  - **Validates: Requirements 6.1**

- [ ]* 7.3 Write unit test for resource registration
  - Test that exactly 12 resources are registered
  - Test that all expected resource URIs are present
  - _Requirements: 6.2_

- [ ]* 7.4 Write property test for resource registration
  - **Property 7: Resource registration completeness**
  - **Validates: Requirements 6.2**

- [ ]* 7.5 Write property test for tool response format
  - **Property 8: Tool response format consistency**
  - **Validates: Requirements 6.4**

- [ ]* 7.6 Write property test for resource data consistency
  - **Property 9: Resource data consistency**
  - **Validates: Requirements 6.5**

- [x] 8. Handle schema file bundling
  - Verify that generated schema files (queries.json, types.json, enums.json, reference-data.json) are accessible at runtime
  - Test that resource handlers can read schema files
  - Ensure wrangler bundles schema files correctly
  - _Requirements: 4.1, 4.3, 4.4_

- [ ]* 8.1 Write unit test for schema file accessibility
  - Test that all schema files can be loaded
  - Test that schema data is valid JSON
  - _Requirements: 4.4_

- [ ]* 8.2 Write property test for schema file accessibility
  - **Property 1: Schema files accessibility**
  - **Validates: Requirements 4.4**

- [x] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Update documentation
  - Update README with Cloudflare Workers deployment instructions
  - Document wrangler installation and setup
  - Document required environment variables and secrets
  - Add commands for local development (wrangler dev)
  - Add commands for deployment (wrangler deploy)
  - Add instructions for testing deployed worker
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [ ] 11. Clean up obsolete files
  - Remove Dockerfile (no longer needed for Workers)
  - Remove fly.toml (if exists)
  - Update .gitignore for Workers artifacts (.wrangler/, worker-configuration.d.ts)
  - _Requirements: 2.5_

- [ ] 12. Final checkpoint - Verify deployment
  - Test locally with wrangler dev
  - Verify /health endpoint works
  - Verify /mcp endpoint accepts requests
  - Deploy to Workers and test deployed version
  - Ensure all tests pass, ask the user if questions arise.
