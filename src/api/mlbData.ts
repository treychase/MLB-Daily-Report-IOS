// All data is pre-computed by the GitHub Actions daily refresh and uploaded
// to Hugging Face as JSON. The iOS app reads those files directly.

const HF_BASE =
  'https://huggingface.co/datasets/treychase/mlb-daily-report/resolve/main/data';

async function fetchJson<T>(name: string): Promise<T | null> {
  try {
    const res = await fetch(`${HF_BASE}/${name}.json`, {
      headers: { 'Cache-Control': 'max-age=3600' },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

export interface ScheduleGame {
  game_pk: number;
  game_datetime: string;
  game_date: string;
  status_abstract_game_state: string;
  status_detailed_state: string;
  status_coded_game_state: string;
  teams_away_team_name: string;
  teams_away_team_id: number;
  teams_away_score: number | null;
  teams_home_team_name: string;
  teams_home_team_id: number;
  teams_home_score: number | null;
  venue_name: string;
  probable_pitcher_away?: string;
  probable_pitcher_home?: string;
}

export interface LinescoreRow {
  team: 'away' | 'home';
  innings: (number | null)[];
  runs: number;
  hits: number;
  errors: number;
}

export interface Linescore {
  away: LinescoreRow;
  home: LinescoreRow;
  inning_count: number;
}

export interface BatterLine {
  name: string;
  position: string;
  ab: number;
  r: number;
  h: number;
  rbi: number;
  bb: number;
  so: number;
  avg?: number;
  person_id?: number;
}

export interface PitcherLine {
  name: string;
  ip: number;
  h: number;
  r: number;
  er: number;
  bb: number;
  so: number;
  era?: number;
  person_id?: number;
  note?: string;
}

export interface BoxScore {
  away: { batters: BatterLine[]; pitchers: PitcherLine[]; team_id: number; team_name: string };
  home: { batters: BatterLine[]; pitchers: PitcherLine[]; team_id: number; team_name: string };
}

export interface WinProjectionPoint {
  date: string;
  team_id: number;
  team_name: string;
  team_abb: string;
  proj_mean: number;
  proj_lo: number;
  proj_hi: number;
  W: number;
  L: number;
  win_pct: number;
  division?: string;
  proj_delta?: number;
}

export interface HitterLeaderRow {
  Name: string;
  Team: string;
  Pos?: string;
  G: number;
  PA: number;
  AB: number;
  HR: number;
  RBI: number;
  SB?: number;
  AVG: number;
  OBP: number;
  SLG: number;
  OPS: number;
  WAR?: number;
  mlb_id?: number;
}

export interface PitcherLeaderRow {
  Name: string;
  Team: string;
  G: number;
  GS?: number;
  IP: string;
  W?: number;
  L?: number;
  ERA: number;
  WHIP: number;
  SO?: number;
  WAR?: number;
  mlb_id?: number;
}

export interface MonthlyHitter {
  player_name: string;
  batter_team: string;
  G: number;
  AB: number;
  H: number;
  HR: number;
  BB: number;
  AVG: number;
  OBP: number;
  SLG: number;
  OPS: number;
  person_id?: number;
}

export interface MonthlyPitcher {
  Name: string;
  Team: string;
  G: number;
  GS?: number;
  IP: string;
  ERA: number;
  WHIP: number;
  K: number;
  role?: string;
  person_id?: number;
}

export interface BetProp {
  player_id: number;
  player_name: string;
  team: string;
  type: 'hitter' | 'pitcher';
  props: {
    market: string;
    label: string;
    lines: number[];
    posterior_alpha?: number;
    posterior_beta?: number;
    posterior_mean: number;
    posterior_sd?: number;
    model: 'gamma_poisson' | 'normal_ig';
    over_probs: number[];
    fair_odds: number[];
  }[];
}

export interface Manifest {
  generated_at: string;
  report_date: string;
  month: string;
  files: string[];
}

// ── Fetch functions ──────────────────────────────────────────────────────────

export const fetchManifest = () => fetchJson<Manifest>('manifest');
export const fetchSchedule = () => fetchJson<ScheduleGame[]>('schedule');
export const fetchBoxscores = () => fetchJson<Record<string, BoxScore>>('boxscores');
export const fetchLinescores = () => fetchJson<Record<string, Linescore>>('linescores');
export const fetchWinProjHistory = () => fetchJson<WinProjectionPoint[]>('win_proj_history');
export const fetchWinProjections = () => fetchJson<WinProjectionPoint[]>('win_projections');
export const fetchLbBatters = () => fetchJson<HitterLeaderRow[]>('lb_batters');
export const fetchLbPitchers = () => fetchJson<PitcherLeaderRow[]>('lb_pitchers');
export const fetchMonthlySc = () => fetchJson<MonthlyHitter[]>('monthly_sc_computed');
export const fetchMonthlyPitchers = () => fetchJson<MonthlyPitcher[]>('monthly_pitchers_computed');
export const fetchBetProps = () => fetchJson<BetProp[]>('bet_props');
