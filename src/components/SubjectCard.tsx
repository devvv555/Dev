import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Subject } from '../types';
import { calculateAttendanceMetrics } from '../services/attendanceEngine';
import { AttendanceGauge } from './AttendanceGauge';
import { PsgimService } from '../services/psgimService';

interface SubjectCardProps {
  subject: Subject;
  studentRollNo?: string;
  onToggleMedicalClaim: (id: string) => void;
  onQuickAttend: (id: string) => void;
  onQuickBunk: (id: string) => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  studentRollNo,
  onToggleMedicalClaim,
  onQuickAttend,
  onQuickBunk,
}) => {
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  const metrics = calculateAttendanceMetrics(
    subject.attended,
    subject.total,
    subject.hasMedicalClaim,
    subject.standardTarget,
    subject.medicalTarget
  );

  const mcobData = studentRollNo && (subject.id === 'sub_mcob' || subject.code === '24GM11')
    ? PsgimService.getMcobDetails(studentRollNo)
    : null;

  return (
    <View style={[styles.card, { borderLeftColor: subject.color }]}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <Text style={styles.codeText}>{subject.code}</Text>
          <Text style={styles.nameText} numberOfLines={1}>
            {subject.name}
          </Text>
          {(subject.batch || subject.faculty) && (
            <View style={styles.batchInfoRow}>
              {subject.batch && (
                <View style={styles.batchPill}>
                  <Text style={styles.batchPillText}>{subject.batch}</Text>
                </View>
              )}
              {subject.faculty && (
                <Text style={styles.facultyText} numberOfLines={1}>
                  👨‍🏫 {subject.faculty}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Medical Claim Toggle Button */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => onToggleMedicalClaim(subject.id)}
          style={[
            styles.medicalToggle,
            subject.hasMedicalClaim ? styles.medicalToggleActive : styles.medicalToggleInactive,
          ]}
        >
          <Text style={styles.medicalToggleIcon}>🏥</Text>
          <Text
            style={[
              styles.medicalToggleLabel,
              subject.hasMedicalClaim ? styles.medicalToggleLabelActive : styles.medicalToggleLabelInactive,
            ]}
          >
            {subject.hasMedicalClaim ? 'Med Claim: 65%' : 'Claim Med?'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Attendance Stats Row */}
      <View style={styles.statsRow}>
        <Text style={styles.classCountsText}>
          <Text style={styles.attendedCount}>{subject.attended}</Text> / {subject.total} classes attended
        </Text>
        <Text style={styles.officialSyncText}>
          College ERP: {subject.officialAttended}/{subject.officialTotal}
        </Text>
      </View>

      {/* Dual Gauge Bar */}
      <AttendanceGauge metrics={metrics} />

      {/* Bunk / Recovery Status Banner */}
      <View
        style={[
          styles.statusBanner,
          metrics.status === 'SAFE_STANDARD'
            ? styles.statusBannerSafe
            : metrics.status === 'SAFE_MEDICAL'
            ? styles.statusBannerMedical
            : styles.statusBannerDanger,
        ]}
      >
        <Text style={styles.statusBannerText}>{metrics.summaryMessage}</Text>
      </View>

      {/* Official Session Log Button (when MCOB real data is present) */}
      {mcobData && (
        <TouchableOpacity
          style={styles.sessionsBtn}
          onPress={() => setShowSessionsModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.sessionsBtnText}>
            📋 View 8 Official Sessions ({mcobData.attendedHours}/16 hrs • {mcobData.percentage}%)
          </Text>
        </TouchableOpacity>
      )}

      {/* Quick Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.actionBtn, styles.attendBtn]}
          onPress={() => onQuickAttend(subject.id)}
        >
          <Text style={styles.attendBtnText}>+1 Present ✅</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.actionBtn, styles.bunkBtn]}
          onPress={() => onQuickBunk(subject.id)}
        >
          <Text style={styles.bunkBtnText}>+1 Bunk ❌</Text>
        </TouchableOpacity>
      </View>

      {/* Official Sessions Breakdown Modal */}
      {mcobData && (
        <Modal
          visible={showSessionsModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowSessionsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>MCOB 1 Official Log</Text>
                  <Text style={styles.modalSubtitle}>
                    {mcobData.name} ({studentRollNo || mcobData.rollNo})
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setShowSessionsModal(false)}
                  style={styles.modalCloseBtn}
                >
                  <Text style={styles.modalCloseBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Summary Stats Card */}
              <View style={styles.modalStatsCard}>
                <View style={styles.modalStatCol}>
                  <Text style={styles.modalStatNum}>{mcobData.attendedHours} hrs</Text>
                  <Text style={styles.modalStatLbl}>Attended</Text>
                </View>
                <View style={styles.modalStatDivider} />
                <View style={styles.modalStatCol}>
                  <Text style={styles.modalStatNum}>{mcobData.totalHours} hrs</Text>
                  <Text style={styles.modalStatLbl}>Total Held</Text>
                </View>
                <View style={styles.modalStatDivider} />
                <View style={styles.modalStatCol}>
                  <Text
                    style={[
                      styles.modalStatNum,
                      { color: mcobData.percentage >= 75 ? '#34D399' : '#F87171' },
                    ]}
                  >
                    {mcobData.percentage}%
                  </Text>
                  <Text style={styles.modalStatLbl}>Percentage</Text>
                </View>
              </View>

              <Text style={styles.modalSectionTitle}>8 Lecture Sessions (Faculty Record)</Text>

              <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
                {mcobData.sessions.map((sess, idx) => {
                  const isPresent = sess.status === 'PRESENT';
                  return (
                    <View key={idx} style={styles.sessionRow}>
                      <View style={styles.sessionLeft}>
                        <Text style={styles.sessionIndex}>#{idx + 1}</Text>
                        <Text style={styles.sessionDate}>{sess.date}</Text>
                      </View>
                      <View
                        style={[
                          styles.sessionStatusBadge,
                          isPresent ? styles.sessionPresentBadge : styles.sessionAbsentBadge,
                        ]}
                      >
                        <Text
                          style={[
                            styles.sessionStatusText,
                            isPresent ? styles.sessionPresentText : styles.sessionAbsentText,
                          ]}
                        >
                          {isPresent ? '✅ Present (2 hrs)' : '❌ Absent (0 hrs)'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setShowSessionsModal(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleArea: {
    flex: 1,
    marginRight: 8,
  },
  codeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nameText: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
    marginTop: 2,
  },
  batchInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  batchPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  batchPillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  facultyText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  medicalToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  medicalToggleActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.15)',
    borderColor: '#06B6D4',
  },
  medicalToggleInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#475569',
  },
  medicalToggleIcon: {
    fontSize: 12,
  },
  medicalToggleLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  medicalToggleLabelActive: {
    color: '#38BDF8',
  },
  medicalToggleLabelInactive: {
    color: '#94A3B8',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  classCountsText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  attendedCount: {
    color: '#F1F5F9',
    fontWeight: '700',
  },
  officialSyncText: {
    color: '#64748B',
    fontSize: 11,
  },
  statusBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 10,
  },
  statusBannerSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  statusBannerMedical: {
    backgroundColor: 'rgba(6, 182, 212, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#06B6D4',
  },
  statusBannerDanger: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  statusBannerText: {
    color: '#F1F5F9',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
    borderWidth: 1,
  },
  attendBtnText: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '700',
  },
  bunkBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
  },
  bunkBtnText: {
    color: '#F87171',
    fontSize: 13,
    fontWeight: '700',
  },
  sessionsBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  sessionsBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: '#334155',
    borderRadius: 8,
  },
  modalCloseBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  modalStatsCard: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'space-around',
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalStatCol: {
    alignItems: 'center',
  },
  modalStatNum: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  modalStatLbl: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#334155',
  },
  modalSectionTitle: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sessionsList: {
    maxHeight: 280,
  },
  sessionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  sessionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sessionIndex: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    width: 24,
  },
  sessionDate: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  sessionStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sessionPresentBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  sessionAbsentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  sessionStatusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sessionPresentText: {
    color: '#34D399',
  },
  sessionAbsentText: {
    color: '#F87171',
  },
  modalDoneBtn: {
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 16,
  },
  modalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
