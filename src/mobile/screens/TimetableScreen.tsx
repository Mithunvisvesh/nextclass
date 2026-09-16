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
} from 'lucide-react-native';
import { formatTime12Hour, parseTimeToMinutes } from '../../core/timeUtils';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableScreen: React.FC = () => {
  const { timetable, addTimetableClass, updateTimetableClass, deleteTimetableClass } =
    useMobileSchedule();
  const { colors } = useTheme();

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<TimetableClass | null>(null);

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

        {/* Day Header & Add Button */}
        <View style={styles.dayHeader}>
          <View>
            <Text style={[styles.dayTitle, { color: colors.text }]}>{selectedDay}</Text>
            <Text style={[styles.dayMeta, { color: colors.textTertiary }]}>
              {dayClasses.length} class{dayClasses.length !== 1 ? 'es' : ''} scheduled
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleOpenAdd}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Class</Text>
          </TouchableOpacity>
        </View>

        {/* Classes List */}
        {dayClasses.length > 0 ? (
          dayClasses.map((item, index) => {
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

                  {(item.instructor || item.faculty) ? (
                    <View style={[styles.detailItem, { marginTop: 4 }]}>
                      <User size={12} color={colors.textTertiary} />
                      <Text style={[styles.instructorText, { color: colors.textTertiary }]}>
                        {item.instructor || item.faculty}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
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
              Add your lectures, labs, or tutorials to build your master timetable.
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
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  dayTabActive: {
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  dayTabText: {
    fontSize: 13,
    fontWeight: '700',
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  countText: {
    fontSize: 10,
    fontWeight: '800',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
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
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  classCard: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  accentBar: {
    width: 5,
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
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
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
    fontSize: 9,
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
    flexWrap: 'wrap',
    gap: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    fontWeight: '500',
  },
  instructorText: {
    fontSize: 11,
    fontWeight: '500',
  },
  emptyCard: {
    padding: 24,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 8,
  },
  emptySubtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    textAlign: 'center',
  },
  addEmptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addEmptyBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
