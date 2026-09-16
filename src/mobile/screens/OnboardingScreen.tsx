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
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { useTheme } from '../../theme/theme';
import {
  Calendar,
  User,
  ShieldCheck,
  FileText,
  CalendarCheck,
  Edit3,
  Sparkles,
  ArrowRight,
} from 'lucide-react-native';
import { DropdownSelect, DropdownOption } from '../components/common/DropdownSelect';
import { pickAndParseTimetable, pickAndParseCalendar } from '../../services/pdf/fileImportService';
import { TimetableReviewModal } from '../components/modals/TimetableReviewModal';
import { CalendarReviewModal } from '../components/modals/CalendarReviewModal';
import { ParsedTimetableResult } from '../../services/pdf/timetableParser';
import { ParsedCalendarResult } from '../../services/pdf/calendarParser';

const DEPARTMENT_OPTIONS: DropdownOption[] = [
  { label: 'Computer Science & Engineering', value: 'Computer Science & Engineering', description: 'CSE' },
  { label: 'Electronics & Communication', value: 'Electronics & Communication', description: 'ECE' },
  { label: 'Mechanical Engineering', value: 'Mechanical Engineering', description: 'ME' },
  { label: 'Civil Engineering', value: 'Civil Engineering', description: 'CE' },
  { label: 'Information Technology', value: 'Information Technology', description: 'IT' },
  { label: 'Artificial Intelligence & Data Science', value: 'Artificial Intelligence & Data Science', description: 'AI & DS' },
  { label: 'Electrical & Electronics', value: 'Electrical & Electronics', description: 'EEE' },
  { label: 'General / Other Sciences', value: 'General / Other Sciences' },
];

const SEMESTER_OPTIONS: DropdownOption[] = [
  { label: 'Semester 1', value: 'Semester 1' },
  { label: 'Semester 2', value: 'Semester 2' },
  { label: 'Semester 3', value: 'Semester 3' },
  { label: 'Semester 4', value: 'Semester 4' },
  { label: 'Semester 5', value: 'Semester 5' },
  { label: 'Semester 6', value: 'Semester 6' },
  { label: 'Semester 7', value: 'Semester 7' },
  { label: 'Semester 8', value: 'Semester 8' },
];

const SECTION_OPTIONS: DropdownOption[] = [
  { label: 'Section A', value: 'Section A' },
  { label: 'Section B', value: 'Section B' },
  { label: 'Section C', value: 'Section C' },
  { label: 'Section D', value: 'Section D' },
  { label: 'Section E', value: 'Section E' },
  { label: 'Section F', value: 'Section F' },
];

const ACADEMIC_YEAR_OPTIONS: DropdownOption[] = [
  { label: '2026–27 (Odd Semester)', value: '2026–27' },
  { label: '2026–27 (Even Semester)', value: '2026–27 Even' },
  { label: '2025–26', value: '2025–26' },
  { label: '2027–28', value: '2027–28' },
];

export const OnboardingScreen: React.FC = () => {
  const {
    completeOnboarding,
    enterDemoMode,
    importTimetableClasses,
    importCalendarEntries,
  } = useMobileSchedule();
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 5');
  const [section, setSection] = useState('Section C');
  const [academicYear, setAcademicYear] = useState('2026–27');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  // Review Modals
  const [timetableResult, setTimetableResult] = useState<ParsedTimetableResult | null>(null);
  const [showTimetableReview, setShowTimetableReview] = useState(false);

  const [calendarResult, setCalendarResult] = useState<ParsedCalendarResult | null>(null);
  const [showCalendarReview, setShowCalendarReview] = useState(false);

  const getProfilePayload = () => ({
    name: name.trim() || 'Student',
    course: department,
    department,
    semester,
    section,
    academicYear,
  });

  // Action 1: Import Timetable PDF
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
      setShowTimetableReview(true);
    } finally {
      setIsParsing(false);
    }
  };

  // Action 2: Import Calendar PDF
  const handleImportCalendar = async () => {
    setIsParsing(true);
    try {
      const res = await pickAndParseCalendar();
      if (!res.success) {
        if (!res.isCancelled) {
          Alert.alert('PDF Import Error', res.error);
        }
        return;
      }
      setCalendarResult(res.result);
      setShowCalendarReview(true);
    } finally {
      setIsParsing(false);
    }
  };

  // Action 3: Enter Manually
  const handleEnterManually = async () => {
    setIsSubmitting(true);
    try {
      await completeOnboarding(getProfilePayload());
    } finally {
      setIsSubmitting(false);
    }
  };

  // Action 4: Demo Mode
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
            Academic timetable and calendar assistant. Understand what class is happening today, what comes next, and modified calendar days.
          </Text>
        </View>

        {/* Local Profile Card */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <User size={18} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Local Student Profile</Text>
          </View>

          <View style={[styles.privacyPill, { backgroundColor: colors.surfaceVariant }]}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
              Stored 100% locally on this device • No login or cloud server required
            </Text>
          </View>

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
              placeholder="e.g. Alex"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />
          </View>

          <DropdownSelect
            label="Department"
            value={department}
            placeholder="Select Department"
            options={DEPARTMENT_OPTIONS}
            onSelect={setDepartment}
          />

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
              <DropdownSelect
                label="Semester"
                value={semester}
                placeholder="Select Semester"
                options={SEMESTER_OPTIONS}
                onSelect={setSemester}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <DropdownSelect
                label="Section"
                value={section}
                placeholder="Select Section"
                options={SECTION_OPTIONS}
                onSelect={setSection}
              />
            </View>
          </View>

          <DropdownSelect
            label="Academic Year"
            value={academicYear}
            placeholder="Select Academic Year"
            options={ACADEMIC_YEAR_OPTIONS}
            onSelect={setAcademicYear}
          />
        </View>

        {/* Set Up Your Schedule Card (3 Clear Choices) */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.setupHeading, { color: colors.text }]}>Set Up Your Schedule</Text>
          <Text style={[styles.setupSubtext, { color: colors.textSecondary }]}>
            Choose how you'd like to initialize your academic timetable and calendar:
          </Text>

          {isParsing && (
            <View style={styles.parsingIndicator}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.parsingText, { color: colors.primary }]}>
                Parsing PDF locally on device...
              </Text>
            </View>
          )}

          {/* Option 1: Import Timetable PDF */}
          <TouchableOpacity
            style={[styles.setupOptionBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            onPress={handleImportTimetable}
            disabled={isParsing || isSubmitting}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <FileText size={20} color={colors.primary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Import Timetable PDF</Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                Select university timetable PDF and extract classes automatically
              </Text>
            </View>
            <ArrowRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Option 2: Import Academic Calendar PDF */}
          <TouchableOpacity
            style={[styles.setupOptionBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            onPress={handleImportCalendar}
            disabled={isParsing || isSubmitting}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconWrap, { backgroundColor: '#ECFDF5' }]}>
              <CalendarCheck size={20} color="#059669" />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Import Academic Calendar PDF</Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                Extract holidays, exams, and special timetable mappings
              </Text>
            </View>
            <ArrowRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          {/* Option 3: Enter Manually */}
          <TouchableOpacity
            style={[styles.setupOptionBtn, { backgroundColor: colors.surfaceVariant, borderColor: colors.border }]}
            onPress={handleEnterManually}
            disabled={isParsing || isSubmitting}
            activeOpacity={0.7}
          >
            <View style={[styles.optionIconWrap, { backgroundColor: '#F3F4F6' }]}>
              <Edit3 size={20} color={colors.textSecondary} />
            </View>
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, { color: colors.text }]}>Enter Manually</Text>
              <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                Start blank and configure your weekly timetable and calendar directly
              </Text>
            </View>
            <ArrowRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Demo Mode Action */}
        <View style={[styles.demoCard, { backgroundColor: colors.surface, borderColor: '#FCD34D' }]}>
          <View style={styles.demoHeader}>
            <Sparkles size={18} color="#D97706" />
            <Text style={[styles.demoTitle, { color: '#92400E' }]}>Demo Mode (Sample Reference Data)</Text>
          </View>
          <Text style={[styles.demoDesc, { color: colors.textSecondary }]}>
            Explore NextClass immediately using pre-loaded CSE-C sample timetable and 2026–27 academic calendar. Strictly isolated from personal data.
          </Text>
          <TouchableOpacity
            style={[styles.demoBtn, { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' }]}
            onPress={handleStartDemo}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Sparkles size={16} color="#B45309" />
            <Text style={styles.demoBtnText}>Explore Demo Mode</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Timetable Review Modal */}
      <TimetableReviewModal
        visible={showTimetableReview}
        parsedResult={timetableResult}
        onClose={() => setShowTimetableReview(false)}
        hasExistingClasses={false}
        onConfirm={async classes => {
          await completeOnboarding(getProfilePayload());
          await importTimetableClasses(classes, 'replace');
          setShowTimetableReview(false);
        }}
      />

      {/* Calendar Review Modal */}
      <CalendarReviewModal
        visible={showCalendarReview}
        parsedResult={calendarResult}
        onClose={() => setShowCalendarReview(false)}
        hasExistingEntries={false}
        onConfirm={async entries => {
          await completeOnboarding(getProfilePayload());
          await importCalendarEntries(entries, 'replace');
          setShowCalendarReview(false);
        }}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 14,
  },
  privacyText: {
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  row: {
    flexDirection: 'row',
  },
  setupHeading: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  setupSubtext: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  parsingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 8,
    marginBottom: 8,
  },
  parsingText: {
    fontSize: 13,
    fontWeight: '600',
  },
  setupOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 10,
  },
  optionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  demoCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  demoTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  demoDesc: {
    fontSize: 12,
    lineHeight: 17,
    marginBottom: 12,
  },
  demoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  demoBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },
});
