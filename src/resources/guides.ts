/**
 * Usage Guide Resources
 * 
 * guide://common-queries - Examples of common queries
 * guide://hockey-terminology - Hockey stats abbreviations
 */

export function getCommonQueriesGuide(): string {
  return JSON.stringify(
    {
      title: "Common GraphQL Query Examples",
      note: "Use the execute_graphql tool to run these queries. Adjust IDs, slugs, and parameters as needed. All stat field names are UPPERCASE (GP, G, A, PTS, etc.).",
      categories: {
        "Scores & Results": [
          {
            description: "Get recent games for a team (e.g., 'Did the Golden Knights win?')",
            query: `query GetRecentTeamGames {
  games(
    teamIds: ["<TEAM_ID>"],
    league: "nhl",
    limit: 5,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        id
        name
      }
      visitingTeam {
        id
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}`,
            note: "Use search_entities to find team ID first. Sort by -dateTime for most recent games first."
          },
          {
            description: "Get specific game details by ID",
            query: `query GetGameDetails {
  game(id: "<GAME_ID>") {
    id
    dateTime
    homeTeam {
      id
      name
    }
    visitingTeam {
      id
      name
    }
    homeScore
    visitingScore
    status
    league {
      name
      slug
    }
  }
}`,
            note: "Use games query to find game IDs first."
          }
        ],
        "Schedules": [
          {
            description: "Get games today/tonight for a league (e.g., 'What NHL games are there tonight?')",
            query: `query GetGamesToday {
  games(
    league: "nhl",
    gameDateFrom: "2024-12-03",
    gameDateTo: "2024-12-03",
    limit: 50,
    sort: "dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        name
      }
      visitingTeam {
        name
      }
      status
    }
  }
}`,
            note: "Use current date for gameDateFrom and gameDateTo. Adjust date format to YYYY-MM-DD."
          },
          {
            description: "Get next game for a specific team (e.g., 'When do the Sharks play next?')",
            query: `query GetNextTeamGame {
  games(
    teamIds: ["<TEAM_ID>"],
    league: "nhl",
    gameDateFrom: "2024-12-03",
    limit: 1,
    sort: "dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        name
      }
      visitingTeam {
        name
      }
      status
    }
  }
}`,
            note: "Use search_entities to find team ID. Set gameDateFrom to current date."
          }
        ],
        "Standings": [
          {
            description: "Get current league standings (e.g., 'What is the Carolina Hurricanes record?')",
            query: `query GetLeagueStandings {
  leagueStandings(
    slug: "nhl",
    season: "2024-2025",
    limit: 32
  ) {
    position
    team {
      id
      name
      slug
    }
    stats {
      GP
      W
      L
      T
      OTW
      OTL
      PTS
      GF
      GA
      GD
      PPG
    }
  }
}`,
            note: "Omit season parameter for current season. Use get_league_standings convenience tool."
          }
        ],
        "Stats - League Leaders": [
          {
            description: "Get NHL points leaders (e.g., 'Who leads the NHL in points?')",
            query: `query GetPointsLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    limit: 20,
    sort: "-regularStats.PTS"
  ) {
    edges {
      player {
        id
        name
        position
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PM
        PIM
      }
    }
  }
}`,
            note: "Use sort: '-regularStats.PTS' for descending order. Change to '-regularStats.G' for goals, '-regularStats.A' for assists."
          },
          {
            description: "Get goalie wins leaders",
            query: `query GetGoalieLeaders {
  leagueGoalieStats(
    slug: "nhl",
    season: "2024-2025",
    limit: 20,
    sort: "-regularStats.W"
  ) {
    edges {
      player {
        id
        name
      }
      team {
        name
      }
      regularStats {
        GP
        W
        L
        GAA
        SVP
        SO
      }
    }
  }
}`,
            note: "Use get_league_leaders convenience tool for both skaters and goalies."
          },
          {
            description: "Get rookie points leaders (e.g., 'rookie points leaders nhl 2024-25?')",
            query: `query GetRookieLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    playerAge: 25,
    regularStatsGPMax: 82,
    limit: 20,
    sort: "-regularStats.PTS"
  ) {
    edges {
      player {
        id
        name
        dateOfBirth
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
      }
    }
  }
}`,
            note: "Filter by playerAge < 26 and low GP to find rookies. Adjust GP threshold as needed."
          }
        ],
        "Stats - Advanced": [
          {
            description: "Get players with most shots on goal (e.g., 'nhl players shots per game leaders?')",
            query: `query GetShotsLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    limit: 20,
    sort: "-regularStats.SOG"
  ) {
    edges {
      player {
        id
        name
      }
      team {
        name
      }
      regularStats {
        GP
        G
        SOG
        PTS
      }
    }
  }
}`,
            note: "Use sort: '-regularStats.SOG' for shots on goal leaders."
          },
          {
            description: "Get players with most hits (e.g., 'nhl hits leaders 2024-2025?')",
            query: `query GetHitsLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    limit: 20,
    sort: "-regularStats.HIT"
  ) {
    edges {
      player {
        id
        name
      }
      team {
        name
      }
      regularStats {
        GP
        HIT
        PTS
      }
    }
  }
}`,
            note: "Use sort: '-regularStats.HIT' for hits leaders. Check schema for exact field name."
          },
          {
            description: "Get players with most blocked shots (e.g., 'nhl blocked shot leaders 2024-25')",
            query: `query GetBlockedShotsLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    limit: 20,
    sort: "-regularStats.BS"
  ) {
    edges {
      player {
        id
        name
      }
      team {
        name
      }
      regularStats {
        GP
        BS
        PTS
      }
    }
  }
}`,
            note: "Use sort: '-regularStats.BS' for blocked shots. Check schema for exact field name."
          },
          {
            description: "Get team statistics from standings (e.g., 'nhl team goals allowed per game this season?')",
            query: `query GetTeamStats {
  leagueStandings(
    slug: "nhl",
    season: "2024-2025",
    limit: 32
  ) {
    position
    team {
      name
    }
    stats {
      GP
      W
      L
      OTL
      PTS
      GF
      GA
      GD
      PPG
    }
  }
}`,
            note: "Calculate per-game stats by dividing by GP. GF = Goals For, GA = Goals Against, GD = Goal Differential."
          }
        ],
        "Stats - Player Career": [
          {
            description: "Get player career stats (e.g., 'What are Mario Lemieux's career stats?')",
            query: `query GetPlayerCareerStats {
  playerStats(
    player: "<PLAYER_ID>",
    limit: 100
  ) {
    edges {
      season {
        slug
      }
      league {
        name
        slug
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PIM
        PM
        PPG
        SHG
        GWG
      }
      postseasonStats {
        GP
        G
        A
        PTS
      }
    }
  }
}`,
            note: "Use search_entities or get_player to find player ID first. Use get_player_stats convenience tool."
          },
          {
            description: "Get player stats for specific season",
            query: `query GetPlayerSeasonStats {
  playerStats(
    player: "<PLAYER_ID>",
    season: "2023-2024",
    limit: 10
  ) {
    edges {
      league {
        name
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PIM
        PM
      }
    }
  }
}`,
            note: "Filter by season for specific year. Player may have stats from multiple leagues in one season."
          }
        ],
        "Bios": [
          {
            description: "Get player bio information (e.g., 'How old is Matty Beniers?', 'How tall is Wayne Gretzky?')",
            query: `query GetPlayerBio {
  player(id: "<PLAYER_ID>") {
    id
    name
    slug
    position
    dateOfBirth
    placeOfBirth
    nationality {
      name
      slug
    }
    height {
      imperial
      metrics
    }
    weight {
      imperial
      metrics
    }
    shoots
    status
    latestStats {
      teamName
      leagueName
    }
  }
}`,
            note: "Use search_entities or get_player convenience tool. Calculate age from dateOfBirth."
          }
        ],
        "Head-to-Head": [
          {
            description: "Get last 10 games between two teams (e.g., 'bruins vs senators last 10 games?')",
            query: `query GetHeadToHeadGames {
  games(
    teamIds: ["<TEAM1_ID>", "<TEAM2_ID>"],
    league: "nhl",
    limit: 10,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        id
        name
      }
      visitingTeam {
        id
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}`,
            note: "Use search_entities to find both team IDs. Filter results to calculate win/loss record."
          },
          {
            description: "Get team home/away record",
            query: `query GetTeamHomeGames {
  games(
    homeTeam: "<TEAM_ID>",
    league: "nhl",
    season: "2024-2025",
    limit: 100,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        name
      }
      visitingTeam {
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}`,
            note: "Use homeTeam filter for home games, visitingTeam for away games. Calculate record from results."
          }
        ],
        "Search": [
          {
            description: "Search for players by name",
            query: `query SearchPlayers {
  players(q: "McDavid", limit: 10) {
    edges {
      id
      name
      position
      dateOfBirth
      latestStats {
        teamName
        leagueName
      }
    }
  }
}`,
            note: "Use search_entities convenience tool instead."
          },
          {
            description: "Search for teams by name",
            query: `query SearchTeams {
  teams(q: "Maple Leafs", limit: 10) {
    edges {
      id
      name
      slug
      league {
        name
        slug
      }
      country {
        name
        slug
      }
    }
  }
}`,
            note: "Use search_entities convenience tool instead."
          }
        ]
      }
    },
    null,
    2
  );
}

export function getHockeyTerminologyGuide(): string {
  return JSON.stringify(
    {
      title: "Hockey Statistics Abbreviations",
      stats: {
        skater: {
          GP: "Games Played",
          G: "Goals",
          A: "Assists",
          PTS: "Points (Goals + Assists)",
          PIM: "Penalty Minutes",
          "+/-": "Plus/Minus",
          PPG: "Power Play Goals",
          SHG: "Short Handed Goals",
          GWG: "Game Winning Goals",
          SOG: "Shots on Goal",
          "S%": "Shooting Percentage",
        },
        goalie: {
          GP: "Games Played",
          W: "Wins",
          L: "Losses",
          OTL: "Overtime Losses",
          GAA: "Goals Against Average",
          "SV%": "Save Percentage",
          SO: "Shutouts",
          SA: "Shots Against",
          SVS: "Saves",
        },
        team: {
          GP: "Games Played",
          W: "Wins",
          L: "Losses",
          OTL: "Overtime Losses",
          PTS: "Points (2 for win, 1 for OTL)",
          GF: "Goals For",
          GA: "Goals Against",
          "GF/GP": "Goals For per Game",
          "GA/GP": "Goals Against per Game",
        },
      },
      positions: {
        C: "Center",
        LW: "Left Wing",
        RW: "Right Wing",
        D: "Defenseman",
        G: "Goalie",
        F: "Forward (generic)",
        W: "Winger (generic)",
      },
      note: "These abbreviations are used throughout the EliteProspects API responses.",
    },
    null,
    2
  );
}


export function getAntiPatternsGuide(): string {
  return JSON.stringify(
    {
      title: "Common Query Mistakes and Corrections",
      description: "This guide lists queries that DON'T exist in the schema and their correct alternatives.",
      antiPatterns: [
        {
          incorrect: "playerStatRecords",
          reason: "This query does not exist in the EliteProspects GraphQL schema",
          explanation: "There is no 'playerStatRecords' query. This is a common mistake when trying to find player statistics or league leaders.",
          correct: [
            "playerStats - for individual player statistics across seasons/leagues",
            "playerStatsLeagues - for player stats grouped by league",
            "playerStatsSeasons - for player stats grouped by season",
            "leagueSkaterStats - for league-wide skater statistics and leaders",
            "leagueGoalieStats - for league-wide goalie statistics and leaders"
          ],
          example: `To find NHL points leaders, use:
query GetPointsLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    limit: 20,
    sort: "-regularStats.PTS"
  ) {
    edges {
      player { name }
      team { name }
      regularStats { GP G A PTS }
    }
  }
}`
        },
        {
          incorrect: "rookies",
          reason: "There is no dedicated 'rookies' query in the schema",
          explanation: "To find rookie players, you must filter existing player stat queries by age and games played criteria.",
          correct: [
            "leagueSkaterStats with playerAge and regularStatsGPMax filters",
            "leagueGoalieStats with playerAge and regularStatsGPMax filters",
            "playerStats with appropriate filters"
          ],
          example: `To find rookie leaders, use:
query GetRookieLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    playerAge: 25,
    regularStatsGPMax: 82,
    limit: 20,
    sort: "-regularStats.PTS"
  ) {
    edges {
      player { name dateOfBirth }
      team { name }
      regularStats { GP G A PTS }
    }
  }
}`
        },
        {
          incorrect: "teamStats",
          reason: "There is no 'teamStats' query at the root level",
          explanation: "Team-level statistics are accessed through league standings or team-specific queries, not a dedicated teamStats query.",
          correct: [
            "leagueStandings - includes team records, goals for/against, and standings position",
            "teamSeasonComparison - for comparing team performance across seasons",
            "teamScoringLeaders - for team's top scorers"
          ],
          example: `To get team statistics, use:
query GetTeamStats {
  leagueStandings(
    slug: "nhl",
    season: "2024-2025"
  ) {
    position
    team { name }
    stats {
      GP W L OTL PTS
      GF GA GD PPG
    }
  }
}`
        },
        {
          incorrect: "Lowercase stat fields (gp, g, a, pts, pim, pm, gaa, svp)",
          reason: "All stat field names in the schema use UPPERCASE abbreviations",
          explanation: "This is a critical formatting requirement. Using lowercase stat fields will result in 'Cannot query field' errors.",
          correct: [
            "GP (not gp) - Games Played",
            "G (not g) - Goals",
            "A (not a) - Assists",
            "PTS (not pts) - Points",
            "PIM (not pim) - Penalty Minutes",
            "PM (not plusMinus or pm) - Plus/Minus",
            "GAA (not gaa) - Goals Against Average",
            "SVP (not svp or sv%) - Save Percentage",
            "SOG (not sog) - Shots on Goal",
            "TOI (not toi) - Time on Ice"
          ],
          example: `WRONG:
regularStats { gp g a pts }

CORRECT:
regularStats { GP G A PTS }`
        },
        {
          incorrect: "Missing subfields on object types",
          reason: "Object-type fields require subfield selection in GraphQL",
          explanation: "Fields like 'country', 'team', 'player', 'league', 'nationality', 'height', 'weight' are object types and cannot be queried without specifying which subfields you want.",
          correct: [
            "country { name slug } - not just 'country'",
            "team { id name } - not just 'team'",
            "player { id name } - not just 'player'",
            "nationality { name } - not just 'nationality'",
            "height { imperial metrics } - not just 'height'"
          ],
          example: `WRONG:
player(id: "123") {
  name
  nationality
  height
}

CORRECT:
player(id: "123") {
  name
  nationality { name slug }
  height { imperial metrics }
}`
        },
        {
          incorrect: "players query without edges",
          reason: "Most list queries return Connection types that require the edges pattern",
          explanation: "Queries like 'players', 'teams', 'games', 'playerStats', 'leagueSkaterStats' return Connection types, not direct arrays.",
          correct: [
            "Use 'edges { ...fields }' pattern for Connection types",
            "Some queries use 'edges { node { ...fields } }' pattern"
          ],
          example: `WRONG:
players(q: "McDavid") {
  id
  name
}

CORRECT:
players(q: "McDavid") {
  edges {
    id
    name
  }
}`
        }
      ],
      note: "Always use the introspect_schema tool or check guide://common-queries for working examples before constructing complex queries."
    },
    null,
    2
  );
}

export function getQueryPatternsGuide(): string {
  return JSON.stringify(
    {
      title: "Query Pattern Templates",
      description: "Reusable query templates with placeholders. Replace <PLACEHOLDERS> with actual values.",
      patterns: [
        {
          name: "League Leaders Pattern",
          description: "Get top players in a league sorted by any stat",
          template: `query GetLeagueLeaders {
  leagueSkaterStats(
    slug: "<LEAGUE_SLUG>",
    season: "<SEASON>",
    limit: <NUMBER>,
    sort: "<SORT_FIELD>"
  ) {
    edges {
      player {
        id
        name
        position
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PM
        PIM
        PPG
        SHG
        GWG
        SOG
      }
    }
  }
}`,
          placeholders: {
            LEAGUE_SLUG: "League identifier (e.g., 'nhl', 'ahl', 'shl', 'khl')",
            SEASON: "Season string (e.g., '2024-2025') or omit for current season",
            NUMBER: "Number of results to return (e.g., 10, 20, 50)",
            SORT_FIELD: "Field to sort by (see available options below)"
          },
          availableSortOptions: [
            "-regularStats.PTS - Points (descending)",
            "-regularStats.G - Goals (descending)",
            "-regularStats.A - Assists (descending)",
            "-regularStats.PM - Plus/Minus (descending)",
            "-regularStats.PPG - Power Play Goals (descending)",
            "-regularStats.SOG - Shots on Goal (descending)",
            "regularStats.PTS - Points (ascending)"
          ],
          note: "Use negative sign (-) for descending order. All stat fields are UPPERCASE."
        },
        {
          name: "Goalie Leaders Pattern",
          description: "Get top goalies in a league",
          template: `query GetGoalieLeaders {
  leagueGoalieStats(
    slug: "<LEAGUE_SLUG>",
    season: "<SEASON>",
    limit: <NUMBER>,
    sort: "<SORT_FIELD>"
  ) {
    edges {
      player {
        id
        name
      }
      team {
        name
      }
      regularStats {
        GP
        W
        L
        GAA
        SVP
        SO
        SA
        SVS
      }
    }
  }
}`,
          placeholders: {
            LEAGUE_SLUG: "League identifier (e.g., 'nhl', 'ahl')",
            SEASON: "Season string or omit for current",
            NUMBER: "Number of results",
            SORT_FIELD: "Field to sort by"
          },
          availableSortOptions: [
            "-regularStats.W - Wins (descending)",
            "-regularStats.SO - Shutouts (descending)",
            "regularStats.GAA - Goals Against Average (ascending = better)",
            "-regularStats.SVP - Save Percentage (descending)"
          ]
        },
        {
          name: "Head-to-Head Games Pattern",
          description: "Get games between two specific teams",
          template: `query GetHeadToHeadGames {
  games(
    teamIds: ["<TEAM1_ID>", "<TEAM2_ID>"],
    league: "<LEAGUE_SLUG>",
    season: "<SEASON>",
    limit: <NUMBER>,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        id
        name
      }
      visitingTeam {
        id
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}`,
          placeholders: {
            TEAM1_ID: "First team ID (use search_entities to find)",
            TEAM2_ID: "Second team ID (use search_entities to find)",
            LEAGUE_SLUG: "League identifier (optional filter)",
            SEASON: "Season string (optional filter)",
            NUMBER: "Number of games to return (e.g., 10 for last 10 games)"
          },
          availableFilters: [
            "teamIds - Array of team IDs (returns games with ANY of these teams)",
            "homeTeam - Filter for home games only",
            "visitingTeam - Filter for away games only",
            "league - Filter by league slug",
            "season - Filter by season",
            "gameDateFrom - Start date (YYYY-MM-DD)",
            "gameDateTo - End date (YYYY-MM-DD)",
            "sort - Sort order ('-dateTime' for most recent first)"
          ],
          note: "Use sort: '-dateTime' for most recent games first. Calculate win/loss record from results."
        },
        {
          name: "Player Stats Pattern",
          description: "Get player statistics with optional filters",
          template: `query GetPlayerStats {
  playerStats(
    player: "<PLAYER_ID>",
    season: "<SEASON>",
    league: "<LEAGUE_SLUG>",
    limit: <NUMBER>
  ) {
    edges {
      season {
        slug
      }
      league {
        name
        slug
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PIM
        PM
        PPG
        SHG
        GWG
        SOG
        TOI
      }
      postseasonStats {
        GP
        G
        A
        PTS
      }
    }
  }
}`,
          placeholders: {
            PLAYER_ID: "Player ID (use search_entities or get_player to find)",
            SEASON: "Optional: Filter by season (e.g., '2023-2024')",
            LEAGUE_SLUG: "Optional: Filter by league (e.g., 'nhl')",
            NUMBER: "Number of records to return"
          },
          availableFilters: [
            "player - Player ID (required)",
            "season - Filter by specific season",
            "league - Filter by league slug",
            "limit - Maximum number of records"
          ],
          note: "Omit season and league for career totals. Player may have multiple entries per season if they played in multiple leagues."
        },
        {
          name: "Rookie Filter Pattern",
          description: "Filter players by age and experience for rookie queries",
          template: `query GetRookies {
  leagueSkaterStats(
    slug: "<LEAGUE_SLUG>",
    season: "<SEASON>",
    playerAge: <MAX_AGE>,
    regularStatsGPMax: <MAX_GAMES>,
    limit: <NUMBER>,
    sort: "<SORT_FIELD>"
  ) {
    edges {
      player {
        id
        name
        dateOfBirth
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
      }
    }
  }
}`,
          placeholders: {
            LEAGUE_SLUG: "League identifier",
            SEASON: "Season string",
            MAX_AGE: "Maximum age (e.g., 25 for under 26)",
            MAX_GAMES: "Maximum career games (e.g., 82 for first/second year)",
            NUMBER: "Number of results",
            SORT_FIELD: "Sort field (e.g., '-regularStats.PTS')"
          },
          availableFilters: [
            "playerAge - Maximum age (under this value)",
            "regularStatsGPMax - Maximum games played",
            "regularStatsGPMin - Minimum games played",
            "playerStatus - Filter by status (e.g., 'ACTIVE')"
          ],
          note: "Typical rookie criteria: age < 26 and GP < 82. Adjust based on league and definition."
        },
        {
          name: "Team Games Pattern",
          description: "Get games for a specific team",
          template: `query GetTeamGames {
  games(
    teamIds: ["<TEAM_ID>"],
    league: "<LEAGUE_SLUG>",
    season: "<SEASON>",
    gameDateFrom: "<START_DATE>",
    gameDateTo: "<END_DATE>",
    limit: <NUMBER>,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        name
      }
      visitingTeam {
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}`,
          placeholders: {
            TEAM_ID: "Team ID (use search_entities to find)",
            LEAGUE_SLUG: "Optional: League filter",
            SEASON: "Optional: Season filter",
            START_DATE: "Optional: Start date (YYYY-MM-DD)",
            END_DATE: "Optional: End date (YYYY-MM-DD)",
            NUMBER: "Number of games to return"
          },
          availableFilters: [
            "teamIds - Array of team IDs",
            "homeTeam - Filter for home games only",
            "visitingTeam - Filter for away games only",
            "league - League slug",
            "season - Season string",
            "gameDateFrom - Start date",
            "gameDateTo - End date",
            "sort - Sort order"
          ],
          note: "Use homeTeam or visitingTeam filters for home/away splits. Default sort is most recent first."
        }
      ],
      generalNotes: [
        "All stat field names are UPPERCASE (GP, G, A, PTS, etc.)",
        "Object fields require subfield selection (e.g., team { name })",
        "Most list queries return Connection types with 'edges' pattern",
        "Use negative sign (-) in sort for descending order",
        "Use search_entities tool to find team and player IDs",
        "Omit optional filters to get broader results"
      ]
    },
    null,
    2
  );
}

export function getAdvancedQueriesGuide(): string {
  return JSON.stringify(
    {
      title: "Advanced Query Examples",
      description: "Complex real-world queries combining multiple filters and advanced use cases.",
      examples: [
        {
          name: "Oldest Active NHL Players",
          description: "Find the oldest players currently active in the NHL",
          useCase: "Answers questions like 'oldest active nhl players 2025?'",
          query: `query GetOldestActivePlayers {
  players(
    playerStatus: "ACTIVE",
    league: "nhl",
    sort: "dateOfBirth",
    limit: 20
  ) {
    edges {
      id
      name
      dateOfBirth
      position
      nationality {
        name
      }
      latestStats {
        teamName
        leagueName
      }
    }
  }
}`,
          note: "Sort by dateOfBirth ascending for oldest first. Change to '-dateOfBirth' for youngest first."
        },
        {
          name: "Youngest Active NHL Players",
          description: "Find the youngest players currently active in the NHL",
          useCase: "Answers questions like 'youngest active nhl players 24-25'",
          query: `query GetYoungestActivePlayers {
  players(
    playerStatus: "ACTIVE",
    league: "nhl",
    sort: "-dateOfBirth",
    limit: 20
  ) {
    edges {
      id
      name
      dateOfBirth
      position
      latestStats {
        teamName
      }
    }
  }
}`,
          note: "Sort by -dateOfBirth for youngest first (most recent birth dates)."
        },
        {
          name: "NHL Defensemen Points Leaders",
          description: "Get top-scoring defensemen in the NHL",
          useCase: "Answers questions like 'nhl defensemen points leaders this season'",
          query: `query GetDefensemenLeaders {
  leagueSkaterStats(
    slug: "nhl",
    season: "2024-2025",
    playerPosition: "D",
    limit: 20,
    sort: "-regularStats.PTS"
  ) {
    edges {
      player {
        id
        name
        position
      }
      team {
        name
      }
      regularStats {
        GP
        G
        A
        PTS
        PM
      }
    }
  }
}`,
          note: "Filter by playerPosition: 'D' for defensemen, 'C' for centers, 'LW'/'RW' for wingers, 'G' for goalies."
        },
        {
          name: "Team Home Record",
          description: "Calculate a team's home win/loss record",
          useCase: "Answers questions like 'ny rangers home record?' or 'new york rangers home away record'",
          query: `query GetTeamHomeRecord {
  games(
    homeTeam: "<TEAM_ID>",
    league: "nhl",
    season: "2024-2025",
    limit: 100,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        name
      }
      visitingTeam {
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}`,
          note: "Calculate record by counting games where homeScore > visitingScore (wins), < (losses), = (ties). Use visitingTeam filter for away record."
        },
        {
          name: "Last 5 Games Between Teams",
          description: "Get recent matchup history between two teams",
          useCase: "Answers questions like 'sabres vs hurricanes record in last 5 games'",
          query: `query GetRecentMatchups {
  games(
    teamIds: ["<TEAM1_ID>", "<TEAM2_ID>"],
    league: "nhl",
    limit: 5,
    sort: "-dateTime"
  ) {
    edges {
      id
      dateTime
      homeTeam {
        id
        name
      }
      visitingTeam {
        id
        name
      }
      homeScore
      visitingScore
      status
    }
  }
}`,
          note: "Calculate win/loss for each team by comparing scores. Identify which team won each game."
        },
        {
          name: "All Active NHL Goalies by Height",
          description: "Get all active goalies sorted by height",
          useCase: "Answers questions like 'every active nhl goalie by height'",
          query: `query GetGoaliesByHeight {
  players(
    playerStatus: "ACTIVE",
    playerPosition: "G",
    league: "nhl",
    sort: "-height.metrics",
    limit: 100
  ) {
    edges {
      id
      name
      height {
        imperial
        metrics
      }
      latestStats {
        teamName
      }
    }
  }
}`,
          note: "Sort by height.metrics for metric height, height.imperial for imperial. Use negative sign for tallest first."
        },
        {
          name: "NHL Career Goal Leaders (Active Players)",
          description: "Get active players with most career goals",
          useCase: "Answers questions like 'nhl career goal leaders by active players'",
          query: `query GetCareerGoalLeaders {
  playerStatsAllTimeLeague(
    league: "nhl",
    playerStatus: "ACTIVE",
    limit: 50,
    sort: "-totalStats.G"
  ) {
    edges {
      player {
        id
        name
        position
      }
      totalStats {
        GP
        G
        A
        PTS
      }
    }
  }
}`,
          note: "Use playerStatsAllTimeLeague for career totals. Filter by playerStatus: 'ACTIVE' for current players only."
        },
        {
          name: "Team Goals Per Game Leaders",
          description: "Calculate which teams score the most per game",
          useCase: "Answers questions like 'nhl teams with most goals in the first period' or 'nhl team goals allowed per game this season'",
          query: `query GetTeamScoringRates {
  leagueStandings(
    slug: "nhl",
    season: "2024-2025",
    sort: "-stats.GF",
    limit: 32
  ) {
    position
    team {
      name
    }
    stats {
      GP
      GF
      GA
      GD
      PTS
    }
  }
}`,
          note: "Calculate per-game rates by dividing GF or GA by GP. GF = Goals For, GA = Goals Against."
        }
      ],
      tips: [
        "Use search_entities tool to find team and player IDs before running these queries",
        "Calculate records and rates from raw game data - the API doesn't always provide pre-calculated stats",
        "Combine filters to narrow results (e.g., playerPosition + playerStatus + league)",
        "Use sort with negative sign (-) for descending order",
        "Check guide://query-patterns for reusable templates",
        "All stat fields are UPPERCASE"
      ]
    },
    null,
    2
  );
}

export function getFieldReferenceGuide(): string {
  return JSON.stringify(
    {
      title: "Field Reference Guide",
      description: "Documentation of commonly used fields and their types. Object fields MUST have subfield selections.",
      types: {
        Player: {
          description: "Player type represents a hockey player",
          scalarFields: [
            "id - Unique player identifier",
            "name - Player's full name",
            "slug - URL-friendly identifier",
            "position - Player position (C, LW, RW, D, G)",
            "dateOfBirth - Birth date (YYYY-MM-DD)",
            "placeOfBirth - Birth location",
            "shoots - Shooting hand (L, R)",
            "status - Player status (ACTIVE, RETIRED, etc.)"
          ],
          objectFields: {
            nationality: "Country type - REQUIRES subfields like { name slug }",
            secondaryNationality: "Country type - REQUIRES subfields like { name slug }",
            height: "Height type - REQUIRES subfields like { imperial metrics }",
            weight: "Weight type - REQUIRES subfields like { imperial metrics }",
            latestStats: "LatestStats type - REQUIRES subfields like { teamName leagueName }"
          },
          example: `player(id: "123") {
  id
  name
  position
  dateOfBirth
  nationality { name slug }
  height { imperial metrics }
  latestStats { teamName leagueName }
}`
        },
        Team: {
          description: "Team type represents a hockey team",
          scalarFields: [
            "id - Unique team identifier",
            "name - Team name",
            "slug - URL-friendly identifier"
          ],
          objectFields: {
            country: "Country type - REQUIRES subfields like { name slug }",
            league: "League type - REQUIRES subfields like { name slug }"
          },
          example: `team(id: "456") {
  id
  name
  slug
  country { name slug }
  league { name slug }
}`
        },
        Game: {
          description: "Game type represents a hockey game",
          scalarFields: [
            "id - Unique game identifier",
            "dateTime - Game date and time",
            "homeScore - Home team score",
            "visitingScore - Visiting team score",
            "status - Game status (FINAL, LIVE, SCHEDULED, etc.)"
          ],
          objectFields: {
            homeTeam: "Team type - REQUIRES subfields like { id name }",
            visitingTeam: "Team type - REQUIRES subfields like { id name }",
            league: "League type - REQUIRES subfields like { name slug }"
          },
          example: `game(id: "789") {
  id
  dateTime
  homeTeam { id name }
  visitingTeam { id name }
  homeScore
  visitingScore
  status
}`
        },
        RegularStats: {
          description: "Statistics for regular season play. ALL field names are UPPERCASE.",
          skaterFields: [
            "GP - Games Played",
            "G - Goals",
            "A - Assists",
            "PTS - Points (Goals + Assists)",
            "PIM - Penalty Minutes",
            "PM - Plus/Minus",
            "PPG - Power Play Goals",
            "SHG - Short Handed Goals",
            "GWG - Game Winning Goals",
            "SOG - Shots on Goal",
            "TOI - Time on Ice"
          ],
          goalieFields: [
            "GP - Games Played",
            "W - Wins",
            "L - Losses",
            "GAA - Goals Against Average",
            "SVP - Save Percentage",
            "SO - Shutouts",
            "SA - Shots Against",
            "SVS - Saves"
          ],
          example: `regularStats {
  GP
  G
  A
  PTS
  PIM
  PM
}`,
          criticalNote: "NEVER use lowercase (gp, g, a, pts). Always UPPERCASE."
        },
        PostseasonStats: {
          description: "Statistics for playoff/postseason play. ALL field names are UPPERCASE.",
          fields: [
            "GP - Games Played",
            "G - Goals",
            "A - Assists",
            "PTS - Points",
            "PIM - Penalty Minutes",
            "PM - Plus/Minus"
          ],
          example: `postseasonStats {
  GP
  G
  A
  PTS
}`,
          note: "Same structure as RegularStats but for playoff games."
        },
        ConnectionTypes: {
          description: "Most list queries return Connection types with edges pattern",
          pattern: "edges { ...fields }",
          examples: [
            "playerStats { edges { ...statFields } }",
            "games { edges { ...gameFields } }",
            "leagueSkaterStats { edges { ...playerStatFields } }",
            "players { edges { id name } }"
          ],
          wrongExample: `WRONG:
players(q: "McDavid") {
  id
  name
}`,
          correctExample: `CORRECT:
players(q: "McDavid") {
  edges {
    id
    name
  }
}`,
          note: "Some queries use 'edges { node { ...fields } }' pattern. Check schema or examples."
        },
        LeagueStandings: {
          description: "Team standings and statistics",
          fields: [
            "position - Standing position/rank",
            "team - Team object (REQUIRES subfields)",
            "stats - Stats object (REQUIRES subfields)"
          ],
          statsFields: [
            "GP - Games Played",
            "W - Wins",
            "L - Losses",
            "T - Ties",
            "OTW - Overtime Wins",
            "OTL - Overtime Losses",
            "PTS - Points",
            "GF - Goals For",
            "GA - Goals Against",
            "GD - Goal Differential",
            "PPG - Points Per Game"
          ],
          example: `leagueStandings(slug: "nhl") {
  position
  team { name }
  stats {
    GP W L OTL PTS
    GF GA GD
  }
}`,
          note: "Shot statistics (SF, SA) may not be available in all leagues."
        }
      },
      criticalRules: [
        "ALL stat field names are UPPERCASE (GP, G, A, PTS, not gp, g, a, pts)",
        "Object-type fields MUST have subfield selections (e.g., team { name }, not just team)",
        "Most list queries return Connection types - use 'edges { ...fields }' pattern",
        "Use introspect_schema tool to discover all available fields for a type",
        "Check guide://common-queries for working examples"
      ]
    },
    null,
    2
  );
}
