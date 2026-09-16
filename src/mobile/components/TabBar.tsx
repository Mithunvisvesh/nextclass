import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMobileSchedule, MobileTab } from '../../context/MobileScheduleContext';
import { 
  CalendarCheck, 
  CalendarClock, 
  Table, 
  CalendarDays, 
  Edit3, 
  Settings 
} from 'lucide-react-native';

export const TabBar: React.FC = () => {
  const { activeTab, setActiveTab, theme, overrides } = useMobileSchedule();

  const tabs: Array<{ id: MobileTab; label: string; icon: React.ElementType; badge?: number }> = [
    { id: 'today', label: 'Today', icon: CalendarCheck },
    { id: 'tomorrow', label: 'Tomorrow', icon: CalendarClock },
    { id: 'timetable', label: 'Timetable', icon: Table },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'changes', label: 'Changes', icon: Edit3, badge: overrides.length },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <View style={[styles.barContainer, { backgroundColor: theme.tabBar, borderTopColor: theme.tabBarBorder }]}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        const iconColor = isActive ? theme.primary : theme.textMuted;

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => setActiveTab(tab.id)}
            style={styles.tabButton}
            activeOpacity={0.7}
            accessibilityLabel={`Navigate to ${tab.label}`}
          >
            <View style={styles.iconWrapper}>
              <Icon size={20} color={iconColor} strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge && tab.badge > 0 ? (
                <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>
            <Text style={[
              styles.tabLabel, 
              { color: isActive ? theme.primary : theme.textMuted, fontWeight: isActive ? '700' : '500' }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  barContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
    borderTopWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
  },
  iconWrapper: {
    position: 'relative',
    width: 28,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
    letterSpacing: -0.1,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -6,
    minWidth: 15,
    height: 15,
    borderRadius: 7.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});
