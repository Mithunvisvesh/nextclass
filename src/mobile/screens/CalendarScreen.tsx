import React, { useState } from 'react';
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
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Sparkles,
  PartyPopper,
  Clock,
  Play,
  CheckCircle2,
  Plus,
  Trash2,
} from 'lucide-react-native';
import { CalendarEventModal } from '../components/modals/CalendarEventModal';
import { CalendarEntry } from '../../types/calendar';
import {
  formatDatePretty,
  parseTimeToMinutes,
  getTodayIsoString,
} from '../../core/timeUtils';

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarScreen: React.FC = () => {
  const {
    calendar,
    overrides,
    getSchedule,
    activeDate,
    setSimulatedDateTime,
    setActiveTab,
    addCalendarEntry,
    deleteCalendarEntry,
  } = useMobileSchedule();
  const { colors } = useTheme();

  // Selected date defaults to activeDate or today
  const [selectedDate, setSelectedDate] = useState<string>(activeDate || getTodayIsoString());
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

  // Current view month/year
  const initialDateObj = new Date(selectedDate);
  const [currentYear, setCurrentYear] = useState(
    isNaN(initialDateObj.getFullYear()) ? 2026 : initialDateObj.getFullYear()
  );
  const [currentMonth, setCurrentMonth] = useState(
    isNaN(initialDateObj.getMonth()) ? 8 : initialDateObj.getMonth() // 8 = Sept (0-indexed)
  );

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  // Month metadata
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  // Generate day matrix
  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  // Helper to format YYYY-MM-DD
  const formatIso = (year: number, month: number, day: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Projected schedule for selectedDate
  const scheduleForSelected = getSchedule(selectedDate);

  // Timeline items for selected date
  type TimelineItem =
    | { type: 'class'; data: typeof scheduleForSelected.classes[0]; sortKey: number }
    | { type: 'break'; data: typeof scheduleForSelected.freePeriods[0]; sortKey: number };

  const timelineItems: TimelineItem[] = [
    ...scheduleForSelected.classes.map(c => ({
      type: 'class' as const,
      data: c,
      sortKey: parseTimeToMinutes(c.startTime),
    })),
    ...scheduleForSelected.freePeriods.map(p => ({
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
      {/* Month Navigator */}
      <View style={[styles.monthCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <ChevronLeft size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: colors.text }]}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <ChevronRight size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Days of week */}
        <View style={styles.weekDaysRow}>
          {WEEK_DAYS.map((wd, i) => (
            <Text
              key={wd}
              style={[
                styles.weekDayText,
                { color: i === 0 || i === 6 ? colors.textTertiary : colors.textSecondary },
              ]}
            >
              {wd}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {daysArray.map((dayNum, idx) => {
            if (dayNum === null) {
              return <View key={`pad-${idx}`} style={styles.emptyDayCell} />;
            }

            const dateStr = formatIso(currentYear, currentMonth, dayNum);
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === getTodayIsoString();

            // Check events / overrides for indicators
            const calEntries = calendar.entries.filter(e => {
              if (e.date) return e.date === dateStr;
              if (e.startDate && e.endDate) return dateStr >= e.startDate && dateStr <= e.endDate;
              return false;
            });
            const hasOverride = overrides.some(o => o.date === dateStr);
            const hasHoliday = calEntries.some(e => e.type === 'holiday' || e.type === 'vacation');
            const hasSpecial = calEntries.some(e => e.type === 'special_timetable');
            const hasExam = calEntries.some(e => e.type === 'exam');

            return (
              <TouchableOpacity
                key={`day-${dateStr}`}
                style={[
                  styles.dayCell,
                  isSelected && [styles.selectedCell, { backgroundColor: colors.primary }],
                  isToday && !isSelected && [styles.todayCell, { borderColor: colors.primary }],
                ]}
                onPress={() => setSelectedDate(dateStr)}
              >
                <Text
                  style={[
                    styles.dayCellText,
                    {
                      color: isSelected
                        ? '#FFFFFF'
                        : isToday
                        ? colors.primary
                        : colors.text,
                      fontWeight: isSelected || isToday ? '800' : '500',
                    },
                  ]}
                >
                  {dayNum}
                </Text>

                {/* Dot Indicators */}
                <View style={styles.dotRow}>
                  {hasHoliday && <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />}
                  {hasSpecial && <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />}
                  {hasExam && <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />}
                  {hasOverride && <View style={[styles.dot, { backgroundColor: '#8B5CF6' }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legend */}
        <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>Holiday</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F59E0B' }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>Day Order</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#3B82F6' }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>Exam</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={[styles.legendText, { color: colors.textTertiary }]}>Override</Text>
          </View>
        </View>
      </View>

      {/* Selected Date Schedule Section */}
      <View style={styles.selectedSection}>
        <View style={styles.selectedHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.selectedTitle, { color: colors.text }]}>
              {formatDatePretty(selectedDate)}
            </Text>
            <Text style={[styles.selectedSub, { color: colors.textSecondary }]}>
              {scheduleForSelected.isSpecialTimetable
                ? `${scheduleForSelected.specialTimetableNote || `Follows ${scheduleForSelected.effectiveSourceDay} schedule`}`
                : `${scheduleForSelected.actualDayOfWeek} Schedule`}
            </Text>
          </View>

          <View style={styles.actionBtnRow}>
            <TouchableOpacity
              style={[styles.addEventBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                setSelectedEntry(null);
                setEventModalVisible(true);
              }}
            >
              <Plus size={13} color="#FFFFFF" />
              <Text style={styles.addEventBtnText}>Add Event</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simBtn, { backgroundColor: colors.surfaceVariant }]}
              onPress={() => {
                setSimulatedDateTime(selectedDate, '08:15');
                setActiveTab('today');
              }}
            >
              <Play size={12} color={colors.primary} />
              <Text style={[styles.simBtnText, { color: colors.primary }]}>Simulate</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Holiday Banner */}
        {scheduleForSelected.isHoliday ? (
          <View style={[styles.holidayBox, { backgroundColor: '#ECFDF5', borderColor: '#6EE7B7' }]}>
            <PartyPopper size={24} color="#059669" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.holidayBoxTitle, { color: '#065F46' }]}>
                {scheduleForSelected.holidayTitle || 'Official College Holiday'}
              </Text>
              <Text style={[styles.holidayBoxSub, { color: '#047857' }]}>
                No academic classes scheduled.
              </Text>
            </View>
          </View>
        ) : scheduleForSelected.isSpecialTimetable ? (
          <View style={[styles.specialBox, { backgroundColor: '#FFFBEB', borderColor: '#FCD34D' }]}>
            <Sparkles size={18} color="#D97706" />
            <Text style={[styles.specialBoxText, { color: '#92400E' }]}>
              Day Order Modified: Running {scheduleForSelected.effectiveSourceDay} schedule.
            </Text>
          </View>
        ) : null}

        {/* Classes on Selected Date */}
        {!scheduleForSelected.isHoliday && (
          <View style={styles.timelineList}>
            {timelineItems.length > 0 ? (
              timelineItems.map((item, idx) =>
                item.type === 'class' ? (
                  <ClassCard key={`sel-cls-${item.data.id}-${idx}`} classItem={item.data} />
                ) : (
                  <FreePeriodCard key={`sel-brk-${item.data.startTime}-${idx}`} freePeriod={item.data} />
                )
              )
            ) : (
              <View style={[styles.emptyBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <CalendarIcon size={32} color={colors.textTertiary} />
                <Text style={[styles.emptyBoxText, { color: colors.textSecondary }]}>
                  No classes scheduled on this date.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Calendar Event Modal */}
      <CalendarEventModal
        visible={eventModalVisible}
        onClose={() => setEventModalVisible(false)}
        onSave={async (entry) => {
          if (entry.id) {
            await deleteCalendarEntry(entry.id);
          }
          await addCalendarEntry(entry);
        }}
        onDelete={async (id) => {
          await deleteCalendarEntry(id);
        }}
        initialData={selectedEntry}
        defaultDate={selectedDate}
      />
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
    paddingBottom: 28,
  },
  monthCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  navBtn: {
    padding: 6,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  weekDayText: {
    width: 38,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyDayCell: {
    width: 38,
    height: 44,
  },
  dayCell: {
    width: 38,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    marginVertical: 2,
  },
  selectedCell: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  todayCell: {
    borderWidth: 1.5,
  },
  dayCellText: {
    fontSize: 13,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedSection: {
    marginTop: 4,
  },
  selectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  selectedSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addEventBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  holidayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  holidayBoxTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  holidayBoxSub: {
    fontSize: 12,
  },
  specialBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 14,
  },
  specialBoxText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  timelineList: {
    marginTop: 4,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  emptyBoxText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
