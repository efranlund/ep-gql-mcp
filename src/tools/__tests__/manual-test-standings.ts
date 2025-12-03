/**
 * Manual test script for league standings
 * Run with: tsx src/tools/__tests__/manual-test-standings.ts
 */

import { handleGetLeagueStandings } from '../leagues.js';

async function runTests() {
  console.log('🧪 Testing League Standings Tool\n');

  try {
    // Test 1: Basic query
    console.log('Test 1: Basic NHL standings query...');
    const result1 = await handleGetLeagueStandings({ leagueSlug: 'nhl', limit: 3 });
    const parsed1 = JSON.parse(result1);
    console.log('✅ Success! Retrieved', parsed1.standings.length, 'teams');
    
    // Verify all 11 fields are present
    if (parsed1.standings.length > 0) {
      const stats = parsed1.standings[0].stats;
      const requiredFields = ['GP', 'W', 'L', 'T', 'OTW', 'OTL', 'PTS', 'GF', 'GA', 'GD', 'PPG'];
      const missingFields = requiredFields.filter(field => !(field in stats));
      
      if (missingFields.length === 0) {
        console.log('✅ All 11 stat fields present');
      } else {
        console.log('❌ Missing fields:', missingFields);
      }
    }
    console.log();

    // Test 2: With season parameter
    console.log('Test 2: Query with season parameter...');
    const result2 = await handleGetLeagueStandings({ 
      leagueSlug: 'nhl', 
      season: '2023-2024',
      limit: 1
    });
    const parsed2 = JSON.parse(result2);
    console.log('✅ Success! Season:', parsed2.season);
    console.log();

    // Test 3: Different league
    console.log('Test 3: Query SHL standings...');
    const result3 = await handleGetLeagueStandings({ leagueSlug: 'shl', limit: 2 });
    const parsed3 = JSON.parse(result3);
    console.log('✅ Success! Retrieved', parsed3.standings.length, 'teams from SHL');
    console.log();

    // Test 4: Error handling
    console.log('Test 4: Error handling for invalid league...');
    try {
      const result = await handleGetLeagueStandings({ leagueSlug: 'invalid-league-xyz' });
      const parsed = JSON.parse(result);
      if (parsed.standings.length === 0) {
        console.log('✅ Correctly returned empty standings for invalid league');
      } else {
        console.log('❌ Should have returned empty standings');
      }
    } catch (error) {
      console.log('✅ Correctly threw error:', (error as Error).message);
    }
    console.log();

    console.log('🎉 All tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

runTests();
