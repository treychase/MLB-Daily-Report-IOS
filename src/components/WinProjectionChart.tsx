import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import Svg, { Path, Line, Text as SvgText, Circle } from 'react-native-svg';
import { colors, spacing, radius } from '../constants/theme';
import { teamColorById, TEAM_ID_TO_ABB, visibleOnDark } from '../constants/teams';
import type { WinProjectionPoint } from '../api/mlbData';

const SCREEN_W = Dimensions.get('window').width;
const CHART_W = SCREEN_W - 32;
const CHART_H = 300;
const PAD = { top: 20, right: 20, bottom: 40, left: 44 };

interface Props {
  history: WinProjectionPoint[];
  selectedTeamId?: number | null;
}

export function WinProjectionChart({ history, selectedTeamId }: Props) {
  const { lines, dates, minW, maxW, xScale, yScale } = useMemo(() => {
    if (!history?.length) return { lines: [], dates: [], minW: 0, maxW: 162, xScale: () => 0, yScale: () => 0 };

    const allDates = [...new Set(history.map(p => p.date))].sort();
    const allProj = history.map(p => p.proj_mean);
    const minW = Math.max(0, Math.min(...allProj) - 5);
    const maxW = Math.min(162, Math.max(...allProj) + 5);

    const xScale = (i: number) => PAD.left + (i / Math.max(1, allDates.length - 1)) * (CHART_W - PAD.left - PAD.right);
    const yScale = (v: number) => PAD.top + ((maxW - v) / (maxW - minW)) * (CHART_H - PAD.top - PAD.bottom);

    const teamIds = [...new Set(history.map(p => p.team_id))];
    const lines = teamIds.map(teamId => {
      const pts = allDates.map(date => {
        const pt = history.find(p => p.team_id === teamId && p.date === date);
        return pt ? { x: xScale(allDates.indexOf(date)), y: yScale(pt.proj_mean), proj: pt.proj_mean, lo: pt.proj_lo, hi: pt.proj_hi, teamName: pt.team_name, date } : null;
      }).filter(Boolean) as { x: number; y: number; proj: number; lo: number; hi: number; teamName: string; date: string }[];

      const col = visibleOnDark(teamColorById(teamId));
      const isFocused = !selectedTeamId || selectedTeamId === teamId;
      const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
      return { teamId, pts, col: isFocused ? col : '#2a3040', d, isFocused, strokeW: isFocused ? 2 : 1 };
    });

    return { lines, dates: allDates, minW, maxW, xScale, yScale };
  }, [history, selectedTeamId]);

  const yTicks = useMemo(() => {
    const step = (maxW - minW) > 20 ? 10 : 5;
    const ticks = [];
    for (let v = Math.ceil(minW / step) * step; v <= maxW; v += step) ticks.push(v);
    return ticks;
  }, [minW, maxW]);

  const xTickIndices = useMemo(() => {
    if (dates.length <= 4) return dates.map((_, i) => i);
    const step = Math.ceil(dates.length / 4);
    const result = [];
    for (let i = 0; i < dates.length; i += step) result.push(i);
    if (result[result.length - 1] !== dates.length - 1) result.push(dates.length - 1);
    return result;
  }, [dates]);

  if (!history?.length) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No projection data available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Svg width={CHART_W} height={CHART_H}>
        {yTicks.map(v => (
          <React.Fragment key={v}>
            <Line x1={PAD.left} y1={yScale(v)} x2={CHART_W - PAD.right} y2={yScale(v)} stroke={colors.border} strokeWidth={1} strokeDasharray="4,4" />
            <SvgText x={PAD.left - 4} y={yScale(v) + 4} fill={colors.dim} fontSize={10} textAnchor="end" fontFamily="monospace">{v}</SvgText>
          </React.Fragment>
        ))}
        {xTickIndices.map(i => (
          <React.Fragment key={i}>
            <Line x1={xScale(i)} y1={CHART_H - PAD.bottom} x2={xScale(i)} y2={CHART_H - PAD.bottom + 4} stroke={colors.border} strokeWidth={1} />
            <SvgText x={xScale(i)} y={CHART_H - PAD.bottom + 14} fill={colors.dim} fontSize={9} textAnchor="middle" fontFamily="monospace">
              {fmtXLabel(dates[i])}
            </SvgText>
          </React.Fragment>
        ))}
        {[...lines.filter(l => !l.isFocused), ...lines.filter(l => l.isFocused)].map(line => (
          <Path key={line.teamId} d={line.d} fill="none" stroke={line.col} strokeWidth={line.strokeW} strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {lines.filter(l => l.isFocused && l.pts.length > 0).map(line => {
          const last = line.pts[line.pts.length - 1];
          return <Circle key={line.teamId} cx={last.x} cy={last.y} r={4} fill={line.col} />;
        })}
        {lines.filter(l => l.isFocused && l.pts.length > 0).map(line => {
          const last = line.pts[line.pts.length - 1];
          const abb = TEAM_ID_TO_ABB[line.teamId] ?? '';
          return <SvgText key={line.teamId} x={last.x + 6} y={last.y + 4} fill={line.col} fontSize={9} fontFamily="monospace" fontWeight="bold">{abb}</SvgText>;
        })}
      </Svg>
      <Text style={styles.yAxisLabel}>Projected Wins</Text>
    </View>
  );
}

function fmtXLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + 'T12:00:00');
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return dateStr.slice(5);
  }
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    overflow: 'hidden',
  },
  empty: {
    height: CHART_H,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.panel,
    borderRadius: radius.md,
  },
  emptyText: { color: colors.muted, fontFamily: 'SpaceMono', fontSize: 13 },
  yAxisLabel: {
    color: colors.dim,
    fontSize: 10,
    fontFamily: 'SpaceMono',
    textAlign: 'center',
    marginTop: 2,
  },
});
