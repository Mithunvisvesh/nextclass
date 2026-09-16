import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { useTheme } from '../../theme/theme';
import { Sparkles, Calendar, BookOpen, User, CheckCircle2, ShieldCheck } from 'lucide-react-native';

export const OnboardingScreen: React.FC = () => {
  const { completeOnboarding, enterDemoMode } = useMobileSchedule();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('5');
  const [section, setSection] = useState('C');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartBlank = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding({
        name: name.trim() || 'Student',
        course: department.trim() || 'Engineering',
        department: department.trim() || 'Engineering',
        semester: semester.trim() || '1',
        section: section.trim() || 'A',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartDemo = async () => {
    setIsSubmitting(true);
    try {
      await enterDemoMode();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.screen, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.header}>
          <View style={[styles.iconBadge, { backgroundColor: colors.primary }]}>
            <Calendar size={32} color="#FFFFFF" />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>NextClass</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>Know what's next.</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            Your intelligent academic schedule assistant. Real-time class tracking, weekly baseline
            management, and dynamic academic calendar overrides.
          </Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <User size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Student Profile</Text>
          </View>
          <Text style={[styles.cardHelp, { color: colors.textTertiary }]}>
            Optional — helps personalize your daily schedule and timetable headers.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Your Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Department / Course</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surfaceVariant,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              placeholder="e.g. Computer Science & Engineering"
              placeholderTextColor={colors.textTertiary}
              value={department}
              onChangeText={setDepartment}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Semester</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="5"
                placeholderTextColor={colors.textTertiary}
                value={semester}
                onChangeText={setSemester}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Section</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="C"
                placeholderTextColor={colors.textTertiary}
                value={section}
                onChangeText={setSection}
              />
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={handleStartBlank}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <CheckCircle2 size={20} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>
              {name ? `Get Started as ${name}` : 'Start with Clean Schedule'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { backgroundColor: colors.surfaceVariant, borderColor: colors.primary },
            ]}
            onPress={handleStartDemo}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Sparkles size={18} color={colors.primary} />
            <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
              Try Demo Mode (CSE-C Sample Timetable)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Feature Badges & Isolation Guarantee */}
        <View style={[styles.isolationCard, { backgroundColor: colors.surfaceVariant }]}>
          <ShieldCheck size={18} color={colors.primary} />
          <Text style={[styles.isolationText, { color: colors.textSecondary }]}>
            Strict Data Isolation: Demo Mode and Personal Data live in completely separate
            namespaces. Trying demo mode will never overwrite or erase your personal timetable.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    alignItems: 'stretch',
  },
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  iconBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 18,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardHelp: {
    fontSize: 12,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  actionContainer: {
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  isolationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
  },
  isolationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
