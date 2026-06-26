import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { colors, spacing } from '../constants/theme';
import type { Linescore } from '../api/mlbData';

interface Props {
  linescore: Linescore;
  awayName: string;
  homeName: string;
}

export function LineScoreTable({ linescore, awayName, homeName }: Props) {
  const { away, home, inning_count } = linescore;
  const innings = Array.from({ length: inning_count }, (_, i) => i + 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.wrap}>
      <View>
        <View style={styles.row}>
          <View style={styles.teamCol}><Text style={styles.hdrCell}> </Text></View>
          {innings.map(i => (
            <View key={i} style={styles.innCell}>
              <Text style={styles.hdrCell}>{i}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totCell}><Text style={[styles.hdrCell, styles.totHdr]}>R</Text></View>
          <View style={styles.totCell}><Text style={[styles.hdrCell, styles.totHdr]}>H</Text></View>
          <View style={styles.totCell}><Text style={[styles.hdrCell, styles.totHdr]}>E</Text></View>
        </View>
        <LineRow label={awayName} row={away} innings={innings} />
        <LineRow label={homeName} row={home} innings={innings} />
      </View>
    </ScrollView>
  );
}

function LineRow({ label, row, innings }: { label: string; row: { innings: (number|null)[]; runs: number; hits: number; errors: number }; innings: number[] }) {
  return (
    <View style={[styles.row, styles.dataRow]}>
      <View style={styles.teamCol}>
        <Text style={styles.teamName}>{label}</Text>
      </View>
      {innings.map((_, i) => (
        <View key={i} style={styles.innCell}>
          <Text style={styles.cell}>{row.innings[i] ?? '-'}</Text>
        </View>
      ))}
      <View style={styles.divider} />
      <View style={styles.totCell}><Text style={styles.total}>{row.runs}</Text></View>
      <View style={styles.totCell}><Text style={styles.total}>{row.hits}</Text></View>
      <View style={styles.totCell}><Text style={styles.total}>{row.errors}</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center' },
  dataRow: { borderTopWidth: 1, borderColor: '#161d27' },
  teamCol: { width: 48, paddingRight: 8 },
  teamName: { color: colors.ink, fontSize: 12, fontWeight: '800', fontFamily: 'SpaceMono' },
  innCell: { width: 26, alignItems: 'center', paddingVertical: 6 },
  hdrCell: { color: colors.muted, fontSize: 12, fontWeight: '700', fontFamily: 'SpaceMono', textAlign: 'center' },
  totHdr: { color: colors.accent },
  cell: { color: colors.text, fontSize: 13, fontFamily: 'SpaceMono', textAlign: 'center' },
  total: { color: colors.ink, fontSize: 13, fontWeight: '800', fontFamily: 'SpaceMono', textAlign: 'center' },
  divider: { width: 1, backgroundColor: colors.border, alignSelf: 'stretch', marginHorizontal: 6 },
  totCell: { width: 28, alignItems: 'center', paddingVertical: 6 },
});
