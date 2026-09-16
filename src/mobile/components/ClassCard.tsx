import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ProcessedClass } from '../../types/schedule';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { MapPin, User, ArrowLeftRight, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react-native';
import { formatTime12Hour } from '../../core/timeUtils';

interface ClassCardProps {
  classItem: ProcessedClass;
}

export const ClassCard: React.FC<ClassCardProps> = ({ classItem }) => {
  const { theme } = useMobileSchedule();

  const isHappening = classItem.status === 'happening';
  const isCompleted = classItem.status === 'completed';

  const getTypeBadgeStyle = () => {
    switch (classItem.type) {
      case 'lab':
        return { bg: theme.infoLight, text: theme.info };
      case 'tutorial':
        return { bg: theme.warningLight, text: theme.warning };
      case 'activity':
        return { bg: theme.successLight, text: theme.success };
      case 'counselling':
        return { bg: theme.dangerLight, text: theme.danger };
      default:
        return { bg: theme.primaryLight, text: theme.primary };
    }
  };

  const typeStyle = getTypeBadgeStyle();

  return (
    <View style={[
      styles.cardWrapper,
      {
        backgroundColor: isHappening ? theme.surface : isCompleted ? theme.surfaceSubtle : theme.card,
        borderColor: isHappening ? theme.primary : theme.border,
        borderWidth: isHappening ? 2 : 1,
        opacity: isCompleted ? 0.65 : 1,
      }
    ]}>
      {/* Top Header: Time, Code, Type */}
      <View style={styles.topRow}>
        <View style={styles.timeBlock}>
          <Text style={[styles.timeText, { color: theme.text }]}>
            {formatTime12Hour(classItem.startTime)} – {formatTime12Hour(classItem.endTime)}
          </Text>
          <Text style={[styles.timeSub, { color: theme.textMuted }]}>
            ({classItem.startTime})
          </Text>
        </View>

        <View style={styles.tagGroup}>
          <View style={[styles.codeBadge, { backgroundColor: theme.surfaceHighlight }]}>
            <Text style={[styles.codeText, { color: theme.textSecondary }]}>
              {classItem.courseCode}
            </Text>
          </View>
          <View style={[styles.typeBadge, { backgroundColor: typeStyle.bg }]}>
            <Text style={[styles.typeText, { color: typeStyle.text }]}>
              {classItem.type}
            </Text>
          </View>
        </View>
      </View>

      {/* Happening Now Banner */}
      {isHappening && (
        <View style={[styles.happeningBanner, { backgroundColor: theme.primaryLight }]}>
          <View style={[styles.liveDot, { backgroundColor: theme.primary }]} />
          <Text style={[styles.happeningText, { color: theme.primary }]}>
            HAPPENING NOW {classItem.progressPercent ? `• ${classItem.progressPercent}% ELAPSED` : ''}
          </Text>
        </View>
      )}

      {/* Course Title */}
      <Text style={[styles.courseTitle, { color: theme.text }]}>
        {classItem.courseName}
      </Text>

      {/* Details: Room & Faculty */}
      <View style={styles.detailRow}>
        <View style={[styles.roomPill, { backgroundColor: theme.surfaceSubtle }]}>
          <MapPin size={13} color={theme.primary} />
          <Text style={[styles.roomText, { color: theme.textSecondary }]}>
            Room {classItem.room}
          </Text>
        </View>

        {classItem.slot && (
          <View style={[styles.slotPill, { backgroundColor: theme.surfaceSubtle }]}>
            <Text style={[styles.slotText, { color: theme.textMuted }]}>
              Slot {classItem.slot}
            </Text>
          </View>
        )}

        {classItem.faculty ? (
          <View style={styles.facultyGroup}>
            <User size={13} color={theme.textMuted} />
            <Text style={[styles.facultyText, { color: theme.textMuted }]} numberOfLines={1}>
              {classItem.faculty}
            </Text>
          </View>
        ) : null}
      </View>

      {/* Date-Specific Override Notice */}
      {classItem.isOverride && (
        <View style={[styles.overrideNotice, { backgroundColor: theme.overrideLight, borderColor: theme.override }]}>
          {classItem.overrideType === 'swap' ? (
            <ArrowLeftRight size={14} color={theme.override} />
          ) : classItem.overrideType === 'extra' ? (
            <PlusCircle size={14} color={theme.override} />
          ) : (
            <AlertCircle size={14} color={theme.override} />
          )}
          <View style={styles.overrideTextContainer}>
            <Text style={[styles.overrideTitle, { color: theme.override }]}>
              Date Override Active:
            </Text>
            <Text style={[styles.overrideDetail, { color: theme.override }]}>
              {classItem.overrideNote || 'Schedule adjusted for today'}
            </Text>
            {classItem.originalValues?.room && (
              <Text style={[styles.overrideSub, { color: theme.override }]}>
                Regular room: {classItem.originalValues.room}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Regular Notes */}
      {classItem.notes && !classItem.isOverride && (
        <Text style={[styles.notesText, { color: theme.textMuted }]}>
          ℹ️ {classItem.notes}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '800',
  },
  timeSub: {
    fontSize: 11,
    fontWeight: '500',
  },
  tagGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  codeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'monospace',
  },
  typeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  happeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  happeningText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 21,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  roomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '700',
  },
  slotPill: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  slotText: {
    fontSize: 11,
    fontWeight: '600',
  },
  facultyGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    minWidth: 100,
  },
  facultyText: {
    fontSize: 11,
    fontWeight: '500',
  },
  overrideNotice: {
    marginTop: 10,
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  overrideTextContainer: {
    flex: 1,
  },
  overrideTitle: {
    fontSize: 11,
    fontWeight: '800',
  },
  overrideDetail: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  overrideSub: {
    fontSize: 10,
    fontStyle: 'italic',
    marginTop: 2,
  },
  notesText: {
    fontSize: 11,
    fontStyle: 'italic',
    marginTop: 6,
  },
});
