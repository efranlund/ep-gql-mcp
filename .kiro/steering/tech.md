# Technology Stack

## Runtime & Language

- **Node.js**: >=18.0.0
- **TypeScript**: 5.9.3 with strict mode enabled
- **Module System**: ES modules (type: "module")

## Core Dependencies

- `@modelcontextprotocol/sdk`: MCP server implementation
- `graphql-request`: GraphQL client for API calls
- `graphql`: GraphQL type definitions
- `express`: HTTP server for remote deployment

## Build System

- **tsup**: Fast TypeScript bundler for ESM output
- **tsx**: TypeScript execution and watch mode for development
- **TypeScript Compiler**: Type checking only (no emit)

## Common Commands

```bash
# Development
npm run dev              # Run with watch mode (tsx)
npm run typecheck        # Type check without building

# Building
npm run build            # Build with tsup + copy generated files
npm run copy-generated   # Copy pre-generated schema files to dist

# Production
npm start                # Run built server (node dist/index.js)

# Schema Management
npm run generate-schema  # Regenerate schema from GraphQL API
```

## Configuration

- `.env` file for environment variables (EP_GQL_URL)
- `tsconfig.json`: ES2022 target, NodeNext module resolution
- `Dockerfile`: Multi-stage build for production deployment

## Architecture Notes

- Pre-generated schema files in `src/generated/` (introspection disabled in production)
- Dual transport support: stdio (StdioServerTransport) and HTTP (StreamableHTTPServerTransport)
- Session management for HTTP mode with UUID-based session IDs
