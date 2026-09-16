import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { Clock, Sun, Moon, Sparkles, UserCheck } from 'lucide-react-native';

export const Header: React.FC = () => {
  const { 
    theme, 
    themePreference, 
    setThemePreference, 
    activeMode, 
    profile, 
    setActiveTab 
  } = useMobileSchedule();

  const toggleTheme = () => {
    if (themePreference === 'light') {
      setThemePreference('dark');
    } else if (themePreference === 'dark') {
      setThemePreference('system');
    } else {
      setThemePreference('light');
    }
  };

  const isDemo = activeMode === 'demo';

  return (
    <View style={[styles.headerContainer, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
      {/* Brand & Tagline */}
      <View style={styles.brandRow}>
        <View style={[styles.logoIcon, { backgroundColor: theme.primary }]}>
          <Clock size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text style={[styles.titleText, { color: theme.text }]}>NextClass</Text>
            <View style={[
              styles.modePill, 
              { backgroundColor: isDemo ? theme.warningLight : theme.primaryLight }
            ]}>
              <Text style={[
                styles.modePillText, 
                { color: isDemo ? theme.warning : theme.primary }
              ]}>
                {isDemo ? 'DEMO' : 'ACTIVE'}
              </Text>
            </View>
          </View>
          <Text style={[styles.taglineText, { color: theme.textMuted }]}>
            {profile.name ? `${profile.name} • ${profile.course || "Know what's next"}` : "Know what's next."}
          </Text>
        </View>
      </View>

      {/* Action Icons */}
      <View style={styles.actionsRow}>
        {/* Quick Theme Toggle */}
        <TouchableOpacity 
          onPress={toggleTheme} 
          style={[styles.iconButton, { backgroundColor: theme.surfaceSubtle }]}
          accessibilityLabel="Toggle Theme"
        >
          {theme.isDark ? (
            <Sun size={18} color={theme.warning} />
          ) : (
            <Moon size={18} color={theme.textSecondary} />
          )}
        </TouchableOpacity>

        {/* Profile / Settings Button */}
        <TouchableOpacity 
          onPress={() => setActiveTab('settings')} 
          style={[styles.iconButton, { backgroundColor: theme.surfaceSubtle }]}
          accessibilityLabel="Profile Settings"
        >
          <UserCheck size={18} color={theme.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modePill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  taglineText: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
