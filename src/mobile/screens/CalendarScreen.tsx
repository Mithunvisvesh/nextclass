import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
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
  FileText,
  CalendarCheck,
} from 'lucide-react-native';
import { CalendarEventModal } from '../components/modals/CalendarEventModal';
import { CalendarEntry } from '../../types/calendar';
import {
  formatDatePretty,
  parseTimeToMinutes,
  getTodayIsoString,
} from '../../core/timeUtils';
import { pickAndParseCalendar } from '../../services/pdf/fileImportService';
import { CalendarReviewModal } from '../components/modals/CalendarReviewModal';
import { ParsedCalendarResult } from '../../services/pdf/calendarParser';

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
    importCalendarEntries,
  } = useMobileSchedule();
  const { colors } = useTheme();

  // Selected date defaults to activeDate or today
  const [selectedDate, setSelectedDate] = useState<string>(activeDate || getTodayIsoString());
  const [eventModalVisible, setEventModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [calendarResult, setCalendarResult] = useState<ParsedCalendarResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

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

  const getDateIso = (day: number) => {
    const m = (currentMonth + 1).toString().padStart(2, '0');
    const d = day.toString().padStart(2, '0');
    return `${currentYear}-${m}-${d}`;
  };

  // Schedule for currently selected date
  const scheduleForSelected = getSchedule(selectedDate);
  const { classes, freePeriods } = scheduleForSelected;

  // Interleave classes & breaks
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

  // Calendar entries for selected date
  const selectedDateEvents = calendar.entries.filter(e => e.date === selectedDate);

  const handleImportCalendar = async () => {
    setIsParsing(true);
    try {
      const res = await pickAndParseCalendar();
      if (!res.success) {
        if (!res.isCancelled) {
          Alert.alert('PDF Import Error', res.error);
        }
        return;
      }
      setCalendarResult(res.result);
      setShowReviewModal(true);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      {/* Missing Calendar Empty State Card */}
      {calendar.entries.length === 0 && (
        <View style={[styles.emptyCalendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <CalendarCheck size={28} color={colors.primary} />
          <Text style={[styles.emptyCalTitle, { color: colors.text }]}>No academic calendar yet</Text>
          <Text style={[styles.emptyCalDesc, { color: colors.textSecondary }]}>
            Import your academic calendar PDF or add events manually.
          </Text>
          <View style={styles.emptyCalActions}>
            <TouchableOpacity
              style={[styles.importBtnLarge, { backgroundColor: colors.primary }]}
              onPress={handleImportCalendar}
              disabled={isParsing}
            >
              <FileText size={16} color="#FFFFFF" />
              <Text style={styles.importBtnLargeText}>Import Academic Calendar PDF</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.primary }]}
              onPress={() => {
                setSelectedEntry(null);
                setEventModalVisible(true);
              }}
            >
              <Plus size={16} color={colors.primary} />
              <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Add Event Manually</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Month Navigator */}
      <View style={[styles.monthBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
          <ChevronLeft size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.monthTitle, { color: colors.text }]}>
          {monthNames[currentMonth]} {currentYear}
        </Text>
        <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
          <ChevronRight size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Weekday Row */}
      <View style={styles.weekdayRow}>
        {WEEK_DAYS.map(w => (
          <Text key={w} style={[styles.weekdayText, { color: colors.textTertiary }]}>
            {w}
          </Text>
        ))}
      </View>

      {/* Calendar Grid */}
      <View style={styles.grid}>
        {daysArray.map((day, idx) => {
          if (day === null) {
            return <View key={`empty-${idx}`} style={styles.dayCell} />;
          }

          const iso = getDateIso(day);
          const isSelected = iso === selectedDate;
          const isToday = iso === getTodayIsoString();

          const calEntry = calendar.entries.find(e => e.date === iso);
          const hasOverride = overrides.some(o => o.date === iso);
          const isHoliday = calEntry?.type === 'holiday';
          const isSpecial = calEntry?.type === 'special_timetable';

          return (
            <TouchableOpacity
              key={`day-${day}`}
              style={[
                styles.dayCell,
                isSelected && [styles.selectedCell, { borderColor: colors.primary }],
                isToday && !isSelected && styles.todayCell,
              ]}
              onPress={() => setSelectedDate(iso)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.dayNumWrap,
                  isSelected && { backgroundColor: colors.primary },
                  isToday && !isSelected && { backgroundColor: colors.surfaceVariant },
                ]}
              >
                <Text
                  style={[
                    styles.dayNum,
                    { color: isSelected ? '#FFFFFF' : isToday ? colors.primary : colors.text },
                    isSelected && { fontWeight: '800' },
                  ]}
                >
                  {day}
                </Text>
              </View>

              {/* Status Indicator Dots */}
              <View style={styles.dotRow}>
                {isHoliday && <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />}
                {isSpecial && <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />}
                {hasOverride && <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#EF4444' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Holiday</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Special Timetable</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
          <Text style={[styles.legendText, { color: colors.textSecondary }]}>Override Active</Text>
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
              style={[styles.importBtnSmall, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
              onPress={handleImportCalendar}
              disabled={isParsing}
            >
              <FileText size={13} color={colors.primary} />
              <Text style={[styles.importBtnSmallText, { color: colors.primary }]}>Import PDF</Text>
            </TouchableOpacity>

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

        {/* Selected Date Calendar Events */}
        {selectedDateEvents.length > 0 && (
          <View style={styles.eventsContainer}>
            {selectedDateEvents.map(evt => (
              <View
                key={evt.id}
                style={[styles.eventBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.eventTitleText, { color: colors.text }]}>{evt.title}</Text>
                  <Text style={[styles.eventTypeSubtitle, { color: colors.textSecondary }]}>
                    {evt.type === 'special_timetable'
                      ? `Special Order: Runs ${evt.timetableSourceDay || 'Altered'} Schedule`
                      : evt.type.toUpperCase()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.deleteEvtBtn}
                  onPress={() => deleteCalendarEntry(evt.id)}
                  accessibilityLabel="Delete event"
                >
                  <Trash2 size={15} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

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
          await addCalendarEntry(entry);
          setEventModalVisible(false);
        }}
        defaultDate={selectedDate}
        initialData={selectedEntry}
        onDelete={async (id) => {
          await deleteCalendarEntry(id);
          setEventModalVisible(false);
        }}
      />

      {/* Calendar PDF Review Modal */}
      <CalendarReviewModal
        visible={showReviewModal}
        parsedResult={calendarResult}
        onClose={() => setShowReviewModal(false)}
        hasExistingEntries={calendar.entries.length > 0}
        onConfirm={async (newEntries, mode) => {
          await importCalendarEntries(newEntries, mode);
          setShowReviewModal(false);
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyCalendarCard: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyCalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyCalDesc: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  emptyCalActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  importBtnLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  importBtnLargeText: {
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
  monthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  navBtn: {
    padding: 6,
  },
  weekdayRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
  },
  selectedCell: {
    borderWidth: 1.5,
  },
  todayCell: {},
  dayNumWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNum: {
    fontSize: 14,
    fontWeight: '600',
  },
  dotRow: {
    flexDirection: 'row',
    gap: 3,
    marginTop: 2,
    height: 4,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '600',
  },
  selectedSection: {
    padding: 16,
    paddingBottom: 32,
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
    marginTop: 2,
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  importBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  importBtnSmallText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addEventBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addEventBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  simBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  simBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  eventsContainer: {
    marginBottom: 12,
    gap: 6,
  },
  eventBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  eventTitleText: {
    fontSize: 13,
    fontWeight: '700',
  },
  eventTypeSubtitle: {
    fontSize: 11,
    marginTop: 1,
  },
  deleteEvtBtn: {
    padding: 6,
  },
  holidayBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 14,
  },
  holidayBoxTitle: {
    fontSize: 15,
    fontWeight: '800',
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
    fontWeight: '700',
    flex: 1,
  },
  timelineList: {
    gap: 8,
  },
  emptyBox: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  emptyBoxText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
});
