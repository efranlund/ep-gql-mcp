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
      examples: [
        {
          description: "Get player profile by ID",
          query: `{
  player(id: 296251) {
    name
    position
    nationality {
      name
    }
    latestStats {
      teamName
      leagueName
    }
  }
}`,
        },
        {
          description: "Get NHL standings for current season",
          query: `{
  league(slug: "nhl") {
    standings {
      edges {
        team {
          name
        }
        points
        rank
      }
    }
  }
}`,
        },
        {
          description: "Get player statistics for a season",
          query: `{
  playerStats(player: 296251, season: "2023-2024") {
    edges {
      league {
        name
      }
      regularStats {
        gp
        g
        a
        pts
      }
    }
  }
}`,
        },
        {
          description: "Search for players",
          query: `{
  players(q: "McDavid", limit: 5) {
    edges {
      id
      name
      position
    }
  }
}`,
        },
        {
          description: "Get team roster",
          query: `{
  teamRoster(team: 123) {
    edges {
      player {
        name
        position
      }
      jerseyNumber
    }
  }
}`,
        },
      ],
      note: "Use the execute_graphql tool to run these queries. Adjust IDs, slugs, and parameters as needed.",
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

