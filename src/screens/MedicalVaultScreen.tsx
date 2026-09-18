import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Subject, MedicalClaimRecord } from '../types';

interface MedicalVaultScreenProps {
  subjects: Subject[];
  medicalClaims: MedicalClaimRecord[];
  onToggleMedicalClaim: (id: string) => void;
  onAddMedicalClaim: (claim: MedicalClaimRecord) => void;
}

export const MedicalVaultScreen: React.FC<MedicalVaultScreenProps> = ({
  subjects,
  medicalClaims,
  onToggleMedicalClaim,
  onAddMedicalClaim,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinic, setClinic] = useState('');
  const [fromDate, setFromDate] = useState('2026-09-14');
  const [toDate, setToDate] = useState('2026-09-18');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub_2');

  const handleSaveClaim = () => {
    if (!reason || !doctorName) {
      Alert.alert('Missing Details', 'Please enter reason for illness and doctor name.');
      return;
    }

    const newClaim: MedicalClaimRecord = {
      id: `med_${Date.now()}`,
      subjectId: selectedSubjectId,
      fromDate,
      toDate,
      reason,
      doctorName,
      hospitalOrClinic: clinic || 'General Hospital',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().split('T')[0],
      certificateNote: 'Medical Certificate verified by doctor.',
    };

    onAddMedicalClaim(newClaim);
    // Also auto-activate claim for selected subject if specific
    if (selectedSubjectId !== 'ALL') {
      const sub = subjects.find((s) => s.id === selectedSubjectId);
      if (sub && !sub.hasMedicalClaim) {
        onToggleMedicalClaim(sub.id);
      }
    }

    setShowModal(false);
    setReason('');
    setDoctorName('');
    setClinic('');
    Alert.alert('Medical Claim Submitted! 🏥', '65% condonation threshold has been applied.');
  };

  const activeClaimsCount = subjects.filter((s) => s.hasMedicalClaim).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Regulation Policy Header */}
      <View style={styles.policyCard}>
        <View style={styles.policyHeader}>
          <Text style={styles.policyIcon}>🏥</Text>
          <View style={styles.policyTitleArea}>
            <Text style={styles.policyTitle}>Medical Concession Policy</Text>
            <Text style={styles.policyCode}>Regulation Clause 14.2 (Attendance Condonation)</Text>
          </View>
        </View>
        <Text style={styles.policyDesc}>
          Students with valid, registered medical claims are granted an attendance relaxation from{' '}
          <Text style={styles.highlightText}>75% standard</Text> down to{' '}
          <Text style={styles.highlightMedText}>65% medical minimum</Text>.
        </Text>
        <View style={styles.policyStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>65%</Text>
            <Text style={styles.statLabel}>Medical Target</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>75%</Text>
            <Text style={styles.statLabel}>Standard Target</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeClaimsCount}</Text>
            <Text style={styles.statLabel}>Subjects Claimed</Text>
          </View>
        </View>
      </View>

      {/* Subject Concession Toggle Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apply Medical Claim Per Subject</Text>
        <Text style={styles.sectionSubtitle}>
          Toggle to switch any subject between standard (75%) and medical (65%) target.
        </Text>

        <View style={styles.toggleList}>
          {subjects.map((sub) => {
            const pct = sub.total === 0 ? 100 : (sub.attended / sub.total) * 100;
            return (
              <View key={sub.id} style={styles.toggleCard}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleSubjectName}>{sub.name}</Text>
                  <Text style={styles.toggleSubjectStats}>
                    Current: {pct.toFixed(1)}% ({sub.attended}/{sub.total})
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.7}
                  style={[
                    styles.toggleSwitch,
                    sub.hasMedicalClaim ? styles.toggleSwitchActive : styles.toggleSwitchInactive,
                  ]}
                  onPress={() => onToggleMedicalClaim(sub.id)}
                >
                  <Text style={styles.toggleSwitchIcon}>🏥</Text>
                  <Text
                    style={[
                      styles.toggleSwitchText,
                      sub.hasMedicalClaim ? styles.toggleSwitchTextActive : styles.toggleSwitchTextInactive,
                    ]}
                  >
                    {sub.hasMedicalClaim ? '65% Active' : '75% Normal'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {/* Medical Certificates Vault */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Medical Certificates & Records</Text>
          <TouchableOpacity
            style={styles.addClaimBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addClaimBtnText}>+ New Claim</Text>
          </TouchableOpacity>
        </View>

        {medicalClaims.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No medical claims filed yet.</Text>
          </View>
        ) : (
          medicalClaims.map((claim) => (
            <View key={claim.id} style={styles.claimCard}>
              <View style={styles.claimTopRow}>
                <View>
                  <Text style={styles.claimReason}>{claim.reason}</Text>
                  <Text style={styles.claimDates}>
                    📅 {claim.fromDate} to {claim.toDate}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    claim.status === 'APPROVED' ? styles.statusApproved : styles.statusSubmitted,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{claim.status}</Text>
                </View>
              </View>

              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>Certified By:</Text>
                <Text style={styles.doctorValue}>{claim.doctorName}</Text>
              </View>

              {claim.hospitalOrClinic && (
                <Text style={styles.clinicValue}>🏥 {claim.hospitalOrClinic}</Text>
              )}

              {claim.certificateNote && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>"{claim.certificateNote}"</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Modal for adding new claim */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>File Medical Claim</Text>
            <Text style={styles.modalSubtitle}>
              Lowers mandatory attendance threshold to 65% for the selected subject.
            </Text>

            <Text style={styles.inputLabel}>Reason / Illness</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Viral Fever, Typhoid, Fractured Arm"
              placeholderTextColor="#64748B"
              value={reason}
              onChangeText={setReason}
            />

            <Text style={styles.inputLabel}>Doctor / Practitioner Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Dr. A. K. Verma, MD"
              placeholderTextColor="#64748B"
              value={doctorName}
              onChangeText={setDoctorName}
            />

            <Text style={styles.inputLabel}>Clinic or Hospital</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Apex Health Center"
              placeholderTextColor="#64748B"
              value={clinic}
              onChangeText={setClinic}
            />

            <View style={styles.dateInputsRow}>
              <View style={styles.dateInputCol}>
                <Text style={styles.inputLabel}>From Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={fromDate}
                  onChangeText={setFromDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#64748B"
                />
              </View>
              <View style={styles.dateInputCol}>
                <Text style={styles.inputLabel}>To Date</Text>
                <TextInput
                  style={styles.textInput}
                  value={toDate}
                  onChangeText={setToDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveClaim}
              >
                <Text style={styles.modalSubmitText}>Submit Claim (Apply 65%)</Text>
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
  policyCard: {
    backgroundColor: '#082F49', // Cyan 950
    borderColor: '#0284C7',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  policyIcon: {
    fontSize: 28,
  },
  policyTitleArea: {
    flex: 1,
  },
  policyTitle: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
  },
  policyCode: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '600',
  },
  policyDesc: {
    color: '#E0F2FE',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  highlightText: {
    color: '#FBBF24',
    fontWeight: '700',
  },
  highlightMedText: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  policyStatsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0C4A6E',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#7DD3FC',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 10,
  },
  addClaimBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addClaimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleList: {
    gap: 8,
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleSubjectName: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSubjectStats: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  toggleSwitchActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06B6D4',
  },
  toggleSwitchInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#475569',
  },
  toggleSwitchIcon: {
    fontSize: 12,
  },
  toggleSwitchText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleSwitchTextActive: {
    color: '#38BDF8',
  },
  toggleSwitchTextInactive: {
    color: '#94A3B8',
  },
  claimCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  claimTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  claimReason: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  claimDates: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  statusSubmitted: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  statusBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  doctorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  doctorLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  doctorValue: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  clinicValue: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
  },
  noteBox: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  noteText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyCard: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginVertical: 6,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
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
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInputCol: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
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
});
