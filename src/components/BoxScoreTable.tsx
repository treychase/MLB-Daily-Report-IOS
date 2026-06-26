import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import type { BoxScore } from '../api/mlbData';
import { fmtRate } from '../utils/formatters';

type Side = BoxScore['away'];
type ViewMode = 'batting' | 'pitching';

export function BoxScoreTable({ side }: { side: Side }) {
  const [mode, setMode] = useState<ViewMode>('batting');

  return (
    <View style={styles.wrap}>
      <View style={styles.modeRow}>
        {(['batting', 'pitching'] as ViewMode[]).map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.modeBtn, mode === m && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'batting' ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.hdrRow}>
              <Text style={[styles.nameCell, styles.hdr]}>Player</Text>
              {['AB','R','H','RBI','BB','SO','AVG'].map(col => (
                <Text key={col} style={[styles.statCell, styles.hdr]}>{col}</Text>
              ))}
            </View>
            {side.batters.map((b, i) => (
              <View key={i} style={[styles.dataRow, i % 2 === 1 && styles.altRow]}>
                <Text style={styles.nameCell} numberOfLines={1}>{b.name}</Text>
                <Text style={styles.statCell}>{b.ab}</Text>
                <Text style={styles.statCell}>{b.r}</Text>
                <Text style={[styles.statCell, b.h > 0 && styles.accentStat]}>{b.h}</Text>
                <Text style={styles.statCell}>{b.rbi}</Text>
                <Text style={styles.statCell}>{b.bb}</Text>
                <Text style={styles.statCell}>{b.so}</Text>
                <Text style={styles.statCell}>{b.avg != null ? fmtRate(b.avg) : '—'}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.hdrRow}>
              <Text style={[styles.nameCell, styles.hdr]}>Pitcher</Text>
              {['IP','H','R','ER','BB','SO','ERA'].map(col => (
                <Text key={col} style={[styles.statCell, styles.hdr]}>{col}</Text>
              ))}
            </View>
            {side.pitchers.map((p, i) => (
              <View key={i} style={[styles.dataRow, i % 2 === 1 && styles.altRow]}>
                <Text style={styles.nameCell} numberOfLines={1}>{p.name}{p.note ? ` (${p.note})` : ''}</Text>
                <Text style={styles.statCell}>{p.ip?.toFixed(1)}</Text>
                <Text style={styles.statCell}>{p.h}</Text>
                <Text style={styles.statCell}>{p.r}</Text>
                <Text style={[styles.statCell, erColor(p.er)]}>{p.er}</Text>
                <Text style={styles.statCell}>{p.bb}</Text>
                <Text style={[styles.statCell, styles.yellowStat]}>{p.so}</Text>
                <Text style={styles.statCell}>{p.era != null ? p.era.toFixed(2) : '—'}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

function erColor(er: number): object {
  if (er === 0) return { color: '#4ade80' };
  if (er <= 2) return { color: '#fbbf24' };
  return { color: '#f87171' };
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  modeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  modeBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modeBtnActive: { borderColor: colors.accent, backgroundColor: '#1d3a6e22' },
  modeBtnText: { color: colors.dim, fontSize: 12, fontFamily: 'SpaceMono' },
  modeBtnTextActive: { color: colors.accent, fontWeight: '700' },
  hdrRow: { flexDirection: 'row', borderBottomWidth: 1, borderColor: colors.border, paddingBottom: spacing.xs },
  hdr: { color: colors.dim, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  dataRow: { flexDirection: 'row', paddingVertical: 5 },
  altRow: { backgroundColor: '#0d1117' },
  nameCell: { width: 130, color: colors.text, fontSize: 12, fontFamily: 'SpaceMono', paddingRight: spacing.sm },
  statCell: { width: 46, textAlign: 'center', color: colors.text, fontSize: 12, fontFamily: 'SpaceMono' },
  accentStat: { color: '#60a5fa', fontWeight: '700' },
  yellowStat: { color: '#f59e0b', fontWeight: '700' },
});
