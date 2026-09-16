import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { useTheme } from '../../theme/theme';
import { ClassCard } from '../components/ClassCard';
import { FreePeriodCard } from '../components/FreePeriodCard';
import {
  Sparkles,
  PartyPopper,
  Calendar,
  AlertCircle,
  ArrowLeft,
  BookOpen,
} from 'lucide-react-native';
import { formatDatePretty, parseTimeToMinutes } from '../../core/timeUtils';

export const TomorrowScreen: React.FC = () => {
  const { tomorrowSchedule, setActiveTab } = useMobileSchedule();
  const { colors } = useTheme();

  const {
    classes,
    freePeriods,
    isHoliday,
    holidayTitle,
    isSpecialTimetable,
    specialTimetableNote,
    effectiveSourceDay,
    actualDayOfWeek,
    appliedOverrides,
  } = tomorrowSchedule;

  // Interleave classes and free periods
  type TimelineItem =
    | { type: 'class'; data: typeof classes[0]; sortKey: number }
    | { type: 'break'; data: typeof freePeriods[0]; sortKey: number };

  const timelineItems: TimelineItem[] = [
    ...classes.map(c => ({
      type: 'class' as const,
      data: c,
      sortKey: parseTimeToMinutes(c.startTime),
    })),
    ...freePeriods.map(p => ({
      type: 'break' as const,
      data: p,
      sortKey: parseTimeToMinutes(p.startTime),
    })),
  ].sort((a, b) => a.sortKey - b.sortKey);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Navigation & Header */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surfaceVariant }]}
          onPress={() => setActiveTab('today')}
        >
          <ArrowLeft size={16} color={colors.primary} />
          <Text style={[styles.backBtnText, { color: colors.primary }]}>Back to Today</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dateHeader}>
        <Text style={[styles.title, { color: colors.text }]}>Tomorrow's Schedule</Text>
        <Text style={[styles.dateText, { color: colors.textSecondary }]}>
          {formatDatePretty(tomorrowSchedule.date)}
        </Text>
        <View style={styles.badgeRow}>
          {isSpecialTimetable ? (
            <View style={styles.specialTag}>
              <Sparkles size={14} color="#D97706" />
              <Text style={styles.specialTagText}>
                {specialTimetableNote || `Follows ${effectiveSourceDay} Schedule`}
              </Text>
            </View>
          ) : (
            <Text style={[styles.daySubtitle, { color: colors.textSecondary }]}>
              {actualDayOfWeek} Routine
            </Text>
          )}

          {appliedOverrides.length > 0 && (
            <View style={[styles.overrideTag, { backgroundColor: '#EFF6FF', borderColor: colors.primary }]}>
              <Text style={[styles.overrideTagText, { color: colors.primary }]}>
                {appliedOverrides.length} override{appliedOverrides.length > 1 ? 's' : ''} applied
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Holiday Announcement */}
      {isHoliday ? (
        <View style={[styles.holidayCard, { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' }]}>
          <PartyPopper size={32} color="#059669" />
          <Text style={[styles.holidayTitle, { color: '#065F46' }]}>
            Holiday: {holidayTitle || 'Official College Holiday'}
          </Text>
          <Text style={[styles.holidaySub, { color: '#047857' }]}>
            No academic sessions are scheduled for tomorrow. Enjoy your day!
          </Text>
        </View>
      ) : isSpecialTimetable ? (
        <View style={[styles.alertCard, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}>
          <AlertCircle size={18} color="#D97706" />
          <Text style={[styles.alertText, { color: '#92400E' }]}>
            Special Schedule: {specialTimetableNote || `Running ${effectiveSourceDay} timetable`}.
          </Text>
        </View>
      ) : null}

      {/* Schedule Items */}
      {!isHoliday && (
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Classes for Tomorrow</Text>
            <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
              {classes.length} class{classes.length !== 1 ? 'es' : ''}
            </Text>
          </View>

          {timelineItems.length > 0 ? (
            timelineItems.map((item, idx) =>
              item.type === 'class' ? (
                <ClassCard key={`tmr-cls-${item.data.id}-${idx}`} classItem={item.data} />
              ) : (
                <FreePeriodCard key={`tmr-brk-${item.data.startTime}-${idx}`} freePeriod={item.data} />
              )
            )
          ) : (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <BookOpen size={36} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No classes scheduled for tomorrow
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Enjoy your free day or configure classes in the Timetable tab.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  topBar: {
    marginBottom: 10,
  },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dateHeader: {
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  dateText: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 6,
  },
  daySubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  specialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  specialTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  overrideTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  overrideTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  holidayCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 16,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  holidaySub: {
    fontSize: 12,
    textAlign: 'center',
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 16,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  timelineSection: {
    marginBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
