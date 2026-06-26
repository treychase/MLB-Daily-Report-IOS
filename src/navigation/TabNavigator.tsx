import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { TodayScreen } from '../screens/TodayScreen';
import { MonthlyScreen } from '../screens/MonthlyScreen';
import { LeaderboardScreen } from '../screens/LeaderboardScreen';
import { ProjectionsScreen } from '../screens/ProjectionsScreen';
import { BettingScreen } from '../screens/BettingScreen';

const Tab = createBottomTabNavigator();

const ICON_MAP: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Today: { focused: 'today', unfocused: 'today-outline' },
  Monthly: { focused: 'calendar', unfocused: 'calendar-outline' },
  Leaderboard: { focused: 'trophy', unfocused: 'trophy-outline' },
  Projections: { focused: 'trending-up', unfocused: 'trending-up-outline' },
  Betting: { focused: 'cash', unfocused: 'cash-outline' },
};

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.panel,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 4,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.dim,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons = ICON_MAP[route.name];
          const name = focused ? icons?.focused : icons?.unfocused;
          return <Ionicons name={name ?? 'ellipse-outline'} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Monthly" component={MonthlyScreen} />
      <Tab.Screen name="Leaderboard" component={LeaderboardScreen} />
      <Tab.Screen name="Projections" component={ProjectionsScreen} />
      <Tab.Screen name="Betting" component={BettingScreen} />
    </Tab.Navigator>
  );
}
