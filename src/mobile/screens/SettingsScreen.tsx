import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { useMobileSchedule } from '../../context/MobileScheduleContext';
import { useTheme } from '../../theme/theme';
import { ProfileModal } from '../components/modals/ProfileModal';
import { ThemePreference } from '../../storage/mobileStorage';
import {
  User,
  Sparkles,
  Moon,
  Sun,
  Smartphone,
  Play,
  RotateCcw,
  Download,
  Upload,
  Trash2,
  ShieldCheck,
  Check,
  Clock,
  Calendar,
  ChevronRight,
  X,
} from 'lucide-react-native';
import { getTodayIsoString } from '../../core/timeUtils';

export const SettingsScreen: React.FC = () => {
  const {
    profile,
    saveProfile,
    activeMode,
    enterDemoMode,
    exitDemoMode,
    resetDemoData,
    themePreference,
    setThemePreference,
    isSimulationActive,
    simulatedDate,
    simulatedTime,
    setSimulatedDateTime,
    clearSimulation,
    exportBackupJson,
    importBackupJson,
    clearActiveData,
    setActiveTab,
  } = useMobileSchedule();
  const { colors } = useTheme();

  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [jsonModalVisible, setJsonModalVisible] = useState(false);
  const [jsonModalMode, setJsonModalMode] = useState<'export' | 'import'>('export');
  const [jsonContent, setJsonContent] = useState('');

  // Simulator local form
  const [simDateInput, setSimDateInput] = useState(simulatedDate || getTodayIsoString());
  const [simTimeInput, setSimTimeInput] = useState(simulatedTime || '08:15');

  const handleOpenExport = () => {
    const data = exportBackupJson();
    setJsonContent(data);
    setJsonModalMode('export');
    setJsonModalVisible(true);
  };

  const handleOpenImport = () => {
    setJsonContent('');
    setJsonModalMode('import');
    setJsonModalVisible(true);
  };

  const handleApplyImport = async () => {
    if (!jsonContent.trim()) {
      Alert.alert('Empty Input', 'Please paste valid NextClass JSON.');
      return;
    }
    const result = await importBackupJson(jsonContent);
    if (result.success) {
      Alert.alert('Success', 'Schedule backup successfully imported!');
      setJsonModalVisible(false);
    } else {
      Alert.alert('Import Failed', result.errors.join('\n'));
    }
  };

  const handleResetData = () => {
    Alert.alert(
      'Reset Schedule',
      'Are you sure you want to clear your current timetable and calendar? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await clearActiveData();
          },
        },
      ]
    );
  };

  const handleApplyCustomSimulation = () => {
    setSimulatedDateTime(simDateInput, simTimeInput);
    Alert.alert('Simulation Active', `Simulating ${simDateInput} at ${simTimeInput}. Switch to Today view to test.`, [
      { text: 'Go to Today', onPress: () => setActiveTab('today') },
      { text: 'OK', style: 'cancel' },
    ]);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Student Profile Card */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <User size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Student Profile</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {profile.name || 'Student'}
          </Text>
          <Text style={[styles.profileMeta, { color: colors.textSecondary }]}>
            {profile.course || profile.department || 'Engineering'}
          </Text>
          <View style={styles.semSecRow}>
            <View style={[styles.semSecBadge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.semSecText, { color: colors.primary }]}>
                Semester {profile.semester || '5'}
              </Text>
            </View>
            <View style={[styles.semSecBadge, { backgroundColor: colors.surfaceVariant }]}>
              <Text style={[styles.semSecText, { color: colors.primary }]}>
                Section {profile.section || 'C'}
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.outlineBtn, { borderColor: colors.border }]}
          onPress={() => setProfileModalVisible(true)}
        >
          <Text style={[styles.outlineBtnText, { color: colors.text }]}>Edit Profile</Text>
          <ChevronRight size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* 2. App Mode & Strict Data Isolation */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Sparkles size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>App Mode & Isolation</Text>
        </View>

        <View style={styles.modeStatusRow}>
          <Text style={[styles.modeLabel, { color: colors.textSecondary }]}>Active Workspace:</Text>
          <View
            style={[
              styles.modeBadge,
              { backgroundColor: activeMode === 'demo' ? '#FEF3C7' : '#DBEAFE' },
            ]}
          >
            <Text
              style={[
                styles.modeBadgeText,
                { color: activeMode === 'demo' ? '#B45309' : '#1E40AF' },
              ]}
            >
              {activeMode === 'demo' ? 'DEMO MODE (CSE-C Sample)' : 'PERSONAL WORKSPACE'}
            </Text>
          </View>
        </View>

        <View style={[styles.isolationBox, { backgroundColor: colors.surfaceVariant }]}>
          <ShieldCheck size={16} color={colors.primary} />
          <Text style={[styles.isolationText, { color: colors.textSecondary }]}>
            Isolated Storage: Demo Mode runs in a separate sandbox. Switching or resetting demo data
            will never affect your personal schedule.
          </Text>
        </View>

        {activeMode === 'demo' ? (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={exitDemoMode}
            >
              <User size={16} color="#FFFFFF" />
              <Text style={styles.primaryBtnText}>Exit to Personal Schedule</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.dangerBtn, { backgroundColor: '#FEE2E2' }]}
              onPress={resetDemoData}
            >
              <RotateCcw size={16} color="#DC2626" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
            onPress={enterDemoMode}
          >
            <Sparkles size={16} color="#FFFFFF" />
            <Text style={styles.primaryBtnText}>Explore Demo Mode (CSE-C)</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 3. Theme Preferences (No purple AI theme!) */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Moon size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Appearance & Theme</Text>
        </View>

        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Professional Academic Theme (Sapphire/Royal Cobalt with Slate neutrals).
        </Text>

        <View style={styles.themeRow}>
          {(['system', 'light', 'dark'] as ThemePreference[]).map(themeOption => {
            const isSelected = themePreference === themeOption;
            const Icon =
              themeOption === 'system' ? Smartphone : themeOption === 'light' ? Sun : Moon;
            const label =
              themeOption === 'system' ? 'System' : themeOption === 'light' ? 'Light' : 'Dark';

            return (
              <TouchableOpacity
                key={themeOption}
                style={[
                  styles.themeTab,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.surfaceVariant,
                  },
                ]}
                onPress={() => setThemePreference(themeOption)}
              >
                <Icon size={16} color={isSelected ? '#FFFFFF' : colors.text} />
                <Text
                  style={[
                    styles.themeTabText,
                    { color: isSelected ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 4. Time Simulator */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Clock size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Schedule Simulator</Text>
        </View>

        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Test time-based logic, breaks, next-class countdowns, and academic day order shifts.
        </Text>

        {isSimulationActive ? (
          <View style={[styles.simActiveBox, { backgroundColor: '#FEF3C7', borderColor: '#FCD34D' }]}>
            <Play size={16} color="#D97706" />
            <Text style={[styles.simActiveText, { color: '#92400E' }]}>
              Simulating {simulatedDate} at {simulatedTime}
            </Text>
            <TouchableOpacity style={styles.clearSimBtn} onPress={clearSimulation}>
              <Text style={styles.clearSimText}>Reset to Real Time</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={[styles.simInactiveText, { color: colors.textTertiary }]}>
            Running real system clock.
          </Text>
        )}

        {/* Simulator Inputs */}
        <View style={styles.simInputsRow}>
          <View style={{ flex: 3, marginRight: 8 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Date (YYYY-MM-DD)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
              ]}
              value={simDateInput}
              onChangeText={setSimDateInput}
              placeholder="2026-09-17"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
          <View style={{ flex: 2 }}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Time (HH:mm)</Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.surfaceVariant, borderColor: colors.border, color: colors.text },
              ]}
              value={simTimeInput}
              onChangeText={setSimTimeInput}
              placeholder="08:15"
              placeholderTextColor={colors.textTertiary}
            />
          </View>
        </View>

        {/* Quick Presets */}
        <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 10 }]}>
          Quick Presets (CSE-C Schedule):
        </Text>
        <View style={styles.presetWrap}>
          <TouchableOpacity
            style={[styles.presetBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => {
              setSimDateInput('2026-09-15'); // Tuesday
              setSimTimeInput('08:30'); // Lab active
              setSimulatedDateTime('2026-09-15', '08:30');
            }}
          >
            <Text style={[styles.presetText, { color: colors.text }]}>Tue 08:30 (OS Lab)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => {
              setSimDateInput('2026-09-14'); // Monday
              setSimTimeInput('10:45'); // Tea break
              setSimulatedDateTime('2026-09-14', '10:45');
            }}
          >
            <Text style={[styles.presetText, { color: colors.text }]}>Mon 10:45 (Tea Break)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => {
              setSimDateInput('2026-09-16'); // Wednesday
              setSimTimeInput('13:00'); // Lunch break
              setSimulatedDateTime('2026-09-16', '13:00');
            }}
          >
            <Text style={[styles.presetText, { color: colors.text }]}>Wed 13:00 (Lunch)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetBtn, { backgroundColor: colors.surfaceVariant }]}
            onPress={() => {
              setSimDateInput('2026-09-18'); // Friday
              setSimTimeInput('16:45'); // After classes
              setSimulatedDateTime('2026-09-18', '16:45');
            }}
          >
            <Text style={[styles.presetText, { color: colors.text }]}>Fri 16:45 (All Done)</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 12 }]}
          onPress={handleApplyCustomSimulation}
        >
          <Play size={16} color="#FFFFFF" />
          <Text style={styles.primaryBtnText}>Apply Custom Simulation</Text>
        </TouchableOpacity>
      </View>

      {/* 5. Data Backup & Portability */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.cardHeader}>
          <Download size={20} color={colors.primary} />
          <Text style={[styles.cardTitle, { color: colors.text }]}>Data Portability</Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Export or import your complete schedule and calendar in standard NextClass JSON format.
        </Text>

        <View style={styles.btnRow}>
          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.primary, flex: 1 }]}
            onPress={handleOpenExport}
          >
            <Download size={16} color={colors.primary} />
            <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Export JSON</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.outlineBtn, { borderColor: colors.primary, flex: 1 }]}
            onPress={handleOpenImport}
          >
            <Upload size={16} color={colors.primary} />
            <Text style={[styles.outlineBtnText, { color: colors.primary }]}>Import JSON</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 6. Danger Zone */}
      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: '#FECACA' }]}>
        <View style={styles.cardHeader}>
          <Trash2 size={20} color="#DC2626" />
          <Text style={[styles.cardTitle, { color: '#DC2626' }]}>Clear Data</Text>
        </View>
        <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>
          Clear all personal timetable slots and calendar entries in this workspace.
        </Text>
        <TouchableOpacity
          style={[styles.dangerBtnFull, { backgroundColor: '#FEE2E2' }]}
          onPress={handleResetData}
        >
          <Trash2 size={16} color="#DC2626" />
          <Text style={styles.dangerBtnText}>Reset Workspace to Empty</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Modal */}
      <ProfileModal
        visible={profileModalVisible}
        onClose={() => setProfileModalVisible(false)}
        onSave={saveProfile}
        initialProfile={profile}
      />

      {/* JSON Import/Export Modal */}
      <Modal visible={jsonModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {jsonModalMode === 'export' ? 'Export Schedule JSON' : 'Import Schedule JSON'}
              </Text>
              <TouchableOpacity onPress={() => setJsonModalVisible(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={[styles.modalHelp, { color: colors.textSecondary }]}>
                {jsonModalMode === 'export'
                  ? 'Copy this JSON backup to store or transfer your schedule.'
                  : 'Paste a valid NextClass JSON export below to load.'}
              </Text>

              <TextInput
                style={[
                  styles.jsonInput,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                multiline
                editable={jsonModalMode === 'import'}
                value={jsonContent}
                onChangeText={setJsonContent}
                placeholder="Paste NextClass JSON here..."
                placeholderTextColor={colors.textTertiary}
              />
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              {jsonModalMode === 'import' ? (
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                  onPress={handleApplyImport}
                >
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.primaryBtnText}>Validate & Import</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                  onPress={() => setJsonModalVisible(false)}
                >
                  <Text style={styles.primaryBtnText}>Done</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
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
  cardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  profileInfo: {
    marginBottom: 12,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  semSecRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  semSecBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  semSecText: {
    fontSize: 11,
    fontWeight: '700',
  },
  modeStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modeLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  modeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  isolationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  isolationText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 15,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  themeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  themeTabText: {
    fontSize: 12,
    fontWeight: '700',
  },
  simActiveBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  simActiveText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
  },
  clearSimBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  clearSimText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#D97706',
  },
  simInactiveText: {
    fontSize: 12,
    marginBottom: 10,
  },
  simInputsRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 12,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  presetBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  presetText: {
    fontSize: 11,
    fontWeight: '600',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  outlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
  },
  outlineBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dangerBtn: {
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dangerBtnFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 10,
  },
  dangerBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalSheet: {
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalBody: {
    padding: 16,
  },
  modalHelp: {
    fontSize: 12,
    marginBottom: 8,
  },
  jsonInput: {
    height: 180,
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    textAlignVertical: 'top',
  },
  modalFooter: {
    padding: 14,
    borderTopWidth: 1,
  },
});
