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
import { DayOfWeek, TimetableClass } from '../../types/timetable';
import { ClassModal } from '../components/modals/ClassModal';
import {
  ShieldCheck,
  Plus,
  Clock,
  MapPin,
  User,
  FlaskConical,
  Edit3,
  Calendar,
  FileText,
} from 'lucide-react-native';
import { formatTime12Hour, parseTimeToMinutes } from '../../core/timeUtils';
import { pickAndParseTimetable } from '../../services/pdf/fileImportService';
import { TimetableReviewModal } from '../components/modals/TimetableReviewModal';
import { ParsedTimetableResult } from '../../services/pdf/timetableParser';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableScreen: React.FC = () => {
  const {
    timetable,
    addTimetableClass,
    updateTimetableClass,
    deleteTimetableClass,
    importTimetableClasses,
  } = useMobileSchedule();
  const { colors } = useTheme();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);

  const [isParsing, setIsParsing] = useState(false);
  const [timetableResult, setTimetableResult] = useState<ParsedTimetableResult | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Filter and sort classes for the selected day
  const dayClasses = timetable.classes
    .filter(c => c.dayOfWeek === selectedDay)
    .sort((a, b) => parseTimeToMinutes(a.startTime) - parseTimeToMinutes(b.startTime));

  const handleOpenAdd = () => {
    setEditingClass(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (c: TimetableClass) => {
    setEditingClass(c);
    setModalVisible(true);
  };

  const handleSaveClass = async (data: Omit<TimetableClass, 'id'> & { id?: string }) => {
    if (data.id) {
      await updateTimetableClass(data as TimetableClass);
    } else {
      await addTimetableClass(data);
    }
  };

  const handleDeleteClass = async (id: string) => {
    await deleteTimetableClass(id);
  };

  const handleImportTimetable = async () => {
    setIsParsing(true);
    try {
      const res = await pickAndParseTimetable();
      if (!res.success) {
        if (!res.isCancelled) {
          Alert.alert('PDF Import Error', res.error);
        }
        return;
      }
      setTimetableResult(res.result);
      setShowReviewModal(true);
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Day Selector Strip */}
      <View style={[styles.dayBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScroll}>
          {DAYS.map(day => {
            const count = timetable.classes.filter(c => c.dayOfWeek === day).length;
            const isSelected = selectedDay === day;
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayTab,
                  isSelected && [styles.dayTabActive, { backgroundColor: colors.primary }],
                ]}
                onPress={() => setSelectedDay(day)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.dayTabText,
                    { color: isSelected ? '#FFFFFF' : colors.textSecondary },
                  ]}
                >
                  {day.slice(0, 3)}
                </Text>
                {count > 0 && (
                  <View
                    style={[
                      styles.countBadge,
                      {
                        backgroundColor: isSelected
                          ? 'rgba(255, 255, 255, 0.25)'
                          : colors.surfaceVariant,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.countText,
                        { color: isSelected ? '#FFFFFF' : colors.textTertiary },
                      ]}
                    >
                      {count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Baseline Invariant Banner */}
        <View style={[styles.invariantCard, { backgroundColor: colors.surfaceVariant }]}>
          <ShieldCheck size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.invariantTitle, { color: colors.text }]}>
              Protected Weekly Baseline
            </Text>
            <Text style={[styles.invariantBody, { color: colors.textSecondary }]}>
              This is your recurring master timetable. Date-specific calendar swaps or cancellations
              never modify these baseline slots.
            </Text>
          </View>
        </View>

        {/* Day Header & Action Buttons */}
        <View style={styles.dayHeader}>
          <View>
            <Text style={[styles.dayTitle, { color: colors.text }]}>{selectedDay}</Text>
            <Text style={[styles.dayMeta, { color: colors.textTertiary }]}>
              {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''} scheduled
            </Text>
          </View>

          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.importBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
              onPress={handleImportTimetable}
              disabled={isParsing}
              activeOpacity={0.8}
            >
              <FileText size={15} color={colors.primary} />
              <Text style={[styles.importBtnText, { color: colors.primary }]}>Import PDF</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: colors.primary }]}
              onPress={handleOpenAdd}
              activeOpacity={0.8}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addBtnText}>Add Class</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Classes List or Clean Empty States */}
        {dayClasses.length > 0 ? (
          dayClasses.map((item) => {
            const startM = parseTimeToMinutes(item.startTime);
            const endM = parseTimeToMinutes(item.endTime);
            const dur = endM - startM;
            const hours = Math.floor(dur / 60);
            const mins = dur % 60;
            const durationStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}` : `${mins}m`;
            const isLab = item.type === 'lab';

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.classCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
                onPress={() => handleOpenEdit(item)}
                activeOpacity={0.7}
              >
                {/* Left accent bar */}
                <View
                  style={[
                    styles.accentBar,
                    { backgroundColor: item.color || colors.primary },
                  ]}
                />

                <View style={styles.cardMain}>
                  <View style={styles.cardHeader}>
                    <View style={styles.codeWrap}>
                      <Text style={[styles.courseCode, { color: colors.primary }]}>
                        {item.courseCode}
                      </Text>
                      {isLab && (
                        <View style={[styles.labBadge, { backgroundColor: '#FEF3C7' }]}>
                          <FlaskConical size={11} color="#D97706" />
                          <Text style={[styles.labText, { color: '#B45309' }]}>LAB</Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.editAction}>
                      <Edit3 size={14} color={colors.textTertiary} />
                    </View>
                  </View>

                  <Text style={[styles.courseName, { color: colors.text }]} numberOfLines={2}>
                    {item.courseName}
                  </Text>

                  <View style={styles.detailsRow}>
                    <View style={styles.detailItem}>
                      <Clock size={13} color={colors.textTertiary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {formatTime12Hour(item.startTime)} – {formatTime12Hour(item.endTime)} ({durationStr})
                      </Text>
                    </View>

                    <View style={styles.detailItem}>
                      <MapPin size={13} color={colors.textTertiary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {item.room}
                      </Text>
                    </View>
                  </View>

                  {item.faculty ? (
                    <View style={[styles.detailItem, { marginTop: 4 }]}>
                      <User size={13} color={colors.textTertiary} />
                      <Text style={[styles.detailText, { color: colors.textSecondary }]}>
                        {item.faculty}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        ) : timetable.classes.length === 0 ? (
          /* NO TIMETABLE YET */
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <FileText size={36} color={colors.primary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No timetable yet
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Import your timetable PDF or add classes manually.
            </Text>
            <View style={styles.emptyActionRow}>
              <TouchableOpacity
                style={[styles.addEmptyBtn, { backgroundColor: colors.primary }]}
                onPress={handleImportTimetable}
                disabled={isParsing}
              >
                <FileText size={16} color="#FFFFFF" />
                <Text style={styles.addEmptyBtnText}>Import Timetable PDF</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.outlineEmptyBtn, { borderColor: colors.primary }]}
                onPress={handleOpenAdd}
              >
                <Plus size={16} color={colors.primary} />
                <Text style={[styles.outlineEmptyText, { color: colors.primary }]}>
                  Add Manually
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* TIMETABLE CONFIGURED BUT NO CLASSES FOR SELECTED DAY */
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Calendar size={36} color={colors.textTertiary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No classes for {selectedDay}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              Add your lectures, labs, or tutorials for {selectedDay}.
            </Text>
            <TouchableOpacity
              style={[styles.addEmptyBtn, { backgroundColor: colors.primary }]}
              onPress={handleOpenAdd}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addEmptyBtnText}>Add Class to {selectedDay}</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <ClassModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveClass}
        onDelete={handleDeleteClass}
        initialData={editingClass}
        defaultDay={selectedDay}
      />

      {/* Timetable PDF Review Modal */}
      <TimetableReviewModal
        visible={showReviewModal}
        parsedResult={timetableResult}
        onClose={() => setShowReviewModal(false)}
        hasExistingClasses={timetable.classes.length > 0}
        onConfirm={async (newClasses, mode) => {
          await importTimetableClasses(newClasses, mode);
          setShowReviewModal(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dayBar: {
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  dayScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  dayTabActive: {},
  dayTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  invariantCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  invariantTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  invariantBody: {
    fontSize: 11,
    lineHeight: 15,
  },
  dayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  dayMeta: {
    fontSize: 12,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  importBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  classCard: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
  },
  accentBar: {
    width: 6,
  },
  cardMain: {
    flex: 1,
    padding: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  codeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseCode: {
    fontSize: 12,
    fontWeight: '800',
  },
  labBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  labText: {
    fontSize: 10,
    fontWeight: '800',
  },
  editAction: {
    padding: 2,
  },
  courseName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 28,
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 18,
  },
  emptyActionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  addEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addEmptyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  outlineEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  outlineEmptyText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
