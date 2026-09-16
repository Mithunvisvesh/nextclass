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
import { DateOverride, OverrideType } from '../../../types/override';
import { DayOfWeek, TimetableClass } from '../../../types/timetable';
import { useMobileSchedule } from '../../../context/MobileScheduleContext';
import { useTheme } from '../../../theme/theme';
import { X, Check, Trash2, Calendar, Sparkles } from 'lucide-react-native';
import { getTodayIsoString } from '../../../core/timeUtils';

interface ChangeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (override: Omit<DateOverride, 'id' | 'createdAt'> & { id?: string }) => void;
  onDelete?: (id: string) => void;
  initialData?: DateOverride | null;
  defaultDate?: string;
}

const OVERRIDE_TYPES: { type: OverrideType; label: string; desc: string }[] = [
  { type: 'cancel', label: 'Cancel Class', desc: 'Cancel a specific period' },
  { type: 'room_change', label: 'Room Change', desc: 'Relocate to a different hall' },
  { type: 'time_change', label: 'Time Change', desc: 'Reschedule period hours' },
  { type: 'extra', label: 'Extra Class', desc: 'Add a one-time class' },
  { type: 'source_day', label: 'Day Order Shift', desc: 'Follow another day schedule' },
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const ChangeModal: React.FC<ChangeModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialData,
  defaultDate,
}) => {
  const { timetable, getSchedule } = useMobileSchedule();
  const { colors } = useTheme();

  const [date, setDate] = useState(defaultDate || getTodayIsoString());
  const [type, setType] = useState<OverrideType>('room_change');
  const [targetClassId, setTargetClassId] = useState<string>('');
  const [newRoom, setNewRoom] = useState('');
  const [newStartTime, setNewStartTime] = useState('08:10');
  const [newEndTime, setNewEndTime] = useState('09:00');
  const [extraCourseName, setExtraCourseName] = useState('');
  const [extraCourseCode, setExtraCourseCode] = useState('');
  const [extraRoom, setExtraRoom] = useState('');
  const [extraInstructor, setExtraInstructor] = useState('');
  const [sourceDay, setSourceDay] = useState<DayOfWeek>('Monday');
  const [notes, setNotes] = useState('');

  // Classes occurring on this date's baseline to choose from for cancel/room/time
  const scheduledClasses = getSchedule(date).classes;

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date);
      setType(initialData.type);
      setTargetClassId(initialData.targetClassId || '');
      setNotes(initialData.notes || '');
      if (initialData.timetableSourceDay) {
        setSourceDay(initialData.timetableSourceDay);
      }
      if (initialData.overrideData) {
        if (initialData.overrideData.room) setNewRoom(initialData.overrideData.room);
        if (initialData.overrideData.startTime) setNewStartTime(initialData.overrideData.startTime);
        if (initialData.overrideData.endTime) setNewEndTime(initialData.overrideData.endTime);
        if (initialData.overrideData.courseName) setExtraCourseName(initialData.overrideData.courseName);
        if (initialData.overrideData.courseCode) setExtraCourseCode(initialData.overrideData.courseCode);
      }
    } else {
      setDate(defaultDate || getTodayIsoString());
      setType('room_change');
      setTargetClassId(scheduledClasses.length > 0 ? scheduledClasses[0].id : '');
      setNewRoom('');
      setNewStartTime('08:10');
      setNewEndTime('09:00');
      setExtraCourseName('');
      setExtraCourseCode('');
      setExtraRoom('');
      setExtraInstructor('');
      setSourceDay('Monday');
      setNotes('');
    }
  }, [initialData, defaultDate, visible]);

  const handleSave = () => {
    if (!date.trim()) {
      Alert.alert('Required Field', 'Please enter a target date (YYYY-MM-DD).');
      return;
    }

    let overrideData: Partial<TimetableClass> | undefined;

    if (type === 'room_change') {
      if (!targetClassId) {
        Alert.alert('Required', 'Please select a target class to relocate.');
        return;
      }
      if (!newRoom.trim()) {
        Alert.alert('Required', 'Please specify the new room.');
        return;
      }
      overrideData = { room: newRoom.trim() };
    } else if (type === 'time_change') {
      if (!targetClassId) {
        Alert.alert('Required', 'Please select a target class to reschedule.');
        return;
      }
      overrideData = { startTime: newStartTime.trim(), endTime: newEndTime.trim() };
    } else if (type === 'cancel') {
      if (!targetClassId) {
        Alert.alert('Required', 'Please select a target class to cancel.');
        return;
      }
    } else if (type === 'extra') {
      if (!extraCourseName.trim() || !extraCourseCode.trim() || !extraRoom.trim()) {
        Alert.alert('Required', 'Please fill Course Name, Code, and Room for extra class.');
        return;
      }
      overrideData = {
        courseName: extraCourseName.trim(),
        courseCode: extraCourseCode.trim().toUpperCase(),
        room: extraRoom.trim(),
        faculty: extraInstructor.trim() || 'Faculty',
        instructor: extraInstructor.trim() || undefined,
        startTime: newStartTime.trim(),
        endTime: newEndTime.trim(),
        type: 'lecture',
      };
    }

    onSave({
      id: initialData?.id,
      date: date.trim(),
      type,
      targetClassId: type !== 'extra' && type !== 'source_day' ? targetClassId : undefined,
      timetableSourceDay: type === 'source_day' ? sourceDay : undefined,
      overrideData,
      notes: notes.trim() || undefined,
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
              {initialData ? 'Edit Schedule Override' : 'New Schedule Override'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.sheetBody} showsVerticalScrollIndicator={false}>
            {/* Target Date */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Target Date (YYYY-MM-DD)
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="2026-09-17"
              placeholderTextColor={colors.textTertiary}
              value={date}
              onChangeText={setDate}
            />

            {/* Type selector */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Change Type</Text>
            <View style={styles.typesList}>
              {OVERRIDE_TYPES.map(ot => (
                <TouchableOpacity
                  key={ot.type}
                  style={[
                    styles.typeOption,
                    {
                      backgroundColor:
                        type === ot.type ? colors.primary : colors.surfaceVariant,
                    },
                  ]}
                  onPress={() => setType(ot.type)}
                >
                  <Text
                    style={[
                      styles.typeOptionTitle,
                      { color: type === ot.type ? '#FFFFFF' : colors.text },
                    ]}
                  >
                    {ot.label}
                  </Text>
                  <Text
                    style={[
                      styles.typeOptionSub,
                      { color: type === ot.type ? 'rgba(255,255,255,0.8)' : colors.textTertiary },
                    ]}
                  >
                    {ot.desc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Target Class Selection (for cancel, room_change, time_change) */}
            {(type === 'cancel' || type === 'room_change' || type === 'time_change') && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Select Class to Modify
                </Text>
                {scheduledClasses.length > 0 ? (
                  scheduledClasses.map(cls => (
                    <TouchableOpacity
                      key={cls.id}
                      style={[
                        styles.classSelectItem,
                        targetClassId === cls.id
                          ? [styles.classSelected, { borderColor: colors.primary, backgroundColor: colors.surfaceVariant }]
                          : { borderColor: colors.border },
                      ]}
                      onPress={() => setTargetClassId(cls.id)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.classSelectName, { color: colors.text }]}>
                          {cls.courseName}
                        </Text>
                        <Text style={[styles.classSelectTime, { color: colors.textSecondary }]}>
                          {cls.courseCode} • {cls.startTime} - {cls.endTime} • {cls.room}
                        </Text>
                      </View>
                      {targetClassId === cls.id && <Check size={18} color={colors.primary} />}
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={[styles.warningText, { color: '#DC2626' }]}>
                    No baseline classes found on {date}. If this date has no classes, you can add an Extra Class instead.
                  </Text>
                )}
              </View>
            )}

            {/* Room Change field */}
            {type === 'room_change' && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  New Room / Hall *
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
                  ]}
                  placeholder="e.g. Auditorium or Lab 2"
                  placeholderTextColor={colors.textTertiary}
                  value={newRoom}
                  onChangeText={setNewRoom}
                />
              </View>
            )}

            {/* Time Change fields */}
            {type === 'time_change' && (
              <View style={styles.formRow}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>New Start</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="08:10"
                    placeholderTextColor={colors.textTertiary}
                    value={newStartTime}
                    onChangeText={setNewStartTime}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>New End</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
                    ]}
                    placeholder="09:00"
                    placeholderTextColor={colors.textTertiary}
                    value={newEndTime}
                    onChangeText={setNewEndTime}
                  />
                </View>
              </View>
            )}

            {/* Extra Class fields */}
            {type === 'extra' && (
              <View style={styles.sectionWrap}>
                <View style={styles.formRow}>
                  <View style={{ flex: 2, marginRight: 8 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Course Name *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                      placeholder="e.g. Remedial Math"
                      placeholderTextColor={colors.textTertiary}
                      value={extraCourseName}
                      onChangeText={setExtraCourseName}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Code *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                      placeholder="CS599"
                      placeholderTextColor={colors.textTertiary}
                      value={extraCourseCode}
                      onChangeText={setExtraCourseCode}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Start Time</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                      placeholder="16:00"
                      placeholderTextColor={colors.textTertiary}
                      value={newStartTime}
                      onChangeText={setNewStartTime}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>End Time</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                      placeholder="17:00"
                      placeholderTextColor={colors.textTertiary}
                      value={newEndTime}
                      onChangeText={setNewEndTime}
                    />
                  </View>
                </View>

                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Room *</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                      placeholder="C-302"
                      placeholderTextColor={colors.textTertiary}
                      value={extraRoom}
                      onChangeText={setExtraRoom}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Instructor</Text>
                    <TextInput
                      style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                      placeholder="Faculty Name"
                      placeholderTextColor={colors.textTertiary}
                      value={extraInstructor}
                      onChangeText={setExtraInstructor}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Source Day Shift */}
            {type === 'source_day' && (
              <View style={styles.sectionWrap}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
                  Run Timetable of Day
                </Text>
                <View style={styles.daysWrap}>
                  {DAYS.map(day => (
                    <TouchableOpacity
                      key={day}
                      style={[
                        styles.dayPill,
                        {
                          backgroundColor:
                            sourceDay === day ? colors.primary : colors.surfaceVariant,
                        },
                      ]}
                      onPress={() => setSourceDay(day)}
                    >
                      <Text
                        style={[
                          styles.dayPillText,
                          { color: sourceDay === day ? '#FFFFFF' : colors.text },
                        ]}
                      >
                        {day}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Reason / Notes */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Reason / Note</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
              ]}
              placeholder="e.g. Professor attending conference, lab maintenance, etc."
              placeholderTextColor={colors.textTertiary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
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
                {initialData ? 'Update Override' : 'Apply Schedule Override'}
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
    maxHeight: '92%',
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
    minHeight: 60,
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
  classSelectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 6,
  },
  classSelected: {
    borderWidth: 1.5,
  },
  classSelectName: {
    fontSize: 13,
    fontWeight: '700',
  },
  classSelectTime: {
    fontSize: 11,
    marginTop: 2,
  },
  warningText: {
    fontSize: 12,
    marginVertical: 4,
  },
  formRow: {
    flexDirection: 'row',
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
