export const TEAM_COLORS: Record<string, string> = {
  ARI: '#A71930', ATL: '#CE1141', BAL: '#DF4601', BOS: '#BD3039',
  CHC: '#0E3386', CWS: '#27251F', CIN: '#C6011F', CLE: '#00385D',
  COL: '#5F259F', DET: '#0C2C56', HOU: '#EB6E1F', KC:  '#004687',
  LAA: '#BA0021', LAD: '#005A9C', MIA: '#00A3E0', MIL: '#12284B',
  MIN: '#002B5C', NYM: '#FF5910', NYY: '#1C2841', OAK: '#003831',
  PHI: '#E81828', PIT: '#FDB827', SD:  '#A2AAAD', SF:  '#FD5A1E',
  SEA: '#0C2C56', STL: '#C41E3A', TB:  '#8FBCE6', TEX: '#003278',
  TOR: '#134A8E', WSH: '#AB0003',
};

export const TEAM_ID_TO_ABB: Record<number, string> = {
  108: 'LAA', 109: 'ARI', 110: 'BAL', 111: 'BOS', 112: 'CHC',
  113: 'CIN', 114: 'CLE', 115: 'COL', 116: 'DET', 117: 'HOU',
  118: 'KC',  119: 'LAD', 120: 'WSH', 121: 'NYM', 133: 'OAK',
  134: 'PIT', 135: 'SD',  136: 'SEA', 137: 'SF',  138: 'STL',
  139: 'TB',  140: 'TEX', 141: 'TOR', 142: 'MIN', 143: 'PHI',
  144: 'ATL', 145: 'CWS', 146: 'MIA', 147: 'NYY', 158: 'MIL',
};

export const TEAM_FULL_NAMES: Record<string, string> = {
  ARI: 'Diamondbacks', ATL: 'Braves',    BAL: 'Orioles',   BOS: 'Red Sox',
  CHC: 'Cubs',         CWS: 'White Sox', CIN: 'Reds',       CLE: 'Guardians',
  COL: 'Rockies',      DET: 'Tigers',    HOU: 'Astros',     KC:  'Royals',
  LAA: 'Angels',       LAD: 'Dodgers',   MIA: 'Marlins',    MIL: 'Brewers',
  MIN: 'Twins',        NYM: 'Mets',      NYY: 'Yankees',    OAK: 'Athletics',
  PHI: 'Phillies',     PIT: 'Pirates',   SD:  'Padres',     SF:  'Giants',
  SEA: 'Mariners',     STL: 'Cardinals', TB:  'Rays',       TEX: 'Rangers',
  TOR: 'Blue Jays',    WSH: 'Nationals',
};

export const TEAM_CITIES: Record<string, string> = {
  ARI: 'Arizona',    ATL: 'Atlanta',      BAL: 'Baltimore',  BOS: 'Boston',
  CHC: 'Chicago',    CWS: 'Chicago',      CIN: 'Cincinnati', CLE: 'Cleveland',
  COL: 'Colorado',   DET: 'Detroit',      HOU: 'Houston',    KC:  'Kansas City',
  LAA: 'Anaheim',    LAD: 'Los Angeles',  MIA: 'Miami',      MIL: 'Milwaukee',
  MIN: 'Minnesota',  NYM: 'New York',     NYY: 'New York',   OAK: 'Oakland',
  PHI: 'Philadelphia', PIT: 'Pittsburgh', SD:  'San Diego',  SF:  'San Francisco',
  SEA: 'Seattle',    STL: 'St. Louis',    TB:  'Tampa Bay',  TEX: 'Texas',
  TOR: 'Toronto',    WSH: 'Washington',
};

export const DIVISIONS: Record<string, string[]> = {
  'AL East':    ['BAL', 'BOS', 'NYY', 'TB', 'TOR'],
  'AL Central': ['CWS', 'CLE', 'DET', 'KC', 'MIN'],
  'AL West':    ['HOU', 'LAA', 'OAK', 'SEA', 'TEX'],
  'NL East':    ['ATL', 'MIA', 'NYM', 'PHI', 'WSH'],
  'NL Central': ['CHC', 'CIN', 'MIL', 'PIT', 'STL'],
  'NL West':    ['ARI', 'COL', 'LAD', 'SD', 'SF'],
};

export const PARK_FACTORS: Record<string, { hr: number; hits: number }> = {
  ARI: { hr: 102, hits: 103 }, ATL: { hr: 103, hits: 100 }, BAL: { hr: 101, hits: 99 },
  BOS: { hr: 97,  hits: 108 }, CHC: { hr: 101, hits: 100 }, CWS: { hr: 103, hits: 100 },
  CIN: { hr: 116, hits: 102 }, CLE: { hr: 98,  hits: 98  }, COL: { hr: 112, hits: 112 },
  DET: { hr: 92,  hits: 99  }, HOU: { hr: 104, hits: 99  }, KC:  { hr: 92,  hits: 102 },
  LAA: { hr: 102, hits: 99  }, LAD: { hr: 102, hits: 97  }, MIA: { hr: 88,  hits: 97  },
  MIL: { hr: 106, hits: 99  }, MIN: { hr: 102, hits: 99  }, NYM: { hr: 96,  hits: 98  },
  NYY: { hr: 110, hits: 99  }, OAK: { hr: 92,  hits: 97  }, PHI: { hr: 107, hits: 100 },
  PIT: { hr: 92,  hits: 101 }, SD:  { hr: 96,  hits: 97  }, SF:  { hr: 86,  hits: 97  },
  SEA: { hr: 93,  hits: 95  }, STL: { hr: 96,  hits: 99  }, TB:  { hr: 96,  hits: 97  },
  TEX: { hr: 103, hits: 101 }, TOR: { hr: 103, hits: 100 }, WSH: { hr: 101, hits: 100 },
};

export function teamLogoUrl(teamId: number): string {
  return `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
}

export function teamColor(abb: string): string {
  return TEAM_COLORS[abb?.toUpperCase()] ?? '#8b949e';
}

export function teamColorById(teamId: number): string {
  const abb = TEAM_ID_TO_ABB[teamId];
  return abb ? teamColor(abb) : '#8b949e';
}

export function visibleOnDark(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (lum >= 0.22) return hex;
  const t = Math.min(1, ((0.22 - lum) / 0.22) * 0.6);
  const blend = (c: number) => Math.round((c + (1 - c) * t) * 255);
  return `#${blend(r).toString(16).padStart(2, '0')}${blend(g).toString(16).padStart(2, '0')}${blend(b).toString(16).padStart(2, '0')}`;
}
