import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { colors, spacing, radius } from '../constants/theme';
import { fetchLbBatters, fetchLbPitchers } from '../api/mlbData';
import { SectionHeader } from '../components/SectionHeader';
import { StatTable } from '../components/StatTable';

type SubTab = 'hitters' | 'pitchers';

export function LeaderboardScreen() {
  const [subTab, setSubTab] = useState<SubTab>('hitters');
  const [hitTeam, setHitTeam] = useState('ALL');
  const [hitMinPA, setHitMinPA] = useState(50);
  const [pitTeam, setPitTeam] = useState('ALL');
  const [pitRole, setPitRole] = useState('ALL');
  const [pitMinIP, setPitMinIP] = useState(10);

  const { data: batters, isLoading: bLoad } = useQuery({ queryKey: ['lb_batters'], queryFn: fetchLbBatters, staleTime: 3_600_000 });
  const { data: pitchers, isLoading: pLoad } = useQuery({ queryKey: ['lb_pitchers'], queryFn: fetchLbPitchers, staleTime: 3_600_000 });

  const allHitTeams = useMemo(() => !batters ? [] : ['ALL', ...new Set(batters.map(b => b.Team).filter(Boolean))].sort((a, b) => a === 'ALL' ? -1 : a.localeCompare(b)), [batters]);
  const allPitTeams = useMemo(() => !pitchers ? [] : ['ALL', ...new Set(pitchers.map(p => p.Team).filter(Boolean))].sort((a, b) => a === 'ALL' ? -1 : a.localeCompare(b)), [pitchers]);

  const filteredBatters = useMemo(() => {
    if (!batters) return [];
    return batters.filter(b => hitTeam === 'ALL' || b.Team === hitTeam).filter(b => (b.PA ?? 0) >= hitMinPA).sort((a, b) => (b.WAR ?? 0) - (a.WAR ?? 0));
  }, [batters, hitTeam, hitMinPA]);

  const filteredPitchers = useMemo(() => {
    if (!pitchers) return [];
    const ipToNum = (ip: string) => { const [w, f] = ip.split('.').map(Number); return (w ?? 0) + (f ?? 0) / 3; };
    return pitchers
      .filter(p => pitTeam === 'ALL' || p.Team === pitTeam)
      .filter(p => pitRole === 'ALL' || (pitRole === 'SP' ? (p.GS ?? 0) > 0 : (p.GS ?? 0) === 0))
      .filter(p => ipToNum(p.IP ?? '0') >= pitMinIP)
      .sort((a, b) => (b.WAR ?? 0) - (a.WAR ?? 0));
  }, [pitchers, pitTeam, pitRole, pitMinIP]);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <SectionHeader title="Season Leaderboard" />
      <View style={styles.tabRow}>
        {(['hitters', 'pitchers'] as SubTab[]).map(t => (
          <TouchableOpacity key={t} onPress={() => setSubTab(t)} style={[styles.tab, subTab === t && styles.tabActive]}>
            <Text style={[styles.tabText, subTab === t && styles.tabTextActive]}>{t.charAt(0).toUpperCase() + t.slice(1)}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {subTab === 'hitters' && (
        <>
          <FilterChips label="Team" options={allHitTeams.slice(0, 10)} value={hitTeam} onChange={setHitTeam} />
          <View style={styles.numFilter}>
            <Text style={styles.filterLabel}>Min PA</Text>
            <TextInput style={styles.numInput} value={String(hitMinPA)} onChangeText={t => setHitMinPA(parseInt(t) || 0)} keyboardType="numeric" />
          </View>
          {bLoad ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} /> :
            <StatTable columns={[
              { key: 'Name', label: 'Player', width: 130 },
              { key: 'Team', label: 'Tm', width: 42 },
              { key: 'G', label: 'G', width: 36, format: 'int' },
              { key: 'PA', label: 'PA', width: 44, format: 'int' },
              { key: 'HR', label: 'HR', width: 40, format: 'int', accent: '#f59e0b' },
              { key: 'RBI', label: 'RBI', width: 44, format: 'int' },
              { key: 'AVG', label: 'AVG', width: 52, format: 'rate3' },
              { key: 'OBP', label: 'OBP', width: 52, format: 'rate3' },
              { key: 'SLG', label: 'SLG', width: 52, format: 'rate3' },
              { key: 'OPS', label: 'OPS', width: 56, format: 'rate3', accent: '#60a5fa' },
              { key: 'WAR', label: 'WAR', width: 48, format: 'war' },
            ]} rows={filteredBatters as unknown as Record<string, unknown>[]} />
          }
        </>
      )}
      {subTab === 'pitchers' && (
        <>
          <FilterChips label="Team" options={allPitTeams.slice(0, 10)} value={pitTeam} onChange={setPitTeam} />
          <FilterChips label="Role" options={['ALL', 'SP', 'RP']} value={pitRole} onChange={setPitRole} />
          <View style={styles.numFilter}>
            <Text style={styles.filterLabel}>Min IP</Text>
            <TextInput style={styles.numInput} value={String(pitMinIP)} onChangeText={t => setPitMinIP(parseInt(t) || 0)} keyboardType="numeric" />
          </View>
          {pLoad ? <ActivityIndicator color={colors.accent} style={{ marginVertical: 40 }} /> :
            <StatTable columns={[
              { key: 'Name', label: 'Pitcher', width: 130 },
              { key: 'Team', label: 'Tm', width: 42 },
              { key: 'G', label: 'G', width: 36, format: 'int' },
              { key: 'IP', label: 'IP', width: 52 },
              { key: 'ERA', label: 'ERA', width: 52, format: 'rate2', accent: '#60a5fa' },
              { key: 'WHIP', label: 'WHIP', width: 56, format: 'rate2' },
              { key: 'SO', label: 'K', width: 44, format: 'int', accent: '#f59e0b' },
              { key: 'WAR', label: 'WAR', width: 48, format: 'war' },
            ]} rows={filteredPitchers as unknown as Record<string, unknown>[]} />
          }
        </>
      )}
    </ScrollView>
  );
}

function FilterChips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <View style={styles.chipGroup}>
      <Text style={styles.filterLabel}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.chipRow}>
          {options.map(opt => (
            <TouchableOpacity key={opt} onPress={() => onChange(opt)} style={[styles.chip, opt === value && styles.chipActive]}>
              <Text style={[styles.chipText, opt === value && styles.chipTextActive]}>{opt}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 80 },
  tabRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, marginBottom: spacing.lg },
  tab: { flex: 1, paddingVertical: spacing.md, alignItems: 'center' },
  tabActive: { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabText: { color: colors.dim, fontSize: 13, fontWeight: '500' },
  tabTextActive: { color: colors.ink, fontWeight: '700' },
  chipGroup: { gap: 4, marginBottom: spacing.sm },
  filterLabel: { color: colors.dim, fontSize: 11, fontFamily: 'SpaceMono', textTransform: 'uppercase', letterSpacing: 0.8 },
  chipRow: { flexDirection: 'row', gap: spacing.xs },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.panel },
  chipActive: { borderColor: colors.accent, backgroundColor: '#1d3a6e22' },
  chipText: { color: colors.muted, fontSize: 12, fontFamily: 'SpaceMono' },
  chipTextActive: { color: colors.accent, fontWeight: '700' },
  numFilter: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  numInput: { backgroundColor: colors.panel2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, color: colors.text, fontFamily: 'SpaceMono', fontSize: 14, paddingHorizontal: spacing.md, paddingVertical: 6, width: 72 },
});
