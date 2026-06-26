import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors, spacing, radius } from '../constants/theme';
import { fmtRate, fmtRate2 } from '../utils/formatters';

export interface Column {
  key: string;
  label: string;
  width?: number;
  format?: 'rate3' | 'rate2' | 'int' | 'str' | 'war';
  accent?: string;
}

interface Props {
  columns: Column[];
  rows: Record<string, unknown>[];
  onRowPress?: (row: Record<string, unknown>) => void;
  highlightKey?: string;
}

export function StatTable({ columns, rows, onRowPress, highlightKey }: Props) {
  const nameCol = columns[0];
  const statCols = columns.slice(1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View>
        <View style={styles.hdrRow}>
          <Text style={[styles.nameHdr, { width: nameCol.width ?? 130 }]}>{nameCol.label}</Text>
          {statCols.map(col => (
            <Text key={col.key} style={[styles.statHdr, { width: col.width ?? 52 }]}>{col.label}</Text>
          ))}
        </View>
        {rows.map((row, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onRowPress?.(row)}
            activeOpacity={onRowPress ? 0.7 : 1}
            style={[styles.dataRow, i % 2 === 1 && styles.altRow]}
          >
            <Text style={[styles.nameCell, { width: nameCol.width ?? 130 }]} numberOfLines={1}>
              {String(row[nameCol.key] ?? '')}
            </Text>
            {statCols.map(col => {
              const v = row[col.key];
              const formatted = formatValue(v, col.format);
              return (
                <Text key={col.key} style={[styles.statCell, { width: col.width ?? 52 }, col.accent ? { color: col.accent } : null]}>
                  {formatted}
                </Text>
              );
            })}
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

function formatValue(v: unknown, format?: Column['format']): string {
  if (v == null || v === '' || v === 'NA') return '—';
  const n = typeof v === 'number' ? v : parseFloat(String(v));
  switch (format) {
    case 'rate3': return isNaN(n) ? '—' : fmtRate(n);
    case 'rate2': return isNaN(n) ? '—' : fmtRate2(n);
    case 'war':   return isNaN(n) ? '—' : n.toFixed(1);
    case 'int':   return isNaN(n) ? String(v) : String(Math.round(n));
    default:      return String(v);
  }
}

const styles = StyleSheet.create({
  hdrRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingBottom: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  nameHdr: {
    color: colors.dim,
    fontSize: 11,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statHdr: {
    color: colors.dim,
    fontSize: 11,
    fontFamily: 'SpaceMono',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderColor: colors.borderSoft,
  },
  altRow: { backgroundColor: '#0b0f16' },
  nameCell: {
    color: colors.text,
    fontSize: 13,
    fontFamily: 'SpaceMono',
    paddingRight: spacing.sm,
  },
  statCell: {
    color: colors.text,
    fontSize: 13,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
  },
});
