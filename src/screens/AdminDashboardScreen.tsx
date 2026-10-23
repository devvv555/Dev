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
} from 'react-native';

import { FeatureUsageStats, StudentFeedback, FeedbackCategory, StudentActivityRecord } from '../types';
import { AnalyticsService } from '../services/analyticsService';
import { FeedbackService } from '../services/feedbackService';

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

  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'STUDENTS' | 'FEEDBACK'>('STUDENTS');
  const [analytics, setAnalytics] = useState<FeatureUsageStats | null>(null);
  const [feedbacks, setFeedbacks] = useState<StudentFeedback[]>([]);
  const [feedbackFilter, setFeedbackFilter] = useState<'ALL' | FeedbackCategory>('ALL');

  // Student Telemetry & Time Spent State
  const [studentActivities, setStudentActivities] = useState<StudentActivityRecord[]>([]);
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedBatchFilter, setSelectedBatchFilter] = useState<'ALL' | 'A' | 'B' | 'C' | 'D'>('ALL');
  const [selectedStudentDrilldown, setSelectedStudentDrilldown] = useState<StudentActivityRecord | null>(null);
  const [replyingFeedback, setReplyingFeedback] = useState<StudentFeedback | null>(null);
  const [replyInput, setReplyInput] = useState<string>('');
  const [isSendingReply, setIsSendingReply] = useState<boolean>(false);

  const loadData = async () => {
    const stats = await AnalyticsService.getAnalyticsSummary();
    const fbList = await FeedbackService.getAllFeedbacks();
    const activities = await AnalyticsService.getAllStudentActivities();
    setAnalytics(stats);
    setFeedbacks(fbList);
    setStudentActivities(activities);
  };


  useEffect(() => {
    if (visible) {
      if (initiallyAuthenticated) {
        setIsAuthenticated(true);
      }
      loadData();
    }
  }, [visible, initiallyAuthenticated]);

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
    if (feedbackFilter === 'ALL') return true;
    return fb.category === feedbackFilter;
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
            <Text style={styles.exitBtnText}>Exit Admin ✕</Text>
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
            </View>


            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
                                <Text style={styles.fbRollNo}>({fb.studentRollNo})</Text>
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
                              <Text key={i} style={styles.fbStar}>★</Text>
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
                const filteredList = studentActivities.filter((rec) => {
                  const matchBatch = selectedBatchFilter === 'ALL' || rec.batch === selectedBatchFilter;
                  const query = studentSearch.trim().toLowerCase();
                  const matchSearch =
                    !query ||
                    rec.rollNo.toLowerCase().includes(query) ||
                    rec.name.toLowerCase().includes(query);
                  return matchBatch && matchSearch;
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
                            <Text style={styles.clearSearchText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>

                      <View style={styles.batchFiltersRow}>
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
                      <Text style={styles.studentListSubTitle}>Tap for feature breakdown</Text>
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
                              </View>
                              <Text style={styles.studentCardRoll}>{st.rollNo}</Text>

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
                              <Text style={styles.drilldownHint}>Inspect ➔</Text>
                            </View>
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </>
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
                              Roll No: {st.rollNo} • Batch {st.batch}
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => setSelectedStudentDrilldown(null)}
                            style={styles.closeDrilldownBtn}
                          >
                            <Text style={styles.closeDrilldownText}>✕</Text>
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
                            {replyingFeedback.studentRollNo ? `Roll No: ${replyingFeedback.studentRollNo} • ` : ''}Batch {replyingFeedback.batch} • {replyingFeedback.category}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setReplyingFeedback(null)}
                          style={styles.closeDrilldownBtn}
                        >
                          <Text style={styles.closeDrilldownText}>✕</Text>
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
});

