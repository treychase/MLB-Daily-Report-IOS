import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radius } from '../constants/theme';
import { fetchBetProps, type BetProp } from '../api/mlbData';
import { SectionHeader } from '../components/SectionHeader';
import { PARK_FACTORS } from '../constants/teams';
import { americanOdds } from '../utils/formatters';

type PlayerType = 'hitter' | 'pitcher';

const TEAM_LIST = ['ALL','ARI','ATL','BAL','BOS','CHC','CWS','CIN','CLE','COL','DET','HOU','KC','LAA','LAD','MIA','MIL','MIN','NYM','NYY','OAK','PHI','PIT','SD','SF','SEA','STL','TB','TEX','TOR','WSH'];
const PARK_LIST = ['NEUTRAL', ...Object.keys(PARK_FACTORS).sort()];

export function BettingScreen() {
  const [playerType, setPlayerType] = useState<PlayerType>('hitter');
  const [selectedTeam, setSelectedTeam] = useState('ALL');
  const [selectedPlayer, setSelectedPlayer] = useState<BetProp | null>(null);
  const [oppPitcherHand, setOppPitcherHand] = useState<'R' | 'L'>('R');
  const [park, setPark] = useState('NEUTRAL');
  const [oppTeam, setOppTeam] = useState('ALL');

  const { data: allProps, isLoading } = useQuery({ queryKey: ['bet_props'], queryFn: fetchBetProps, staleTime: 3_600_000 });

  const filteredPlayers = useMemo(() => {
    if (!allProps) return [];
    return allProps.filter(p => p.type === playerType).filter(p => selectedTeam === 'ALL' || p.team === selectedTeam).sort((a, b) => a.player_name.localeCompare(b.player_name));
  }, [allProps, playerType, selectedTeam]);

  const parkFactor = useMemo(() => {
    if (park === 'NEUTRAL') return { hits: 1, hr: 1, tb: 1 };
    const pf = PARK_FACTORS[park];
    if (!pf) return { hits: 1, hr: 1, tb: 1 };
    return { hits: clamp(pf.hits / 100, 0.85, 1.20), hr: clamp(pf.hr / 100, 0.70, 1.30), tb: clamp(0.7 * pf.hits / 100 + 0.3 * pf.hr / 100, 0.85, 1.20) };
  }, [park]);

  const adjustedProps = useMemo(() => {
    if (!selectedPlayer) return null;
    return selectedPlayer.props.map(prop => {
      let factor = 1;
      if (playerType === 'hitter') {
        if (prop.market === 'hits') factor = parkFactor.hits;
        else if (prop.market === 'home_runs') factor = parkFactor.hr;
        else if (prop.market === 'total_bases') factor = parkFactor.tb;
      }
      return { ...prop, adj_mean: prop.posterior_mean * clamp(factor, 0.70, 1.40) };
    });
  }, [selectedPlayer, playerType, parkFactor]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <SectionHeader title="Bayesian Prop Projections" />
      <Text style={styles.note}>Posterior-predictive betting lines from this season's game log. Count markets use Gamma–Poisson; innings pitched uses Normal–Inverse-Gamma.</Text>
      <View style={styles.toggleRow}>
        {(['hitter', 'pitcher'] as PlayerType[]).map(t => (
          <TouchableOpacity key={t} onPress={() => { setPlayerType(t); setSelectedPlayer(null); }}
            style={[styles.toggleBtn, playerType === t && styles.toggleBtnActive]}>
            <Text style={[styles.toggleText, playerType === t && styles.toggleTextActive]}>{t === 'hitter' ? 'Hitters' : 'Pitchers (SP)'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        <View style={styles.chipRow}>
          {TEAM_LIST.map(t => (
            <TouchableOpacity key={t} onPress={() => { setSelectedTeam(t); setSelectedPlayer(null); }} style={[styles.chip, selectedTeam === t && styles.chipActive]}>
              <Text style={[styles.chipText, selectedTeam === t && styles.chipTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {isLoading ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} /> : (
        <>
          <Text style={styles.filterLabel}>Select Player</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.lg }}>
            <View style={styles.chipRow}>
              {filteredPlayers.map(p => (
                <TouchableOpacity key={p.player_id} onPress={() => setSelectedPlayer(selectedPlayer?.player_id === p.player_id ? null : p)}
                  style={[styles.chip, selectedPlayer?.player_id === p.player_id && styles.chipActive]}>
                  <Text style={[styles.chipText, selectedPlayer?.player_id === p.player_id && styles.chipTextActive]} numberOfLines={1}>{p.player_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          {selectedPlayer && (
            <>
              {playerType === 'hitter' && (
                <View style={{ marginBottom: spacing.md }}>
                  <Text style={styles.filterLabel}>Pitcher Throws</Text>
                  <View style={styles.chipRow}>
                    {(['R', 'L'] as const).map(h => (
                      <TouchableOpacity key={h} onPress={() => setOppPitcherHand(h)} style={[styles.chip, oppPitcherHand === h && styles.chipActive]}>
                        <Text style={[styles.chipText, oppPitcherHand === h && styles.chipTextActive]}>{h === 'R' ? 'RHP' : 'LHP'}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={[styles.filterLabel, { marginTop: spacing.sm }]}>Park</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipRow}>
                      {PARK_LIST.slice(0, 12).map(pk => (
                        <TouchableOpacity key={pk} onPress={() => setPark(pk)} style={[styles.chip, park === pk && styles.chipActive]}>
                          <Text style={[styles.chipText, park === pk && styles.chipTextActive]}>{pk}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>
                </View>
              )}
              <View style={styles.playerHdr}>
                <Text style={styles.playerName}>{selectedPlayer.player_name}</Text>
                <Text style={styles.playerMeta}>{selectedPlayer.team} · {selectedPlayer.type}</Text>
              </View>
              <View style={styles.betGrid}>
                {(adjustedProps ?? []).map(prop => <PropCard key={prop.market} prop={prop} />)}
              </View>
            </>
          )}
          {!selectedPlayer && filteredPlayers.length === 0 && (
            <View style={styles.empty}><Text style={styles.emptyText}>No prop data available. Data is refreshed daily at 8 AM ET.</Text></View>
          )}
        </>
      )}
    </ScrollView>
  );
}

interface AdjustedProp { market: string; label: string; lines: number[]; posterior_mean: number; adj_mean: number; over_probs: number[]; fair_odds: number[]; model: string; }

function PropCard({ prop }: { prop: AdjustedProp }) {
  return (
    <View style={styles.propCard}>
      <Text style={styles.propTitle}>{prop.label}</Text>
      <Text style={styles.propProj}>Proj: <Text style={styles.propProjVal}>{prop.adj_mean.toFixed(2)}</Text></Text>
      {prop.lines.map((line, i) => {
        const overP = prop.over_probs[i] ?? 0;
        return (
          <View key={line} style={styles.propLine}>
            <Text style={styles.propLineLabel}>Over {line}</Text>
            <View style={styles.propLineRight}>
              <View style={styles.probBarBg}><View style={[styles.probBarFill, { width: `${Math.round(overP * 100)}%` as any, backgroundColor: probColor(overP) }]} /></View>
              <Text style={[styles.propOverPct, { color: probColor(overP) }]}>{Math.round(overP * 100)}%</Text>
              <Text style={styles.propOdds}>{americanOdds(overP)}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function probColor(p: number): string {
  if (p >= 0.6) return colors.green;
  if (p >= 0.45) return '#f59e0b';
  return colors.red;
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 80 },
  note: { color: colors.dim, fontSize: 12, fontFamily: 'SpaceMono', marginBottom: spacing.lg, lineHeight: 18 },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  toggleBtn: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  toggleBtnActive: { borderColor: colors.accent, backgroundColor: '#1d3a6e22' },
  toggleText: { color: colors.muted, fontSize: 13, fontFamily: 'SpaceMono' },
  toggleTextActive: { color: colors.accent, fontWeight: '700' },
  chipRow: { flexDirection: 'row', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  chipActive: { borderColor: colors.accent, backgroundColor: '#1d3a6e22' },
  chipText: { color: colors.muted, fontSize: 12, fontFamily: 'SpaceMono' },
  chipTextActive: { color: colors.accent, fontWeight: '700' },
  filterLabel: { color: colors.dim, fontSize: 11, fontFamily: 'SpaceMono', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 4 },
  playerHdr: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.lg },
  playerName: { color: colors.ink, fontSize: 20, fontWeight: '900', letterSpacing: -0.5 },
  playerMeta: { color: colors.muted, fontSize: 13, fontFamily: 'SpaceMono', marginTop: 2 },
  betGrid: { gap: spacing.lg },
  propCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl },
  propTitle: { color: colors.accent, fontSize: 14, fontWeight: '800', marginBottom: 4 },
  propProj: { color: colors.dim, fontSize: 12, fontFamily: 'SpaceMono', marginBottom: spacing.md },
  propProjVal: { color: colors.ink, fontSize: 16, fontWeight: '900' },
  propLine: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 6, borderTopWidth: 1, borderColor: colors.borderSoft },
  propLineLabel: { color: colors.text, fontSize: 13, fontFamily: 'SpaceMono', flex: 1 },
  propLineRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  probBarBg: { width: 60, height: 6, backgroundColor: colors.panel2, borderRadius: 3, overflow: 'hidden' },
  probBarFill: { height: 6, borderRadius: 3 },
  propOverPct: { fontSize: 13, fontWeight: '700', fontFamily: 'SpaceMono', width: 38, textAlign: 'right' },
  propOdds: { color: colors.muted, fontSize: 12, fontFamily: 'SpaceMono', width: 50, textAlign: 'right' },
  empty: { padding: spacing.xxl, alignItems: 'center', backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.muted, fontFamily: 'SpaceMono', fontSize: 13, textAlign: 'center' },
});
