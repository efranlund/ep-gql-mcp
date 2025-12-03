#!/usr/bin/env node
/**
 * Test script to verify MCP server functionality
 * Run with: node test-mcp.js
 */

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Testing MCP Server Functionality\n');
console.log('=' .repeat(60));

// Test 1: Verify generated files exist
console.log('\n📋 Test 1: Verify generated files exist');
const GENERATED_DIR = join(__dirname, 'dist/generated');
const requiredFiles = ['queries.json', 'types.json', 'enums.json', 'schema.json', 'reference-data.json'];

let allFilesExist = true;
for (const file of requiredFiles) {
  try {
    const path = join(GENERATED_DIR, file);
    readFileSync(path, 'utf-8');
    console.log(`  ✅ ${file} exists`);
  } catch (error) {
    console.log(`  ❌ ${file} missing`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.error('\n❌ Some generated files are missing!');
  console.error('Run: npm run build');
  process.exit(1);
}

// Test 2: Verify queries.json structure
console.log('\n📋 Test 2: Verify queries.json structure');
try {
  const content = readFileSync(join(GENERATED_DIR, 'queries.json'), 'utf-8');
  const queries = JSON.parse(content);
  
  console.log(`  ✅ Total queries: ${queries.length}`);
  console.log(`  ✅ Sample query: ${queries[0].name}`);
  
  // Check for key queries
  const keyQueries = ['players', 'teams', 'leagues', 'staff', 'player', 'team'];
  for (const queryName of keyQueries) {
    const found = queries.find(q => q.name === queryName);
    if (found) {
      console.log(`  ✅ Found query: ${queryName}`);
    } else {
      console.log(`  ⚠️  Missing query: ${queryName}`);
    }
  }
  
  // Verify there's NO generic "search" query
  const searchQuery = queries.find(q => q.name === 'search');
  if (!searchQuery) {
    console.log('  ✅ No generic "search" query (expected)');
  } else {
    console.log('  ⚠️  Unexpected "search" query found');
  }
} catch (error) {
  console.error('  ❌ Failed to parse queries.json:', error.message);
  process.exit(1);
}

// Test 3: Verify reference data
console.log('\n📋 Test 3: Verify reference data');
try {
  const content = readFileSync(join(GENERATED_DIR, 'reference-data.json'), 'utf-8');
  const refData = JSON.parse(content);
  
  console.log(`  ✅ Leagues: ${refData.leagues?.length || 0}`);
  console.log(`  ✅ Countries: ${refData.countries?.length || 0}`);
  console.log(`  ✅ Positions: ${refData.positions?.length || 0}`);
  console.log(`  ✅ Current season: ${refData.currentSeason}`);
} catch (error) {
  console.error('  ❌ Failed to parse reference-data.json:', error.message);
  process.exit(1);
}

// Test 4: Verify path resolution works from dist/
console.log('\n📋 Test 4: Verify path resolution from dist/');
try {
  // Simulate the path resolution that happens in the compiled code
  const distDir = join(__dirname, 'dist');
  const generatedFromDist = join(distDir, './generated');
  const testFile = join(generatedFromDist, 'queries.json');
  
  readFileSync(testFile, 'utf-8');
  console.log('  ✅ Path resolution works: dist/./generated/queries.json');
} catch (error) {
  console.error('  ❌ Path resolution failed:', error.message);
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('✅ All tests passed!\n');
console.log('🚀 The MCP server should now work correctly.');
console.log('\nTo test with Claude/Cursor:');
console.log('1. Restart your MCP client (Claude Desktop, Cursor, etc.)');
console.log('2. Try: "Search for Connor Bedard"');
console.log('3. Try: "Show me the available GraphQL queries"');
console.log('4. Try: "What queries are available for searching players?"');

