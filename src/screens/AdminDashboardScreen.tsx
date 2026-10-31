import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Platform,
  ActivityIndicator,
} from 'react-native';

import { FeatureUsageStats, StudentFeedback, FeedbackCategory, StudentActivityRecord } from '../types';
import { AnalyticsService } from '../services/analyticsService';
import { FeedbackService } from '../services/feedbackService';
import { CloudSyncService } from '../services/cloudSyncService';
import { toNewRollNo, toOldRollNo } from '../data/psgimMasterStudents';
import { UltronScanner, UltronScanResult } from '../services/ultronScanner';
import { JarvisFixer, JarvisFixReport } from '../services/jarvisFixer';
import { FridayAnalyzer, FridayDiagnosis } from '../services/fridayAnalyzer';
import { EdithSupervisor } from '../services/edithSupervisor';
import { DumeMonitor, DumeMaintenanceReport } from '../services/dumeMonitor';
import { MissMinutesScheduler, MissMinutesSyncLog, MarkedStudentSummary } from '../services/missMinutesScheduler';

export interface AdminDashboardScreenProps {
  visible: boolean;
  onClose: () => void;
  initiallyAuthenticated?: boolean;
}

export const CORRECT_ADMIN_PIN = 'Au76.;@dgb(Knu&!fhk:mh';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  visible,
  onClose,
  initiallyAuthenticated = false,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initiallyAuthenticated);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'STUDENTS' | 'FEEDBACK' | 'AI_OPERATIONS'>('STUDENTS');
  const [analytics, setAnalytics] = useState<FeatureUsageStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<'ALL' | FeedbackCategory>('ALL');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'ALL' | 'REPLIED' | 'PENDING'>('ALL');

  // AI Subsystem States
  const [ultronReport, setUltronReport] = useState<UltronScanResult | null>(null);
  const [jarvisReport, setJarvisReport] = useState<JarvisFixReport | null>(null);
  const [fridayDiagnoses, setFridayDiagnoses] = useState<FridayDiagnosis[]>([]);
  const [dumeReport, setDumeReport] = useState<DumeMaintenanceReport | null>(null);
  const [missMinutesLog, setMissMinutesLog] = useState<MissMinutesSyncLog | null>(null);
  const [markedAttendanceStudents, setMarkedAttendanceStudents] = useState<MarkedStudentSummary[]>([]);
  const [isAiScanning, setIsAiScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<{
    phase: string;
    percent: number;
    currentTest: string;
    findingsCount: number;
  } | null>(null);
  const [isAiFixing, setIsAiFixing] = useState<boolean>(false);
  const [isMinutesSyncing, setIsMinutesSyncing] = useState<boolean>(false);

  // Student Telemetry & Time Spent State
  const [studentActivities, setStudentActivities] = useState<StudentActivityRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [liveOnlyFilter, setLiveOnlyFilter] = useState<boolean>(false);
  const [selectedStudentDrilldown, setSelectedStudentDrilldown] = useState<StudentActivityRecord | null>(null);
  const [replyingFeedback, setReplyingFeedback] = useState<StudentFeedback | null>(null);
  const [replyInput, setReplyInput] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  // Live Attendance Control States
  const [attendanceWindowStatus, setAttendanceWindowStatus] = useState<'OPEN' | 'LOCKED'>('LOCKED');
  const [windowExpiresAt, setWindowExpiresAt] = useState<string | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>('5');
  const [isPerformingAction, setIsPerformingAction] = useState<boolean>(false);
  const [isControlsExpanded, setIsControlsExpanded] = useState<boolean>(true);

  // Secondary Confirmation Modal State
  const [confirmModalConfig, setConfirmModalConfig] = useState<{
    visible: boolean;
    title: string;
    description: string;
    actionLabel: string;
    actionColor: string;
    onConfirm: () => Promise<void>;
  }>({
    visible: false,
    title: '',
    description: '',
    actionLabel: '',
    actionColor: '#0284C7',
    onConfirm: async () => {},
  });

  const loadData = async () => {
    const stats = await AnalyticsService.getAnalyticsSummary();
    const fbList = await FeedbackService.getAllFeedbacks();
    const activities = await AnalyticsService.getAllStudentActivities();
    const lastUltron = await UltronScanner.getLastScan();
    const lastDume = await DumeMonitor.getLastReport();
    const lastMinutes = await MissMinutesScheduler.getLastSyncLog();
    const markedList = await MissMinutesScheduler.getAttendanceMarkedStudents();
    setAnalytics(stats);
    setFeedbacks(fbList);
    setStudentActivities(activities);
    setMarkedAttendanceStudents(markedList);
    if (lastUltron) setUltronReport(lastUltron);
    if (lastDume) setDumeReport(lastDume);
    if (lastMinutes) {
      setMissMinutesLog(lastMinutes);
      if (lastMinutes.markedStudents && lastMinutes.markedStudents.length > 0) {
        setMarkedAttendanceStudents(lastMinutes.markedStudents);
      }
    }
  };

  const handleRunUltronScan = async () => {
    setIsAiScanning(true);
    setScanProgress({
      phase: 'Initializing Ultron...',
      percent: 0,
      currentTest: 'Preparing deep stress test suites across all app vectors...',
      findingsCount: 0,
    });
    try {
      const scan = await UltronScanner.scanAll((prog) => {
        setScanProgress({
          phase: prog.phase,
          percent: prog.percent,
          currentTest: prog.currentTest,
          findingsCount: prog.findingsCount,
        });
      });
      setUltronReport(scan);

      // Friday automatically investigates the root causes for each finding
      const diagnoses: FridayDiagnosis[] = [];
      for (const vuln of scan.vulnerabilities) {
        const diag = FridayAnalyzer.analyzeRootCause(vuln.id, vuln.description);
        diagnoses.push(diag);
        // Friday reports directly to Edith
        await FridayAnalyzer.reportToEdith(diag);
      }
      setFridayDiagnoses(diagnoses);

      Alert.alert(
        'Ultron Probe Complete',
        `Ultron tested all options across ${scan.phasesCompleted} phases (${scan.totalTestsRun} test cases) and detected ${scan.totalVulnerabilitiesFound} vulnerabilities. Friday diagnosed root causes and reported to Edith.`
      );

      // Cloud Firestore Sync
      await CloudSyncService.syncAiSubsystemsToCloud({
        ultronScan: scan,
        fridayDiagnoses: diagnoses,
        edithOverview: EdithSupervisor.getSystemSupervisionOverview(),
      });
    } catch (e: any) {
      Alert.alert('Scan Error', e?.message || 'Ultron probe failed.');
    } finally {
      setIsAiScanning(false);
      setScanProgress(null);
    }
  };

  const handleRunJarvisFix = async () => {
    setIsAiFixing(true);
    try {
      const result = await JarvisFixer.fixVulnerabilities(ultronReport || undefined);
      setJarvisReport(result);
      const refreshedUltron = await UltronScanner.getLastScan();
      if (refreshedUltron) setUltronReport(refreshedUltron);

      Alert.alert(
        'Jarvis Fix Deployed',
        `J.A.R.V.I.S. patched ${result.fixedCount} vulnerabilities! Status: ${result.status}.`
      );

      // Cloud Firestore Sync
      await CloudSyncService.syncAiSubsystemsToCloud({
        ultronScan: refreshedUltron || ultronReport,
        jarvisFix: result,
        edithOverview: EdithSupervisor.getSystemSupervisionOverview(),
      });
    } catch (e: any) {
      Alert.alert('Fix Error', e?.message || 'Jarvis fix failed.');
    } finally {
      setIsAiFixing(false);
    }
  };

  const handleRunDumeMaintenance = async () => {
    try {
      const report = await DumeMonitor.generateMaintenanceReport();
      setDumeReport(report);
      Alert.alert('DUM-E & U Report Ready', `UX Ease-of-use score: ${report.easeOfUseScore}/100.`);

      // Cloud Firestore Sync
      await CloudSyncService.syncAiSubsystemsToCloud({
        dumeReport: report,
      });
    } catch (e: any) {
      Alert.alert('Analysis Error', e?.message || 'Maintenance generation failed.');
    }
  };

  const handleRunMissMinutes = async () => {
    setIsMinutesSyncing(true);
    try {
      const log = await MissMinutesScheduler.executeNightlyAttendanceSync(true);
      setMissMinutesLog(log);
      if (log.markedStudents && log.markedStudents.length > 0) {
        setMarkedAttendanceStudents(log.markedStudents);
      } else {
        const fresh = await MissMinutesScheduler.getAttendanceMarkedStudents();
        setMarkedAttendanceStudents(fresh);
      }
      Alert.alert('Miss Minutes Sync', log.details);
    } catch (e: any) {
      Alert.alert('Sync Error', e?.message || 'Miss Minutes sync failed.');
    } finally {
      setIsMinutesSyncing(false);
    }
  };


  useEffect(() => {
    if (visible) {
      if (initiallyAuthenticated) {
        setIsAuthenticated(true);
      }
      loadData();
    }
  }, [visible, initiallyAuthenticated]);

  // Subscribe to live attendance window state
  useEffect(() => {
    const unsub = CloudSyncService.listenToAttendanceWindow((data) => {
      if (data && data.status) {
        setAttendanceWindowStatus(data.status);
        setWindowExpiresAt(data.expiresAt || null);
      }
    });
    return () => unsub();
  }, []);

  // Action 1: Lock / Unlock Live Attendance
  const handleTriggerLockUnlock = () => {
    const isCurrentlyOpen = attendanceWindowStatus === 'OPEN';
    const targetStatus = isCurrentlyOpen ? 'LOCKED' : 'OPEN';
    const todayDate = new Date().toISOString().split('T')[0];

    setConfirmModalConfig({
      visible: true,
      title: isCurrentlyOpen ? 'Lock Live Attendance?' : 'Unlock Live Attendance?',
      description: isCurrentlyOpen
        ? 'This will immediately lock live attendance for all students. No student will be able to record or change attendance until reopened.'
        : 'This will reopen live attendance for all students today. A notification will automatically be sent to all students alerting them that attendance is open.',
      actionLabel: isCurrentlyOpen ? 'Confirm Lock Attendance' : 'Confirm Unlock & Notify All',
      actionColor: isCurrentlyOpen ? '#EF4444' : '#10B981',
      onConfirm: async () => {
        setIsPerformingAction(true);
        try {
          if (targetStatus === 'OPEN') {
            const minutes = parseInt(customTimerMinutes, 10) || 5;
            const now = new Date();
            const expires = new Date(Date.now() + minutes * 60 * 1000);
            await CloudSyncService.broadcastAttendanceWindow({
              status: 'OPEN',
              durationMinutes: minutes,
              durationSeconds: minutes * 60,
              openedAt: now.toISOString(),
              expiresAt: expires.toISOString(),
              date: todayDate,
              sendNotification: true,
              message: `Today's live attendance has been reopened for ${minutes} minutes. If you have not recorded or need to change attendance, do it now.`,
            });
          } else {
            await CloudSyncService.broadcastAttendanceWindow({
              status: 'LOCKED',
              durationSeconds: 0,
              date: todayDate,
              message: "Today's live attendance is now locked.",
            });
          }
        } finally {
          setIsPerformingAction(false);
          setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
        }
      },
    });
  };

  // Action 2: Set Timer in Live Attendance
  const handleTriggerSetTimer = (minutes: number) => {
    const todayDate = new Date().toISOString().split('T')[0];
    setConfirmModalConfig({
      visible: true,
      title: `Set Attendance Timer to ${minutes} Minutes?`,
      description: `This will broadcast a live ${minutes}-minute countdown to all students and send an instant phone notification alerting everyone that live attendance is open for ${minutes} minutes.`,
      actionLabel: `Confirm & Start ${minutes}m Timer`,
      actionColor: '#0284C7',
      onConfirm: async () => {
        setIsPerformingAction(true);
        try {
          const now = new Date();
          const expires = new Date(Date.now() + minutes * 60 * 1000);
          await CloudSyncService.broadcastAttendanceWindow({
            status: 'OPEN',
            durationMinutes: minutes,
            durationSeconds: minutes * 60,
            openedAt: now.toISOString(),
            expiresAt: expires.toISOString(),
            date: todayDate,
            sendNotification: true,
            message: `Today's live attendance is open for ${minutes} minutes. If you have not recorded or need to change attendance, do it now.`,
          });
        } finally {
          setIsPerformingAction(false);
          setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
        }
      },
    });
  };

  // Action 3: Upload to Cloud & Permanently Lock (Unless clash detected)
  const handleTriggerCloudUploadAndLock = () => {
    const todayDate = new Date().toISOString().split('T')[0];
    setConfirmModalConfig({
      visible: true,
      title: 'Upload & Permanently Lock Today\'s Attendance?',
      description: 'This will finalize today\'s attendance, upload all student records to Cloud Firestore, and permanently lock them. Records cannot be altered unless official college ERP portal attendance clashes with app records.',
      actionLabel: 'Confirm Upload & Lock to Cloud',
      actionColor: '#7C3AED',
      onConfirm: async () => {
        setIsPerformingAction(true);
        try {
          await CloudSyncService.lockAllStudentsTodayAttendance(todayDate);
        } finally {
          setIsPerformingAction(false);
          setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
        }
      },
    });
  };

  const handleVerifyPin = () => {
    setPinError(null);
    if (pinInput.trim() === CORRECT_ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinInput('');
      loadData();
    } else {
      setPinError('Invalid Admin PIN. Access denied.');
      setPinInput('');
    }
  };

  const handleOpenReplyModal = (feedback: StudentFeedback) => {
    setReplyingFeedback(feedback);
    setReplyInput(feedback.adminReply || '');
  };

  const handleSendReply = async (markResolved = false) => {
    if (!replyingFeedback) return;
    if (!replyInput.trim()) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
        window.alert('Please enter a reply message.');
      } else {
        Alert.alert('Message Required', 'Please enter a reply message.');
      }
      return;
    }

    setIsSendingReply(true);
    try {
      await FeedbackService.replyToFeedback(replyingFeedback.id, replyInput.trim(), markResolved);
      setReplyingFeedback(null);
      setReplyInput('');
      await loadData();
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
        window.alert('Reply saved and sent successfully!');
      } else {
        Alert.alert('Success', 'Reply saved and sent successfully!');
      }
    } catch (err) {
      console.warn('Failed to save reply:', err);
      Alert.alert('Error', 'Failed to save reply. Please try again.');
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleStatusToggle = async (feedback: StudentFeedback) => {
    const nextStatus =
      feedback.status === 'NEW'
        ? 'REVIEWED'
        : feedback.status === 'REVIEWED'
        ? 'RESOLVED'
        : 'NEW';

    await FeedbackService.updateFeedbackStatus(feedback.id, nextStatus);
    loadData();
  };

  const handleResetAnalytics = () => {
    const doReset = async () => {
      try {
        await AnalyticsService.resetAnalytics();
        await loadData();
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
          window.alert('Most Used Features view counts and telemetry stats have been reset to 0.');
        } else {
          Alert.alert('Success', 'Most Used Features view counts and telemetry stats have been reset to 0.');
        }
      } catch (e) {
        console.error('Error resetting telemetry:', e);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm('Reset Most Used Features & Telemetry?\n\nThis will reset all feature view counts to 0 and clear student foreground activity.')) {
        doReset();
      }
      return;
    }

    Alert.alert(
      'Reset Most Used Features & Telemetry?',
      'This will reset all feature view counts to 0 and clear student foreground activity.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset to 0',
          style: 'destructive',
          onPress: doReset,
        },
      ]
    );
  };

  const handleClearAllFeedbacks = () => {
    const doClear = async () => {
      try {
        await FeedbackService.clearAllFeedbacks();
        await loadData();
        if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
          window.alert('All feedback records have been removed.');
        } else {
          Alert.alert('Success', 'All feedback records have been removed.');
        }
      } catch (e) {
        console.error('Error clearing feedbacks:', e);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (
        window.confirm(
          'Remove All Feedback?\n\nThis will permanently delete all student feedback and replies from local storage and the cloud database.'
        )
      ) {
        doClear();
      }
      return;
    }

    Alert.alert(
      'Remove All Feedback?',
      'This will permanently delete all student feedback and replies from local storage and the cloud database.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: doClear,
        },
      ]
    );
  };

  const handleDeleteFeedback = (fb: StudentFeedback) => {
    const doDelete = async () => {
      try {
        await FeedbackService.deleteFeedback(fb.id);
        await loadData();
      } catch (e) {
        console.error('Error deleting feedback:', e);
      }
    };

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm) {
      if (window.confirm(`Delete feedback from ${fb.studentName || 'Student'}?`)) {
        doDelete();
      }
      return;
    }

    Alert.alert(
      'Delete Feedback?',
      `Are you sure you want to delete this feedback from ${fb.studentName || 'Student'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: doDelete },
      ]
    );
  };

  const calculateFeaturePercentages = (stats: FeatureUsageStats) => {
    const totalViews =
      stats.hourlyTrackerViews +
      stats.timetableViews +
      stats.calendarViews +
      stats.medicalVaultViews +
      stats.erpSyncViews;

    const safeTotal = totalViews === 0 ? 1 : totalViews;

    return [
      {
        name: 'Hourly Class Tracker',
        count: stats.hourlyTrackerViews,
        pct: Math.round((stats.hourlyTrackerViews / safeTotal) * 100),
        color: '#3B82F6',
      },
      {
        name: 'Holidays & Academic Calendar',
        count: stats.calendarViews,
        pct: Math.round((stats.calendarViews / safeTotal) * 100),
        color: '#10B981',
      },
      {
        name: 'Weekly Timetable',
        count: stats.timetableViews,
        pct: Math.round((stats.timetableViews / safeTotal) * 100),
        color: '#8B5CF6',
      },
      {
        name: 'Medical Claim Vault (65%)',
        count: stats.medicalVaultViews,
        pct: Math.round((stats.medicalVaultViews / safeTotal) * 100),
        color: '#EC4899',
      },
      {
        name: 'ERP Attendance Reconcile',
        count: stats.erpSyncViews,
        pct: Math.round((stats.erpSyncViews / safeTotal) * 100),
        color: '#F59E0B',
      },
    ].sort((a, b) => b.count - a.count);
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    const matchCategory = feedbackFilter === 'ALL' || fb.category === feedbackFilter;
    const isReplied = Boolean(fb.adminReply && fb.adminReply.trim().length > 0);
    const matchStatus =
      feedbackStatusFilter === 'ALL'
        ? true
        : feedbackStatusFilter === 'REPLIED'
        ? isReplied
        : !isReplied;
    return matchCategory && matchStatus;
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Control Center</Text>
          <TouchableOpacity
            onPress={() => {
              setIsAuthenticated(false);
              onClose();
            }}
            style={styles.exitBtn}
          >
            <Text style={styles.exitBtnText}>Exit Admin X</Text>
          </TouchableOpacity>
        </View>

        {/* PIN Authentication Gate */}
        {!isAuthenticated ? (
          <View style={styles.pinGateContainer}>
            <View style={styles.pinCard}>
              <View style={styles.lockBadge}>
                <Text style={styles.lockText}>ADMIN</Text>
              </View>
              <Text style={styles.pinTitle}>Enter Admin Passkey</Text>
              <Text style={styles.pinSub}>
                Authorized developer and administrator access only.
              </Text>

              {pinError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{pinError}</Text>
                </View>
              )}

              <View style={styles.pinWrapper}>
                <TextInput
                  style={styles.pinInput}
                  placeholder="Enter secret passkey"
                  placeholderTextColor="#64748B"
                  value={pinInput}
                  onChangeText={(text) => {
                    setPinInput(text);
                    setPinError(null);
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={!showPin}
                  maxLength={64}
                />
                <TouchableOpacity
                  style={styles.showPinBtn}
                  onPress={() => setShowPin(!showPin)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.showPinText}>{showPin ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.unlockBtn}
                onPress={handleVerifyPin}
                activeOpacity={0.8}
              >
                <Text style={styles.unlockBtnText}>Unlock Admin Panel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Authenticated Admin Dashboard */
          <View style={styles.dashboardBody}>
            {/* Tab Switcher */}
            <View style={styles.tabSwitcher}>
              <TouchableOpacity
                style={[styles.switchTab, activeTab === 'ANALYTICS' && styles.switchTabActive]}
                onPress={() => setActiveTab('ANALYTICS')}
              >
                <Text
                  style={[
                    styles.switchTabText,
                    activeTab === 'ANALYTICS' && styles.switchTabTextActive,
                  ]}
                >
                  Cohort Stats
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.switchTab, activeTab === 'STUDENTS' && styles.switchTabActive]}
                onPress={() => setActiveTab('STUDENTS')}
              >
                <Text
                  style={[
                    styles.switchTabText,
                    activeTab === 'STUDENTS' && styles.switchTabTextActive,
                  ]}
                >
                  Student Time & Features ({studentActivities.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.switchTab, activeTab === 'FEEDBACK' && styles.switchTabActive]}
                onPress={() => setActiveTab('FEEDBACK')}
              >
                <Text
                  style={[
                    styles.switchTabText,
                    activeTab === 'FEEDBACK' && styles.switchTabTextActive,
                  ]}
                >
                  Feedback ({feedbacks.length})
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.switchTab, activeTab === 'AI_OPERATIONS' && styles.switchTabActive]}
                onPress={() => setActiveTab('AI_OPERATIONS')}
              >
                <Text
                  style={[
                    styles.switchTabText,
                    activeTab === 'AI_OPERATIONS' && styles.switchTabTextActive,
                  ]}
                >
                  AI Operations
                </Text>
              </TouchableOpacity>
            </View>


            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {/* Live Attendance Master Controls */}
              <View style={styles.masterControlCard}>
                <View style={styles.masterControlHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.masterControlTitle}>Live Attendance Master Controls</Text>
                    <Text style={styles.masterControlSubtitle}>Real-time cohort gate and cloud synchronization</Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.masterStatusBadge,
                      attendanceWindowStatus === 'OPEN' ? styles.masterStatusBadgeOpen : styles.masterStatusBadgeLocked,
                    ]}
                    onPress={() => setIsControlsExpanded(!isControlsExpanded)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.masterStatusDot,
                        attendanceWindowStatus === 'OPEN' ? styles.masterStatusDotOpen : styles.masterStatusDotLocked,
                      ]}
                    />
                    <Text
                      style={[
                        styles.masterStatusBadgeText,
                        attendanceWindowStatus === 'OPEN' ? styles.masterStatusTextOpen : styles.masterStatusTextLocked,
                      ]}
                    >
                      {attendanceWindowStatus === 'OPEN' ? 'STATUS: OPEN' : 'STATUS: LOCKED'}
                    </Text>
                    <Text style={styles.toggleArrowText}>
                      {isControlsExpanded ? '▲' : '▼'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {isControlsExpanded && (
                  <View style={styles.masterControlsBody}>
                    {/* Button 1: Lock / Unlock Toggle */}
                    <View style={styles.controlActionBlock}>
                      <View style={styles.actionBlockHeader}>
                        <View style={styles.actionBlockNumberBadge}>
                          <Text style={styles.actionBlockNumberText}>1</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.actionBlockTitle}>Student Recording Gate</Text>
                          <Text style={styles.actionBlockDesc}>
                            {attendanceWindowStatus === 'OPEN'
                              ? 'Currently allowing all cohort students to mark and edit attendance.'
                              : 'Currently locked. Reopening will broadcast an alert notification to all students.'}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          attendanceWindowStatus === 'OPEN' ? styles.actionButtonRed : styles.actionButtonGreen,
                        ]}
                        onPress={handleTriggerLockUnlock}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionButtonText}>
                          {attendanceWindowStatus === 'OPEN'
                            ? 'Lock Live Attendance'
                            : 'Unlock Live Attendance & Notify All'}
                        </Text>
                      </TouchableOpacity>
                    </View>

                    {/* Button 2: Set Timer Window */}
                    <View style={styles.controlActionBlock}>
                      <View style={styles.actionBlockHeader}>
                        <View style={styles.actionBlockNumberBadge}>
                          <Text style={styles.actionBlockNumberText}>2</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.actionBlockTitle}>Live Attendance Timer</Text>
                          <Text style={styles.actionBlockDesc}>
                            Broadcasts live countdown to all students and sends high-priority notification.
                          </Text>
                        </View>
                      </View>

                      <View style={styles.timerPresetsRow}>
                        {[5, 10, 15].map((mins) => (
                          <TouchableOpacity
                            key={mins}
                            style={[
                              styles.timerPresetBtn,
                              customTimerMinutes === String(mins) && styles.timerPresetBtnActive,
                            ]}
                            onPress={() => {
                              setCustomTimerMinutes(String(mins));
                              handleTriggerSetTimer(mins);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.timerPresetBtnText,
                                customTimerMinutes === String(mins) && styles.timerPresetBtnTextActive,
                              ]}
                            >
                              {mins} Mins
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>

                      <View style={styles.customTimerRow}>
                        <TextInput
                          style={styles.customTimerInput}
                          keyboardType="numeric"
                          value={customTimerMinutes}
                          onChangeText={setCustomTimerMinutes}
                          placeholder="Mins"
                          placeholderTextColor="#64748B"
                          maxLength={3}
                        />
                        <Text style={styles.timerUnitText}>mins</Text>
                        <TouchableOpacity
                          style={styles.startCustomTimerBtn}
                          onPress={() => handleTriggerSetTimer(parseInt(customTimerMinutes, 10) || 5)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.startCustomTimerBtnText}>Set Timer & Notify All</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Button 3: Upload & Cloud Lock */}
                    <View style={styles.controlActionBlock}>
                      <View style={styles.actionBlockHeader}>
                        <View style={styles.actionBlockNumberBadge}>
                          <Text style={styles.actionBlockNumberText}>3</Text>
                        </View>
                        <View style={{ flex: 1, marginLeft: 8 }}>
                          <Text style={styles.actionBlockTitle}>Cloud Sync & Permanent Lock</Text>
                          <Text style={styles.actionBlockDesc}>
                            Uploads today's attendance to Cloud Firestore and seals records. Cannot be modified unless official college ERP portal attendance clashes.
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.actionButtonPurple]}
                        onPress={handleTriggerCloudUploadAndLock}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionButtonText}>
                          Upload & Permanently Lock to Cloud
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>

              {activeTab === 'ANALYTICS' && analytics && (
                <>
                  {/* Overview Metric Cards */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Active Students</Text>
                      <Text style={styles.metricValue}>
                        {analytics.uniqueStudentsCount}
                        <Text style={styles.metricSubValue}> / 252</Text>
                      </Text>
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricBadgeText}>
                          {Math.round((analytics.uniqueStudentsCount / 252) * 100)}% Cohort Adoption
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metricCard}>
                      <Text style={styles.metricLabel}>Total Sessions</Text>
                      <Text style={styles.metricValue}>{analytics.totalLogins}</Text>
                      <View style={styles.metricBadgeGreen}>
                        <Text style={styles.metricBadgeGreenText}>
                          +{analytics.activeTodayCount} Active Today
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Batch Adoption Breakdown */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>Student Batch Distribution</Text>
                    <View style={styles.batchRow}>
                      <View style={styles.batchPill}>
                        <Text style={styles.batchLetter}>Batch A</Text>
                        <Text style={styles.batchCount}>{analytics.batchBreakdown.A}</Text>
                      </View>
                      <View style={styles.batchPill}>
                        <Text style={styles.batchLetter}>Batch B</Text>
                        <Text style={styles.batchCount}>{analytics.batchBreakdown.B}</Text>
                      </View>
                      <View style={styles.batchPill}>
                        <Text style={styles.batchLetter}>Batch C</Text>
                        <Text style={styles.batchCount}>{analytics.batchBreakdown.C}</Text>
                      </View>
                      <View style={styles.batchPill}>
                        <Text style={styles.batchLetter}>Batch D</Text>
                        <Text style={styles.batchCount}>{analytics.batchBreakdown.D}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Feature Popularity Breakdown */}
                  <View style={styles.sectionCard}>
                    <View style={styles.sectionHeaderRow}>
                      <View>
                        <Text style={styles.sectionTitle}>Most Used Features</Text>
                        <Text style={styles.sectionSub}>
                          What parts of the app are students using the most?
                        </Text>
                      </View>
                      <TouchableOpacity onPress={handleResetAnalytics} style={styles.resetBtn}>
                        <Text style={styles.resetBtnText}>Reset Stats</Text>
                      </TouchableOpacity>
                    </View>

                    {calculateFeaturePercentages(analytics).map((item, idx) => (
                      <View key={item.name} style={styles.featureRankItem}>
                        <View style={styles.featureTopLine}>
                          <View style={styles.featureTitleCol}>
                            <Text style={styles.featureRankNum}>#{idx + 1}</Text>
                            <Text style={styles.featureName}>{item.name}</Text>
                          </View>
                          <Text style={styles.featureCountText}>
                            {item.count} views ({item.pct}%)
                          </Text>
                        </View>
                        {/* Progress Bar */}
                        <View style={styles.progressBarTrack}>
                          <View
                            style={[
                              styles.progressBarFill,
                              { width: `${item.pct}%`, backgroundColor: item.color },
                            ]}
                          />
                        </View>
                      </View>
                    ))}
                  </View>
                </>
              )}

              {activeTab === 'FEEDBACK' && (
                <>
                  <View style={[styles.sectionHeaderRow, { marginBottom: 14 }]}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <Text style={styles.sectionTitle}>Student Feedback</Text>
                      <Text style={styles.sectionSub}>
                        Suggestions, bug reports, and schedule change requests from students.
                      </Text>
                    </View>
                    {feedbacks.length > 0 && (
                      <TouchableOpacity onPress={handleClearAllFeedbacks} style={styles.resetBtn}>
                        <Text style={[styles.resetBtnText, { color: '#EF4444' }]}>Clear All Feedback</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Reply Status Segment Bar */}
                  <View style={styles.replyStatusRow}>
                    <TouchableOpacity
                      style={[
                        styles.replyStatusPill,
                        feedbackStatusFilter === 'ALL' && styles.replyStatusPillActive,
                      ]}
                      onPress={() => setFeedbackStatusFilter('ALL')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.replyStatusPillText,
                          feedbackStatusFilter === 'ALL' && styles.replyStatusPillTextActive,
                        ]}
                      >
                        All ({feedbacks.length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.replyStatusPill,
                        feedbackStatusFilter === 'REPLIED' && styles.replyStatusPillRepliedActive,
                      ]}
                      onPress={() => setFeedbackStatusFilter('REPLIED')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.replyStatusPillText,
                          feedbackStatusFilter === 'REPLIED' && styles.replyStatusPillRepliedTextActive,
                        ]}
                      >
                        Replied ({feedbacks.filter((f) => Boolean(f.adminReply && f.adminReply.trim())).length})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.replyStatusPill,
                        feedbackStatusFilter === 'PENDING' && styles.replyStatusPillPendingActive,
                      ]}
                      onPress={() => setFeedbackStatusFilter('PENDING')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.replyStatusPillText,
                          feedbackStatusFilter === 'PENDING' && styles.replyStatusPillPendingTextActive,
                        ]}
                      >
                        Needs Reply ({feedbacks.filter((f) => !f.adminReply || !f.adminReply.trim()).length})
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Category Filter Chips */}
                  <View style={styles.filterRow}>
                    {(['ALL', 'FEATURE', 'SCHEDULE', 'BUG', 'GENERAL'] as const).map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterChip,
                          feedbackFilter === filter && styles.filterChipActive,
                        ]}
                        onPress={() => setFeedbackFilter(filter)}
                      >
                        <Text
                          style={[
                            styles.filterChipText,
                            feedbackFilter === filter && styles.filterChipTextActive,
                          ]}
                        >
                          {filter === 'ALL'
                            ? 'All Types'
                            : filter === 'FEATURE'
                            ? 'Features'
                            : filter === 'SCHEDULE'
                            ? 'Schedule'
                            : filter === 'BUG'
                            ? 'Bugs'
                            : 'General'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Feedback List */}
                  {filteredFeedbacks.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyTitle}>No Feedback in this Category</Text>
                      <Text style={styles.emptySub}>
                        Student feedback submissions will appear here automatically.
                      </Text>
                    </View>
                  ) : (
                    filteredFeedbacks.map((fb) => (
                      <View key={fb.id} style={styles.feedbackCard}>
                        <View style={styles.fbHeaderRow}>
                          <View>
                            <View style={styles.fbAuthorRow}>
                              <Text style={styles.fbAuthorName}>
                                {fb.studentName || 'Student'}
                              </Text>
                              {fb.studentRollNo ? (
                                <Text style={styles.fbRollNo}>({toNewRollNo(fb.studentRollNo)})</Text>
                              ) : null}
                              {fb.isAnonymous && (
                                <View style={styles.anonymousBadge}>
                                  <Text style={styles.anonymousBadgeText}>Posted Anonymously</Text>
                                </View>
                              )}
                              <View style={styles.fbBatchBadge}>
                                <Text style={styles.fbBatchText}>Batch {fb.batch}</Text>
                              </View>
                            </View>
                            <Text style={styles.fbDate}>
                              {fb.studentDob ? `DOB: ${fb.studentDob} • ` : ''}{new Date(fb.createdAt).toLocaleDateString('en-GB')} • {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </Text>
                          </View>

                          {/* Status Badge (Tap to toggle status) */}
                          <TouchableOpacity
                            onPress={() => handleStatusToggle(fb)}
                            style={[
                              styles.statusBadge,
                              fb.status === 'NEW'
                                ? styles.statusNew
                                : fb.status === 'REVIEWED'
                                ? styles.statusReviewed
                                : styles.statusResolved,
                            ]}
                          >
                            <Text style={styles.statusText}>{fb.status}</Text>
                          </TouchableOpacity>
                        </View>

                        {/* Rating Stars & Category Pill */}
                        <View style={styles.fbMetaRow}>
                          <View style={styles.fbRatingStars}>
                            {[...Array(fb.rating)].map((_, i) => (
                              <Text key={i} style={styles.fbStar}>*</Text>
                            ))}
                          </View>
                          <View style={styles.categoryPill}>
                            <Text style={styles.categoryPillText}>
                              {fb.category === 'FEATURE'
                                ? 'Feature Request'
                                : fb.category === 'SCHEDULE'
                                ? 'Schedule Correction'
                                : fb.category === 'BUG'
                                ? 'Bug Report'
                                : 'General'}
                            </Text>
                          </View>
                        </View>

                        {/* Message Body */}
                        <Text style={styles.fbMessage}>{fb.message}</Text>

                        {/* Admin Reply Section */}
                        {fb.adminReply ? (
                          <View style={styles.adminReplyCard}>
                            <View style={styles.adminReplyHeader}>
                              <Text style={styles.adminReplyLabel}>Admin Official Reply</Text>
                              {fb.repliedAt && (
                                <Text style={styles.adminReplyDate}>
                                  {new Date(fb.repliedAt).toLocaleDateString('en-GB')}
                                </Text>
                              )}
                            </View>
                            <Text style={styles.adminReplyBody}>{fb.adminReply}</Text>
                          </View>
                        ) : null}

                        {/* Action Row */}
                        <View style={styles.fbCardActionsRow}>
                          <TouchableOpacity
                            style={styles.deleteActionBtn}
                            onPress={() => handleDeleteFeedback(fb)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.deleteActionBtnText}>Delete</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.replyActionBtn}
                            onPress={() => handleOpenReplyModal(fb)}
                            activeOpacity={0.7}
                          >
                            <Text style={styles.replyActionBtnText}>
                              {fb.adminReply ? 'Edit Reply' : 'Reply to Student'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  )}
                </>
              )}

              {/* Student Activity & Feature Usage Tab */}
              {activeTab === 'STUDENTS' && (() => {
                const nowMs = Date.now();
                const isStudentLive = (st: StudentActivityRecord) => {
                  if (!st.lastActiveAt) return false;
                  const diffMins = (nowMs - new Date(st.lastActiveAt).getTime()) / (1000 * 60);
                  return diffMins <= 5;
                };

                const liveStudentsCount = studentActivities.filter(isStudentLive).length;

                const filteredList = studentActivities.filter((rec) => {
                  const matchBatch = selectedBatchFilter === 'ALL' || rec.batch === selectedBatchFilter;
                  const matchLive = !liveOnlyFilter || isStudentLive(rec);
                  const query = studentSearch.trim().toLowerCase();
                  const matchSearch =
                    !query ||
                    toNewRollNo(rec.rollNo).toLowerCase().includes(query) ||
                    toOldRollNo(rec.rollNo).toLowerCase().includes(query) ||
                    rec.name.toLowerCase().includes(query);
                  return matchBatch && matchLive && matchSearch;
                });

                const totalMinutesCohort = studentActivities.reduce(
                  (sum, s) => sum + (s.totalTimeMinutes || 0),
                  0
                );
                const totalHoursCohort = (totalMinutesCohort / 60).toFixed(1);

                return (
                  <>
                    {/* Top Aggregate Header */}
                    <View style={styles.metricsGrid}>
                      <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Total Time Spent</Text>
                        <Text style={styles.metricValue}>
                          {totalHoursCohort} <Text style={styles.metricSubValue}>hrs</Text>
                        </Text>
                        <View style={styles.metricBadge}>
                          <Text style={styles.metricBadgeText}>Cohort Foreground Usage</Text>
                        </View>
                      </View>

                      <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Live In App Now</Text>
                        <Text style={[styles.metricValue, { color: '#10B981' }]}>
                          {liveStudentsCount} <Text style={styles.metricSubValue}>online</Text>
                        </Text>
                        <View style={styles.metricBadgeGreen}>
                          <Text style={styles.metricBadgeGreenText}>Active in last 5m</Text>
                        </View>
                      </View>

                      <View style={styles.metricCard}>
                        <Text style={styles.metricLabel}>Tracked Students</Text>
                        <Text style={styles.metricValue}>
                          {studentActivities.length} <Text style={styles.metricSubValue}>/ 252</Text>
                        </Text>
                        <View style={styles.metricBadge}>
                          <Text style={styles.metricBadgeText}>Across Batches A, B, C, D</Text>
                        </View>
                      </View>
                    </View>

                    {/* Search & Batch Filter Bar */}
                    <View style={styles.studentFilterSection}>
                      <View style={styles.studentSearchBox}>
                        <TextInput
                          style={styles.studentSearchInput}
                          placeholder="Search student by name or roll no..."
                          placeholderTextColor="#64748B"
                          value={studentSearch}
                          onChangeText={setStudentSearch}
                        />
                        {studentSearch.length > 0 && (
                          <TouchableOpacity onPress={() => setStudentSearch('')}>
                            <Text style={styles.clearSearchText}>X</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.batchFiltersRow}>
                        {/* Live Now Filter Pill */}
                        <TouchableOpacity
                          style={[
                            styles.liveFilterPill,
                            liveOnlyFilter && styles.liveFilterPillActive,
                          ]}
                          onPress={() => setLiveOnlyFilter(!liveOnlyFilter)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.liveIndicatorDot} />
                          <Text
                            style={[
                              styles.liveFilterText,
                              liveOnlyFilter && styles.liveFilterTextActive,
                            ]}
                          >
                            Live Now ({liveStudentsCount})
                          </Text>
                        </TouchableOpacity>

                        {(['ALL', 'A', 'B', 'C', 'D'] as const).map((b) => (
                          <TouchableOpacity
                            key={b}
                            style={[
                              styles.batchFilterPill,
                              selectedBatchFilter === b && styles.batchFilterPillActive,
                            ]}
                            onPress={() => setSelectedBatchFilter(b)}
                          >
                            <Text
                              style={[
                                styles.batchFilterText,
                                selectedBatchFilter === b && styles.batchFilterTextActive,
                              ]}
                            >
                              {b === 'ALL' ? 'All Batches' : `Batch ${b}`}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Student List */}
                    <View style={styles.studentListHeaderRow}>
                      <Text style={styles.studentListTitle}>
                        Student Leaderboard ({filteredList.length})
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <TouchableOpacity onPress={handleResetAnalytics} style={styles.resetBtn}>
                          <Text style={styles.resetBtnText}>Reset Stats</Text>
                        </TouchableOpacity>
                        <Text style={styles.studentListSubTitle}>Tap for feature breakdown</Text>
                      </View>
                    </View>

                    {filteredList.length === 0 ? (
                      <View style={styles.emptyCard}>
                        <Text style={styles.emptyTitle}>No matching students found</Text>
                        <Text style={styles.emptySub}>
                          Try adjusting your roll number, name, or batch filter.
                        </Text>
                      </View>
                    ) : (
                      filteredList.map((st, index) => {
                        const hours = Math.floor((st.totalTimeMinutes || 0) / 60);
                        const mins = (st.totalTimeMinutes || 0) % 60;
                        const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

                        const todayHours = Math.floor((st.todayTimeMinutes || 0) / 60);
                        const todayMins = (st.todayTimeMinutes || 0) % 60;
                        const todayTimeStr = todayHours > 0 ? `${todayHours}h ${todayMins}m` : `${todayMins}m`;

                        // Find top used feature
                        const feat = st.featureUsage || {
                          hourlyTrack: 0,
                          timetable: 0,
                          calendar: 0,
                          erpSync: 0,
                          medicalVault: 0,
                          digitalId: 0,
                          coursePlan: 0,
                          notices: 0,
                        };

                        const featRank = [
                          { name: 'Live Tracker', count: feat.hourlyTrack || 0 },
                          { name: 'Timetable', count: feat.timetable || 0 },
                          { name: 'Calendar', count: feat.calendar || 0 },
                          { name: 'ERP Reconcile', count: feat.erpSync || 0 },
                          { name: 'Medical Vault', count: feat.medicalVault || 0 },
                          { name: 'Digital ID', count: feat.digitalId || 0 },
                          { name: 'Course Plan', count: feat.coursePlan || 0 },
                        ].sort((a, b) => b.count - a.count);

                        const topFeat = featRank[0] && featRank[0].count > 0 ? featRank[0] : null;

                        return (
                          <TouchableOpacity
                            key={st.rollNo}
                            style={styles.studentCard}
                            activeOpacity={0.7}
                            onPress={() => setSelectedStudentDrilldown(st)}
                          >
                            <View style={styles.studentCardRank}>
                              <Text style={styles.studentRankText}>#{index + 1}</Text>
                            </View>

                            <View style={styles.studentCardInfo}>
                              <View style={styles.studentNameRow}>
                                <Text style={styles.studentCardName} numberOfLines={1}>
                                  {st.name}
                                </Text>
                                <View style={styles.batchBadgeSmall}>
                                  <Text style={styles.batchBadgeTextSmall}>Batch {st.batch}</Text>
                                </View>
                                {isStudentLive(st) && (
                                  <View style={styles.liveNowBadge}>
                                    <View style={styles.liveNowDot} />
                                    <Text style={styles.liveNowBadgeText}>LIVE</Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.studentCardRoll}>{toNewRollNo(st.rollNo)}</Text>

                              {topFeat && (
                                <View style={styles.topFeatRow}>
                                  <Text style={styles.topFeatText}>
                                    Top: {topFeat.name} ({topFeat.count}x)
                                  </Text>
                                </View>
                              )}
                            </View>

                            <View style={styles.studentCardTimes}>
                              <Text style={styles.studentTotalTime}>{timeStr}</Text>
                              <Text style={styles.studentTodayTime}>Today: {todayTimeStr}</Text>
                              <Text style={styles.drilldownHint}>Inspect -&gt;</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </>
                );
              })()}

              {/* AI Operations & MCU Fleet Control Tab */}
              {activeTab === 'AI_OPERATIONS' && (() => {
                const edithOverview = EdithSupervisor.getSystemSupervisionOverview();

                return (
                  <View style={{ marginBottom: 40 }}>
                    {/* Header Banner */}
                    <View style={styles.aiHeaderCard}>
                      <Text style={styles.aiHeaderTitle}>MCU AI Intelligence Grid</Text>
                      <Text style={styles.aiHeaderSubtitle}>
                        Autonomous testing, root cause diagnosis, UX maintenance, isolation oversight, and cloud updates.
                      </Text>
                    </View>

                    {/* Section 1: E.D.I.T.H. Supervisory Grid */}
                    <View style={styles.sectionCard}>
                      <View style={styles.aiSectionTitleRow}>
                        <View style={[styles.aiDot, { backgroundColor: '#38BDF8' }]} />
                        <Text style={styles.sectionTitle}>E.D.I.T.H. Security & Oversight</Text>
                      </View>
                      <Text style={styles.sectionSub}>
                        {edithOverview.enforcementPolicy}
                      </Text>

                      <View style={styles.aiFleetGrid}>
                        {edithOverview.aiFleet.map((ai) => (
                          <View key={ai.service} style={styles.aiFleetItem}>
                            <Text style={styles.aiFleetName}>{ai.service}</Text>
                            <View style={styles.aiStatusPill}>
                              <Text style={styles.aiStatusText}>{ai.status}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Section 2: Ultron & Jarvis (Vulnerability Hunter & Auto-Fixer) */}
                    <View style={styles.sectionCard}>
                      <View style={styles.aiSectionTitleRow}>
                        <View style={[styles.aiDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.sectionTitle}>Ultron (Villain) & J.A.R.V.I.S. (Hero)</Text>
                      </View>
                      <Text style={styles.sectionSub}>
                        Ultron aggressively probes all app options to find vulnerabilities. Jarvis automatically patches them.
                      </Text>

                      <View style={styles.aiActionRow}>
                        <TouchableOpacity
                          style={[styles.aiBtn, { backgroundColor: '#EF4444' }]}
                          onPress={handleRunUltronScan}
                          disabled={isAiScanning}
                        >
                          <Text style={styles.aiBtnText}>
                            {isAiScanning ? 'Ultron Testing System...' : '1. Run Ultron Vulnerability Scan'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.aiBtn, { backgroundColor: '#10B981' }]}
                          onPress={handleRunJarvisFix}
                          disabled={isAiFixing || isAiScanning}
                        >
                          <Text style={styles.aiBtnText}>
                            {isAiFixing ? 'Jarvis Patching...' : '2. Deploy J.A.R.V.I.S. Auto-Fix'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {scanProgress && (
                        <View style={[styles.aiResultBox, { borderColor: '#EF4444', backgroundColor: '#1F1116' }]}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={[styles.aiResultTitle, { color: '#F87171' }]}>{scanProgress.phase}</Text>
                            <Text style={{ color: '#F87171', fontWeight: '800', fontSize: 12 }}>{scanProgress.percent}%</Text>
                          </View>
                          <View style={{ height: 6, backgroundColor: '#371B20', borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
                            <View style={{ width: `${scanProgress.percent}%`, height: '100%', backgroundColor: '#EF4444' }} />
                          </View>
                          <Text style={{ color: '#FECACA', fontSize: 11, fontStyle: 'italic' }}>
                            {scanProgress.currentTest}
                          </Text>
                        </View>
                      )}

                      {ultronReport && (
                        <View style={styles.aiResultBox}>
                          <Text style={styles.aiResultTitle}>Latest Ultron Threat Assessment:</Text>
                          <Text style={styles.aiResultDesc}>{ultronReport.threatAssessment}</Text>
                          <Text style={styles.aiResultMeta}>
                            Vulnerabilities Found: {ultronReport.totalVulnerabilitiesFound} | Critical: {ultronReport.criticalCount}
                          </Text>

                          {ultronReport.vulnerabilities.map((v) => (
                            <View key={v.id} style={styles.vulnItem}>
                              <View style={styles.vulnTop}>
                                <Text style={styles.vulnId}>[{v.id}] {v.target}</Text>
                                <Text style={[styles.vulnSeverity, v.fixed ? { color: '#10B981' } : { color: '#EF4444' }]}>
                                  {v.fixed ? 'RESOLVED BY JARVIS' : v.severity}
                                </Text>
                              </View>
                              <Text style={styles.vulnDesc}>{v.description}</Text>
                              <Text style={styles.vulnRec}>Fix: {v.fixRecommendation}</Text>
                            </View>
                          ))}
                        </View>
                      )}

                      {jarvisReport && (
                        <View style={[styles.aiResultBox, { borderColor: '#10B981', marginTop: 12 }]}>
                          <Text style={[styles.aiResultTitle, { color: '#10B981' }]}>Jarvis Remediation Log:</Text>
                          <Text style={styles.aiResultDesc}>
                            Status: {jarvisReport.status} | Repaired: {jarvisReport.fixedCount} items.
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Section 3: Friday (Root Cause Analyzer) */}
                    <View style={styles.sectionCard}>
                      <View style={styles.aiSectionTitleRow}>
                        <View style={[styles.aiDot, { backgroundColor: '#8B5CF6' }]} />
                        <Text style={styles.sectionTitle}>F.R.I.D.A.Y. Root Cause Diagnostics</Text>
                      </View>
                      <Text style={styles.sectionSub}>
                        Friday traces the technical origin of every glitch and communicates directly with Edith.
                      </Text>

                      {fridayDiagnoses.length === 0 ? (
                        <Text style={styles.aiEmptyText}>
                          No active diagnostics. Run an Ultron scan above to trigger Friday root-cause analysis.
                        </Text>
                      ) : (
                        fridayDiagnoses.map((diag) => (
                          <View key={diag.diagnosisId} style={styles.diagItem}>
                            <Text style={styles.diagTitle}>Module: {diag.sourceModule}</Text>
                            <Text style={styles.diagCause}>Root Cause: {diag.rootCause}</Text>
                            <Text style={styles.diagFix}>Prevention: {diag.preventionStrategy}</Text>
                          </View>
                        ))
                      )}
                    </View>

                    {/* Section 4: DUM-E & U (Maintenance & UX Ease-of-Use) */}
                    <View style={styles.sectionCard}>
                      <View style={styles.aiSectionTitleRow}>
                        <View style={[styles.aiDot, { backgroundColor: '#F59E0B' }]} />
                        <Text style={styles.sectionTitle}>D.U.M.-E. & U. Maintenance & UX</Text>
                      </View>
                      <Text style={styles.sectionSub}>
                        Monitors student navigation ease, identifies user friction, and recommends improvements.
                      </Text>

                      <TouchableOpacity
                        style={[styles.aiBtn, { backgroundColor: '#F59E0B' }]}
                        onPress={handleRunDumeMaintenance}
                      >
                        <Text style={styles.aiBtnText}>Run DUM-E & U UX Analysis</Text>
                      </TouchableOpacity>

                      {dumeReport && (
                        <View style={styles.aiResultBox}>
                          <Text style={styles.aiResultTitle}>
                            Ease of Use Score: {dumeReport.easeOfUseScore}/100
                          </Text>
                          <Text style={styles.aiResultDesc}>
                            Monitored {dumeReport.totalStudentsMonitored} students | Avg Session: {dumeReport.averageActiveTimeMinutes} mins
                          </Text>

                          <Text style={[styles.aiResultTitle, { marginTop: 10, fontSize: 13 }]}>
                            Recommendations for Improvement:
                          </Text>
                          {dumeReport.recommendations.map((rec) => (
                            <View key={rec.id} style={styles.recItem}>
                              <Text style={styles.recFeature}>{rec.feature} ({rec.priority} Priority)</Text>
                              <Text style={styles.recIssue}>Issue: {rec.issueObserved}</Text>
                              <Text style={styles.recAdvice}>Fix: {rec.recommendedImprovement}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>

                    {/* Section 5: Miss Minutes (Nightly 9:00 PM Cloud Sync) */}
                    <View style={styles.sectionCard}>
                      <View style={styles.aiSectionTitleRow}>
                        <View style={[styles.aiDot, { backgroundColor: '#EC4899' }]} />
                        <Text style={styles.sectionTitle}>Miss Minutes Scheduled Cloud Update</Text>
                      </View>
                      <Text style={styles.sectionSub}>
                        Automated protocol: Syncs every day's attendance to the cloud at 9:00 PM, Monday through Saturday.
                      </Text>

                      <TouchableOpacity
                        style={[styles.aiBtn, { backgroundColor: '#EC4899' }]}
                        onPress={handleRunMissMinutes}
                        disabled={isMinutesSyncing}
                      >
                        <Text style={styles.aiBtnText}>
                          {isMinutesSyncing ? 'Syncing Cloud...' : 'Trigger Miss Minutes Daily Protocol'}
                        </Text>
                      </TouchableOpacity>

                      {missMinutesLog && (
                        <View style={styles.aiResultBox}>
                          <Text style={styles.aiResultTitle}>
                            Protocol Status: {missMinutesLog.status} ({missMinutesLog.dayOfWeek})
                          </Text>
                          <Text style={styles.aiResultDesc}>{missMinutesLog.details}</Text>
                          <Text style={styles.aiResultMeta}>
                            Records Synced: {missMinutesLog.uploadedRecordsCount} | Schedule: {missMinutesLog.scheduledTime}
                          </Text>
                        </View>
                      )}

                      {/* List of Students Who Marked Attendance in the App */}
                      <View style={{ marginTop: 16 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                          <Text style={{ fontSize: 13, fontWeight: '700', color: '#F8FAFC' }}>
                            Students Marked Attendance in App ({markedAttendanceStudents.length})
                          </Text>
                          <Text style={{ fontSize: 11, color: '#94A3B8' }}>Synced via Miss Minutes</Text>
                        </View>

                        {markedAttendanceStudents.length === 0 ? (
                          <View style={{ padding: 14, backgroundColor: 'rgba(30, 41, 59, 0.5)', borderRadius: 8, borderWidth: 1, borderColor: '#334155', alignItems: 'center' }}>
                            <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                              No student attendance recordings detected yet today.
                            </Text>
                          </View>
                        ) : (
                          <View style={{ gap: 8 }}>
                            {markedAttendanceStudents.map((st, sIdx) => (
                              <View
                                key={st.rollNo}
                                style={{
                                  backgroundColor: 'rgba(30, 41, 59, 0.7)',
                                  padding: 12,
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: '#334155',
                                  flexDirection: 'row',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                }}
                              >
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                                  <View
                                    style={{
                                      width: 26,
                                      height: 26,
                                      borderRadius: 13,
                                      backgroundColor: 'rgba(236, 72, 153, 0.2)',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                    }}
                                  >
                                    <Text style={{ color: '#EC4899', fontSize: 11, fontWeight: '700' }}>
                                      {sIdx + 1}
                                    </Text>
                                  </View>

                                  <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                      <Text style={{ color: '#F8FAFC', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                                        {st.name}
                                      </Text>
                                      <View
                                        style={{
                                          paddingHorizontal: 6,
                                          paddingVertical: 1,
                                          borderRadius: 4,
                                          backgroundColor: 'rgba(56, 189, 248, 0.15)',
                                        }}
                                      >
                                        <Text style={{ color: '#38BDF8', fontSize: 10, fontWeight: '700' }}>
                                          Batch {st.batch}
                                        </Text>
                                      </View>
                                    </View>
                                    <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 1 }}>
                                      Roll No: {toNewRollNo(st.rollNo)}
                                      {st.subjectsCount > 0 ? ` • ${st.subjectsCount} subjects active` : ''}
                                    </Text>
                                  </View>
                                </View>

                                <View style={{ alignItems: 'flex-end' }}>
                                  <View
                                    style={{
                                      backgroundColor: 'rgba(16, 185, 129, 0.15)',
                                      paddingHorizontal: 8,
                                      paddingVertical: 4,
                                      borderRadius: 6,
                                      borderWidth: 1,
                                      borderColor: 'rgba(16, 185, 129, 0.3)',
                                    }}
                                  >
                                    <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700' }}>
                                      {st.totalHoursMarked} hrs marked
                                    </Text>
                                  </View>
                                  {st.lastMarkedAt && (
                                    <Text style={{ color: '#64748B', fontSize: 10, marginTop: 2 }}>
                                      {new Date(st.lastMarkedAt).toLocaleDateString('en-GB')}
                                    </Text>
                                  )}
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                );
              })()}
            </ScrollView>

            {/* Individual Student Feature Drilldown Modal */}
            <Modal
              visible={!!selectedStudentDrilldown}
              transparent
              animationType="fade"
              onRequestClose={() => setSelectedStudentDrilldown(null)}
            >
              <View style={styles.drilldownOverlay}>
                <View style={styles.drilldownCard}>
                  {selectedStudentDrilldown && (() => {
                    const st = selectedStudentDrilldown;
                    const hours = Math.floor((st.totalTimeMinutes || 0) / 60);
                    const mins = (st.totalTimeMinutes || 0) % 60;
                    const timeStr = hours > 0 ? `${hours} hrs ${mins} mins` : `${mins} mins`;

                    const feat = st.featureUsage || {
                      hourlyTrack: 0,
                      timetable: 0,
                      calendar: 0,
                      erpSync: 0,
                      medicalVault: 0,
                      digitalId: 0,
                      coursePlan: 0,
                      notices: 0,
                    };

                    const totalActions = Object.values(feat).reduce((a, b) => a + b, 0) || 1;

                    const breakdown = [
                      { name: 'Hourly Live Attendance Tracker', count: feat.hourlyTrack || 0, color: '#38BDF8' },
                      { name: 'Weekly Timetable & Period Slots', count: feat.timetable || 0, color: '#818CF8' },
                      { name: 'Academic Calendar & Holidays', count: feat.calendar || 0, color: '#10B981' },
                      { name: 'ERP Studzone & Moodle Sync', count: feat.erpSync || 0, color: '#F59E0B' },
                      { name: 'Medical Vault & Claims (65%)', count: feat.medicalVault || 0, color: '#EC4899' },
                      { name: 'Digital ID & Barcode Card', count: feat.digitalId || 0, color: '#A855F7' },
                      { name: 'Course Plans & Syllabus', count: feat.coursePlan || 0, color: '#06B6D4' },
                      { name: 'PSGIM Connect Notices', count: feat.notices || 0, color: '#F97316' },
                    ];

                    return (
                      <>
                        <View style={styles.drilldownHeader}>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.drilldownName}>{st.name}</Text>
                            <Text style={styles.drilldownSub}>
                              Roll No: {toNewRollNo(st.rollNo)} • Batch {st.batch}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => setSelectedStudentDrilldown(null)}
                            style={styles.closeDrilldownBtn}
                          >
                            <Text style={styles.closeDrilldownText}>X</Text>
                          </TouchableOpacity>
                        </View>

                        <View style={styles.drilldownTimeBanner}>
                          <View style={styles.timeBannerItem}>
                            <Text style={styles.timeBannerLabel}>Total Active Time</Text>
                            <Text style={styles.timeBannerValue}>{timeStr}</Text>
                          </View>
                          <View style={styles.timeBannerDivider} />
                          <View style={styles.timeBannerItem}>
                            <Text style={styles.timeBannerLabel}>Sessions Logged</Text>
                            <Text style={styles.timeBannerValue}>{st.totalSessions || 1} logins</Text>
                          </View>
                        </View>

                        <Text style={styles.featureBreakdownTitle}>Features Used Breakdown:</Text>

                        <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                          {breakdown.map((item) => {
                            const pct = Math.round((item.count / totalActions) * 100);
                            return (
                              <View key={item.name} style={styles.featureItemRow}>
                                <View style={styles.featureItemTop}>
                                  <Text style={styles.featureItemName}>
                                    {item.name}
                                  </Text>
                                  <Text style={styles.featureItemCount}>
                                    {item.count}x ({pct}%)
                                  </Text>
                                </View>
                                <View style={styles.featureProgressBarBg}>
                                  <View
                                    style={[
                                      styles.featureProgressBarFill,
                                      { width: `${pct}%`, backgroundColor: item.color },
                                    ]}
                                  />
                                </View>
                              </View>
                            );
                          })}
                        </ScrollView>
                      </>
                    );
                  })()}
                </View>
              </View>
            </Modal>

            {/* Admin Reply Modal */}
            <Modal
              visible={!!replyingFeedback}
              transparent
              animationType="fade"
              onRequestClose={() => setReplyingFeedback(null)}
            >
              <View style={styles.drilldownOverlay}>
                <View style={styles.replyModalCard}>
                  {replyingFeedback && (
                    <>
                      <View style={styles.drilldownHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.drilldownName}>
                            Reply to {replyingFeedback.studentName}
                          </Text>
                          <Text style={styles.drilldownSub}>
                            {replyingFeedback.studentRollNo ? `Roll No: ${toNewRollNo(replyingFeedback.studentRollNo)} • ` : ''}Batch {replyingFeedback.batch} • {replyingFeedback.category}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setReplyingFeedback(null)}
                          style={styles.closeDrilldownBtn}
                        >
                          <Text style={styles.closeDrilldownText}>X</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Original Feedback Quote */}
                      <View style={styles.feedbackQuoteBox}>
                        <Text style={styles.feedbackQuoteLabel}>Student Feedback:</Text>
                        <Text style={styles.feedbackQuoteText}>{replyingFeedback.message}</Text>
                      </View>

                      {/* Reply Input */}
                      <Text style={styles.replyInputLabel}>YOUR OFFICIAL REPLY</Text>
                      <TextInput
                        style={styles.replyTextInput}
                        placeholder="Type your official response to this student..."
                        placeholderTextColor="#64748B"
                        value={replyInput}
                        onChangeText={setReplyInput}
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                      />

                      {/* Send Actions */}
                      <View style={styles.replyModalActions}>
                        <TouchableOpacity
                          style={[styles.replyBtnSecondary, isSendingReply && styles.btnDisabled]}
                          onPress={() => handleSendReply(false)}
                          disabled={isSendingReply}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.replyBtnSecondaryText}>
                            {isSendingReply ? 'Saving...' : 'Send as Reviewed'}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.replyBtnPrimary, isSendingReply && styles.btnDisabled]}
                          onPress={() => handleSendReply(true)}
                          disabled={isSendingReply}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.replyBtnPrimaryText}>
                            {isSendingReply ? 'Saving...' : 'Send & Mark Resolved'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </>
                  )}
                </View>
              </View>
            </Modal>

            {/* Secondary Confirmation Modal */}
            <Modal
              visible={confirmModalConfig.visible}
              transparent
              animationType="fade"
              onRequestClose={() => {
                if (!isPerformingAction) {
                  setConfirmModalConfig((prev) => ({ ...prev, visible: false }));
                }
              }}
            >
              <View style={styles.confirmOverlay}>
                <View style={styles.confirmModalCard}>
                  <View style={styles.confirmBadgeBox}>
                    <Text style={styles.confirmBadgeText}>ACTION CONFIRMATION</Text>
                  </View>

                  <Text style={styles.confirmTitleText}>{confirmModalConfig.title}</Text>
                  <Text style={styles.confirmDescriptionText}>
                    {confirmModalConfig.description}
                  </Text>

                  <View style={styles.confirmActionsRow}>
                    <TouchableOpacity
                      style={styles.confirmCancelBtn}
                      onPress={() => setConfirmModalConfig((prev) => ({ ...prev, visible: false }))}
                      disabled={isPerformingAction}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.confirmCancelBtnText}>Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.confirmExecuteBtn,
                        { backgroundColor: confirmModalConfig.actionColor },
                        isPerformingAction && styles.btnDisabled,
                      ]}
                      onPress={confirmModalConfig.onConfirm}
                      disabled={isPerformingAction}
                      activeOpacity={0.8}
                    >
                      {isPerformingAction ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <Text style={styles.confirmExecuteBtnText}>
                          {confirmModalConfig.actionLabel}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}

      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    maxWidth: 240,
  },
  exitBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  exitBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  pinGateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  pinCard: {
    backgroundColor: '#1E293B',
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  lockBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  lockText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  lockIcon: {
    fontSize: 32,
  },
  pinTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  pinSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    padding: 8,
    width: '100%',
    marginBottom: 14,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  pinWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    width: '100%',
    marginBottom: 16,
    paddingHorizontal: 12,
  },
  pinInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  showPinBtn: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  showPinText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  unlockBtn: {
    backgroundColor: '#2563EB',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dashboardBody: {
    flex: 1,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    padding: 6,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  switchTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  switchTabActive: {
    backgroundColor: '#2563EB',
  },
  switchTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  switchTabTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '800',
  },
  metricSubValue: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  metricBadge: {
    backgroundColor: '#0C4A6E',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  metricBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  metricBadgeGreen: {
    backgroundColor: '#064E3B',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  metricBadgeGreenText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  resetBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  resetBtnText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  batchRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  batchPill: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  batchLetter: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  batchCount: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  featureRankItem: {
    marginBottom: 14,
  },
  featureTopLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureTitleCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureRankNum: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '800',
  },
  featureIconText: {
    fontSize: 14,
  },
  featureName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  featureCountText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: '#0F172A',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  replyStatusRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  replyStatusPill: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  replyStatusPillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  replyStatusPillRepliedActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.25)',
    borderColor: '#10B981',
  },
  replyStatusPillPendingActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.25)',
    borderColor: '#EAB308',
  },
  replyStatusPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  replyStatusPillTextActive: {
    color: '#0F172A',
    fontWeight: '800',
  },
  replyStatusPillRepliedTextActive: {
    color: '#34D399',
    fontWeight: '800',
  },
  replyStatusPillPendingTextActive: {
    color: '#FDE047',
    fontWeight: '800',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  feedbackCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fbHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  fbAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  fbAuthorName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
  },
  fbRollNo: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  fbBatchBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  fbBatchText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
  },
  anonymousBadge: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  anonymousBadgeText: {
    color: '#FDE047',
    fontSize: 9,
    fontWeight: '700',
  },
  fbDate: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusNew: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  statusReviewed: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  statusResolved: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  fbMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fbRatingStars: {
    flexDirection: 'row',
  },
  fbStar: {
    color: '#FBBF24',
    fontSize: 14,
  },
  categoryPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  categoryPillText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  fbMessage: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },

  // ── Student Activity & Telemetry Styles ─────────────────────────
  studentFilterSection: {
    marginBottom: 16,
    gap: 10,
  },
  studentSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#334155',
    height: 44,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  studentSearchInput: {
    flex: 1,
    color: '#F8FAFC',
    fontSize: 13,
  },
  clearSearchText: {
    color: '#94A3B8',
    fontSize: 14,
    paddingHorizontal: 6,
  },
  batchFiltersRow: {
    flexDirection: 'row',
    gap: 8,
  },
  batchFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  batchFilterPillActive: {
    backgroundColor: '#38BDF8',
    borderColor: '#38BDF8',
  },
  batchFilterText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  batchFilterTextActive: {
    color: '#0F172A',
  },
  liveFilterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#059669',
  },
  liveFilterPillActive: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  liveFilterText: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '700',
  },
  liveFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  liveIndicatorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  liveNowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveNowBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  studentListHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  studentListTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  studentListSubTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  studentCardRank: {
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentRankText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
  },
  studentCardInfo: {
    flex: 1,
    marginLeft: 8,
  },
  studentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  studentCardName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    flexShrink: 1,
  },
  batchBadgeSmall: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  batchBadgeTextSmall: {
    color: '#38BDF8',
    fontSize: 9.5,
    fontWeight: '800',
  },
  studentCardRoll: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  topFeatRow: {
    marginTop: 4,
  },
  topFeatText: {
    color: '#A5B4FC',
    fontSize: 10.5,
    fontWeight: '600',
  },
  studentCardTimes: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  studentTotalTime: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '800',
  },
  studentTodayTime: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  drilldownHint: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },

  // ── Drilldown Modal Styles ─────────────────────────────────────────
  drilldownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  drilldownCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  drilldownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  drilldownName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  drilldownSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  closeDrilldownBtn: {
    padding: 6,
  },
  closeDrilldownText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  drilldownTimeBanner: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timeBannerItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeBannerDivider: {
    width: 1,
    backgroundColor: '#334155',
  },
  timeBannerLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  timeBannerValue: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 2,
  },
  featureBreakdownTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  featureItemRow: {
    marginBottom: 10,
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
  },
  featureItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureItemName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  featureItemCount: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  featureProgressBarBg: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  featureProgressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  adminReplyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  adminReplyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  adminReplyLabel: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  adminReplyDate: {
    color: '#64748B',
    fontSize: 10,
  },
  adminReplyBody: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 17,
  },
  fbCardActionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
  deleteActionBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  deleteActionBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  replyActionBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  replyActionBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  replyModalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 20,
    width: '92%',
    maxWidth: 540,
    borderWidth: 1,
    borderColor: '#334155',
  },
  feedbackQuoteBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#64748B',
  },
  feedbackQuoteLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  feedbackQuoteText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontStyle: 'italic',
  },
  replyInputLabel: {
    color: '#94A3B8',
    fontSize: 10.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  replyTextInput: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    padding: 12,
    color: '#F8FAFC',
    fontSize: 13,
    minHeight: 100,
    marginBottom: 16,
  },
  replyModalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  replyBtnSecondary: {
    backgroundColor: '#334155',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtnSecondaryText: {
    color: '#F1F5F9',
    fontSize: 12,
    fontWeight: '700',
  },
  replyBtnPrimary: {
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  replyBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.5,
  },

  // Live Attendance Master Controls Styles
  masterControlCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  masterControlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masterControlTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  masterControlSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  masterStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  masterStatusBadgeOpen: {
    backgroundColor: '#064E3B',
    borderColor: '#10B981',
  },
  masterStatusBadgeLocked: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  masterStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  masterStatusDotOpen: {
    backgroundColor: '#34D399',
  },
  masterStatusDotLocked: {
    backgroundColor: '#F87171',
  },
  masterStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  masterStatusTextOpen: {
    color: '#34D399',
  },
  masterStatusTextLocked: {
    color: '#FCA5A5',
  },
  toggleArrowText: {
    color: '#94A3B8',
    fontSize: 10,
    marginLeft: 6,
  },
  masterControlsBody: {
    marginTop: 16,
    gap: 12,
  },
  controlActionBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  actionBlockHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  actionBlockNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  actionBlockNumberText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
  },
  actionBlockTitle: {
    color: '#F1F5F9',
    fontSize: 13,
    fontWeight: '700',
  },
  actionBlockDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2,
  },
  actionButton: {
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonGreen: {
    backgroundColor: '#059669',
  },
  actionButtonRed: {
    backgroundColor: '#DC2626',
  },
  actionButtonPurple: {
    backgroundColor: '#7C3AED',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  timerPresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  timerPresetBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  timerPresetBtnActive: {
    backgroundColor: '#0369A1',
    borderColor: '#38BDF8',
  },
  timerPresetBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  timerPresetBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  customTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customTimerInput: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    width: 60,
    textAlign: 'center',
  },
  timerUnitText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  startCustomTimerBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startCustomTimerBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Secondary Confirmation Modal Styles
  confirmOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 22,
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderColor: '#334155',
  },
  confirmBadgeBox: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
    marginBottom: 12,
  },
  confirmBadgeText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  confirmTitleText: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: 10,
  },
  confirmDescriptionText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 20,
  },
  confirmActionsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  confirmCancelBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmCancelBtnText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  confirmExecuteBtn: {
    flex: 1.6,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmExecuteBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  aiHeaderCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  aiHeaderTitle: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  aiHeaderSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
  },
  aiSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  aiDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  aiFleetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  aiFleetItem: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    minWidth: 95,
    flex: 1,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  aiFleetName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  aiStatusPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aiStatusText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  aiActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  aiBtn: {
    flex: 1,
    minWidth: 160,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  aiBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  aiResultBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  aiResultTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  aiResultDesc: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 6,
  },
  aiResultMeta: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 8,
  },
  aiEmptyText: {
    color: '#64748B',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 8,
  },
  vulnItem: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  vulnTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  vulnId: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  vulnSeverity: {
    fontSize: 10,
    fontWeight: '800',
    marginLeft: 6,
  },
  vulnDesc: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
  },
  vulnRec: {
    color: '#38BDF8',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  diagItem: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  diagTitle: {
    color: '#A78BFA',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  diagCause: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
  },
  diagFix: {
    color: '#34D399',
    fontSize: 11,
    lineHeight: 16,
  },
  recItem: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
  },
  recFeature: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  recIssue: {
    color: '#CBD5E1',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 2,
  },
  recAdvice: {
    color: '#38BDF8',
    fontSize: 11,
    lineHeight: 16,
  },
});

