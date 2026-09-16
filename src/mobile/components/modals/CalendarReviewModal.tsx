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
import { CalendarEntry, CalendarEntryType } from '../../../types/calendar';
import { ParsedCalendarResult } from '../../../services/pdf/calendarParser';
import {
  Check,
  X,
  Trash2,
  Calendar,
  Sparkles,
  PartyPopper,
  BookOpen,
  Sun,
  AlertTriangle,
} from 'lucide-react-native';
import { formatDatePretty } from '../../../core/timeUtils';

interface CalendarReviewModalProps {
  visible: boolean;
  parsedResult: ParsedCalendarResult | null;
  onClose: () => void;
  onConfirm: (entries: Omit<CalendarEntry, 'id'>[], mode: 'replace' | 'append') => Promise<void>;
  hasExistingEntries: boolean;
}

export const CalendarReviewModal: React.FC<CalendarReviewModalProps> = ({
  visible,
  parsedResult,
  onClose,
  onConfirm,
  hasExistingEntries,
}) => {
  const { colors } = useTheme();

  const [entries, setEntries] = useState<Omit<CalendarEntry, 'id'>[]>(
    parsedResult?.entries || []
  );
  const [saveModePrompt, setSaveModePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  React.useEffect(() => {
    if (parsedResult) {
      setEntries(parsedResult.entries);
    }
  }, [parsedResult]);

  if (!parsedResult) return null;

  const handleDeleteItem = (index: number) => {
    setEntries(prev => prev.filter((_, i) => i !== index));
  };

  const handleConfirmPress = () => {
    if (entries.length === 0) {
      Alert.alert('No Events', 'No calendar events to save.');
      return;
    }

    if (hasExistingEntries) {
      setSaveModePrompt(true);
    } else {
      executeSave('replace');
    }
  };

  const executeSave = async (mode: 'replace' | 'append') => {
    setIsSaving(true);
    try {
      await onConfirm(entries, mode);
      setSaveModePrompt(false);
      onClose();
    } catch (err: any) {
      Alert.alert('Save Failed', err?.message || 'Could not save calendar.');
    } finally {
      setIsSaving(false);
    }
  };

  const renderTypeBadge = (type: CalendarEntryType, sourceDay?: string) => {
    switch (type) {
      case 'special_timetable':
        return (
          <View style={[styles.badge, { backgroundColor: '#FEF3C7' }]}>
            <Sparkles size={12} color="#D97706" />
            <Text style={[styles.badgeText, { color: '#B45309' }]}>
              {sourceDay ? `${sourceDay} Timetable` : 'Special Timetable'}
            </Text>
          </View>
        );
      case 'holiday':
        return (
          <View style={[styles.badge, { backgroundColor: '#ECFDF5' }]}>
            <PartyPopper size={12} color="#059669" />
            <Text style={[styles.badgeText, { color: '#047857' }]}>Holiday</Text>
          </View>
        );
      case 'exam':
        return (
          <View style={[styles.badge, { backgroundColor: '#FEE2E2' }]}>
            <BookOpen size={12} color="#DC2626" />
            <Text style={[styles.badgeText, { color: '#B91C1C' }]}>Exam</Text>
          </View>
        );
      case 'vacation':
        return (
          <View style={[styles.badge, { backgroundColor: '#E0E7FF' }]}>
            <Sun size={12} color="#4F46E5" />
            <Text style={[styles.badgeText, { color: '#3730A3' }]}>Vacation</Text>
          </View>
        );
      default:
        return (
          <View style={[styles.badge, { backgroundColor: colors.surfaceVariant }]}>
            <Calendar size={12} color={colors.textSecondary} />
            <Text style={[styles.badgeText, { color: colors.textSecondary }]}>Event</Text>
          </View>
        );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Review Academic Calendar</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Extracted {entries.length} events from PDF
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        <View style={[styles.banner, { backgroundColor: colors.surfaceVariant }]}>
          <Text style={[styles.bannerText, { color: colors.textSecondary }]}>
            Review the extracted dates and events. Special timetable mappings (e.g. Friday Timetable for all)
            and official holidays are categorized below.
          </Text>
        </View>

        {/* Entries List */}
        <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
          {entries.map((item, idx) => (
            <View
              key={`${item.date}-${idx}`}
              style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.dateWrap}>
                  <Text style={[styles.dateText, { color: colors.text }]}>
                    {formatDatePretty(item.date)}
                  </Text>
                  <Text style={[styles.rawDate, { color: colors.textTertiary }]}>{item.date}</Text>
                </View>

                {renderTypeBadge(item.type, item.timetableSourceDay)}

                <TouchableOpacity
                  onPress={() => handleDeleteItem(idx)}
                  style={styles.deleteBtn}
                  accessibilityLabel="Delete event"
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>

              <Text style={[styles.entryTitle, { color: colors.text }]}>{item.title}</Text>

              {item.timetableSourceDay ? (
                <View style={styles.specialNotice}>
                  <Sparkles size={12} color="#D97706" />
                  <Text style={styles.specialNoticeText}>
                    Schedule Engine will run {item.timetableSourceDay} classes on this day
                  </Text>
                </View>
              ) : null}
            </View>
          ))}
        </ScrollView>

        {/* Footer */}
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
            <Text style={styles.confirmBtnText}>Confirm & Save ({entries.length})</Text>
          </TouchableOpacity>
        </View>

        {/* Data Safety Modal */}
        <Modal visible={saveModePrompt} transparent animationType="fade">
          <View style={styles.promptOverlay}>
            <View style={[styles.promptCard, { backgroundColor: colors.surface }]}>
              <View style={styles.promptHeader}>
                <AlertTriangle size={24} color="#D97706" />
                <Text style={[styles.promptTitle, { color: colors.text }]}>Save Academic Calendar</Text>
              </View>
              <Text style={[styles.promptDesc, { color: colors.textSecondary }]}>
                You already have calendar events saved. How would you like to import these {entries.length} events?
              </Text>

              <TouchableOpacity
                style={[styles.promptActionBtn, { backgroundColor: colors.primary }]}
                onPress={() => executeSave('replace')}
                disabled={isSaving}
              >
                <Text style={styles.promptActionText}>Replace Existing Calendar</Text>
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
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  dateWrap: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    fontWeight: '700',
  },
  rawDate: {
    fontSize: 11,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 4,
  },
  entryTitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  specialNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFBEB',
    borderRadius: 6,
  },
  specialNoticeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B45309',
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
