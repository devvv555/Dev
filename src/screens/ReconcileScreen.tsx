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
  onUpdateSubjectOfficial: (subjectId: string, officialAttended: number, officialTotal: number) => void;
}

export const ReconcileScreen: React.FC<ReconcileScreenProps> = ({
  subjects,
  onUpdateSubjectOfficial,
}) => {
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newAttended, setNewAttended] = useState('');
  const [newTotal, setNewTotal] = useState('');

  const handleOpenEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setNewAttended(subject.officialAttended.toString());
    setNewTotal(subject.officialTotal.toString());
  };

  const handleSaveOfficial = () => {
    if (!editingSubject) return;
    const att = parseInt(newAttended, 10);
    const tot = parseInt(newTotal, 10);
    if (isNaN(att) || isNaN(tot) || att < 0 || tot < att) {
      Alert.alert('Invalid Numbers', 'Attended must be non-negative and less than or equal to total held.');
      return;
    }
    onUpdateSubjectOfficial(editingSubject.id, att, tot);
    setEditingSubject(null);
    Alert.alert('ERP Synced! 🔄', `Updated official baseline for ${editingSubject.name}.`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly ERP Reconciler</Text>
        <Text style={styles.headerSubtitle}>
          Compare your hour-by-hour logs against the weekly batch update from the college ERP.
        </Text>
      </View>

      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>💡</Text>
        <Text style={styles.infoBannerText}>
          When your college updates portal attendance on the weekend, enter the latest counts here to keep your baseline calibrated and detect any faculty marking errors.
        </Text>
      </View>

      <View style={styles.tableCard}>
        <Text style={styles.tableTitle}>Attendance Comparison</Text>

        {subjects.map((sub) => {
          const appPct = sub.total === 0 ? 100 : (sub.attended / sub.total) * 100;
          const erpPct = sub.officialTotal === 0 ? 100 : (sub.officialAttended / sub.officialTotal) * 100;
          const classDiff = sub.total - sub.officialTotal;
          const attendedDiff = sub.attended - sub.officialAttended;

          return (
            <View key={sub.id} style={styles.rowItem}>
              <View style={styles.rowTop}>
                <View>
                  <Text style={styles.subjectCode}>{sub.code}</Text>
                  <Text style={styles.subjectName}>{sub.name}</Text>
                </View>

                <TouchableOpacity
                  style={styles.syncBtn}
                  onPress={() => handleOpenEdit(sub)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.syncBtnText}>✏️ Edit ERP</Text>
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
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Update College ERP Baseline</Text>
            <Text style={styles.modalSubtitle}>
              {editingSubject?.name} ({editingSubject?.code})
            </Text>

            <Text style={styles.inputLabel}>Official Attended Classes (from College Portal)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={newAttended}
              onChangeText={setNewAttended}
            />

            <Text style={styles.inputLabel}>Official Total Classes Held (from College Portal)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={newTotal}
              onChangeText={setNewTotal}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setEditingSubject(null)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveOfficial}
              >
                <Text style={styles.modalSubmitText}>Save ERP Counts</Text>
              </TouchableOpacity>
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
