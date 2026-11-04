import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { Subject } from '../types';
import { calculateAttendanceMetrics } from '../services/attendanceEngine';
import { AttendanceGauge } from './AttendanceGauge';
import { PsgimService } from '../services/psgimService';

interface SubjectCardProps {
  subject: Subject;
  studentRollNo?: string;
  onQuickAttend?: (id: string) => void;
  onQuickBunk?: (id: string) => void;
  onOpenCoursePlan?: (subjectCode: string, subjectName: string) => void;
  onEditFaculty?: (subject: Subject) => void;
  isEnhancedSuit?: boolean;
  isLightMode?: boolean;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({
  subject,
  studentRollNo,
  onOpenCoursePlan,
  onEditFaculty,
  isEnhancedSuit = false,
  isLightMode = false,
}) => {
  const [showSessionsModal, setShowSessionsModal] = useState(false);

  const metrics = calculateAttendanceMetrics(
    subject.attended,
    subject.total,
    subject.hasMedicalClaim,
    subject.standardTarget || 75,
    subject.medicalTarget || 65
  );

  const mcobData = studentRollNo && (subject.id === 'sub_mcob' || subject.code === '24GM11')
    ? PsgimService.getMcobDetails(studentRollNo)
    : null;

  const isSports =
    subject.noAttendance ||
    subject.code === 'SPORTS' ||
    subject.id === 'sub_sports' ||
    subject.name.toLowerCase().includes('sports');

  return (
    <View style={[
      styles.card,
      { borderLeftColor: isLightMode ? '#2B3990' : isEnhancedSuit ? '#10B981' : subject.color },
      isLightMode
        ? {
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            borderWidth: 1,
            shadowColor: '#64748B',
            shadowOpacity: 0.08,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 8,
            elevation: 2,
          }
        : isEnhancedSuit && { backgroundColor: '#121212', borderColor: '#262626', borderWidth: 1.5 }
    ]}>
      {/* Top Header */}
      <View style={styles.cardHeader}>
        <View style={styles.titleArea}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={[styles.codeText, isLightMode ? { color: '#64748B', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>{subject.code}</Text>
            {isSports && (
              <View style={[
                styles.batchPill,
                isLightMode
                  ? { backgroundColor: '#EEF2FF', borderColor: '#CBD5E1' }
                  : { backgroundColor: 'rgba(99, 102, 241, 0.18)', borderColor: '#6366F1' }
              ]}>
                <Text style={[styles.batchPillText, isLightMode ? { color: '#2B3990' } : { color: '#818CF8' }]}>No Attendance</Text>
              </View>
            )}
          </View>
          <Text style={[styles.nameText, isLightMode ? { color: '#0F172A', fontWeight: '800' } : isEnhancedSuit && { color: '#F8FAFC' }]} numberOfLines={1}>
            {subject.name}
          </Text>
          {(subject.batch || subject.faculty) && (
            <View style={styles.batchInfoRow}>
              {subject.batch && (
                <View style={[
                  styles.batchPill,
                  isLightMode
                    ? { backgroundColor: '#EEF2FF', borderColor: '#CBD5E1' }
                    : isEnhancedSuit && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }
                ]}>
                  <Text style={[styles.batchPillText, isLightMode ? { color: '#2B3990' } : isEnhancedSuit && { color: '#10B981' }]}>{subject.batch}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => onEditFaculty && onEditFaculty(subject)}
                style={[
                  styles.facultyTouchBtn,
                  isLightMode && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }
                ]}
                activeOpacity={0.7}
              >
                <Text style={[styles.facultyText, isLightMode ? { color: '#475569' } : isEnhancedSuit && { color: '#10B981' }]} numberOfLines={1}>
                  {subject.faculty || 'Assign Faculty'} ✎
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Attendance Stats Row */}
      {isSports ? (
        <View style={styles.statsRow}>
          <Text style={[styles.classCountsText, isLightMode ? { color: '#475569' } : isEnhancedSuit && { color: '#F8FAFC' }]}>Physical Education & Wellness</Text>
          <Text style={[styles.officialSyncText, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]}>Not tracked in the ERP</Text>
        </View>
      ) : (
        <View style={styles.statsRow}>
          <Text style={[styles.classCountsText, isLightMode ? { color: '#475569' } : isEnhancedSuit && { color: '#F8FAFC' }]}>
            <Text style={[styles.attendedCount, isLightMode ? { color: '#0F172A', fontWeight: '900' } : isEnhancedSuit && { color: '#10B981' }]}>{subject.attended}</Text> / {subject.total} hrs attended
          </Text>
          <View style={{ alignItems: 'flex-end', gap: 2 }}>
            <Text style={[styles.officialSyncText, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]}>
              College ERP: {subject.officialAttended}/{subject.officialTotal} hrs
            </Text>
            {subject.medicalExemptionPercentage !== undefined && subject.medicalExemptionPercentage > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={{ fontSize: 10.5, fontWeight: '700', color: '#10B981' }}>
                  🏥 Med Concession: {subject.medicalExemptionPercentage}%
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Dual Gauge Bar & Status Banner */}
      {isSports ? (
        <View
          style={[
            styles.statusBanner,
            isLightMode
              ? { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', borderWidth: 1, marginTop: 8 }
              : { backgroundColor: 'rgba(99, 102, 241, 0.12)', borderColor: 'rgba(99, 102, 241, 0.35)', marginTop: 8 }
          ]}
        >
          <Text style={[styles.statusBannerText, isLightMode ? { color: '#475569' } : { color: '#C7D2FE' }]}>
            Not tracked in the ERP.
          </Text>
        </View>
      ) : (
        <>
          <AttendanceGauge metrics={metrics} isEnhancedSuit={isEnhancedSuit} isLightMode={isLightMode} />
          <View
            style={[
              styles.statusBanner,
              isLightMode
                ? {
                    backgroundColor: metrics.status === 'SAFE_STANDARD' ? '#ECFDF5' : '#FEF2F2',
                    borderColor: metrics.status === 'SAFE_STANDARD' ? '#A7F3D0' : '#FECACA',
                    borderWidth: 1,
                  }
                : metrics.status === 'SAFE_STANDARD'
                ? (isEnhancedSuit
                    ? { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }
                    : styles.statusBannerSafe)
                : metrics.status === 'SAFE_MEDICAL'
                ? styles.statusBannerMedical
                : styles.statusBannerDanger,
            ]}
          >
            <Text style={[
              styles.statusBannerText,
              isLightMode
                ? { color: metrics.status === 'SAFE_STANDARD' ? '#065F46' : '#991B1B', fontWeight: '600' }
                : isEnhancedSuit && metrics.status === 'SAFE_STANDARD' && { color: '#10B981' }
            ]}>
              {metrics.summaryMessage}
            </Text>
          </View>
        </>
      )}

      {/* Course Plan & Continuous Assessment (CA) Pattern */}
      {onOpenCoursePlan && (
        <TouchableOpacity
          style={[
            styles.coursePlanBtn,
            isLightMode
              ? { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }
              : isEnhancedSuit && { backgroundColor: '#050505', borderColor: '#262626' }
          ]}
          onPress={() => onOpenCoursePlan(subject.code, subject.name)}
          activeOpacity={0.7}
        >
          <Text style={[styles.coursePlanBtnText, isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>
            Course Plan & CA Marks (50M Target) →
          </Text>
        </TouchableOpacity>
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
  facultyTouchBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '85%',
  },
  facultyText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
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
  coursePlanBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
    alignItems: 'center',
  },
  coursePlanBtnText: {
    color: '#A5B4FC',
    fontSize: 11.5,
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
