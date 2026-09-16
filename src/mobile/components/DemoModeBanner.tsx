import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { Sparkles, LogOut, Clock, Calendar } from 'lucide-react-native';
import { formatTime12Hour } from '../../core/timeUtils';

export const DemoModeBanner: React.FC = () => {
  const { 
    activeMode, 
    exitDemoMode, 
    theme, 
    simulatedDate, 
    simulatedTime, 
    setSimulatedDateTime, 
    clearSimulation, 
    isSimulationActive,
    todaySchedule 
  } = useMobileSchedule();

  if (activeMode !== 'demo') return null;

  const presets = [
    { label: 'Sep 21: Swapped', date: '2026-09-21', time: '08:35', desc: 'NLP & CN Swapped' },
    { label: 'Sep 23: Cancelled', date: '2026-09-23', time: '08:15', desc: 'CN Cancelled' },
    { label: 'Sep 25: Room A406', date: '2026-09-25', time: '08:20', desc: 'Room C404 -> A406' },
    { label: 'Sep 14: Holiday', date: '2026-09-14', time: '09:00', desc: 'Ganesh Chaturthi' },
    { label: 'Oct 01: Special', date: '2026-10-01', time: '08:15', desc: 'Thu follows Mon' },
    { label: 'Oct 31: Sat Spec', date: '2026-10-31', time: '08:20', desc: 'Sat follows Fri' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.warningLight, borderBottomColor: theme.warning }]}>
      {/* Top Banner Row */}
      <View style={styles.headerRow}>
        <View style={styles.statusIndicator}>
          <Sparkles size={16} color={theme.warning} />
          <Text style={[styles.bannerTitle, { color: theme.warning }]}>
            DEMO MODE
          </Text>
          <Text style={[styles.subText, { color: theme.textSecondary }]}>
            ({todaySchedule.date} • {formatTime12Hour(todaySchedule.classes[0]?.startTime || '08:10')})
          </Text>
        </View>

        {/* Exit Demo Mode */}
        <TouchableOpacity 
          onPress={exitDemoMode} 
          style={[styles.exitButton, { backgroundColor: theme.surface }]}
          accessibilityLabel="Exit Demo Mode"
        >
          <LogOut size={13} color={theme.text} />
          <Text style={[styles.exitText, { color: theme.text }]}>Exit Demo</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Scenario Picker */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.scenarioList}
      >
        {presets.map((p) => {
          const isSelected = todaySchedule.date === p.date;
          return (
            <TouchableOpacity
              key={p.date}
              onPress={() => setSimulatedDateTime(p.date, p.time)}
              style={[
                styles.presetPill,
                { 
                  backgroundColor: isSelected ? theme.primary : theme.surface,
                  borderColor: isSelected ? theme.primaryDark : theme.border
                }
              ]}
            >
              <Text style={[
                styles.presetText, 
                { color: isSelected ? '#FFFFFF' : theme.text }
              ]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          );
        })}

        {/* Reset to live button */}
        {isSimulationActive && (
          <TouchableOpacity
            onPress={clearSimulation}
            style={[styles.presetPill, { backgroundColor: theme.surfaceSubtle, borderColor: theme.border }]}
          >
            <Text style={[styles.presetText, { color: theme.textMuted }]}>Reset to Live</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subText: {
    fontSize: 11,
    fontWeight: '600',
  },
  exitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  exitText: {
    fontSize: 11,
    fontWeight: '700',
  },
  scenarioList: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 2,
  },
  presetPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
