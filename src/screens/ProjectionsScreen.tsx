import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radius } from '../constants/theme';
import { fetchWinProjHistory, fetchWinProjections } from '../api/mlbData';
import { SectionHeader } from '../components/SectionHeader';
import { WinProjectionChart } from '../components/WinProjectionChart';
import { teamLogoUrl, teamColorById, visibleOnDark, TEAM_ID_TO_ABB } from '../constants/teams';

export function ProjectionsScreen() {
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const { data: history, isLoading: hLoad } = useQuery({ queryKey: ['win_proj_history'], queryFn: fetchWinProjHistory, staleTime: 3_600_000 });
  const { data: current } = useQuery({ queryKey: ['win_projections'], queryFn: fetchWinProjections, staleTime: 3_600_000 });

  const { modelBadge, lastDate } = useMemo(() => {
    if (!history?.length) return { modelBadge: 'err', lastDate: '' };
    const dates = history.map(p => p.date).sort();
    const last = dates[dates.length - 1];
    const age = Math.floor((Date.now() - new Date(last + 'T12:00:00').getTime()) / 86_400_000);
    return { modelBadge: age > 2 ? 'warn' : 'ok', lastDate: last };
  }, [history]);

  const divisionGroups = useMemo(() => {
    if (!current?.length) return [];
    const divOrder = ['AL East', 'AL Central', 'AL West', 'NL East', 'NL Central', 'NL West'];
    return divOrder.map(div => ({
      div,
      teams: (current ?? []).filter(t => t.division === div).sort((a, b) => b.proj_mean - a.proj_mean),
    })).filter(g => g.teams.length > 0);
  }, [current]);

  const teamChoices = useMemo(() => !current?.length ? [] : [...current].sort((a, b) => b.proj_mean - a.proj_mean), [current]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <SectionHeader title="Win Projections" />
      <Text style={styles.note}>Recursive Bayesian filter (Beta–Bernoulli) updates each team's win rate daily. Bands are 90% credible intervals.</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
        <View style={styles.teamPills}>
          <TouchableOpacity onPress={() => setSelectedTeamId(null)} style={[styles.pill, !selectedTeamId && styles.pillActive]}>
            <Text style={[styles.pillText, !selectedTeamId && styles.pillTextActive]}>All Teams</Text>
          </TouchableOpacity>
          {teamChoices.map(t => {
            const isSelected = selectedTeamId === t.team_id;
            const col = visibleOnDark(teamColorById(t.team_id));
            return (
              <TouchableOpacity key={t.team_id} onPress={() => setSelectedTeamId(isSelected ? null : t.team_id)}
                style={[styles.pill, isSelected && { borderColor: col, backgroundColor: col + '22' }]}>
                <Text style={[styles.pillText, isSelected && { color: col, fontWeight: '700' }]}>{TEAM_ID_TO_ABB[t.team_id] ?? t.team_name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      {hLoad ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} /> :
        <WinProjectionChart history={history ?? []} selectedTeamId={selectedTeamId} />}
      <View style={{ marginTop: spacing.xxl }}>
        <SectionHeader title="Current Standings & Projections" subtitle="Grouped by division · tap a row to focus team in chart" />
        {divisionGroups.map(group => (
          <View key={group.div} style={styles.divGroup}>
            <Text style={styles.divLabel}>{group.div}</Text>
            <View style={styles.divCard}>
              <View style={styles.tableHdr}>
                <Text style={[styles.thCell, { flex: 2 }]}>Team</Text>
                <Text style={styles.thCell}>W</Text>
                <Text style={styles.thCell}>L</Text>
                <Text style={styles.thCell}>Proj</Text>
                <Text style={[styles.thCell, { width: 80 }]}>90% CI</Text>
                <Text style={styles.thCell}>Δ</Text>
              </View>
              {group.teams.map((team, i) => (
                <TouchableOpacity key={team.team_id} onPress={() => setSelectedTeamId(selectedTeamId === team.team_id ? null : team.team_id)}
                  style={[styles.teamRow, i === group.teams.length - 1 && { borderBottomWidth: 0 }, selectedTeamId === team.team_id && styles.teamRowSelected]}>
                  <View style={[{ flex: 2 }, styles.teamNameCell]}>
                    <Image source={{ uri: teamLogoUrl(team.team_id) }} style={styles.rowLogo} resizeMode="contain" />
                    <Text style={styles.teamName} numberOfLines={1}>{team.team_name}</Text>
                  </View>
                  <Text style={styles.tdCell}>{team.W}</Text>
                  <Text style={styles.tdCell}>{team.L}</Text>
                  <Text style={[styles.tdCell, { fontWeight: '800', color: colors.ink }]}>{Math.round(team.proj_mean)}</Text>
                  <Text style={[styles.tdCell, { width: 80, fontSize: 11 }]}>{Math.round(team.proj_lo)}–{Math.round(team.proj_hi)}</Text>
                  <Text style={styles.tdCell}>{formatDelta(team.proj_delta)}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function formatDelta(delta?: number): string {
  if (delta == null || !isFinite(delta) || Math.abs(delta) < 0.05) return '—';
  return delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 80 },
  note: { color: colors.dim, fontSize: 12, fontFamily: 'SpaceMono', marginBottom: spacing.lg, lineHeight: 18 },
  teamPills: { flexDirection: 'row', gap: spacing.xs },
  pill: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  pillActive: { borderColor: colors.accent, backgroundColor: '#1d3a6e22' },
  pillText: { color: colors.muted, fontSize: 12, fontFamily: 'SpaceMono' },
  pillTextActive: { color: colors.accent, fontWeight: '700' },
  divGroup: { marginBottom: spacing.xl },
  divLabel: { color: colors.ink, fontWeight: '700', fontSize: 15, marginBottom: spacing.sm, borderBottomWidth: 1, borderColor: colors.border, paddingBottom: 4 },
  divCard: { backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, overflow: 'hidden' },
  tableHdr: { flexDirection: 'row', paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.panel2 },
  thCell: { color: colors.dim, fontSize: 11, fontFamily: 'SpaceMono', textTransform: 'uppercase', textAlign: 'center', width: 40 },
  teamRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderBottomWidth: 1, borderColor: colors.borderSoft },
  teamRowSelected: { backgroundColor: '#1d3a6e18' },
  teamNameCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  rowLogo: { width: 22, height: 22 },
  teamName: { color: colors.text, fontSize: 13, fontWeight: '600', flex: 1 },
  tdCell: { color: colors.text, fontSize: 13, fontFamily: 'SpaceMono', textAlign: 'center', width: 40 },
});
