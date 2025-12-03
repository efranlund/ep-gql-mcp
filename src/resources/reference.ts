/**
 * Reference Resources
 * 
 * reference://leagues - Complete list of leagues
 * reference://countries - Country codes and names
 * reference://positions - Valid player positions
 * reference://seasons - Season format guide
 */

import referenceData from "../generated/reference-data.json";

const refData = referenceData as {
  leagues: unknown[];
  countries: unknown[];
  positions: string[];
  seasonFormat: string;
  currentSeason: string;
};

export function getReferenceLeaguesResource(): string {
  return JSON.stringify(
    {
      leagues: refData.leagues,
      total: refData.leagues.length,
      note: "Use league slugs (e.g., 'nhl', 'ahl') in queries. Common leagues: nhl, ahl, shl, khl, ohl, whl, qmjhl.",
    },
    null,
    2
  );
}

export function getReferenceCountriesResource(): string {
  return JSON.stringify(
    {
      countries: refData.countries,
      total: refData.countries.length,
      note: "Use country codes (ISO 3166-1 alpha-2) in queries. Examples: 'CA' (Canada), 'US' (USA), 'SE' (Sweden), 'FI' (Finland).",
    },
    null,
    2
  );
}

export function getReferencePositionsResource(): string {
  return JSON.stringify(
    {
      positions: refData.positions,
      positionDescriptions: {
        C: "Center",
        LW: "Left Wing",
        RW: "Right Wing",
        D: "Defenseman",
        G: "Goalie",
        F: "Forward",
        W: "Winger",
      },
      note: "Use position codes in queries. Common positions: C, LW, RW, D, G.",
    },
    null,
    2
  );
}

export function getReferenceSeasonsResource(): string {
  return JSON.stringify(
    {
      seasonFormat: refData.seasonFormat,
      currentSeason: refData.currentSeason,
      examples: ["2023-2024", "2022-2023", "2021-2022"],
      note: "Seasons are formatted as YYYY-YYYY. Use this format in queries that require a season parameter.",
    },
    null,
    2
  );
}
