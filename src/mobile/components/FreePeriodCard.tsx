import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FreePeriod } from '../../types/schedule';
import { Coffee, Utensils } from 'lucide-react-native';
import { formatTime12Hour } from '../../core/timeUtils';
import { useTheme } from '../../theme/theme';

interface FreePeriodCardProps {
  freePeriod: FreePeriod;
}

export const FreePeriodCard: React.FC<FreePeriodCardProps> = ({ freePeriod }) => {
  const { colors } = useTheme();
  const isLunch = freePeriod.label.toLowerCase().includes('lunch');
  const Icon = isLunch ? Utensils : Coffee;

  return (
    <View style={styles.container}>
      {/* Time column */}
      <View style={styles.timeColumn}>
        <Text style={[styles.timeText, { color: colors.textTertiary }]}>
          {formatTime12Hour(freePeriod.startTime)}
        </Text>
      </View>

      {/* Bullet / dot */}
      <View style={styles.dotContainer}>
        <View style={[styles.dot, { backgroundColor: colors.border }]} />
      </View>

      {/* Break pill */}
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.surfaceVariant,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.left}>
          <Icon size={14} color={colors.textSecondary} />
          <Text style={[styles.label, { color: colors.textSecondary }]}>
            {freePeriod.label}
          </Text>
        </View>
        <Text style={[styles.duration, { color: colors.textTertiary }]}>
          {formatTime12Hour(freePeriod.startTime)} – {formatTime12Hour(freePeriod.endTime)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  timeColumn: {
    width: 62,
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  dotContainer: {
    width: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginLeft: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
  duration: {
    fontSize: 11,
    fontWeight: '500',
  },
});
