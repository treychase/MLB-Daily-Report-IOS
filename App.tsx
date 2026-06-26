import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TabNavigator } from './src/navigation/TabNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: 1000,
    },
  },
});

const NAV_THEME = {
  dark: true,
  colors: {
    primary: '#3b82f6',
    background: '#080c10',
    card: '#0d1117',
    text: '#e6edf3',
    border: '#1d2633',
    notification: '#3b82f6',
  },
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <NavigationContainer theme={NAV_THEME}>
          <StatusBar style="light" />
          <TabNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
