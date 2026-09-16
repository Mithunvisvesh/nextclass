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
import { DateOverride } from '../../types/override';
import { ChangeModal } from '../components/modals/ChangeModal';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Calendar,
  AlertCircle,
  MapPin,
  Clock,
  Ban,
  ShieldCheck,
} from 'lucide-react-native';
import { formatDatePretty, formatTime12Hour } from '../../core/timeUtils';

export const ChangesScreen: React.FC = () => {
  const { overrides, addOverride, updateOverride, deleteOverride, timetable } =
    useMobileSchedule();
  const { colors } = useTheme();

  const [modalVisible, setModalVisible] = useState(false);
  const [editingOverride, setEditingOverride] = useState<DateOverride | null>(null);

  const handleOpenAdd = () => {
    setEditingOverride(null);
    setModalVisible(true);
  };

  const handleOpenEdit = (ov: DateOverride) => {
    setEditingOverride(ov);
    setModalVisible(true);
  };

  const handleSave = async (
    data: Omit<DateOverride, 'id' | 'createdAt'> & { id?: string }
  ) => {
    if (data.id) {
      await updateOverride(data as DateOverride);
    } else {
      await addOverride(data);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Remove Override',
      'Are you sure you want to delete this schedule override? The date will revert to its baseline timetable.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteOverride(id);
          },
        },
      ]
    );
  };

  // Sort overrides chronologically by date
  const sortedOverrides = [...overrides].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.surfaceVariant }]}>
          <ShieldCheck size={18} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.bannerTitle, { color: colors.text }]}>
              Isolated Date-Specific Changes
            </Text>
            <Text style={[styles.bannerSub, { color: colors.textSecondary }]}>
              Overrides temporarily adjust your classes for specific dates. Your weekly timetable
              baseline remains completely untouched.
            </Text>
          </View>
        </View>

        {/* Section Header */}
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Schedule Overrides</Text>
            <Text style={[styles.sub, { color: colors.textTertiary }]}>
              {sortedOverrides.length} active date override{sortedOverrides.length !== 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: colors.primary }]}
            onPress={handleOpenAdd}
            activeOpacity={0.8}
          >
            <Plus size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New Override</Text>
          </TouchableOpacity>
        </View>

        {/* List of Overrides */}
        {sortedOverrides.length > 0 ? (
          sortedOverrides.map(ov => {
            const targetClass = ov.targetClassId
              ? timetable.classes.find(c => c.id === ov.targetClassId)
              : undefined;

            let badgeColor = '#2563EB';
            let badgeBg = '#DBEAFE';
            let badgeLabel = 'Override';
            let Icon = Sparkles;

            if (ov.type === 'cancel') {
              badgeColor = '#DC2626';
              badgeBg = '#FEE2E2';
              badgeLabel = 'Cancelled';
              Icon = Ban;
            } else if (ov.type === 'room_change') {
              badgeColor = '#D97706';
              badgeBg = '#FEF3C7';
              badgeLabel = 'Room Change';
              Icon = MapPin;
            } else if (ov.type === 'time_change') {
              badgeColor = '#0891B2';
              badgeBg = '#CFFAFE';
              badgeLabel = 'Time Change';
              Icon = Clock;
            } else if (ov.type === 'extra') {
              badgeColor = '#059669';
              badgeBg = '#D1FAE5';
              badgeLabel = 'Extra Class';
              Icon = Plus;
            } else if (ov.type === 'source_day') {
              badgeColor = '#7C3AED';
              badgeBg = '#EDE9FE';
              badgeLabel = 'Day Order Shift';
              Icon = Calendar;
            }

            return (
              <View
                key={ov.id}
                style={[
                  styles.overrideCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.typeBadge, { backgroundColor: badgeBg }]}>
                    <Icon size={12} color={badgeColor} />
                    <Text style={[styles.typeBadgeText, { color: badgeColor }]}>
                      {badgeLabel}
                    </Text>
                  </View>

                  <Text style={[styles.cardDate, { color: colors.textSecondary }]}>
                    {formatDatePretty(ov.date)}
                  </Text>

                  <View style={styles.actionIcons}>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(ov)}
                      style={styles.iconBtn}
                    >
                      <Edit3 size={15} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(ov.id)}
                      style={styles.iconBtn}
                    >
                      <Trash2 size={15} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.cardBody}>
                  {ov.type === 'source_day' ? (
                    <Text style={[styles.mainDescription, { color: colors.text }]}>
                      Follows {ov.timetableSourceDay}'s weekly schedule on this day.
                    </Text>
                  ) : ov.type === 'extra' ? (
                    <View>
                      <Text style={[styles.mainDescription, { color: colors.text }]}>
                        {ov.overrideData?.courseName} ({ov.overrideData?.courseCode})
                      </Text>
                      <Text style={[styles.subDescription, { color: colors.textSecondary }]}>
                        {formatTime12Hour(ov.overrideData?.startTime || '')} –{' '}
                        {formatTime12Hour(ov.overrideData?.endTime || '')} • Room{' '}
                        {ov.overrideData?.room}
                      </Text>
                    </View>
                  ) : targetClass ? (
                    <View>
                      <Text style={[styles.mainDescription, { color: colors.text }]}>
                        {targetClass.courseName} ({targetClass.courseCode})
                      </Text>
                      {ov.type === 'cancel' && (
                        <Text style={[styles.subDescription, { color: '#DC2626' }]}>
                          Scheduled at {formatTime12Hour(targetClass.startTime)} – Class is CANCELLED for this date.
                        </Text>
                      )}
                      {ov.type === 'room_change' && (
                        <Text style={[styles.subDescription, { color: '#D97706' }]}>
                          Relocated: Room {targetClass.room} ➔ {ov.overrideData?.room}
                        </Text>
                      )}
                      {ov.type === 'time_change' && (
                        <Text style={[styles.subDescription, { color: '#0891B2' }]}>
                          Rescheduled: {targetClass.startTime} ➔ {ov.overrideData?.startTime} – {ov.overrideData?.endTime}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={[styles.mainDescription, { color: colors.text }]}>
                      Modified Class Slot
                    </Text>
                  )}

                  {ov.notes ? (
                    <View style={styles.noteWrap}>
                      <Text style={[styles.noteText, { color: colors.textTertiary }]}>
                        Note: {ov.notes}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>
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
              No schedule overrides active
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              All dates are running their standard weekly baseline. Need to record a cancelled
              lecture, room swap, or day order shift?
            </Text>
            <TouchableOpacity
              style={[styles.addEmptyBtn, { backgroundColor: colors.primary }]}
              onPress={handleOpenAdd}
            >
              <Plus size={16} color="#FFFFFF" />
              <Text style={styles.addEmptyBtnText}>Add Date Override</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Change Modal */}
      <ChangeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        onDelete={id => deleteOverride(id)}
        initialData={editingOverride}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 11,
    lineHeight: 15,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  sub: {
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
  overrideCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  cardDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    padding: 4,
  },
  cardBody: {
    marginTop: 2,
  },
  mainDescription: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  subDescription: {
    fontSize: 12,
    fontWeight: '500',
  },
  noteWrap: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  noteText: {
    fontSize: 11,
    fontStyle: 'italic',
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
    paddingHorizontal: 12,
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
