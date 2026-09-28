import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { Subject } from '../types';

interface ReconcileScreenProps {
  subjects: Subject[];
  onUpdateAttendance: (
    subjectId: string,
    appAttended: number,
    appTotal: number,
    officialAttended: number,
    officialTotal: number
  ) => void;
  onUpdateSubjectOfficial?: (subjectId: string, officialAttended: number, officialTotal: number) => void;
}

export const ReconcileScreen: React.FC<ReconcileScreenProps> = ({
  subjects,
  onUpdateAttendance,
  onUpdateSubjectOfficial,
}) => {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [appAttended, setAppAttended] = useState('');
  const [appTotal, setAppTotal] = useState('');
  const [officialAttended, setOfficialAttended] = useState('');
  const [officialTotal, setOfficialTotal] = useState('');

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

  const handleSave = () => {
    if (!editingSubject) return;
    const aAtt = parseInt(appAttended, 10);
    const aTot = parseInt(appTotal, 10);
    const oAtt = parseInt(officialAttended, 10);
    const oTot = parseInt(officialTotal, 10);

    if (isNaN(aAtt) || isNaN(aTot) || aAtt < 0 || aTot < aAtt) {
      Alert.alert('Invalid App Attendance', 'App attended classes must be non-negative and less than or equal to total held.');
      return;
    }

    if (isNaN(oAtt) || isNaN(oTot) || oAtt < 0 || oTot < oAtt) {
      Alert.alert('Invalid ERP Baseline', 'College ERP attended classes must be non-negative and less than or equal to total held.');
      return;
    }

    if (onUpdateAttendance) {
      onUpdateAttendance(editingSubject.id, aAtt, aTot, oAtt, oTot);
    } else if (onUpdateSubjectOfficial) {
      onUpdateSubjectOfficial(editingSubject.id, oAtt, oTot);
    }

    setEditingSubject(null);
    Alert.alert('Attendance Synced! 🔄', `Updated attendance numbers for ${editingSubject.name}.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Sync</Text>
        <Text style={styles.headerSubtitle}>
          Review, synchronize, and edit your subject attendance against college portal updates.
        </Text>
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>💡</Text>
        <Text style={styles.infoBannerText}>
          Need to calibrate your attendance or adjust for college ERP updates? Tap "✏️ Edit" on any subject below to adjust your recorded app counts or college official baseline.
        </Text>
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Subject Attendance & Reconciliation</Text>

        {subjects.map((sub) => {
          const appPct = sub.total === 0 ? 100 : (sub.attended / sub.total) * 100;
          const erpPct = sub.officialTotal === 0 ? 100 : (sub.officialAttended / sub.officialTotal) * 100;
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
                  <Text style={styles.syncBtnText}>✏️ Edit Attendance</Text>
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
                  <Text style={[styles.colValue, classDiff > 0 ? styles.deltaPositive : styles.deltaEven]}>
                    {classDiff > 0 ? `+${classDiff} held` : 'In sync'}
                  </Text>
                  <Text style={styles.deltaSub}>
                    {attendedDiff > 0 ? `+${attendedDiff} marked present` : 'Matches'}
                  </Text>
                </View>
              </View>

              {classDiff > 0 && (
                <View style={styles.deltaNotice}>
                  <Text style={styles.deltaNoticeText}>
                    ⚡ {classDiff} class sessions logged in App since college last updated on {sub.lastOfficialUpdate || 'last week'}.
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>

      {/* Edit Modal */}
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
                  onPress={handleSave}
                >
                  <Text style={styles.modalSubmitText}>Save Attendance</Text>
                </TouchableOpacity>
              </View>
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
    marginTop: 8,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 15,
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
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
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
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
