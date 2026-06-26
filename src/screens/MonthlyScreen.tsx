import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radius } from '../constants/theme';
import { fetchMonthlySc, fetchMonthlyPitchers, fetchManifest } from '../api/mlbData';
import { SectionHeader } from '../components/SectionHeader';
import { StatTable } from '../components/StatTable';

type SubTab = 'hitters' | 'starters' | 'relievers';

export function MonthlyScreen() {
  const [subTab, setSubTab] = useState<SubTab>('hitters');
  const { data: manifest } = useQuery({ queryKey: ['manifest'], queryFn: fetchManifest, staleTime: 3_600_000 });
  const { data: hitters, isLoading: hLoad } = useQuery({ queryKey: ['monthly_sc'], queryFn: fetchMonthlySc, staleTime: 3_600_000 });
  const { data: pitchersRaw, isLoading: pLoad } = useQuery({ queryKey: ['monthly_pitchers'], queryFn: fetchMonthlyPitchers, staleTime: 3_600_000 });

  const starters = pitchersRaw?.filter(p => (p.role ?? '').toLowerCase().includes('start') || (p.GS ?? 0) > 0) ?? [];
  const relievers = pitchersRaw?.filter(p => (p.role ?? '').toLowerCase().includes('relief') || (p.GS ?? 0) === 0) ?? [];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <SectionHeader title={`${manifest?.month ?? ''} Leaders`} />
      <View style={styles.tabRow}>
        {(['hitters', 'starters', 'relievers'] as SubTab[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setSubTab(t)} style={[styles.tab, subTab === t && styles.tabActive]}>
            <Text style={[styles.tabText, subTab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {subTab === 'hitters' && (
        hLoad ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} /> :
        !hitters?.length ? <Empty msg="No qualified hitters yet (min 15 AB)." /> :
        <StatTable columns={[
          { key: 'player_name', label: 'Player', width: 140 },
          { key: 'batter_team', label: 'Tm', width: 42 },
          { key: 'G', label: 'G', width: 36, format: 'int' },
          { key: 'AB', label: 'AB', width: 40, format: 'int' },
          { key: 'H', label: 'H', width: 36, format: 'int' },
          { key: 'HR', label: 'HR', width: 40, format: 'int', accent: '#f59e0b' },
          { key: 'BB', label: 'BB', width: 36, format: 'int' },
          { key: 'AVG', label: 'AVG', width: 52, format: 'rate3' },
          { key: 'OBP', label: 'OBP', width: 52, format: 'rate3' },
          { key: 'SLG', label: 'SLG', width: 52, format: 'rate3' },
          { key: 'OPS', label: 'OPS', width: 56, format: 'rate3', accent: '#60a5fa' },
        ]} rows={(hitters ?? []) as unknown as Record<string, unknown>[]} />
      )}
      {subTab === 'starters' && (
        pLoad ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} /> :
        !starters.length ? <Empty msg="No qualified starters yet (min 10 IP)." /> :
        <StatTable columns={[
          { key: 'Name', label: 'Pitcher', width: 140 },
          { key: 'Team', label: 'Tm', width: 42 },
          { key: 'G', label: 'G', width: 36, format: 'int' },
          { key: 'IP', label: 'IP', width: 48 },
          { key: 'ERA', label: 'ERA', width: 52, format: 'rate2', accent: '#60a5fa' },
          { key: 'WHIP', label: 'WHIP', width: 56, format: 'rate2' },
          { key: 'K', label: 'K', width: 40, format: 'int', accent: '#f59e0b' },
        ]} rows={starters as unknown as Record<string, unknown>[]} />
      )}
      {subTab === 'relievers' && (
        pLoad ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} /> :
        !relievers.length ? <Empty msg="No qualified relievers yet (min 5 IP)." /> :
        <StatTable columns={[
          { key: 'Name', label: 'Pitcher', width: 140 },
          { key: 'Team', label: 'Tm', width: 42 },
          { key: 'G', label: 'G', width: 36, format: 'int' },
          { key: 'IP', label: 'IP', width: 48 },
          { key: 'ERA', label: 'ERA', width: 52, format: 'rate2', accent: '#60a5fa' },
          { key: 'WHIP', label: 'WHIP', width: 56, format: 'rate2' },
          { key: 'K', label: 'K', width: 40, format: 'int', accent: '#f59e0b' },
        ]} rows={relievers as unknown as Record<string, unknown>[]} />
      )}
    </ScrollView>
  );
}

function Empty({ msg }: { msg: string }) {
  return <View style={styles.empty}><Text style={styles.emptyText}>{msg}</Text></View>;
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 80 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabText: { color: colors.dim, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: colors.ink, fontWeight: '700' },
  empty: { padding: spacing.xxl, alignItems: 'center', backgroundColor: colors.panel, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, marginTop: spacing.lg },
  emptyText: { color: colors.muted, fontFamily: 'SpaceMono', fontSize: 13 },
});
