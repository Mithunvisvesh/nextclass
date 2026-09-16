import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { UserProfile } from '../../../storage/mobileStorage';
import { useTheme } from '../../../theme/theme';
import { X, Check, User, ShieldCheck } from 'lucide-react-native';
import { DropdownSelect, DropdownOption } from '../common/DropdownSelect';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  initialProfile: UserProfile;
}

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

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  initialProfile,
}) => {
  const { colors } = useTheme();

  const [name, setName] = useState(initialProfile.name || '');
  const [department, setDepartment] = useState(
    initialProfile.department || initialProfile.course || 'Computer Science & Engineering'
  );
  const [semester, setSemester] = useState(
    initialProfile.semester?.startsWith('Semester')
      ? initialProfile.semester
      : `Semester ${initialProfile.semester || '5'}`
  );
  const [section, setSection] = useState(
    initialProfile.section?.startsWith('Section')
      ? initialProfile.section
      : `Section ${initialProfile.section || 'C'}`
  );
  const [academicYear, setAcademicYear] = useState(initialProfile.academicYear || '2026–27');

  useEffect(() => {
    setName(initialProfile.name || '');
    setDepartment(
      initialProfile.department || initialProfile.course || 'Computer Science & Engineering'
    );
    setSemester(
      initialProfile.semester?.startsWith('Semester')
        ? initialProfile.semester
        : `Semester ${initialProfile.semester || '5'}`
    );
    setSection(
      initialProfile.section?.startsWith('Section')
        ? initialProfile.section
        : `Section ${initialProfile.section || 'C'}`
    );
    setAcademicYear(initialProfile.academicYear || '2026–27');
  }, [initialProfile, visible]);

  const handleSave = async () => {
    await onSave({
      name: name.trim() || 'Student',
      course: department,
      department,
      semester,
      section,
      academicYear,
    });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <User size={18} color={colors.primary} />
              <Text style={[styles.title, { color: colors.text }]}>Local Profile Setup</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Local Storage Privacy Badge */}
            <View style={[styles.privacyPill, { backgroundColor: colors.surfaceVariant }]}>
              <ShieldCheck size={14} color={colors.primary} />
              <Text style={[styles.privacyText, { color: colors.textSecondary }]}>
                100% Local Profile • Stored only on your device
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Your Name</Text>
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

            <DropdownSelect
              label="Department"
              value={department}
              placeholder="Select Department"
              options={DEPARTMENT_OPTIONS}
              onSelect={setDepartment}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <DropdownSelect
                  label="Semester"
                  value={semester}
                  placeholder="Select Semester"
                  options={SEMESTER_OPTIONS}
                  onSelect={setSemester}
                />
              </View>
              <View style={{ flex: 1 }}>
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
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Local Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  privacyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
  },
  privacyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 12,
  },
  fieldLabel: {
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
  footer: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
