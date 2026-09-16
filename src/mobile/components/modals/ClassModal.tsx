import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { DayOfWeek, TimetableClass, ClassType } from '../../../types/timetable';
import { useTheme } from '../../../theme/theme';
import { X, Check, Trash2, Clock, MapPin, User, BookOpen } from 'lucide-react-native';

interface ClassModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (classData: Omit<TimetableClass, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: TimetableClass | null;
  defaultDay?: DayOfWeek;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TYPES: { value: ClassType; label: string }[] = [
  { value: 'lecture', label: 'Lecture' },
  { value: 'lab', label: 'Lab' },
  { value: 'tutorial', label: 'Tutorial' },
  { value: 'activity', label: 'Activity' },
  { value: 'counselling', label: 'Counselling' },
];
const PRESET_COLORS = [
  '#2563EB', // Blue
  '#059669', // Emerald
  '#D97706', // Amber
  '#DC2626', // Red
  '#7C3AED', // Purple
  '#0891B2', // Cyan
  '#4F46E5', // Indigo
];

export const ClassModal: React.FC<ClassModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultDay = 'Monday',
}) => {
  const { colors } = useTheme();

  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState('08:10');
  const [endTime, setEndTime] = useState('09:00');
  const [room, setRoom] = useState('');
  const [instructor, setInstructor] = useState('');
  const [type, setType] = useState<ClassType>('lecture');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  useEffect(() => {
    if (initialData) {
      setCourseCode(initialData.courseCode);
      setCourseName(initialData.courseName);
      setDayOfWeek(initialData.dayOfWeek);
      setStartTime(initialData.startTime);
      setEndTime(initialData.endTime);
      setRoom(initialData.room);
      setInstructor(initialData.instructor || initialData.faculty || '');
      setType(initialData.type);
      setSelectedColor(initialData.color || PRESET_COLORS[0]);
    } else {
      setCourseCode('');
      setCourseName('');
      setDayOfWeek(defaultDay);
      setStartTime('08:10');
      setEndTime('09:00');
      setRoom('');
      setInstructor('');
      setType('lecture');
      setSelectedColor(PRESET_COLORS[0]);
    }
  }, [initialData, defaultDay, visible]);

  const handleSave = () => {
    if (!courseName.trim() || !courseCode.trim() || !room.trim()) {
      Alert.alert('Required Fields', 'Please fill in Course Name, Course Code, and Room.');
      return;
    }

    onSave({
      id: initialData?.id,
      courseCode: courseCode.trim().toUpperCase(),
      courseName: courseName.trim(),
      dayOfWeek,
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      room: room.trim(),
      faculty: instructor.trim() || initialData?.faculty || 'Faculty',
      instructor: instructor.trim() || undefined,
      type,
      color: selectedColor,
    });
    onClose();
  };

  const handleDelete = () => {
    if (!initialData || !onDelete) return;
    Alert.alert(
      'Delete Class',
      `Are you sure you want to remove "${initialData.courseName}" from ${initialData.dayOfWeek}'s schedule?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(initialData.id);
            onClose();
          },
        },
      ]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.modalOverlay}
      >
        <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
          {/* Header */}
          <View style={[styles.sheetHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.sheetTitle, { color: colors.text }]}>
              {initialData ? 'Edit Recurring Class' : 'Add Recurring Class'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {/* Day of week pills */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Day of Week</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dayScroll}>
              {DAYS.map(day => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayPill,
                    {
                      backgroundColor:
                        dayOfWeek === day ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setDayOfWeek(day)}
                >
                  <Text
                    style={[
                      styles.dayPillText,
                      { color: dayOfWeek === day ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {day.slice(0, 3)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Course Details */}
            <View style={styles.formRow}>
              <View style={{ flex: 2, marginRight: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Course Name *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. Operating Systems"
                  placeholderTextColor={colors.textTertiary}
                  value={courseName}
                  onChangeText={setCourseName}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Code *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="19CS501"
                  placeholderTextColor={colors.textTertiary}
                  value={courseCode}
                  onChangeText={setCourseCode}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* Timings */}
            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Start Time (HH:mm)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="08:10"
                  placeholderTextColor={colors.textTertiary}
                  value={startTime}
                  onChangeText={setStartTime}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>End Time (HH:mm)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="09:00"
                  placeholderTextColor={colors.textTertiary}
                  value={endTime}
                  onChangeText={setEndTime}
                />
              </View>
            </View>

            {/* Room & Instructor */}
            <View style={styles.formRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Room / Hall *</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="C-302 or Lab 3"
                  placeholderTextColor={colors.textTertiary}
                  value={room}
                  onChangeText={setRoom}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Instructor</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="e.g. Dr. A. Kumar"
                  placeholderTextColor={colors.textTertiary}
                  value={instructor}
                  onChangeText={setInstructor}
                />
              </View>
            </View>

            {/* Class Type */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Class Type</Text>
            <View style={styles.typeRow}>
              {TYPES.map(t => (
                <TouchableOpacity
                  key={t.value}
                  style={[
                    styles.typePill,
                    {
                      backgroundColor: type === t.value ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setType(t.value)}
                >
                  <Text
                    style={[
                      styles.typePillText,
                      { color: type === t.value ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Color accent */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Color Accent</Text>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[
                    styles.colorDot,
                    { backgroundColor: c },
                    selectedColor === c && styles.colorDotSelected,
                  ]}
                  onPress={() => setSelectedColor(c)}
                >
                  {selectedColor === c && <Check size={14} color="#FFFFFF" />}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
            {initialData && onDelete ? (
              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
                onPress={handleDelete}
              >
                <Trash2 size={18} color="#DC2626" />
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handleSave}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>
                {initialData ? 'Save Changes' : 'Add to Timetable'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 20,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
  },
  dayScroll: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  formRow: {
    flexDirection: 'row',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  typePillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    marginBottom: 16,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorDotSelected: {
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sheetFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  deleteBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
