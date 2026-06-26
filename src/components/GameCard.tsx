import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { teamLogoUrl } from '../constants/teams';
import { gameStatusLabel, fmtGameTime } from '../utils/formatters';
import type { ScheduleGame, Linescore, BoxScore } from '../api/mlbData';
import { LineScoreTable } from './LineScoreTable';
import { BoxScoreTable } from './BoxScoreTable';

interface Props {
  game: ScheduleGame;
  linescore?: Linescore;
  boxscore?: BoxScore;
}

type GameTab = 'score' | 'linescore' | 'box_away' | 'box_home';

export function GameCard({ game, linescore, boxscore }: Props) {
  const [tab, setTab] = useState<GameTab>('score');
  const { label, type } = gameStatusLabel(game.status_detailed_state ?? '');
  const isLive = type === 'live';
  const isFinal = type === 'final';
  const hasScore = isFinal || isLive;

  const awayScore = game.teams_away_score;
  const homeScore = game.teams_home_score;
  const awayWin = hasScore && awayScore != null && homeScore != null && awayScore > homeScore;
  const homeWin = hasScore && awayScore != null && homeScore != null && homeScore > awayScore;

  const awayAbb = teamAbb(game.teams_away_team_id);
  const homeAbb = teamAbb(game.teams_home_team_id);

  return (
    <View style={styles.card}>
      <View style={styles.scoreRow}>
        <TeamScore teamId={game.teams_away_team_id} teamName={game.teams_away_team_name} score={awayScore} isWinner={awayWin} hasScore={hasScore} />
        <View style={styles.scoreMid}>
          <View style={[styles.badge, type === 'final' ? styles.badgeFinal : type === 'live' ? styles.badgeLive : styles.badgeSched]}>
            <Text style={[styles.badgeText, isLive && { color: '#ff7b72' }]}>{label}</Text>
          </View>
          {!hasScore && <Text style={styles.gameTime}>{fmtGameTime(game.game_datetime)}</Text>}
          {!hasScore && game.venue_name ? <Text style={styles.venue}>{game.venue_name}</Text> : null}
          {!hasScore && (game.probable_pitcher_away || game.probable_pitcher_home) ? (
            <View style={styles.pitchers}>
              <Text style={styles.ppLabel}>PROBABLE PITCHERS</Text>
              <Text style={styles.ppNames}>
                {fmtPitcher(game.probable_pitcher_away)} <Text style={styles.ppSep}>vs</Text> {fmtPitcher(game.probable_pitcher_home)}
              </Text>
            </View>
          ) : null}
        </View>
        <TeamScore teamId={game.teams_home_team_id} teamName={game.teams_home_team_name} score={homeScore} isWinner={homeWin} hasScore={hasScore} />
      </View>

      {hasScore && (
        <>
          <View style={styles.tabRow}>
            {(['score', 'linescore', 'box_away', 'box_home'] as GameTab[]).map((t) => {
              const lbl = t === 'score' ? 'Overview' : t === 'linescore' ? 'Line Score' : t === 'box_away' ? `${awayAbb} Box` : `${homeAbb} Box`;
              return (
                <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabBtn, tab === t && styles.tabBtnActive]}>
                  <Text style={[styles.tabBtnText, tab === t && styles.tabBtnTextActive]}>{lbl}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {tab === 'linescore' && linescore && <LineScoreTable linescore={linescore} awayName={awayAbb} homeName={homeAbb} />}
          {tab === 'box_away' && boxscore && <BoxScoreTable side={boxscore.away} />}
          {tab === 'box_home' && boxscore && <BoxScoreTable side={boxscore.home} />}
        </>
      )}
    </View>
  );
}

function TeamScore({ teamId, teamName, score, isWinner, hasScore }: { teamId: number; teamName: string; score: number | null; isWinner: boolean; hasScore: boolean }) {
  return (
    <View style={styles.teamScore}>
      <Image source={{ uri: teamLogoUrl(teamId) }} style={styles.teamLogo} resizeMode="contain" />
      <Text style={styles.teamCity}>{cityFromName(teamName)}</Text>
      <Text style={styles.teamNickname}>{nicknameFromName(teamName)}</Text>
      {hasScore && score != null && <Text style={[styles.scoreNum, isWinner && { color: colors.ink }]}>{score}</Text>}
    </View>
  );
}

function teamAbb(teamId: number): string {
  const map: Record<number, string> = {
    108:'LAA',109:'ARI',110:'BAL',111:'BOS',112:'CHC',113:'CIN',114:'CLE',
    115:'COL',116:'DET',117:'HOU',118:'KC',119:'LAD',120:'WSH',121:'NYM',
    133:'OAK',134:'PIT',135:'SD',136:'SEA',137:'SF',138:'STL',139:'TB',
    140:'TEX',141:'TOR',142:'MIN',143:'PHI',144:'ATL',145:'CWS',146:'MIA',
    147:'NYY',158:'MIL',
  };
  return map[teamId] ?? String(teamId);
}

function cityFromName(name: string): string {
  const parts = name.split(' ');
  return parts.slice(0, -1).join(' ') || name;
}

function nicknameFromName(name: string): string {
  return name.split(' ').slice(-1)[0] ?? name;
}

function fmtPitcher(name?: string): string {
  if (!name) return 'TBD';
  const parts = name.trim().split(' ');
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts.slice(1).join(' ')}`;
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl, marginBottom: spacing.lg },
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  teamScore: { flex: 1, alignItems: 'center', gap: spacing.xs },
  teamLogo: { width: 52, height: 52, marginBottom: spacing.xs },
  teamCity: { color: colors.dim, fontSize: 10, fontFamily: 'SpaceMono', textTransform: 'uppercase', letterSpacing: 1.2 },
  teamNickname: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  scoreNum: { color: colors.muted, fontSize: 40, fontWeight: '900', fontFamily: 'SpaceMono', letterSpacing: -1 },
  scoreMid: { alignItems: 'center', gap: spacing.xs, minWidth: 120, paddingHorizontal: spacing.sm, borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border },
  badge: { paddingHorizontal: spacing.md, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  badgeFinal: { backgroundColor: '#1f4e8c', borderColor: '#2d6cbe44' },
  badgeLive: { backgroundColor: '#3d0a0a', borderColor: '#da363344' },
  badgeSched: { backgroundColor: 'transparent', borderColor: colors.borderStrong },
  badgeText: { color: colors.accentSoft, fontSize: 10, fontFamily: 'SpaceMono', fontWeight: '700', letterSpacing: 0.8 },
  gameTime: { color: colors.muted, fontSize: 12, fontFamily: 'SpaceMono' },
  venue: { color: colors.dim, fontSize: 11, textAlign: 'center' },
  pitchers: { alignItems: 'center', marginTop: spacing.xs },
  ppLabel: { color: colors.dim, fontSize: 9, fontFamily: 'SpaceMono', textTransform: 'uppercase', letterSpacing: 1 },
  ppNames: { color: colors.muted, fontSize: 11, fontFamily: 'SpaceMono', marginTop: 2, textAlign: 'center' },
  ppSep: { color: colors.borderStrong },
  tabRow: { flexDirection: 'row', marginTop: spacing.lg, borderTopWidth: 1, borderColor: colors.border, paddingTop: spacing.sm, gap: spacing.xs },
  tabBtn: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', borderRadius: radius.sm },
  tabBtnActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabBtnText: { color: colors.dim, fontSize: 11, fontFamily: 'SpaceMono' },
  tabBtnTextActive: { color: colors.accent, fontWeight: '700' },
});
