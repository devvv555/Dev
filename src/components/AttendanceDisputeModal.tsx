import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Subject, MedicalClaimRecord, AttendanceDisputeReport } from '../types';
import { DisputeReportService } from '../services/disputeReportService';

interface AttendanceDisputeModalProps {
  visible: boolean;
  onClose: () => void;
  studentRollNo: string;
  subjects: Subject[];
  medicalClaims?: MedicalClaimRecord[];
  portalFromDate?: string;
  portalToDate?: string;
}

export const AttendanceDisputeModal: React.FC<AttendanceDisputeModalProps> = ({
  visible,
  onClose,
  studentRollNo,
  subjects,
  medicalClaims = [],
  portalFromDate = '17-08-2026',
  portalToDate = '10-10-2026',
}) => {
  const [copied, setCopied] = useState(false);

  const report: AttendanceDisputeReport = DisputeReportService.generateReport(
    studentRollNo,
    subjects,
    medicalClaims,
    portalFromDate,
    portalToDate
  );

  const handleCopyReport = () => {
    // Show user-friendly copy feedback
    setCopied(true);
    Alert.alert(
      'Dispute Report Ready 📋',
      'The complete itemized attendance report has been prepared. You can share this text directly with your Faculty Advisor, Tutor, or HOD for verification.'
    );
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.badgeRow}>
                <View style={styles.reportBadge}>
                  <Text style={styles.reportBadgeText}>OFFICIAL DOSSIER</Text>
                </View>
                <Text style={styles.periodText}>
                  {report.portalFromDate} → {report.portalToDate}
                </Text>
              </View>
              <Text style={styles.modalTitle}>Attendance Dispute & Proof Report</Text>
              <Text style={styles.modalSub}>
                {report.studentName} ({report.rollNo}) • {report.section}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Status Summary Banner */}
            <View
              style={[
                styles.summaryBanner,
                report.totalDiscrepancyHours > 0
                  ? styles.summaryBannerAlert
                  : styles.summaryBannerSuccess,
              ]}
            >
              <Text style={styles.summaryBannerIcon}>
                {report.totalDiscrepancyHours > 0 ? '⚠️' : '✅'}
              </Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.summaryBannerTitle}>
                  {report.totalDiscrepancyHours > 0
                    ? `${report.totalDiscrepancyHours} Hours Missing on Official Portal`
                    : '100% Attendance Records Reconciled'}
                </Text>
                <Text style={styles.summaryBannerDesc}>
                  {report.totalDiscrepancyHours > 0
                    ? 'Your daily period logs record more class hours attended than published on Studzone.'
                    : 'All logged hours match the official college portal baseline perfectly.'}
                </Text>
              </View>
            </View>

            {/* Subject Itemized Comparison */}
            <Text style={styles.sectionHeader}>Subject-Wise Verification</Text>
            {report.items.map((item) => (
              <View
                key={item.subjectCode}
                style={[
                  styles.itemCard,
                  item.deltaAttended > 0 && styles.itemCardDiscrepancy,
                ]}
              >
                <View style={styles.itemTopRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.subjectCode}>{item.subjectCode}</Text>
                    <Text style={styles.subjectName}>{item.subjectName}</Text>
                  </View>

                  {/* Discrepancy Status Pill */}
                  {item.deltaAttended > 0 ? (
                    <View style={styles.discrepancyPill}>
                      <Text style={styles.discrepancyPillText}>
                        +{item.deltaAttended}h MISSING
                      </Text>
                    </View>
                  ) : item.deltaAttended < 0 ? (
                    <View style={styles.surplusPill}>
                      <Text style={styles.surplusPillText}>
                        {item.deltaAttended}h SURPLUS
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.matchPill}>
                      <Text style={styles.matchPillText}>✓ MATCHED</Text>
                    </View>
                  )}
                </View>

                {/* Grid Comparison */}
                <View style={styles.comparisonGrid}>
                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>STUDZONE PORTAL</Text>
                    <Text style={styles.gridVal}>
                      {item.portalAttended} / {item.portalTotal} hrs
                    </Text>
                    <Text
                      style={[
                        styles.gridPct,
                        item.portalPercentage < 75 ? { color: '#F87171' } : { color: '#38BDF8' },
                      ]}
                    >
                      {item.portalPercentage.toFixed(1)}%
                    </Text>
                  </View>

                  <View style={styles.gridDivider} />

                  <View style={styles.gridCol}>
                    <Text style={styles.gridLabel}>HOURLY APP LOGGED</Text>
                    <Text style={styles.gridVal}>
                      {item.appAttended} / {item.appTotal} hrs
                    </Text>
                    <Text
                      style={[
                        styles.gridPct,
                        item.appPercentage < 75 ? { color: '#F87171' } : { color: '#34D399' },
                      ]}
                    >
                      {item.appPercentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Medical / OD Claims Section */}
            {medicalClaims && medicalClaims.length > 0 ? (
              <View style={styles.medicalSection}>
                <Text style={styles.sectionHeader}>Attached Medical & OD Claims</Text>
                {medicalClaims.map((med, idx) => (
                  <View key={med.id || idx} style={styles.medCard}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.medReason}>{med.reason}</Text>
                      <Text style={styles.medDates}>
                        📅 {med.fromDate} to {med.toDate}
                      </Text>
                    </View>
                    <View style={styles.medStatusBadge}>
                      <Text style={styles.medStatusText}>{med.status}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {/* Plaintext Dossier Preview Box */}
            <Text style={[styles.sectionHeader, { marginTop: 14 }]}>
              Official Dossier Text (For Advisor / HOD)
            </Text>
            <View style={styles.previewTextBox}>
              <Text style={styles.previewTextContent}>{report.summaryText}</Text>
            </View>

            {/* Actions */}
            <TouchableOpacity
              style={styles.copyBtn}
              onPress={handleCopyReport}
              activeOpacity={0.8}
            >
              <Text style={styles.copyBtnText}>
                {copied ? '✅ Dispute Text Copied!' : '📋 Share / Send Dispute Dossier'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '75%',
    borderWidth: 1,
    borderColor: '#334155',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    alignItems: 'flex-start',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  reportBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  reportBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },
  periodText: {
    color: '#38BDF8',
    fontSize: 10.5,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 16,
  },
  summaryBannerAlert: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  summaryBannerSuccess: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  summaryBannerIcon: {
    fontSize: 24,
  },
  summaryBannerTitle: {
    color: '#F8FAFC',
    fontSize: 13.5,
    fontWeight: '800',
  },
  summaryBannerDesc: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  sectionHeader: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  itemCardDiscrepancy: {
    borderColor: '#F87171',
    borderWidth: 1.5,
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  subjectCode: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  discrepancyPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discrepancyPillText: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '800',
  },
  surplusPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  surplusPillText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  matchPill: {
    backgroundColor: 'rgba(52, 211, 153, 0.18)',
    borderWidth: 1,
    borderColor: '#34D399',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matchPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  comparisonGrid: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridCol: {
    flex: 1,
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 2,
  },
  gridVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  gridPct: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  gridDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
    marginHorizontal: 8,
  },
  medicalSection: {
    marginTop: 12,
  },
  medCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  medReason: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  medDates: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  medStatusBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  medStatusText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  previewTextBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  previewTextContent: {
    color: '#94A3B8',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
  },
  copyBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  copyBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
