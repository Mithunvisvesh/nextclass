import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMobileSchedule } from '../context/MobileScheduleContext';
import { useTheme } from '../theme/theme';
import { Header } from './components/Header';
import { DemoModeBanner } from './components/DemoModeBanner';
import { TabBar } from './components/TabBar';

// Screens
import { OnboardingScreen } from './screens/OnboardingScreen';
import { TodayScreen } from './screens/TodayScreen';
import { TomorrowScreen } from './screens/TomorrowScreen';
import { TimetableScreen } from './screens/TimetableScreen';
import { CalendarScreen } from './screens/CalendarScreen';
import { ChangesScreen } from './screens/ChangesScreen';
import { SettingsScreen } from './screens/SettingsScreen';

export const MobileApp: React.FC = () => {
  const { hasOnboarded, activeTab, setActiveTab, isLoading } = useMobileSchedule();
  const { colors, isDark } = useTheme();

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      </View>
    );
  }

  // Show onboarding screen on clean install until completed or demo chosen
  if (!hasOnboarded) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <OnboardingScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* App Header */}
      <Header />

      {/* Demo Mode / Simulation banner */}
      <DemoModeBanner />

      {/* Active Screen View */}
      <View style={styles.screenContainer}>
        {activeTab === 'today' && <TodayScreen />}
        {activeTab === 'tomorrow' && <TomorrowScreen />}
        {activeTab === 'timetable' && <TimetableScreen />}
        {activeTab === 'calendar' && <CalendarScreen />}
        {activeTab === 'changes' && <ChangesScreen />}
        {activeTab === 'settings' && <SettingsScreen />}
      </View>

      {/* Persistent Bottom Tab Bar */}
      <TabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  screenContainer: {
    flex: 1,
  },
});
