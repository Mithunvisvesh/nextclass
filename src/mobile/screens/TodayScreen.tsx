import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { useTheme } from '../../theme/theme';
import { ClassCard } from '../components/ClassCard';
import { FreePeriodCard } from '../components/FreePeriodCard';
import {
  Sparkles,
  MapPin,
  User,
  Clock,
  ArrowRight,
  PartyPopper,
  Calendar,
  AlertCircle,
  PlusCircle,
  CheckCircle2,
} from 'lucide-react-native';
import {
  formatDatePretty,
  formatTime12Hour,
  parseTimeToMinutes,
  getCurrentTimeIso,
} from '../../core/timeUtils';

export const TodayScreen: React.FC = () => {
  const {
    todaySchedule,
    tomorrowSchedule,
    setActiveTab,
    simulatedTime,
    isSimulationActive,
    enterDemoMode,
  } = useMobileSchedule();
  const { colors } = useTheme();

  const currentTime = simulatedTime || getCurrentTimeIso();
  const currentMinutes = parseTimeToMinutes(currentTime);

  const {
    currentClass,
    nextClass,
    classes,
    freePeriods,
    isHoliday,
    holidayTitle,
    isSpecialTimetable,
    specialTimetableNote,
    appliedOverrides,
    effectiveSourceDay,
    actualDayOfWeek,
  } = todaySchedule;

  // Interleave classes and free periods by start time
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

  // Minutes remaining in current class
  const minutesRemaining = currentClass
    ? parseTimeToMinutes(currentClass.endTime) - currentMinutes
    : 0;

  // Minutes until next class
  const minutesUntilNext = nextClass
    ? parseTimeToMinutes(nextClass.startTime) - currentMinutes
    : 0;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Date & Schedule Subtitle */}
      <View style={styles.dateHeader}>
        <View style={styles.dateTitleWrap}>
          <Text style={[styles.dateTitle, { color: colors.text }]}>
            {formatDatePretty(todaySchedule.date)}
          </Text>
          <View style={styles.scheduleTypeRow}>
            {isSpecialTimetable ? (
              <View style={styles.specialTag}>
                <Sparkles size={14} color="#D97706" />
                <Text style={styles.specialTagText}>
                  {specialTimetableNote || `Follows ${effectiveSourceDay} Schedule`}
                </Text>
              </View>
            ) : (
              <Text style={[styles.daySubtitle, { color: colors.textSecondary }]}>
                {actualDayOfWeek} Schedule
              </Text>
            )}
          </View>
        </View>

        {appliedOverrides.length > 0 && (
          <TouchableOpacity
            style={[styles.overrideBadge, { backgroundColor: '#EFF6FF', borderColor: colors.primary }]}
            onPress={() => setActiveTab('changes')}
          >
            <Text style={[styles.overrideBadgeText, { color: colors.primary }]}>
              {appliedOverrides.length} change{appliedOverrides.length > 1 ? 's' : ''} active
            </Text>
            <ArrowRight size={12} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Holiday Banner */}
      {isHoliday ? (
        <View style={[styles.holidayCard, { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' }]}>
          <View style={styles.holidayIconWrap}>
            <PartyPopper size={28} color="#059669" />
          </View>
          <Text style={[styles.holidayTitle, { color: '#065F46' }]}>
            {holidayTitle || 'Official College Holiday'}
          </Text>
          <Text style={[styles.holidaySub, { color: '#047857' }]}>
            No academic classes scheduled today. Enjoy your day off!
          </Text>
        </View>
      ) : isSpecialTimetable ? (
        <View style={[styles.alertCard, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}>
          <AlertCircle size={18} color="#D97706" />
          <Text style={[styles.alertText, { color: '#92400E' }]}>
            Special Academic Day: {specialTimetableNote || `Running ${effectiveSourceDay} timetable`}.
          </Text>
        </View>
      ) : null}

      {/* Hero Class Card (Happening Now or Next or Done) */}
      {!isHoliday && (
        <View style={styles.heroSection}>
          {currentClass ? (
            /* HAPPENING NOW */
            <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
              <View style={styles.heroTopRow}>
                <View style={styles.liveIndicator}>
                  <View style={styles.livePulse} />
                  <Text style={styles.liveText}>HAPPENING NOW</Text>
                </View>
                <View style={styles.timeRemainingPill}>
                  <Clock size={12} color="#FFFFFF" />
                  <Text style={styles.timeRemainingText}>
                    {minutesRemaining > 0 ? `${minutesRemaining}m left` : 'Ending now'}
                  </Text>
                </View>
              </View>

              <Text style={styles.heroCourseName} numberOfLines={2}>
                {currentClass.courseName}
              </Text>
              <Text style={styles.heroCourseCode}>
                {currentClass.courseCode} • {currentClass.type}
              </Text>

              {/* Progress bar */}
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressBar,
                    { width: `${Math.min(100, Math.max(0, currentClass.progressPercent || 0))}%` },
                  ]}
                />
              </View>

              <View style={styles.heroMetaRow}>
                <View style={styles.metaItem}>
                  <Clock size={14} color="#BFDBFE" />
                  <Text style={styles.heroMetaText}>
                    {formatTime12Hour(currentClass.startTime)} – {formatTime12Hour(currentClass.endTime)}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <MapPin size={14} color="#BFDBFE" />
                  <Text style={styles.heroMetaText}>{currentClass.room}</Text>
                </View>
              </View>

              {(currentClass.instructor || currentClass.faculty) ? (
                <View style={[styles.metaItem, { marginTop: 6 }]}>
                  <User size={13} color="#93C5FD" />
                  <Text style={styles.instructorText}>
                    {currentClass.instructor || currentClass.faculty}
                  </Text>
                </View>
              ) : null}
            </View>
          ) : nextClass ? (
            /* NEXT UP */
            <View
              style={[
                styles.nextHeroCard,
                { backgroundColor: colors.surface, borderColor: colors.primary },
              ]}
            >
              <View style={styles.heroTopRow}>
                <View style={[styles.nextBadge, { backgroundColor: colors.surfaceVariant }]}>
                  <Sparkles size={12} color={colors.primary} />
                  <Text style={[styles.nextBadgeText, { color: colors.primary }]}>NEXT CLASS</Text>
                </View>
                <Text style={[styles.startsInText, { color: colors.textSecondary }]}>
                  Starts in {minutesUntilNext}m ({formatTime12Hour(nextClass.startTime)})
                </Text>
              </View>

              <Text style={[styles.nextCourseName, { color: colors.text }]} numberOfLines={1}>
                {nextClass.courseName}
              </Text>

              <View style={styles.nextMetaRow}>
                <Text style={[styles.nextCourseCode, { color: colors.textSecondary }]}>
                  {nextClass.courseCode} • {nextClass.type}
                </Text>
                <View style={styles.roomTag}>
                  <MapPin size={12} color={colors.primary} />
                  <Text style={[styles.roomTagText, { color: colors.primary }]}>
                    {nextClass.room}
                  </Text>
                </View>
              </View>
            </View>
          ) : classes.length > 0 ? (
            /* ALL CLASSES DONE */
            <View
              style={[
                styles.doneCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <CheckCircle2 size={32} color="#10B981" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.doneTitle, { color: colors.text }]}>
                  All done for today!
                </Text>
                <Text style={[styles.doneSubtitle, { color: colors.textSecondary }]}>
                  You've completed all scheduled classes for {actualDayOfWeek}.
                </Text>
              </View>
            </View>
          ) : (
            /* NO CLASSES CONFIGURED */
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Calendar size={36} color={colors.textTertiary} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                No classes scheduled today
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                Your timetable for {actualDayOfWeek} is currently empty.
              </Text>
              <View style={styles.emptyActions}>
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setActiveTab('timetable')}
                >
                  <PlusCircle size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Add Class in Timetable</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.outlineBtn, { borderColor: colors.primary }]}
                  onPress={enterDemoMode}
                >
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
                    Load Demo Timetable
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Timeline Section */}
      {timelineItems.length > 0 && (
        <View style={styles.timelineSection}>
          <View style={styles.timelineHeader}>
            <Text style={[styles.sectionHeading, { color: colors.text }]}>Today's Timeline</Text>
            <Text style={[styles.sectionCount, { color: colors.textTertiary }]}>
              {classes.length} class{classes.length !== 1 ? 'es' : ''}
            </Text>
          </View>

          {timelineItems.map((item, idx) =>
            item.type === 'class' ? (
              <ClassCard key={`cls-${item.data.id}-${idx}`} classItem={item.data} />
            ) : (
              <FreePeriodCard key={`brk-${item.data.startTime}-${idx}`} freePeriod={item.data} />
            )
          )}
        </View>
      )}

      {/* Tomorrow's Preview */}
      <View style={[styles.tomorrowCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.tomorrowHeader}>
          <View>
            <Text style={[styles.tomorrowLabel, { color: colors.primary }]}>AHEAD OF TIME</Text>
            <Text style={[styles.tomorrowTitle, { color: colors.text }]}>
              Tomorrow ({tomorrowSchedule.actualDayOfWeek})
            </Text>
            <Text style={[styles.tomorrowDate, { color: colors.textTertiary }]}>
              {formatDatePretty(tomorrowSchedule.date)}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.viewTomorrowBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => setActiveTab('tomorrow')}
          >
            <Text style={[styles.viewTomorrowText, { color: colors.primary }]}>View</Text>
            <ArrowRight size={14} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {tomorrowSchedule.isHoliday ? (
          <View style={styles.tomorrowHoliday}>
            <PartyPopper size={16} color="#059669" />
            <Text style={styles.tomorrowHolidayText}>
              Holiday: {tomorrowSchedule.holidayTitle || 'Day off'}
            </Text>
          </View>
        ) : (
          <Text style={[styles.tomorrowSummary, { color: colors.textSecondary }]}>
            {tomorrowSchedule.classes.length > 0
              ? `${tomorrowSchedule.classes.length} class${
                  tomorrowSchedule.classes.length > 1 ? 'es' : ''
                } scheduled, starting at ${formatTime12Hour(tomorrowSchedule.classes[0].startTime)}`
              : 'No classes scheduled for tomorrow.'}
          </Text>
        )}
      </View>
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
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTitleWrap: {
    flex: 1,
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  scheduleTypeRow: {
    marginTop: 2,
  },
  daySubtitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  specialTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  specialTagText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#D97706',
  },
  overrideBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  overrideBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  holidayCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    marginBottom: 14,
  },
  holidayIconWrap: {
    marginBottom: 6,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
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
    marginBottom: 14,
  },
  alertText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
  },
  heroSection: {
    marginBottom: 16,
  },
  heroCard: {
    borderRadius: 16,
    padding: 18,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34D399',
  },
  liveText: {
    color: '#A7F3D0',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeRemainingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  timeRemainingText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  heroCourseName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginBottom: 2,
  },
  heroCourseCode: {
    color: '#DBEAFE',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#34D399',
    borderRadius: 3,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroMetaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  instructorText: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '500',
  },
  nextHeroCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 16,
  },
  nextBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nextBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  startsInText: {
    fontSize: 12,
    fontWeight: '600',
  },
  nextCourseName: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  nextMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextCourseCode: {
    fontSize: 12,
  },
  roomTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roomTagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  doneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  doneTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  doneSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  emptyCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  emptyActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineSection: {
    marginBottom: 20,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionHeading: {
    fontSize: 16,
    fontWeight: '800',
  },
  sectionCount: {
    fontSize: 12,
    fontWeight: '600',
  },
  tomorrowCard: {
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
  },
  tomorrowHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tomorrowLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tomorrowTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  tomorrowDate: {
    fontSize: 11,
    marginTop: 1,
  },
  viewTomorrowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewTomorrowText: {
    fontSize: 12,
    fontWeight: '700',
  },
  tomorrowSummary: {
    fontSize: 13,
    lineHeight: 18,
  },
  tomorrowHoliday: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tomorrowHolidayText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
  },
});
