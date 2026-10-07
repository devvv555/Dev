import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Vibration,
} from 'react-native';
import { Subject } from '../types';
import {
  StudzoneService,
  StudzoneAttendanceRecord,
} from '../services/studzoneService';

interface ReconcileScreenProps {
  subjects: Subject[];
  activeRollNo?: string;
  onUpdateAttendance: (
    subjectId: string,
    appAttended: number,
    appTotal: number,
    officialAttended: number,
    officialTotal: number
  ) => void;
  onUpdateSubjectOfficial?: (subjectId: string, officialAttended: number, officialTotal: number) => void;
  onBatchUpdateSubjects?: (updatedSubjects: Subject[]) => void;
  onRefresh?: () => Promise<void>;
}

export const ReconcileScreen: React.FC<ReconcileScreenProps> = ({
  subjects,
  activeRollNo = '',
  onUpdateAttendance,
  onUpdateSubjectOfficial,
  onBatchUpdateSubjects,
  onRefresh,
}) => {
  // Manual edit states
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [appAttended, setAppAttended] = useState('');
  const [appTotal, setAppTotal] = useState('');
  const [officialAttended, setOfficialAttended] = useState('');
  const [officialTotal, setOfficialTotal] = useState('');

  // Studzone automated extraction states
  const [isStudzoneModalVisible, setIsStudzoneModalVisible] = useState(false);
  const [studzoneRollNo, setStudzoneRollNo] = useState(activeRollNo);
  const [studzonePassword, setStudzonePassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberCreds, setRememberCreds] = useState(true);
  const [syncAppAttendanceToo, setSyncAppAttendanceToo] = useState(true);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStatusText, setExtractionStatusText] = useState('');
  const [extractedRecords, setExtractedRecords] = useState<StudzoneAttendanceRecord[] | null>(null);

  // Pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // Load saved credentials on mount or roll change
  useEffect(() => {
    async function loadSaved() {
      const saved = await StudzoneService.getSavedCredentials();
      if (saved) {
        setStudzoneRollNo(saved.rollNo || activeRollNo);
        setStudzonePassword(saved.dobPassword || '');
        setRememberCreds(saved.remember);
      } else if (activeRollNo) {
        setStudzoneRollNo(activeRollNo);
      }
    }
    loadSaved();
  }, [activeRollNo]);

  const handlePullRefresh = async () => {
    if (!onRefresh) return;
    setRefreshing(true);
    Vibration.vibrate(35);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setAppAttended(subject.attended.toString());
    setAppTotal(subject.total.toString());
    setOfficialAttended(subject.officialAttended.toString());
    setOfficialTotal(subject.officialTotal.toString());
  };

  const handleCopyErpToApp = () => {
    setAppAttended(officialAttended);
    setAppTotal(officialTotal);
  };

  const handleSaveManual = () => {
    if (!editingSubject) return;
    const aAtt = parseInt(appAttended, 10);
    const aTot = parseInt(appTotal, 10);
    const oAtt = parseInt(officialAttended, 10);
    const oTot = parseInt(officialTotal, 10);

    if (isNaN(aAtt) || isNaN(aTot) || aAtt < 0 || aTot < aAtt) {
      Alert.alert(
        'Invalid App Attendance',
        'App attended classes must be non-negative and cannot exceed total classes held.'
      );
      return;
    }

    if (isNaN(oAtt) || isNaN(oTot) || oAtt < 0 || oTot < oAtt) {
      Alert.alert(
        'Invalid ERP Baseline',
        'Official attended classes must be non-negative and cannot exceed total classes held.'
      );
      return;
    }

    if (onUpdateAttendance) {
      onUpdateAttendance(editingSubject.id, aAtt, aTot, oAtt, oTot);
    } else if (onUpdateSubjectOfficial) {
      onUpdateSubjectOfficial(editingSubject.id, oAtt, oTot);
    }

    setEditingSubject(null);
    Alert.alert('Attendance Updated! 🔄', `Attendance recorded for ${editingSubject.name}.`);
  };

  // Perform automated Studzone extraction
  const handleStartStudzoneExtraction = async () => {
    const cleanRoll = (studzoneRollNo || activeRollNo).trim().toUpperCase();
    const cleanPass = studzonePassword.trim().toUpperCase();

    if (!cleanRoll) {
      Alert.alert('Roll Number Required', 'Please enter your Student Roll Number.');
      return;
    }

    if (!cleanPass) {
      Alert.alert(
        'Password Required',
        'Please enter your Date of Birth in DDMMMYY format (e.g. 13AUG05 for 13th August 2005).'
      );
      return;
    }

    setIsExtracting(true);
    setExtractionStatusText('Connecting to ecampus.psgtech.ac.in...');

    try {
      // Step status progression
      setTimeout(() => {
        setExtractionStatusText('Authenticating with Studzone portal...');
      }, 700);

      setTimeout(() => {
        setExtractionStatusText('Retrieving official attendance table...');
      }, 1400);

      const result = await StudzoneService.loginAndExtractAttendance(cleanRoll, cleanPass);

      if (!result.success) {
        Alert.alert('Studzone Sync Failed', result.error || 'Could not fetch attendance records.');
        return;
      }

      // Save credentials if user opted in
      await StudzoneService.saveCredentials({
        rollNo: cleanRoll,
        dobPassword: cleanPass,
        remember: rememberCreds,
      });

      setExtractedRecords(result.records);
      Vibration.vibrate([0, 50, 50, 50]);
    } catch (e: any) {
      Alert.alert('Connection Error', e.message || 'Network error communicating with Studzone.');
    } finally {
      setIsExtracting(false);
      setExtractionStatusText('');
    }
  };

  // Apply extracted Studzone records into App subjects
  const handleApplyExtractedRecords = () => {
    if (!extractedRecords || extractedRecords.length === 0) return;

    if (onBatchUpdateSubjects) {
      const { updatedSubjects, matchedCount, unmatchedCodes } = StudzoneService.applyToSubjects(
        extractedRecords,
        subjects,
        syncAppAttendanceToo
      );

      onBatchUpdateSubjects(updatedSubjects);

      let msg = `Synchronized ${matchedCount} subjects from your official Studzone portal!`;
      if (unmatchedCodes.length > 0) {
        msg += `\n\n(Unmatched course codes: ${unmatchedCodes.join(', ')})`;
      }

      Alert.alert('Studzone Sync Complete! 🚀', msg);
    } else {
      // Fallback single updates
      extractedRecords.forEach((rec) => {
        const sub = subjects.find(
          (s) => s.code.toUpperCase() === rec.courseCode.toUpperCase()
        );
        if (sub) {
          const appAtt = syncAppAttendanceToo ? rec.attendedClasses : sub.attended;
          const appTot = syncAppAttendanceToo ? rec.totalClasses : sub.total;
          onUpdateAttendance(sub.id, appAtt, appTot, rec.attendedClasses, rec.totalClasses);
        }
      });
      Alert.alert('Studzone Sync Complete! 🚀', `Updated official baseline from Studzone.`);
    }

    setExtractedRecords(null);
    setIsStudzoneModalVisible(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handlePullRefresh}
            colors={['#38BDF8', '#2563EB']}
            tintColor="#38BDF8"
          />
        ) : undefined
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Sync</Text>
        <Text style={styles.headerSubtitle}>
          Review, calibrate, and sync your attendance directly from official college portals.
        </Text>
      </View>

      {/* Hero: Studzone Live Sync Banner */}
      <View style={styles.studzoneCard}>
        <View style={styles.studzoneCardHeader}>
          <View style={styles.studzoneIconCircle}>
            <Text style={styles.studzoneCardIcon}>⚡</Text>
          </View>
          <View style={styles.studzoneTitleCol}>
            <View style={styles.studzoneBadgeRow}>
              <Text style={styles.studzoneCardTitle}>PSG Studzone Extractor</Text>
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>OFFICIAL PORTAL</Text>
              </View>
            </View>
            <Text style={styles.studzoneCardSubtitle}>
              ecampus.psgtech.ac.in/studzone
            </Text>
          </View>
        </View>

        <Text style={styles.studzoneDescription}>
          Automatically pull your official subject-wise attended and total classes directly from your college portal.
        </Text>

        <TouchableOpacity
          style={styles.studzoneSyncButton}
          onPress={() => {
            setExtractedRecords(null);
            setIsStudzoneModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.studzoneSyncButtonText}>🌐 Connect & Extract Attendance</Text>
        </TouchableOpacity>
      </View>

      {/* Information Tip */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>💡</Text>
        <Text style={styles.infoBannerText}>
          The <Text style={styles.boldText}>Hourly App</Text> logs each period real-time. The <Text style={styles.boldText}>College ERP</Text> represents your official baseline. Tap "✏️ Edit" on any subject below to make manual adjustments.
        </Text>
      </View>

      {/* Main Subjects Table */}
      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Subject Attendance & Reconciliation</Text>

        {subjects.map((sub) => {
          const appPct = sub.total === 0 ? 100 : (sub.attended / sub.total) * 100;
          const erpPct =
            sub.officialTotal === 0 ? 100 : (sub.officialAttended / sub.officialTotal) * 100;
          const classDiff = sub.total - sub.officialTotal;
          const attendedDiff = sub.attended - sub.officialAttended;

          return (
            <View key={sub.id} style={styles.rowItem}>
              <View style={styles.rowTop}>
                <View style={styles.subjectTitleContainer}>
                  <Text style={styles.subjectCode}>{sub.code}</Text>
                  <Text style={styles.subjectName}>{sub.name}</Text>
                </View>

                <TouchableOpacity
                  style={styles.syncBtn}
                  onPress={() => handleOpenEdit(sub)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.syncBtnText}>✏️ Edit</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.comparisonGrid}>
                <View style={styles.colBox}>
                  <Text style={styles.colLabel}>📱 Hourly App</Text>
                  <Text style={styles.colValue}>
                    {sub.attended} / {sub.total}
                  </Text>
                  <Text style={styles.colPct}>{appPct.toFixed(1)}%</Text>
                </View>

                <View style={styles.colDivider} />

                <View style={styles.colBox}>
                  <Text style={styles.colLabel}>🏛️ College ERP</Text>
                  <Text style={styles.colValue}>
                    {sub.officialAttended} / {sub.officialTotal}
                  </Text>
                  <Text style={styles.colPct}>{erpPct.toFixed(1)}%</Text>
                </View>

                <View style={styles.colDivider} />

                <View style={styles.colBox}>
                  <Text style={styles.colLabel}>Delta / Status</Text>
                  <Text
                    style={[
                      styles.colValue,
                      classDiff > 0 ? styles.deltaPositive : styles.deltaEven,
                    ]}
                  >
                    {classDiff > 0 ? `+${classDiff} held` : 'In sync'}
                  </Text>
                  <Text style={styles.deltaSub}>
                    {attendedDiff > 0 ? `+${attendedDiff} present` : 'Matches'}
                  </Text>
                </View>
              </View>

              {classDiff > 0 && (
                <View style={styles.deltaNotice}>
                  <Text style={styles.deltaNoticeText}>
                    ⚡ {classDiff} class sessions logged in App since portal last updated on{' '}
                    {sub.lastOfficialUpdate || 'last week'}.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Manual Edit Modal */}
      <Modal visible={!!editingSubject} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Edit Subject Attendance</Text>
              <Text style={styles.modalSubtitle}>
                {editingSubject?.name} ({editingSubject?.code})
              </Text>

              {/* Section 1: App Attendance */}
              <View style={styles.modalSection}>
                <Text style={styles.sectionHeader}>📱 Hourly App Attendance</Text>
                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Classes Attended</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={appAttended}
                      onChangeText={setAppAttended}
                      placeholder="0"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Total Held</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={appTotal}
                      onChangeText={setAppTotal}
                      placeholder="0"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>
              </View>

              {/* Section 2: College ERP Baseline */}
              <View style={styles.modalSection}>
                <View style={styles.sectionHeaderRow}>
                  <Text style={styles.sectionHeader}>🏛️ College Portal (ERP Baseline)</Text>
                  <TouchableOpacity
                    onPress={handleCopyErpToApp}
                    style={styles.copyErpBtn}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.copyErpBtnText}>⚡ Copy to App</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputRow}>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Official Attended</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={officialAttended}
                      onChangeText={setOfficialAttended}
                      placeholder="0"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                  <View style={styles.inputCol}>
                    <Text style={styles.inputLabel}>Official Total</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={officialTotal}
                      onChangeText={setOfficialTotal}
                      placeholder="0"
                      placeholderTextColor="#64748B"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setEditingSubject(null)}
                >
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSaveManual}
                >
                  <Text style={styles.modalSubmitText}>Save Attendance</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Studzone Automated Extractor Modal */}
      <Modal visible={isStudzoneModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalCard}>
              <View style={styles.studzoneModalHeader}>
                <View style={styles.studzoneModalIconCircle}>
                  <Text style={styles.studzoneModalIcon}>⚡</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle}>PSG Studzone Extractor</Text>
                  <Text style={styles.studzoneModalSub}>
                    Secure live portal extraction
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    if (!isExtracting) {
                      setIsStudzoneModalVisible(false);
                      setExtractedRecords(null);
                    }
                  }}
                  style={styles.closeModalBtn}
                >
                  <Text style={styles.closeModalBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {!extractedRecords ? (
                <>
                  {/* Credential Inputs */}
                  <View style={styles.modalSection}>
                    <Text style={styles.inputLabel}>Student Roll Number</Text>
                    <TextInput
                      style={styles.textInput}
                      autoCapitalize="characters"
                      value={studzoneRollNo}
                      onChangeText={(val) => setStudzoneRollNo(val.toUpperCase())}
                      placeholder="e.g. 24AA01"
                      placeholderTextColor="#64748B"
                      editable={!isExtracting}
                    />

                    <Text style={styles.inputLabel}>
                      Studzone Password (Date of Birth)
                    </Text>
                    <View style={styles.passwordInputContainer}>
                      <TextInput
                        style={[styles.textInput, { flex: 1, borderWidth: 0 }]}
                        secureTextEntry={!showPassword}
                        autoCapitalize="characters"
                        value={studzonePassword}
                        onChangeText={(val) => setStudzonePassword(val.toUpperCase())}
                        placeholder="e.g. 13AUG05"
                        placeholderTextColor="#64748B"
                        editable={!isExtracting}
                      />
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeBtn}
                      >
                        <Text style={styles.eyeText}>{showPassword ? '👁️' : '🙈'}</Text>
                      </TouchableOpacity>
                    </View>

                    <View style={styles.dobHintBox}>
                      <Text style={styles.dobHintTitle}>💡 Password Format Hint:</Text>
                      <Text style={styles.dobHintText}>
                        Password is your Date of Birth in format{' '}
                        <Text style={styles.boldText}>DDMMMYY</Text>. For example, if you were born on{' '}
                        <Text style={styles.boldText}>13th August 2005</Text>, enter{' '}
                        <Text style={styles.boldText}>13AUG05</Text>.
                      </Text>
                    </View>

                    <View style={styles.securityWarningBox}>
                      <Text style={styles.securityWarningText}>
                        ⚠️ Caution: Studzone locks student accounts after 5 consecutive incorrect password attempts.
                      </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionRow}>
                      <Text style={styles.optionLabel}>Remember password on this device</Text>
                      <Switch
                        value={rememberCreds}
                        onValueChange={setRememberCreds}
                        trackColor={{ false: '#334155', true: '#2563EB' }}
                        thumbColor={rememberCreds ? '#38BDF8' : '#94A3B8'}
                        disabled={isExtracting}
                      />
                    </View>

                    <View style={styles.optionRow}>
                      <Text style={styles.optionLabel}>Also update App counts to match Studzone</Text>
                      <Switch
                        value={syncAppAttendanceToo}
                        onValueChange={setSyncAppAttendanceToo}
                        trackColor={{ false: '#334155', true: '#2563EB' }}
                        thumbColor={syncAppAttendanceToo ? '#38BDF8' : '#94A3B8'}
                        disabled={isExtracting}
                      />
                    </View>
                  </View>

                  {/* Extraction Progress */}
                  {isExtracting && (
                    <View style={styles.extractingProgressBox}>
                      <ActivityIndicator size="small" color="#38BDF8" />
                      <Text style={styles.extractingProgressText}>
                        {extractionStatusText}
                      </Text>
                    </View>
                  )}

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setIsStudzoneModalVisible(false)}
                      disabled={isExtracting}
                    >
                      <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.modalSubmitBtn, isExtracting && { opacity: 0.6 }]}
                      onPress={handleStartStudzoneExtraction}
                      disabled={isExtracting}
                    >
                      <Text style={styles.modalSubmitText}>
                        {isExtracting ? 'Connecting...' : '🚀 Extract Attendance'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* Extracted Preview View */
                <>
                  <View style={styles.successPreviewHeader}>
                    <Text style={styles.successPreviewTitle}>
                      🎉 Extracted {extractedRecords.length} Subjects Successfully!
                    </Text>
                    <Text style={styles.successPreviewSubtitle}>
                      Official attendance report from PSG Studzone:
                    </Text>
                  </View>

                  <ScrollView style={styles.previewList} nestedScrollEnabled>
                    {extractedRecords.map((rec, idx) => (
                      <View key={idx} style={styles.previewItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.previewCode}>{rec.courseCode}</Text>
                          {rec.courseName ? (
                            <Text style={styles.previewName}>{rec.courseName}</Text>
                          ) : null}
                          <Text style={styles.previewStats}>
                            Attended: {rec.attendedClasses} / {rec.totalClasses} classes
                          </Text>
                        </View>
                        <View style={styles.previewPctBadge}>
                          <Text
                            style={[
                              styles.previewPctText,
                              rec.percentage < 75 ? { color: '#F87171' } : { color: '#34D399' },
                            ]}
                          >
                            {rec.percentage.toFixed(1)}%
                          </Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  <View style={styles.modalActions}>
                    <TouchableOpacity
                      style={styles.modalCancelBtn}
                      onPress={() => setExtractedRecords(null)}
                    >
                      <Text style={styles.modalCancelText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.modalSubmitBtn}
                      onPress={handleApplyExtractedRecords}
                    >
                      <Text style={styles.modalSubmitText}>✅ Apply to All Subjects</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  // Studzone Hero Card
  studzoneCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    marginBottom: 16,
    shadowColor: '#0284C7',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  studzoneCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  studzoneIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  studzoneCardIcon: {
    fontSize: 22,
  },
  studzoneTitleCol: {
    flex: 1,
  },
  studzoneBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  studzoneCardTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  liveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  liveBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
  },
  studzoneCardSubtitle: {
    color: '#38BDF8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  studzoneDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 10,
    lineHeight: 18,
  },
  studzoneSyncButton: {
    marginTop: 14,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  studzoneSyncButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderColor: '#2563EB',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  infoBannerIcon: {
    fontSize: 20,
  },
  infoBannerText: {
    flex: 1,
    color: '#93C5FD',
    fontSize: 12,
    lineHeight: 17,
  },
  boldText: {
    fontWeight: '700',
    color: '#F8FAFC',
  },
  tableCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  tableTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  rowItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 14,
    marginBottom: 14,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  subjectCode: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  subjectName: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '700',
  },
  syncBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  syncBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  comparisonGrid: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  colBox: {
    flex: 1,
    alignItems: 'center',
  },
  colDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#334155',
  },
  colLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 2,
  },
  colValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  colPct: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  deltaPositive: {
    color: '#F59E0B',
  },
  deltaEven: {
    color: '#10B981',
  },
  deltaSub: {
    color: '#94A3B8',
    fontSize: 10,
  },
  deltaNotice: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 6,
    padding: 6,
    marginTop: 8,
  },
  deltaNoticeText: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '90%',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  modalSubtitle: {
    color: '#38BDF8',
    fontSize: 13,
    marginBottom: 12,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  subjectTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalSection: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionHeader: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  copyErpBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  copyErpBtnText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputCol: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  // Studzone modal styles
  studzoneModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  studzoneModalIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studzoneModalIcon: {
    fontSize: 18,
  },
  studzoneModalSub: {
    color: '#38BDF8',
    fontSize: 12,
  },
  closeModalBtn: {
    padding: 6,
  },
  closeModalBtnText: {
    color: '#94A3B8',
    fontSize: 18,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingRight: 8,
  },
  eyeBtn: {
    padding: 8,
  },
  eyeText: {
    fontSize: 16,
  },
  dobHintBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  dobHintTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  dobHintText: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
  },
  securityWarningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  securityWarningText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '600',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  optionLabel: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 12,
    marginRight: 8,
  },
  extractingProgressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 10,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    marginBottom: 10,
  },
  extractingProgressText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  successPreviewHeader: {
    marginBottom: 12,
  },
  successPreviewTitle: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
  },
  successPreviewSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  previewList: {
    maxHeight: 260,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  previewCode: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  previewName: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  previewStats: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  previewPctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#1E293B',
  },
  previewPctText: {
    fontSize: 13,
    fontWeight: '800',
  },
});
