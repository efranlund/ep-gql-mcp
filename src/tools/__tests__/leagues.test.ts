/**
 * Unit tests for league tools
 * 
 * Note: These tests require a test framework to be installed (e.g., vitest, jest)
 * Run: npm install -D vitest @vitest/ui
 * Then: npx vitest run
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { handleGetLeagueStandings } from '../leagues.js';

describe('handleGetLeagueStandings', () => {
  it('should successfully query standings for a known league', async () => {
    const result = await handleGetLeagueStandings({
      leagueSlug: 'nhl',
    });

    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('league', 'nhl');
    expect(parsed).toHaveProperty('season');
    expect(parsed).toHaveProperty('standings');
    expect(Array.isArray(parsed.standings)).toBe(true);
  });

  it('should include all 11 stat fields in response', async () => {
    const result = await handleGetLeagueStandings({
      leagueSlug: 'nhl',
      limit: 1,
    });

    const parsed = JSON.parse(result);
    if (parsed.standings.length > 0) {
      const firstTeam = parsed.standings[0];
      expect(firstTeam).toHaveProperty('stats');
      
      const stats = firstTeam.stats;
      // Check all 11 required fields
      expect(stats).toHaveProperty('GP');
      expect(stats).toHaveProperty('W');
      expect(stats).toHaveProperty('L');
      expect(stats).toHaveProperty('T');
      expect(stats).toHaveProperty('OTW');
      expect(stats).toHaveProperty('OTL');
      expect(stats).toHaveProperty('PTS');
      expect(stats).toHaveProperty('GF');
      expect(stats).toHaveProperty('GA');
      expect(stats).toHaveProperty('GD');
      expect(stats).toHaveProperty('PPG');
    }
  });

  it('should work with optional season parameter', async () => {
    const result = await handleGetLeagueStandings({
      leagueSlug: 'nhl',
      season: '2023-2024',
    });

    const parsed = JSON.parse(result);
    expect(parsed).toHaveProperty('season', '2023-2024');
    expect(Array.isArray(parsed.standings)).toBe(true);
  });

  it('should throw error for missing leagueSlug', async () => {
    await expect(
      handleGetLeagueStandings({
        leagueSlug: '',
      })
    ).rejects.toThrow('leagueSlug is required');
  });

  it('should handle invalid league slug gracefully', async () => {
    await expect(
      handleGetLeagueStandings({
        leagueSlug: 'invalid-league-xyz',
      })
    ).rejects.toThrow('Failed to fetch league standings');
  });

  it('should respect limit parameter', async () => {
    const result = await handleGetLeagueStandings({
      leagueSlug: 'nhl',
      limit: 5,
    });

    const parsed = JSON.parse(result);
    expect(parsed.standings.length).toBeLessThanOrEqual(5);
  });
});
