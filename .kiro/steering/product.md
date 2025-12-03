# Product Overview

This is an MCP (Model Context Protocol) server that provides AI assistants with access to the EliteProspects.com GraphQL API for hockey data queries.

## Purpose

Enable natural language queries about hockey statistics, players, teams, leagues, drafts, and games through a standardized MCP interface.

## Key Features

- 321 GraphQL queries accessible via `execute_graphql` tool
- 13 convenience tools for common queries (players, teams, leagues, games, drafts)
- Universal entity search across players, teams, leagues, and staff
- Schema introspection with pre-generated schema data
- MCP resources for documentation, reference data, and usage guides

## Deployment Modes

- **stdio mode**: Local use with Claude Desktop, Cursor, and other MCP clients
- **HTTP mode**: Remote/cloud deployment (e.g., Fly.io) with Streamable HTTP transport

## Target Users

AI assistants (Claude, Cursor, etc.) that need to query hockey data on behalf of users.
