import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { Subject, TimetableSlot } from '../types';
import { simulateAttendanceProjections } from '../services/forecasterService';

interface WhatIfForecasterModalProps {
  visible: boolean;
  onClose: () => void;
  subjects: Subject[];
  timetable: TimetableSlot[];
}

export const WhatIfForecasterModal: React.FC<WhatIfForecasterModalProps> = ({
  visible,
  onClose,
  subjects,
  timetable,
}) => {
  // Map of subjectId -> number of extra bunks to simulate
  const [bunkAdjustments, setBunkAdjustments] = useState<Record<string, number>>({});

  const projection = useMemo(() => {
    return simulateAttendanceProjections(subjects, timetable, bunkAdjustments);
  }, [subjects, timetable, bunkAdjustments]);

  const handleAdjustBunk = (subjectId: string, delta: number, maxAllowance: number) => {
    setBunkAdjustments((prev) => {
      const current = prev[subjectId] || 0;
      const next = Math.max(0, Math.min(maxAllowance, current + delta));
      return { ...prev, [subjectId]: next };
    });
  };

  const handleReset = () => {
    setBunkAdjustments({});
  };

  const getStatusBadge = (status: 'SAFE' | 'CONDONATION' | 'DETENTION') => {
    switch (status) {
      case 'SAFE':
        return {
          label: 'Eligible for Exams (Safe)',
          bg: 'rgba(16, 185, 129, 0.15)',
          border: '#10B981',
          text: '#34D399',
        };
      case 'CONDONATION':
        return {
          label: 'Condonation Fee Needed (65%-74%)',
          bg: 'rgba(245, 158, 11, 0.15)',
          border: '#F59E0B',
          text: '#FBBF24',
        };
      case 'DETENTION':
        return {
          label: 'Detained / Ineligible (<65%)',
          bg: 'rgba(239, 68, 68, 0.15)',
          border: '#EF4444',
          text: '#F87171',
        };
    }
  };

  const overallBadge = getStatusBadge(projection.overallStatus);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.title}>What-If Bunk & Exam Forecaster</Text>
              <Text style={styles.subtitle}>
                Simulate end-of-semester attendance & exam hall ticket eligibility
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.exitHeaderBtn} activeOpacity={0.8}>
              <Text style={styles.exitHeaderBtnText}>✕ Exit</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Projected Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={styles.summaryLabel}>Projected Overall Attendance</Text>
                  <Text style={styles.summaryBigNumber}>
                    {projection.projectedOverallPercentage}%
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: overallBadge.bg, borderColor: overallBadge.border }]}>
                  <Text style={[styles.statusBadgeText, { color: overallBadge.text }]}>
                    {overallBadge.label}
                  </Text>
                </View>
              </View>

              <View style={styles.statBreakdownRow}>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>Current Attendance</Text>
                  <Text style={styles.miniStatVal}>{projection.currentOverallPercentage}%</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>Semester Cut-off Date</Text>
                  <Text style={styles.miniStatVal}>27 Nov 2026</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={styles.miniStatLabel}>End Semester Exams</Text>
                  <Text style={styles.miniStatVal}>30 Nov 2026</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Text style={styles.resetBtnText}>↺ Reset All Simulations</Text>
              </TouchableOpacity>
            </View>

            {/* Instruction Banner */}
            <View style={styles.infoBanner}>
              <Text style={styles.infoBannerText}>
                Adjust the bunks below using <Text style={{ fontWeight: 'bold' }}>-</Text> and <Text style={{ fontWeight: 'bold' }}>+</Text> to preview your exact final percentage on the Last Working Day before End Sem Exams.
              </Text>
            </View>

            {/* Subject Simulations List */}
            <Text style={styles.sectionHeading}>Subject-Wise Simulation</Text>

            {projection.subjects.map((sub) => {
              const badge = getStatusBadge(sub.eligibilityStatus);
              const maxSimBunk = sub.remainingScheduledHours;

              return (
                <View key={sub.subjectId} style={styles.subjectCard}>
                  <View style={styles.subjectTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.subjectCode}>{sub.subjectCode}</Text>
                      <Text style={styles.subjectName} numberOfLines={1}>{sub.subjectName}</Text>
                    </View>
                    <View style={[styles.badgePill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.badgePillText, { color: badge.text }]}>
                        {sub.projectedPercentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Metrics preview */}
                  <View style={styles.metricsRow}>
                    <Text style={styles.metricItem}>
                      Current: <Text style={styles.metricVal}>{sub.currentAttended}/{sub.currentTotal} ({sub.currentPercentage}%)</Text>
                    </Text>
                    <Text style={styles.metricItem}>
                      Remaining Classes: <Text style={styles.metricVal}>{sub.remainingScheduledHours} hrs</Text>
                    </Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <Text style={styles.metricItem}>
                      Max Safe Bunk Margin: <Text style={{ color: '#34D399', fontWeight: '700' }}>{sub.safeBunkAllowanceRemaining} hrs</Text>
                    </Text>
                    <Text style={styles.metricItem}>
                      Ceiling: <Text style={styles.metricVal}>{sub.maxPossiblePercentage}%</Text>
                    </Text>
                  </View>

                  {/* Simulator Control */}
                  <View style={styles.controlBox}>
                    <Text style={styles.controlLabel}>Simulate Bunking:</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={[styles.stepBtn, sub.simulatedBunks <= 0 && styles.stepBtnDisabled]}
                        onPress={() => handleAdjustBunk(sub.subjectId, -1, maxSimBunk)}
                        disabled={sub.simulatedBunks <= 0}
                      >
                        <Text style={styles.stepBtnText}>−</Text>
                      </TouchableOpacity>
                      <View style={styles.bunkCountBox}>
                        <Text style={styles.bunkCountText}>{sub.simulatedBunks} hrs</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.stepBtn, sub.simulatedBunks >= maxSimBunk && styles.stepBtnDisabled]}
                        onPress={() => handleAdjustBunk(sub.subjectId, 1, maxSimBunk)}
                        disabled={sub.simulatedBunks >= maxSimBunk}
                      >
                        <Text style={styles.stepBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Result Projection Note */}
                  <View style={styles.forecastNoteRow}>
                    <Text style={styles.forecastNoteText}>
                      Projected Result: <Text style={{ fontWeight: 'bold', color: badge.text }}>{sub.projectedAttended}/{sub.projectedTotal} hrs ({sub.projectedPercentage}%)</Text> • {sub.eligibilityStatus === 'SAFE' ? 'Permitted for University Exam' : sub.eligibilityStatus === 'CONDONATION' ? 'Requires Medical / Condonation Application' : 'Strict Exam Detention'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Footer Exit Action */}
          <View style={styles.footerActionRow}>
            <TouchableOpacity onPress={onClose} style={styles.bottomExitBtn} activeOpacity={0.8}>
              <Text style={styles.bottomExitBtnText}>✕ Exit Forecaster</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 43, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  container: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '90%',
    backgroundColor: '#0B132B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2A3B5C',
    padding: 18,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
      },
      default: {},
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C2541',
    paddingBottom: 12,
    marginBottom: 12,
  },
  title: {
    color: '#F4E8C1',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#C5BA9D',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollArea: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#1C2541',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A3B5C',
    marginBottom: 12,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: '#C5BA9D',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryBigNumber: {
    color: '#F4E8C1',
    fontSize: 32,
    fontWeight: '800',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statBreakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A3B5C',
  },
  miniStat: {
    alignItems: 'flex-start',
  },
  miniStatLabel: {
    color: '#8E9BB0',
    fontSize: 10,
    fontWeight: '600',
  },
  miniStatVal: {
    color: '#F4E8C1',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  resetBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  resetBtnText: {
    color: '#F4E8C1',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBanner: {
    backgroundColor: 'rgba(244, 232, 193, 0.08)',
    borderColor: 'rgba(244, 232, 193, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  infoBannerText: {
    color: '#F4E8C1',
    fontSize: 11.5,
    lineHeight: 16,
  },
  sectionHeading: {
    color: '#F4E8C1',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  subjectCard: {
    backgroundColor: '#1C2541',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A3B5C',
    marginBottom: 12,
  },
  subjectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectCode: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  badgePillText: {
    fontSize: 13,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  metricItem: {
    color: '#94A3B8',
    fontSize: 11,
  },
  metricVal: {
    color: '#E2E8F0',
    fontWeight: '600',
  },
  controlBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  controlLabel: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.5,
  },
  stepBtnText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 20,
  },
  bunkCountBox: {
    minWidth: 48,
    alignItems: 'center',
  },
  bunkCountText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  forecastNoteRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  forecastNoteText: {
    color: '#94A3B8',
    fontSize: 10.5,
    lineHeight: 14,
  },
  exitHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 232, 193, 0.12)',
    borderWidth: 1,
    borderColor: '#F4E8C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitHeaderBtnText: {
    color: '#F4E8C1',
    fontSize: 13,
    fontWeight: '800',
  },
  footerActionRow: {
    borderTopWidth: 1,
    borderTopColor: '#2A3B5C',
    paddingTop: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  bottomExitBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1C2541',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomExitBtnText: {
    color: '#F4E8C1',
    fontSize: 14,
    fontWeight: '700',
  },
});
