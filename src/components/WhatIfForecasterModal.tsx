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
import { ThemeManager } from '../constants/theme';

interface WhatIfForecasterModalProps {
  visible: boolean;
  onClose: () => void;
  subjects: Subject[];
  timetable: TimetableSlot[];
  isLightMode?: boolean;
}

export const WhatIfForecasterModal: React.FC<WhatIfForecasterModalProps> = ({
  visible,
  onClose,
  subjects,
  timetable,
  isLightMode: isLightModeProp,
}) => {
  const isLightMode = isLightModeProp !== undefined ? isLightModeProp : ThemeManager.getMode() === 'LIGHT';

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
          bg: isLightMode ? '#ECFDF5' : 'rgba(16, 185, 129, 0.15)',
          border: '#10B981',
          text: isLightMode ? '#047857' : '#34D399',
        };
      case 'CONDONATION':
        return {
          label: 'Condonation Fee Needed (65%-74%)',
          bg: isLightMode ? '#FEF3C7' : 'rgba(245, 158, 11, 0.15)',
          border: '#F59E0B',
          text: isLightMode ? '#B45309' : '#FBBF24',
        };
      case 'DETENTION':
        return {
          label: 'Detained / Ineligible (<65%)',
          bg: isLightMode ? '#FEE2E2' : 'rgba(239, 68, 68, 0.15)',
          border: '#EF4444',
          text: isLightMode ? '#DC2626' : '#F87171',
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
      <View style={[styles.overlay, isLightMode && { backgroundColor: 'rgba(15, 23, 42, 0.55)' }]}>
        <View style={[
          styles.container,
          isLightMode && {
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            ...Platform.select({
              web: {
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              },
              default: {},
            }),
          }
        ]}>
          {/* Header */}
          <View style={[styles.header, isLightMode && { borderBottomColor: '#E2E8F0' }]}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={[styles.title, isLightMode ? { color: '#0F172A', fontWeight: '900' } : { color: '#10B981' }]}>
                What-If Bunk & Exam Forecaster
              </Text>
              <Text style={[styles.subtitle, isLightMode && { color: '#64748B' }]}>
                Simulate end-of-semester attendance & exam hall ticket eligibility
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.exitHeaderBtn,
                isLightMode && { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.exitHeaderBtnText, isLightMode ? { color: '#0F172A', fontWeight: '700' } : { color: '#10B981' }]}>
                ✕ Exit
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            {/* Projected Summary Card */}
            <View style={[styles.summaryCard, isLightMode && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
              <View style={styles.summaryTop}>
                <View>
                  <Text style={[styles.summaryLabel, isLightMode && { color: '#64748B' }]}>
                    Projected Overall Attendance
                  </Text>
                  <Text style={[styles.summaryBigNumber, isLightMode && { color: '#047857' }]}>
                    {projection.projectedOverallPercentage}%
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: overallBadge.bg, borderColor: overallBadge.border }]}>
                  <Text style={[styles.statusBadgeText, { color: overallBadge.text }]}>
                    {overallBadge.label}
                  </Text>
                </View>
              </View>

              <View style={[styles.statBreakdownRow, isLightMode && { borderTopColor: '#E2E8F0' }]}>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatLabel, isLightMode && { color: '#64748B' }]}>Current Attendance</Text>
                  <Text style={[styles.miniStatVal, isLightMode && { color: '#0F172A' }]}>{projection.currentOverallPercentage}%</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatLabel, isLightMode && { color: '#64748B' }]}>Semester Cut-off Date</Text>
                  <Text style={[styles.miniStatVal, isLightMode && { color: '#0F172A' }]}>27 Nov 2026</Text>
                </View>
                <View style={styles.miniStat}>
                  <Text style={[styles.miniStatLabel, isLightMode && { color: '#64748B' }]}>End Semester Exams</Text>
                  <Text style={[styles.miniStatVal, isLightMode && { color: '#0F172A' }]}>30 Nov 2026</Text>
                </View>
              </View>

              <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
                <Text style={[styles.resetBtnText, isLightMode && { color: '#2B3990' }]}>↺ Reset All Simulations</Text>
              </TouchableOpacity>
            </View>

            {/* Instruction Banner */}
            <View style={[styles.infoBanner, isLightMode && { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <Text style={[styles.infoBannerText, isLightMode && { color: '#1E40AF' }]}>
                Adjust the bunks below using <Text style={{ fontWeight: 'bold' }}>-</Text> and <Text style={{ fontWeight: 'bold' }}>+</Text> to preview your exact final percentage on the Last Working Day before End Sem Exams.
              </Text>
            </View>

            {/* Subject Simulations List */}
            <Text style={[styles.sectionHeading, isLightMode ? { color: '#0F172A', fontWeight: '800' } : { color: '#10B981' }]}>
              Subject-Wise Simulation
            </Text>

            {projection.subjects.map((sub) => {
              const badge = getStatusBadge(sub.eligibilityStatus);
              const maxSimBunk = sub.remainingScheduledHours;

              return (
                <View key={sub.subjectId} style={[styles.subjectCard, isLightMode && { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
                  <View style={styles.subjectTopRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.subjectCode, isLightMode ? { color: '#2B3990', fontWeight: '800' } : { color: '#10B981' }]}>
                        {sub.subjectCode}
                      </Text>
                      <Text style={[styles.subjectName, isLightMode ? { color: '#0F172A', fontWeight: '700' } : { color: '#10B981' }]} numberOfLines={1}>
                        {sub.subjectName}
                      </Text>
                    </View>
                    <View style={[styles.badgePill, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                      <Text style={[styles.badgePillText, { color: badge.text }]}>
                        {sub.projectedPercentage}%
                      </Text>
                    </View>
                  </View>

                  {/* Metrics preview */}
                  <View style={styles.metricsRow}>
                    <Text style={[styles.metricItem, isLightMode && { color: '#64748B' }]}>
                      Current: <Text style={[styles.metricVal, isLightMode && { color: '#047857' }]}>{sub.currentAttended}/{sub.currentTotal} ({sub.currentPercentage}%)</Text>
                    </Text>
                    <Text style={[styles.metricItem, isLightMode && { color: '#64748B' }]}>
                      Remaining Classes: <Text style={[styles.metricVal, isLightMode && { color: '#047857' }]}>{sub.remainingScheduledHours} hrs</Text>
                    </Text>
                  </View>

                  <View style={styles.metricsRow}>
                    <Text style={[styles.metricItem, isLightMode && { color: '#64748B' }]}>
                      Max Safe Bunk Margin: <Text style={{ color: isLightMode ? '#047857' : '#34D399', fontWeight: '700' }}>{sub.safeBunkAllowanceRemaining} hrs</Text>
                    </Text>
                    <Text style={[styles.metricItem, isLightMode && { color: '#64748B' }]}>
                      Ceiling: <Text style={[styles.metricVal, isLightMode && { color: '#047857' }]}>{sub.maxPossiblePercentage}%</Text>
                    </Text>
                  </View>

                  {/* Simulator Control */}
                  <View style={[styles.controlBox, isLightMode && { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' }]}>
                    <Text style={[styles.controlLabel, isLightMode && { color: '#0F172A' }]}>Simulate Bunking:</Text>
                    <View style={styles.stepperContainer}>
                      <TouchableOpacity
                        style={[
                          styles.stepBtn,
                          isLightMode && { backgroundColor: '#2B3990' },
                          sub.simulatedBunks <= 0 && (isLightMode ? { backgroundColor: '#E2E8F0', opacity: 0.6 } : styles.stepBtnDisabled)
                        ]}
                        onPress={() => handleAdjustBunk(sub.subjectId, -1, maxSimBunk)}
                        disabled={sub.simulatedBunks <= 0}
                      >
                        <Text style={[styles.stepBtnText, isLightMode && { color: '#FFFFFF' }]}>−</Text>
                      </TouchableOpacity>
                      <View style={styles.bunkCountBox}>
                        <Text style={[styles.bunkCountText, isLightMode && { color: '#0F172A' }]}>{sub.simulatedBunks} hrs</Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.stepBtn,
                          isLightMode && { backgroundColor: '#2B3990' },
                          sub.simulatedBunks >= maxSimBunk && (isLightMode ? { backgroundColor: '#E2E8F0', opacity: 0.6 } : styles.stepBtnDisabled)
                        ]}
                        onPress={() => handleAdjustBunk(sub.subjectId, 1, maxSimBunk)}
                        disabled={sub.simulatedBunks >= maxSimBunk}
                      >
                        <Text style={[styles.stepBtnText, isLightMode && { color: '#FFFFFF' }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Result Projection Note */}
                  <View style={[styles.forecastNoteRow, isLightMode && { borderTopColor: '#E2E8F0' }]}>
                    <Text style={[styles.forecastNoteText, isLightMode && { color: '#64748B' }]}>
                      Projected Result: <Text style={{ fontWeight: 'bold', color: badge.text }}>{sub.projectedAttended}/{sub.projectedTotal} hrs ({sub.projectedPercentage}%)</Text> • {sub.eligibilityStatus === 'SAFE' ? 'Permitted for University Exam' : sub.eligibilityStatus === 'CONDONATION' ? 'Requires Medical / Condonation Application' : 'Strict Exam Detention'}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Bottom Footer Exit Action */}
          <View style={[styles.footerActionRow, isLightMode && { borderTopColor: '#E2E8F0' }]}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.bottomExitBtn,
                isLightMode && { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.bottomExitBtnText, isLightMode ? { color: '#0F172A', fontWeight: '700' } : { color: '#10B981' }]}>
                ✕ Exit Forecaster
              </Text>
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
    backgroundColor: '#050505',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#262626',
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
    borderBottomColor: '#121212',
    paddingBottom: 12,
    marginBottom: 12,
  },
  title: {
    color: '#10B981',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#9CA3AF',
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
    backgroundColor: '#121212',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 12,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  summaryBigNumber: {
    color: '#10B981',
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
    borderTopColor: '#262626',
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
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  resetBtn: {
    marginTop: 12,
    alignSelf: 'flex-end',
  },
  resetBtnText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '700',
  },
  infoBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  infoBannerText: {
    color: '#10B981',
    fontSize: 11.5,
    lineHeight: 16,
  },
  sectionHeading: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  subjectCard: {
    backgroundColor: '#121212',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#262626',
    marginBottom: 12,
  },
  subjectTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  subjectCode: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '800',
  },
  subjectName: {
    color: '#10B981',
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
    color: '#8E9BB0',
    fontSize: 11,
  },
  metricVal: {
    color: '#10B981',
    fontWeight: '600',
  },
  controlBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#050505',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#262626',
  },
  controlLabel: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepBtn: {
    backgroundColor: '#10B981',
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBtnDisabled: {
    backgroundColor: '#121212',
    opacity: 0.5,
  },
  stepBtnText: {
    color: '#050505',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 20,
  },
  bunkCountBox: {
    minWidth: 48,
    alignItems: 'center',
  },
  bunkCountText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  forecastNoteRow: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#262626',
  },
  forecastNoteText: {
    color: '#9CA3AF',
    fontSize: 10.5,
    lineHeight: 14,
  },
  exitHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitHeaderBtnText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '800',
  },
  footerActionRow: {
    borderTopWidth: 1,
    borderTopColor: '#262626',
    paddingTop: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  bottomExitBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#121212',
    borderWidth: 1,
    borderColor: '#262626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomExitBtnText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
});
