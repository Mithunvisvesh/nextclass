import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../../../theme/theme';
import { TimetableClass, DayOfWeek, ClassType } from '../../../types/timetable';
import { ParsedTimetableResult } from '../../../services/pdf/timetableParser';
import {
  Check,
  X,
  Trash2,
  Plus,
  Clock,
  MapPin,
  User,
  FlaskConical,
  BookOpen,
  AlertTriangle,
} from 'lucide-react-native';
import { formatTime12Hour } from '../../../core/timeUtils';

interface TimetableReviewModalProps {
  visible: boolean;
  parsedResult: ParsedTimetableResult | null;
  onClose: () => void;
  onConfirm: (classes: Omit<TimetableClass, 'id'>[], mode: 'replace' | 'append') => Promise<void>;
  hasExistingClasses: boolean;
}

export const TimetableReviewModal: React.FC<TimetableReviewModalProps> = ({
  visible,
  parsedResult,
  onClose,
  onConfirm,
  hasExistingClasses,
}) => {
  const { colors } = useTheme();

  const [classes, setClasses] = useState<Omit<TimetableClass, 'id'>[]>(
    parsedResult?.classes || []
  );
  const [saveModePrompt, setSaveModePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Update internal classes when parsedResult changes
  React.useEffect(() => {
    if (parsedResult) {
      setClasses(parsedResult.classes);
    }
  }, [parsedResult]);

  if (!parsedResult) return null;

  const handleDeleteItem = (index: number) => {
    setClasses(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmPress = () => {
    if (classes.length === 0) {
      Alert.alert('No Classes', 'No classes to save.');
      return;
    }

    if (hasExistingClasses) {
      // Prompt user to choose Replace or Append
      setSaveModePrompt(true);
    } else {
      executeSave('replace');
    }
  };

  const executeSave = async (mode: 'replace' | 'append') => {
    setIsSaving(true);
    try {
      await onConfirm(classes, mode);
      setSaveModePrompt(false);
      onClose();
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save timetable.');
    } finally {
      setIsSaving(false);
    }
  };

  // Group classes by weekday for clear review
  const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Review Timetable</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Extracted {classes.length} classes from PDF
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={[styles.banner, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
            Review the extracted classes below. Continuous lab blocks (e.g. 2h15m) are preserved.
            Tap Confirm to store in your local timetable.
          </Text>
        </View>

        {/* Classes List */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {days.map(day => {
            const dayItems = classes
              .map((c, idx) => ({ ...c, originalIdx: idx }))
              .filter(c => c.dayOfWeek === day);

            if (dayItems.length === 0) return null;

            return (
              <View key={day} style={styles.dayGroup}>
                <Text style={[styles.dayHeading, { color: colors.primary }]}>{day}</Text>
                {dayItems.map(item => (
                  <View
                    key={`${day}-${item.startTime}-${item.originalIdx}`}
                    style={[styles.classCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.cardTop}>
                      <View style={styles.timeBadge}>
                        <Clock size={12} color={colors.primary} />
                        <Text style={[styles.timeText, { color: colors.primary }]}>
                          {formatTime12Hour(item.startTime)} – {formatTime12Hour(item.endTime)}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor:
                              item.type === 'lab' ? '#FEF3C7' : colors.surfaceVariant,
                          },
                        ]}
                      >
                        {item.type === 'lab' ? (
                          <FlaskConical size={11} color="#D97706" />
                        ) : (
                          <BookOpen size={11} color={colors.textSecondary} />
                        )}
                        <Text
                          style={[
                            styles.typeText,
                            { color: item.type === 'lab' ? '#B45309' : colors.textSecondary },
                          ]}
                        >
                          {item.type.toUpperCase()}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteItem(item.originalIdx)}
                        style={styles.deleteBtn}
                        accessibilityLabel="Delete item"
                      >
                        <Trash2 size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>

                    <Text style={[styles.courseName, { color: colors.text }]}>{item.courseName}</Text>
                    <Text style={[styles.courseCode, { color: colors.textSecondary }]}>
                      {item.courseCode}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.metaItem}>
                        <MapPin size={13} color={colors.textTertiary} />
                        <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                          Room {item.room || 'C404'}
                        </Text>
                      </View>
                      {item.faculty ? (
                        <View style={styles.metaItem}>
                          <User size={13} color={colors.textTertiary} />
                          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
                            {item.faculty}
                          </Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            );
          })}
        </ScrollView>

        {/* Bottom Bar */}
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.surface }]}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={[styles.cancelBtnText, { color: colors.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
            onPress={handleConfirmPress}
            disabled={isSaving}
          >
            <Check size={18} color="#FFFFFF" />
            <Text style={styles.confirmBtnText}>Confirm & Save ({classes.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Conflict / Data Safety Prompt Modal */}
        <Modal visible={saveModePrompt} transparent animationType="fade">
          <View style={styles.promptOverlay}>
            <View style={[styles.promptCard, { backgroundColor: colors.surface }]}>
              <View style={styles.promptHeader}>
                <AlertTriangle size={24} color="#D97706" />
                <Text style={[styles.promptTitle, { color: colors.text }]}>Save Timetable</Text>
              </View>
              <Text style={[styles.promptDesc, { color: colors.textSecondary }]}>
                You already have existing timetable classes. How would you like to import these {classes.length} classes?
              </Text>

              <TouchableOpacity
                style={[styles.promptActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => executeSave('replace')}
                disabled={isSaving}
              >
                <Text style={styles.promptActionText}>Replace Existing Timetable</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.promptActionBtn, { backgroundColor: colors.surfaceVariant }]}
                onPress={() => executeSave('append')}
                disabled={isSaving}
              >
                <Text style={[styles.promptActionText, { color: colors.text }]}>
                  Add / Merge Into Existing
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.promptCancelBtn, { borderColor: colors.border }]}
                onPress={() => setSaveModePrompt(false)}
              >
                <Text style={[styles.promptCancelText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  banner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  bannerText: {
    fontSize: 12,
    lineHeight: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  dayGroup: {
    marginBottom: 18,
  },
  dayHeading: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  classCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  deleteBtn: {
    marginLeft: 'auto',
    padding: 4,
  },
  courseName: {
    fontSize: 14,
    fontWeight: '700',
  },
  courseCode: {
    fontSize: 12,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  promptOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  promptCard: {
    borderRadius: 16,
    padding: 20,
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  promptDesc: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  promptActionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },
  promptActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  promptCancelBtn: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  promptCancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
