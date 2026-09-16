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
import { CalendarEntry, CalendarEntryType } from '../../../types/calendar';
import { DayOfWeek } from '../../../types/timetable';
import { useTheme } from '../../../theme/theme';
import { X, Check, Trash2, Calendar, PartyPopper, Sparkles, BookOpen } from 'lucide-react-native';
import { getTodayIsoString } from '../../../core/timeUtils';

interface CalendarEventModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (entry: Omit<CalendarEntry, 'id'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: CalendarEntry | null;
  defaultDate?: string;
}

const EVENT_TYPES: { type: CalendarEntryType; label: string; desc: string }[] = [
  { type: 'holiday', label: 'Holiday', desc: 'No routine classes' },
  { type: 'special_timetable', label: 'Special Timetable', desc: 'Runs another day schedule' },
  { type: 'exam', label: 'Exam / Midterm', desc: 'Assessment / Exam session' },
  { type: 'vacation', label: 'Vacation', desc: 'Multi-day term break' },
  { type: 'working_day', label: 'Working Day', desc: 'Compensatory working day' },
  { type: 'other', label: 'Other Event', desc: 'General academic milestone' },
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultDate,
}) => {
  const { colors } = useTheme();

  const [date, setDate] = useState(defaultDate || getTodayIsoString());
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEntryType>('holiday');
  const [timetableSourceDay, setTimetableSourceDay] = useState<DayOfWeek>('Monday');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setTitle(initialData.title);
      setType(initialData.type);
      setTimetableSourceDay(initialData.timetableSourceDay || 'Monday');
      setDescription(initialData.description || '');
    } else {
      setDate(defaultDate || getTodayIsoString());
      setTitle('');
      setType('holiday');
      setTimetableSourceDay('Monday');
      setDescription('');
    }
  }, [initialData, defaultDate, visible]);

  const handleSave = () => {
    if (!title.trim() || !date.trim()) {
      Alert.alert('Required Fields', 'Please fill in Title and Date (YYYY-MM-DD).');
      return;
    }

    onSave({
      id: initialData?.id,
      date: date.trim(),
      title: title.trim(),
      type,
      timetableSourceDay: type === 'special_timetable' ? timetableSourceDay : undefined,
      description: description.trim() || undefined,
    });
    onClose();
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
              {initialData ? 'Edit Academic Event' : 'Add Calendar Event / Holiday'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {/* Event Title */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Event Title *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="e.g. Ganesh Chaturthi or Midterm Exams"
              placeholderTextColor={colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />

            {/* Target Date */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Date (YYYY-MM-DD) *</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="2026-09-14"
              placeholderTextColor={colors.textTertiary}
              value={date}
              onChangeText={setDate}
            />

            {/* Event Type selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Event Type</Text>
            <View style={styles.typesList}>
              {EVENT_TYPES.map(et => (
                <TouchableOpacity
                  key={et.type}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor:
                        type === et.type ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setType(et.type)}
                >
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      { color: type === et.type ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {et.label}
                  </Text>
                  <Text
                    style={[
                      styles.typeOptionSub,
                      { color: type === et.type ? 'rgba(255,255,255,0.8)' : colors.textTertiary },
                    ]}
                  >
                    {et.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Source Day Shift (for special_timetable) */}
            {type === 'special_timetable' && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Which day's timetable runs on this date?
                </Text>
                <View style={styles.daysWrap}>
                  {DAYS.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayPill,
                        {
                          backgroundColor:
                            timetableSourceDay === day ? colors.primary : colors.surfaceVariant,
                        },
                      ]}
                      onPress={() => setTimetableSourceDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayPillText,
                          { color: timetableSourceDay === day ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Description / Notes */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Description (Optional)
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="e.g. Official gazetted holiday announced by Dean"
              placeholderTextColor={colors.textTertiary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={2}
            />
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.sheetFooter, { borderTopColor: colors.border }]}>
            {initialData && onDelete ? (
              <TouchableOpacity
                style={[styles.deleteBtn, { backgroundColor: '#FEE2E2' }]}
                onPress={() => {
                  onDelete(initialData.id);
                  onClose();
                }}
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
                {initialData ? 'Update Event' : 'Save Calendar Event'}
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
    maxHeight: '85%',
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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  textArea: {
    minHeight: 50,
    textAlignVertical: 'top',
  },
  typesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeOption: {
    width: '48%',
    padding: 10,
    borderRadius: 10,
  },
  typeOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  typeOptionSub: {
    fontSize: 10,
    marginTop: 2,
  },
  sectionWrap: {
    marginTop: 8,
  },
  daysWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  dayPillText: {
    fontSize: 12,
    fontWeight: '700',
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
