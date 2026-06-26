import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radius } from '../constants/theme';
import { fetchSchedule, fetchBoxscores, fetchLinescores, fetchManifest } from '../api/mlbData';
import { GameCard } from '../components/GameCard';
import { SectionHeader } from '../components/SectionHeader';
import { StatTable } from '../components/StatTable';

export function TodayScreen() {
  const { data: manifest } = useQuery({ queryKey: ['manifest'], queryFn: fetchManifest, staleTime: 60_000 });
  const { data: schedule, isLoading: schedLoading, refetch: refetchSched } = useQuery({
    queryKey: ['schedule'], queryFn: fetchSchedule, staleTime: 300_000,
  });
  const { data: boxscores } = useQuery({ queryKey: ['boxscores'], queryFn: fetchBoxscores, staleTime: 300_000 });
  const { data: linescores } = useQuery({ queryKey: ['linescores'], queryFn: fetchLinescores, staleTime: 300_000 });

  const games = useMemo(() =>
    (schedule ?? []).sort((a, b) => new Date(a.game_datetime).getTime() - new Date(b.game_datetime).getTime()),
  [schedule]);

  const { top5Hitters, top5Pitchers } = useMemo(() => {
    if (!boxscores) return { top5Hitters: [], top5Pitchers: [] };
    const batters: Record<string, unknown>[] = [];
    const pitchers: Record<string, unknown>[] = [];
    Object.values(boxscores).forEach(box => {
      (['away', 'home'] as const).forEach(side => {
        const s = box[side];
        s.batters.forEach(b => {
          if (b.ab >= 2) {
            const ops = (b.h / Math.max(1, b.ab)) + ((b.h + b.bb) / Math.max(1, b.ab + b.bb));
            batters.push({ Name: b.name, Team: s.team_name, AB: b.ab, H: b.h, RBI: b.rbi, BB: b.bb, SO: b.so, OPS: ops });
          }
        });
        s.pitchers.forEach((p, i) => {
          if (i === 0 && p.ip >= 4) pitchers.push({ Name: p.name, Team: s.team_name, IP: p.ip.toFixed(1), H: p.h, ER: p.er, BB: p.bb, SO: p.so });
        });
      });
    });
    return {
      top5Hitters: [...batters].sort((a, b) => (b.OPS as number) - (a.OPS as number)).slice(0, 5),
      top5Pitchers: [...pitchers].sort((a, b) => (a.ER as number) - (b.ER as number)).slice(0, 5),
    };
  }, [boxscores]);

  const reportDate = manifest?.report_date;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={schedLoading} onRefresh={refetchSched} tintColor={colors.accent} />}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MLB <Text style={{ color: colors.accent }}>Daily Report</Text></Text>
        {reportDate && <Text style={styles.headerMeta}>{formatDateLabel(reportDate)} · MLB Stats API & Baseball Savant</Text>}
      </View>
      <SectionHeader title="Today's Games" />
      {schedLoading ? (
        <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} />
      ) : games.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>No games scheduled.</Text></View>
      ) : (
        games.map(game => (
          <GameCard key={game.game_pk} game={game} linescore={linescores?.[String(game.game_pk)]} boxscore={boxscores?.[String(game.game_pk)]} />
        ))
      )}
      {top5Hitters.length > 0 && (
        <View style={{ marginTop: spacing.xl }}>
          <SectionHeader title={`Top Performances — ${reportDate ? formatShortDate(reportDate) : 'Today'}`} />
          <View style={styles.top5Card}>
            <Text style={styles.top5Title}>Top 5 Hitters</Text>
            <Text style={styles.top5Sub}>Ranked by OPS (min 2 AB)</Text>
            <StatTable columns={[
              { key: 'Name', label: 'Player', width: 120 },
              { key: 'Team', label: 'Team', width: 46 },
              { key: 'AB', label: 'AB', width: 36, format: 'int' },
              { key: 'H', label: 'H', width: 36, format: 'int', accent: '#60a5fa' },
              { key: 'RBI', label: 'RBI', width: 40, format: 'int' },
              { key: 'BB', label: 'BB', width: 36, format: 'int' },
              { key: 'OPS', label: 'OPS', width: 56, format: 'rate3', accent: '#60a5fa' },
            ]} rows={top5Hitters} />
          </View>
          {top5Pitchers.length > 0 && (
            <View style={[styles.top5Card, { marginTop: spacing.lg }]}>
              <Text style={styles.top5Title}>Top 5 Starters</Text>
              <Text style={styles.top5Sub}>Ranked by ER, IP (min 4 IP)</Text>
              <StatTable columns={[
                { key: 'Name', label: 'Pitcher', width: 120 },
                { key: 'Team', label: 'Team', width: 46 },
                { key: 'IP', label: 'IP', width: 40 },
                { key: 'H', label: 'H', width: 36, format: 'int' },
                { key: 'ER', label: 'ER', width: 36, accent: '#f87171' },
                { key: 'BB', label: 'BB', width: 36, format: 'int' },
                { key: 'SO', label: 'SO', width: 40, format: 'int', accent: '#f59e0b' },
              ]} rows={top5Pitchers} />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function formatDateLabel(dateStr: string): string {
  try { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
  catch { return dateStr; }
}
function formatShortDate(dateStr: string): string {
  try { return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' }); }
  catch { return dateStr; }
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 80 },
  header: { marginBottom: spacing.xxl, paddingBottom: spacing.lg, borderBottomWidth: 1, borderColor: colors.border },
  headerTitle: { color: colors.ink, fontSize: 28, fontWeight: '900', letterSpacing: -1 },
  headerMeta: { color: colors.muted, fontSize: 12, fontFamily: 'SpaceMono', marginTop: 6 },
  empty: { padding: spacing.xxl, alignItems: 'center', backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border },
  emptyText: { color: colors.muted, fontFamily: 'SpaceMono', fontSize: 13 },
  top5Card: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, padding: spacing.xl },
  top5Title: { color: colors.accent, fontSize: 14, fontWeight: '800', marginBottom: 2 },
  top5Sub: { color: colors.dim, fontSize: 11, fontFamily: 'SpaceMono', marginBottom: spacing.md },
});
