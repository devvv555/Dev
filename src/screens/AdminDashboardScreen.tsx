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
} from 'react-native';
import { FeatureUsageStats, StudentFeedback, FeedbackCategory } from '../types';
import { AnalyticsService } from '../services/analyticsService';
import { FeedbackService } from '../services/feedbackService';

interface AdminDashboardScreenProps {
  visible: boolean;
  onClose: () => void;
}

const CORRECT_ADMIN_PIN = 'Au76.;@dgb(Knu&!fhk:mh';

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  visible,
  onClose,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'FEEDBACK'>('ANALYTICS');
  const [analytics, setAnalytics] = useState<FeatureUsageStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<'ALL' | FeedbackCategory>('ALL');

  const loadData = async () => {
    const stats = await AnalyticsService.getAnalyticsSummary();
    const fbList = await FeedbackService.getAllFeedbacks();
    setAnalytics(stats);
    setFeedbacks(fbList);
  };

  useEffect(() => {
    if (visible && isAuthenticated) {
      loadData();
    }
  }, [visible, isAuthenticated]);

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
    Alert.alert(
      'Reset Telemetry Data?',
      'This will reset the feature view counts back to initial baseline numbers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AnalyticsService.resetAnalytics();
            loadData();
          },
        },
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
        icon: '⚡',
        count: stats.hourlyTrackerViews,
        pct: Math.round((stats.hourlyTrackerViews / safeTotal) * 100),
        color: '#3B82F6',
      },
      {
        name: 'Holidays & Academic Calendar',
        icon: '🌴',
        count: stats.calendarViews,
        pct: Math.round((stats.calendarViews / safeTotal) * 100),
        color: '#10B981',
      },
      {
        name: 'Weekly Timetable',
        icon: '📅',
        count: stats.timetableViews,
        pct: Math.round((stats.timetableViews / safeTotal) * 100),
        color: '#8B5CF6',
      },
      {
        name: 'Medical Claim Vault (65%)',
        icon: '🏥',
        count: stats.medicalVaultViews,
        pct: Math.round((stats.medicalVaultViews / safeTotal) * 100),
        color: '#EC4899',
      },
      {
        name: 'ERP Attendance Reconcile',
        icon: '🔄',
        count: stats.erpSyncViews,
        pct: Math.round((stats.erpSyncViews / safeTotal) * 100),
        color: '#F59E0B',
      },
    ].sort((a, b) => b.count - a.count);
  };

  const filteredFeedbacks = feedbacks.filter((fb) => {
    if (feedbackFilter === 'ALL') return true;
    return fb.category === feedbackFilter;
  });

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>🛡️ Admin Control Center</Text>
            <Text style={styles.headerSubtitle}>
              Cohort analytics, feature usage breakdown & student feedback.
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setIsAuthenticated(false);
              onClose();
            }}
            style={styles.exitBtn}
          >
            <Text style={styles.exitBtnText}>Exit Admin ✕</Text>
          </TouchableOpacity>
        </View>

        {/* PIN Authentication Gate */}
        {!isAuthenticated ? (
          <View style={styles.pinGateContainer}>
            <View style={styles.pinCard}>
              <View style={styles.lockBadge}>
                <Text style={styles.lockIcon}>🔐</Text>
              </View>
              <Text style={styles.pinTitle}>Enter Admin Passkey</Text>
              <Text style={styles.pinSub}>
                Authorized developer and administrator access only.
              </Text>

              {pinError && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️ {pinError}</Text>
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
                  📊 Usage Analytics
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
                  📬 Student Feedback ({feedbacks.length})
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              {activeTab === 'ANALYTICS' && analytics && (
                <>
                  {/* Overview Metric Cards */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricCard}>
                      <Text style={styles.metricIcon}>👥</Text>
                      <Text style={styles.metricValue}>
                        {analytics.uniqueStudentsCount}
                        <Text style={styles.metricSubValue}> / 252</Text>
                      </Text>
                      <Text style={styles.metricLabel}>Active Students</Text>
                      <View style={styles.metricBadge}>
                        <Text style={styles.metricBadgeText}>
                          {Math.round((analytics.uniqueStudentsCount / 252) * 100)}% Cohort Adoption
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metricCard}>
                      <Text style={styles.metricIcon}>⚡</Text>
                      <Text style={styles.metricValue}>{analytics.totalLogins}</Text>
                      <Text style={styles.metricLabel}>Total Sessions</Text>
                      <View style={styles.metricBadgeGreen}>
                        <Text style={styles.metricBadgeGreenText}>
                          +{analytics.activeTodayCount} Active Today
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Batch Adoption Breakdown */}
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>🏷️ Student Batch Distribution</Text>
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
                        <Text style={styles.sectionTitle}>🔥 Most Used Features</Text>
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
                            <Text style={styles.featureIconText}>{item.icon}</Text>
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
                            ? 'All Feedback'
                            : filter === 'FEATURE'
                            ? '💡 Features'
                            : filter === 'SCHEDULE'
                            ? '📅 Schedule'
                            : filter === 'BUG'
                            ? '🐛 Bugs'
                            : '💬 General'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Feedback List */}
                  {filteredFeedbacks.length === 0 ? (
                    <View style={styles.emptyCard}>
                      <Text style={styles.emptyIcon}>📬</Text>
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
                                {fb.isAnonymous ? '👤 Anonymous Student' : `👤 ${fb.studentName}`}
                              </Text>
                              {!fb.isAnonymous && fb.studentRollNo !== 'Hidden' && (
                                <Text style={styles.fbRollNo}>({fb.studentRollNo})</Text>
                              )}
                              <View style={styles.fbBatchBadge}>
                                <Text style={styles.fbBatchText}>Batch {fb.batch}</Text>
                              </View>
                            </View>
                            <Text style={styles.fbDate}>
                              {new Date(fb.createdAt).toLocaleDateString()} • {new Date(fb.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
                              <Text key={i} style={styles.fbStar}>★</Text>
                            ))}
                          </View>
                          <View style={styles.categoryPill}>
                            <Text style={styles.categoryPillText}>
                              {fb.category === 'FEATURE'
                                ? '💡 Feature Request'
                                : fb.category === 'SCHEDULE'
                                ? '📅 Schedule Correction'
                                : fb.category === 'BUG'
                                ? '🐛 Bug Report'
                                : '💬 General'}
                            </Text>
                          </View>
                        </View>

                        {/* Message Body */}
                        <Text style={styles.fbMessage}>{fb.message}</Text>
                      </View>
                    ))
                  )}
                </>
              )}
            </ScrollView>
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
});
