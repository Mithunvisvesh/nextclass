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
import { UserProfile } from '../../../storage/mobileStorage';
import { useTheme } from '../../../theme/theme';
import { X, Check, User } from 'lucide-react-native';

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (profile: Partial<UserProfile>) => Promise<void>;
  initialProfile: UserProfile;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  visible,
  onClose,
  onSave,
  initialProfile,
}) => {
  const { colors } = useTheme();

  const [name, setName] = useState(initialProfile.name || '');
  const [department, setDepartment] = useState(initialProfile.course || initialProfile.department || '');
  const [semester, setSemester] = useState(initialProfile.semester || '5');
  const [section, setSection] = useState(initialProfile.section || 'C');

  useEffect(() => {
    setName(initialProfile.name || '');
    setDepartment(initialProfile.course || initialProfile.department || '');
    setSemester(initialProfile.semester || '5');
    setSection(initialProfile.section || 'C');
  }, [initialProfile, visible]);

  const handleSave = async () => {
    await onSave({
      name: name.trim(),
      course: department.trim(),
      department: department.trim(),
      semester: semester.trim(),
      section: section.trim(),
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
              <Text style={[styles.title, { color: colors.text }]}>Edit Student Profile</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Student Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. John Doe"
              placeholderTextColor={colors.textTertiary}
              value={name}
              onChangeText={setName}
            />

            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>
              Department / Course
            </Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Computer Science & Engineering"
              placeholderTextColor={colors.textTertiary}
              value={department}
              onChangeText={setDepartment}
            />

            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Semester</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="5"
                  placeholderTextColor={colors.textTertiary}
                  value={semester}
                  onChangeText={setSemester}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Section</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text }]}
                  placeholder="C"
                  placeholderTextColor={colors.textTertiary}
                  value={section}
                  onChangeText={setSection}
                />
              </View>
            </View>
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSave}
            >
              <Check size={18} color="#FFFFFF" />
              <Text style={styles.saveBtnText}>Save Profile</Text>
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
    maxHeight: '80%',
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
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  body: {
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
  row: {
    flexDirection: 'row',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
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
