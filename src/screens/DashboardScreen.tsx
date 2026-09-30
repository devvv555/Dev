import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Vibration,
  RefreshControl,
} from 'react-native';
import { Subject, TimetableSlot, PeriodAttendanceRecord, AttendanceStatus } from '../types';
import { calculateOverallMetrics } from '../services/attendanceEngine';
import { AttendanceGauge } from '../components/AttendanceGauge';
import { SubjectCard } from '../components/SubjectCard';
import { PsgimService } from '../services/psgimService';
import { getNextHoliday, getUpcomingWeekdayHolidayNotification } from '../data/academicCalendarData';

interface DashboardScreenProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  studentRollNo: string;
  studentName: string;
  periodRecords: Record<string, PeriodAttendanceRecord>;
  onRecordPeriodAttendance: (
    slot: TimetableSlot,
    date: string,
    status: AttendanceStatus
  ) => Promise<{ success: boolean; message: string; isChange: boolean; alreadyMarked?: boolean }>;
  onUpdateSubject?: (subject: Subject) => void;
  onToggleMedicalClaim: (id: string) => void;
  onQuickAttend?: (id: string) => void;
  onQuickBunk?: (id: string) => void;
  onOpenCalendar?: () => void;
  onRefresh?: () => Promise<void> | void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  subjects,
  timetable,
  studentRollNo,
  studentName,
  periodRecords,
  onRecordPeriodAttendance,
  onToggleMedicalClaim,
  onOpenCalendar,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'SHORTAGE' | 'MEDICAL' | 'SAFE'>('ALL');
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  const overall = calculateOverallMetrics(subjects);
  const profile = PsgimService.getStudentProfile(studentRollNo);
  const nextHolidayInfo = getNextHoliday();
  const weekdayHolidayAlert = getUpcomingWeekdayHolidayNotification();

  // Filter subjects based on selected tab
  const filteredSubjects = subjects.filter((s) => {
    if (filter === 'MEDICAL') return s.hasMedicalClaim;
    const pct = s.total === 0 ? 100 : (s.attended / s.total) * 100;
    const target = s.hasMedicalClaim ? s.medicalTarget : s.standardTarget;
    if (filter === 'SAFE') return pct >= target;
    if (filter === 'SHORTAGE') return pct < target;
    return true;
  });

  // Auto-detect ongoing or recently ended class based on real-time clock
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Get slots for today
  const todaySlots = timetable.filter(
    (s) => s.day.toLowerCase() === currentDayName.toLowerCase()
  );
  const activeDaySlots = todaySlots.length > 0 ? todaySlots : timetable;

  // Auto-detect which slot is active, just ended, or upcoming
  const autoDetectSlotIndex = (): number => {
    if (activeDaySlots.length === 0) return 0;

    // 1. In-progress class
    const inProgress = activeDaySlots.findIndex((s) => {
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      return currentMinutes >= start && currentMinutes < end;
    });
    if (inProgress !== -1) return inProgress;

    // 2. Just ended class (within 60 min)
    const justEnded = activeDaySlots.findIndex((s) => {
      const end = timeToMinutes(s.endTime);
      return currentMinutes >= end && currentMinutes <= end + 60;
    });
    if (justEnded !== -1) return justEnded;

    // 3. Next upcoming class today
    const upcoming = activeDaySlots.findIndex((s) => {
      const start = timeToMinutes(s.startTime);
      return currentMinutes < start;
    });
    if (upcoming !== -1) return upcoming;

    return 0;
  };

  const activeIndex = selectedSlotIndex !== null ? selectedSlotIndex : autoDetectSlotIndex();
  const currentSlot = activeDaySlots[activeIndex] || timetable[0];
  const currentSubject = subjects.find((s) => s.id === currentSlot?.subjectId);

  // Status badge calculation
  const getSlotStatus = () => {
    if (!currentSlot) return { tag: '📅 SCHEDULED', color: '#818CF8', message: 'No classes scheduled.' };
    const start = timeToMinutes(currentSlot.startTime);
    const end = timeToMinutes(currentSlot.endTime);
    const isToday = currentSlot.day.toLowerCase() === currentDayName.toLowerCase();

    if (isToday && currentMinutes >= start && currentMinutes < end) {
      const left = end - currentMinutes;
      return {
        tag: `🔴 LIVE NOW (${left}m left)`,
        color: '#EF4444',
        message: 'This class is currently in session. Mark your attendance when completed:',
      };
    }
    if (isToday && currentMinutes >= end && currentMinutes <= end + 60) {
      return {
        tag: '🔔 CLASS JUST ENDED',
        color: '#F59E0B',
        message: 'This class has just ended. Did you attend or bunk?',
      };
    }
    if (isToday && currentMinutes < start) {
      const startsIn = start - currentMinutes;
      return {
        tag: `⏳ STARTS IN ${startsIn}m`,
        color: '#38BDF8',
        message: `Upcoming class today at ${currentSlot.startTime}. Pre-log or plan your attendance:`,
      };
    }
    return {
      tag: `📅 ${currentSlot.day.toUpperCase()} SCHEDULE`,
      color: '#818CF8',
      message: 'Automatic slot tracker based on your weekly timetable:',
    };
  };

  const todayDate = now.toISOString().split('T')[0];
  const currentPeriodKey = currentSlot ? `${todayDate}_${currentSlot.id}` : null;
  const currentRecord = currentPeriodKey ? periodRecords[currentPeriodKey] : undefined;
  const slotStatus = getSlotStatus();

  // Interactive Class Ended Notification popup state
  const [endedSlotNotification, setEndedSlotNotification] = useState<{
    slot: TimetableSlot;
    subject: Subject;
  } | null>(null);
  const alertedSlotsRef = useRef<Set<string>>(new Set());

  // Automatic detector that fires notification & vibration when class ends
  useEffect(() => {
    const checkEndedClasses = () => {
      const currentTime = new Date();
      const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
      const today = currentTime.toISOString().split('T')[0];
      const todayDay = dayNames[currentTime.getDay()].toLowerCase();

      // Find any class from today that has reached its endTime and is not yet marked
      const endedSlot = timetable.find((slot) => {
        if (slot.day.toLowerCase() !== todayDay) return false;
        const end = timeToMinutes(slot.endTime);
        const periodKey = `${today}_${slot.id}`;
        return mins >= end && mins <= end + 180 && !periodRecords[periodKey];
      });

      if (endedSlot) {
        const periodKey = `${today}_${endedSlot.id}`;
        if (!alertedSlotsRef.current.has(periodKey)) {
          alertedSlotsRef.current.add(periodKey);
          const sub = subjects.find((s) => s.id === endedSlot.subjectId);
          if (sub) {
            try {
              Vibration.vibrate([0, 500, 200, 500]);
            } catch {}
            setEndedSlotNotification({ slot: endedSlot, subject: sub });
          }
        }
      }
    };

    checkEndedClasses();
    const interval = setInterval(checkEndedClasses, 30000);
    return () => clearInterval(interval);
  }, [timetable, periodRecords, subjects]);

  const handleRecordFromNotification = async (status: AttendanceStatus) => {
    if (!endedSlotNotification) return;
    const { slot, subject } = endedSlotNotification;
    const res = await onRecordPeriodAttendance(slot, todayDate, status);
    setEndedSlotNotification(null);
    if (res.success) {
      Alert.alert(
        status === 'attended' ? 'Marked Present ✅' : status === 'bunked' ? 'Marked Bunk ❌' : 'Class Cancelled ⚪',
        `Attendance recorded for ${subject.name}.`
      );
    }
  };

  const handleAutoRecord = async (status: AttendanceStatus) => {
    if (!currentSlot || !currentSubject) return;

    if (currentRecord) {
      if (currentRecord.status === status) {
        Alert.alert(
          'Already Recorded ℹ️',
          `You have already marked this period as "${status.toUpperCase()}".\n\nA class period cannot be counted twice.`
        );
        return;
      }

      // Prompt confirmation before changing previous attendance status
      const fromStatus = currentRecord.status.toUpperCase();
      const toStatus = status.toUpperCase();

      Alert.alert(
        'Change Attendance Status? 🔄',
        `This period is currently recorded as "${fromStatus}".\n\nDo you want to change it to "${toStatus}"? Your attendance totals will be adjusted accurately.`,
        [
          { text: 'Keep As Is', style: 'cancel' },
          {
            text: `Switch to ${toStatus}`,
            onPress: async () => {
              const res = await onRecordPeriodAttendance(currentSlot, todayDate, status);
              if (res.success) {
                Alert.alert('Status Updated 🔄', res.message);
              }
            },
          },
        ]
      );
      return;
    }

    // First time recording this period
    const res = await onRecordPeriodAttendance(currentSlot, todayDate, status);
    if (res.success) {
      Alert.alert(
        status === 'attended'
          ? 'Logged Present ✅'
          : status === 'bunked'
          ? 'Logged Bunk ❌'
          : 'Class Cancelled ⚪',
        res.message
      );
    } else {
      Alert.alert('Notice', res.message);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      try {
        Vibration.vibrate(35);
      } catch {}
      if (onRefresh) {
        await onRefresh();
      }
    } catch (e) {
      console.warn('Dashboard refresh error:', e);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#38BDF8"
          colors={['#38BDF8', '#2563EB']}
          progressBackgroundColor="#1E293B"
        />
      }
    >
      {/* Student Welcome Card */}
      <View style={styles.welcomeCard}>
        <View style={styles.welcomeTopRow}>
          <View style={styles.welcomeAvatar}>
            <Text style={styles.welcomeAvatarText}>
              {studentName ? studentName.charAt(0) : '🎓'}
            </Text>
          </View>
          <View style={styles.welcomeInfo}>
            <Text style={styles.welcomeGreeting}>Welcome,</Text>
            <Text style={styles.welcomeName} numberOfLines={1}>
              {studentName || 'Student'}
            </Text>
            <Text style={styles.welcomeSub}>
              {profile.section ? `${profile.section} • ` : ''}MBA (2026–28)
            </Text>
          </View>
        </View>

        {/* Verified Student Email if available */}
        {profile.email ? (
          <View style={styles.profileDetailsRow}>
            <View style={styles.profilePill}>
              <Text style={styles.profilePillText} numberOfLines={1}>✉️ {profile.email}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {/* Weekday Holiday 7-Day Notification Alert (Strictly NO notification for weekend holidays) */}
      {weekdayHolidayAlert ? (
        <TouchableOpacity
          style={styles.weekdayNotifCard}
          onPress={onOpenCalendar}
          activeOpacity={0.85}
        >
          <View style={styles.weekdayNotifTop}>
            <View style={styles.weekdayNotifBadge}>
              <Text style={styles.weekdayNotifBadgeText}>
                🔔 HOLIDAY ALERT • {weekdayHolidayAlert.daysRemaining === 0 ? 'TODAY' : weekdayHolidayAlert.daysRemaining === 1 ? 'TOMORROW' : `IN ${weekdayHolidayAlert.daysRemaining} DAYS`}
              </Text>
            </View>
            <Text style={styles.weekdayNotifLink}>View Calendar →</Text>
          </View>

          <Text style={styles.weekdayNotifTitle}>
            🌴 {weekdayHolidayAlert.holiday.title} ({weekdayHolidayAlert.holiday.day})
          </Text>

          {/* Academic calendar pre-accounted message */}
          <View style={styles.weekdayNotifAccountedBox}>
            <Text style={styles.weekdayNotifAccountedText}>
              ✓ {weekdayHolidayAlert.accountingNote}
            </Text>
          </View>
        </TouchableOpacity>
      ) : nextHolidayInfo ? (
        /* Regular calendar access card when no weekday holiday is within 7 days */
        <TouchableOpacity
          style={styles.holidayBannerCard}
          onPress={onOpenCalendar}
          activeOpacity={0.8}
        >
          <View style={styles.holidayBannerLeft}>
            <View style={styles.holidayBannerIconCircle}>
              <Text style={styles.holidayBannerIcon}>🌴</Text>
            </View>
            <View style={styles.holidayBannerTextCol}>
              <View style={styles.holidayBadgeRow}>
                <Text style={styles.holidayCountdownBadge}>
                  ACADEMIC CALENDAR & HOLIDAYS
                </Text>
                {nextHolidayInfo.holiday.longWeekendTag && (
                  <View style={styles.holidayWeekendPill}>
                    <Text style={styles.holidayWeekendPillText}>
                      {nextHolidayInfo.holiday.longWeekendTag}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.holidayBannerTitle} numberOfLines={1}>
                Next: {nextHolidayInfo.holiday.title} ({nextHolidayInfo.holiday.day})
              </Text>
            </View>
          </View>
          <Text style={styles.holidayBannerChevron}>→</Text>
        </TouchableOpacity>
      ) : null}

      {/* Top Banner: Overall Attendance Metric */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={styles.summaryTitle}>Overall Attendance</Text>
            <Text style={styles.summarySubtitle}>
              {overall.totalAttended} of {overall.totalHeld} total classes attended
            </Text>
          </View>
          <View style={styles.badgeContainer}>
            {overall.isMedicalClaimActive && (
              <View style={styles.activeMedBadge}>
                <Text style={styles.activeMedBadgeText}>🏥 Med Active</Text>
              </View>
            )}
          </View>
        </View>

        <AttendanceGauge metrics={overall} />

        <View style={styles.summaryFooter}>
          <Text style={styles.summaryFooterText}>{overall.summaryMessage}</Text>
        </View>
      </View>

      {/* Live Auto-Class Tracker Card */}
      <View style={styles.promptSimulatorCard}>
        <View style={styles.simulatorHeader}>
          <View style={[styles.statusTagBadge, { borderColor: slotStatus.color }]}>
            <Text style={[styles.simulatorTag, { color: slotStatus.color }]}>
              {slotStatus.tag}
            </Text>
          </View>
          <Text style={styles.simulatorTime}>
            {currentSlot ? `${currentSlot.startTime} - ${currentSlot.endTime}` : ''}
          </Text>
        </View>

        <Text style={styles.simulatorTitle}>
          {currentSubject ? `${currentSubject.name}` : 'No Class in Session'}
        </Text>
        <Text style={styles.simulatorSubDetail}>
          {currentSlot ? `${currentSlot.day} • ${currentSlot.startTime} – ${currentSlot.endTime} • ${currentSlot.room || 'Lecture Hall'}` : ''}
        </Text>
        <Text style={styles.simulatorSub}>
          {slotStatus.message}
        </Text>

        {/* Period Selector Pills: Instant 1-tap period switching for Today */}
        {activeDaySlots.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodPillScroll}
            contentContainerStyle={styles.periodPillContainer}
          >
            {activeDaySlots.map((slot, idx) => {
              const sub = subjects.find((s) => s.id === slot.subjectId);
              const isSelected = idx === activeIndex;
              const pKey = `${todayDate}_${slot.id}`;
              const rec = periodRecords[pKey];

              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => setSelectedSlotIndex(idx)}
                  style={[
                    styles.periodPill,
                    isSelected ? styles.periodPillActive : styles.periodPillInactive,
                    rec?.status === 'attended' && !isSelected && styles.periodPillMarkedAttended,
                    rec?.status === 'bunked' && !isSelected && styles.periodPillMarkedBunked,
                    rec?.status === 'cancelled' && !isSelected && styles.periodPillMarkedCancelled,
                  ]}
                >
                  <View style={styles.pillHeaderRow}>
                    <Text style={[styles.periodPillTime, isSelected && styles.periodPillTextActive]}>
                      {slot.startTime}
                    </Text>
                    {rec && (
                      <Text style={styles.pillStatusIndicator}>
                        {rec.status === 'attended' ? '✅' : rec.status === 'bunked' ? '❌' : '⚪'}
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.periodPillCode, isSelected && styles.periodPillTextActive]}>
                    {sub?.code || slot.subjectId.replace('sub_', '').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* If this period was already marked, display locked status banner */}
        {currentRecord && (
          <View
            style={[
              styles.periodLockedBanner,
              currentRecord.status === 'attended' && styles.lockedBannerAttended,
              currentRecord.status === 'bunked' && styles.lockedBannerBunked,
              currentRecord.status === 'cancelled' && styles.lockedBannerCancelled,
            ]}
          >
            <View style={styles.lockedBannerRow}>
              <Text style={styles.lockedBannerIcon}>
                {currentRecord.status === 'attended' ? '✅' : currentRecord.status === 'bunked' ? '❌' : '⚪'}
              </Text>
              <View style={styles.lockedBannerTextContainer}>
                <Text style={styles.lockedBannerTitle}>
                  {currentRecord.status === 'attended' && 'Recorded: Attended (Present)'}
                  {currentRecord.status === 'bunked' && 'Recorded: Bunked (Absent)'}
                  {currentRecord.status === 'cancelled' && 'Recorded: Free / Cancelled'}
                </Text>
                <Text style={styles.lockedBannerSub}>
                  Locked for this period to prevent double-counting. Tap any other option below to switch status.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* 1-Tap Attendance Actions */}
        <View style={styles.promptActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.promptActionBtn,
              styles.promptAttendBtn,
              currentRecord?.status === 'attended' && styles.promptBtnSelected,
              currentRecord && currentRecord.status !== 'attended' && styles.promptBtnDimmed,
            ]}
            onPress={() => handleAutoRecord('attended')}
          >
            <Text style={styles.promptAttendText}>
              {currentRecord?.status === 'attended' ? '✅ Attended (Marked)' : '✅ I Attended'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.promptActionBtn,
              styles.promptBunkBtn,
              currentRecord?.status === 'bunked' && styles.promptBtnSelected,
              currentRecord && currentRecord.status !== 'bunked' && styles.promptBtnDimmed,
            ]}
            onPress={() => handleAutoRecord('bunked')}
          >
            <Text style={styles.promptBunkText}>
              {currentRecord?.status === 'bunked' ? '❌ Bunked (Marked)' : '❌ I Bunked'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.promptActionBtn,
              styles.promptCancelBtn,
              currentRecord?.status === 'cancelled' && styles.promptBtnSelected,
              currentRecord && currentRecord.status !== 'cancelled' && styles.promptBtnDimmed,
            ]}
            onPress={() => handleAutoRecord('cancelled')}
          >
            <Text style={styles.promptCancelText}>
              {currentRecord?.status === 'cancelled' ? '⚪ Free (Marked)' : '⚪ Free / Cancelled'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'SAFE', 'SHORTAGE', 'MEDICAL'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[styles.filterChip, filter === tab && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === tab && styles.filterChipTextActive]}>
              {tab === 'ALL' && 'All Subjects'}
              {tab === 'SAFE' && '✅ Safe'}
              {tab === 'SHORTAGE' && '⚠️ Shortage'}
              {tab === 'MEDICAL' && '🏥 Med Claim (65%)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subjects List */}
      {filteredSubjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          studentRollNo={studentRollNo}
          onToggleMedicalClaim={onToggleMedicalClaim}
        />
      ))}

      {/* Class Ended Interactive Notification Pop-up */}
      <Modal
        visible={!!endedSlotNotification}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEndedSlotNotification(null)}
      >
        <View style={styles.notifOverlay}>
          <View style={styles.notifCard}>
            <View style={styles.notifHeaderRow}>
              <View style={styles.notifIconCircle}>
                <Text style={styles.notifIconText}>🔔</Text>
              </View>
              <View style={styles.notifHeaderInfo}>
                <Text style={styles.notifHeaderBadge}>CLASS CONCLUDED</Text>
                <Text style={styles.notifSubjectName} numberOfLines={1}>
                  {endedSlotNotification?.subject.name}
                </Text>
                <Text style={styles.notifTimeSlot}>
                  ⏰ {endedSlotNotification?.slot.startTime} – {endedSlotNotification?.slot.endTime} • {endedSlotNotification?.slot.day}
                </Text>
              </View>
            </View>

            <Text style={styles.notifBodyText}>
              Your class has ended! Mark your attendance now so your records stay up to date:
            </Text>

            <View style={styles.notifActionsRow}>
              <TouchableOpacity
                style={[styles.notifBtn, styles.notifAttendBtn]}
                onPress={() => handleRecordFromNotification('attended')}
                activeOpacity={0.8}
              >
                <Text style={styles.notifAttendText}>✅ Attended</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.notifBtn, styles.notifBunkBtn]}
                onPress={() => handleRecordFromNotification('bunked')}
                activeOpacity={0.8}
              >
                <Text style={styles.notifBunkText}>❌ Bunked</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.notifBtn, styles.notifCancelBtn]}
                onPress={() => handleRecordFromNotification('cancelled')}
                activeOpacity={0.8}
              >
                <Text style={styles.notifCancelText}>⚪ Free / Off</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.notifDismissBtn}
              onPress={() => setEndedSlotNotification(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.notifDismissText}>Remind Me Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Slate 900
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  summaryTitle: {
    color: '#F8FAFC',
    fontSize: 19,
    fontWeight: '800',
  },
  summarySubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  activeMedBadge: {
    backgroundColor: '#0C4A6E',
    borderColor: '#0284C7',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  activeMedBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  summaryFooterText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  promptSimulatorCard: {
    backgroundColor: '#1E1B4B', // Indigo 950
    borderColor: '#4338CA',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  simulatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusTagBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
  },
  simulatorTag: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  simulatorTime: {
    color: '#A5B4FC',
    fontSize: 12,
    fontWeight: '600',
  },
  simulatorTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  simulatorSubDetail: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  simulatorSub: {
    color: '#CBD5E1',
    fontSize: 12,
    marginBottom: 6,
    lineHeight: 16,
  },
  periodPillScroll: {
    marginVertical: 10,
  },
  periodPillContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  periodPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 64,
  },
  periodPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#60A5FA',
  },
  periodPillInactive: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
  },
  periodPillTime: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
  },
  periodPillCode: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
  },
  periodPillTextActive: {
    color: '#FFFFFF',
  },
  pillHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  pillStatusIndicator: {
    fontSize: 9,
  },
  periodPillMarkedAttended: {
    borderColor: '#059669',
    backgroundColor: '#064E3B',
  },
  periodPillMarkedBunked: {
    borderColor: '#DC2626',
    backgroundColor: '#450A0A',
  },
  periodPillMarkedCancelled: {
    borderColor: '#64748B',
    backgroundColor: '#1E293B',
  },
  periodLockedBanner: {
    borderRadius: 12,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
  },
  lockedBannerAttended: {
    backgroundColor: 'rgba(5, 150, 105, 0.15)',
    borderColor: '#059669',
  },
  lockedBannerBunked: {
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderColor: '#DC2626',
  },
  lockedBannerCancelled: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderColor: '#64748B',
  },
  lockedBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  lockedBannerIcon: {
    fontSize: 20,
  },
  lockedBannerTextContainer: {
    flex: 1,
  },
  lockedBannerTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  lockedBannerSub: {
    color: '#CBD5E1',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  promptActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  promptActionBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptBtnSelected: {
    borderWidth: 2,
    borderColor: '#F8FAFC',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  promptBtnDimmed: {
    opacity: 0.6,
  },
  promptAttendBtn: {
    backgroundColor: '#059669',
  },
  promptAttendText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  promptBunkBtn: {
    backgroundColor: '#DC2626',
  },
  promptBunkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  promptCancelBtn: {
    backgroundColor: '#475569',
  },
  promptCancelText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: 12,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  filterChipText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  welcomeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  welcomeTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  welcomeAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeAvatarText: {
    color: '#38BDF8',
    fontSize: 20,
    fontWeight: '800',
  },
  welcomeInfo: {
    flex: 1,
  },
  welcomeGreeting: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  welcomeName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  welcomeSub: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  welcomeRoll: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  profileDetailsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  profilePill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  profilePillEmail: {
    maxWidth: 220,
  },
  profilePillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },

  // ── Class Ended Notification Pop-up Styles ─────────────────────────
  notifOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notifCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 22,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  notifHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  notifIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIconText: {
    fontSize: 22,
  },
  notifHeaderInfo: {
    flex: 1,
  },
  notifHeaderBadge: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  notifSubjectName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  notifTimeSlot: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  notifBodyText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  notifActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  notifBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  notifAttendBtn: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderColor: '#10B981',
  },
  notifAttendText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
  },
  notifBunkBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  notifBunkText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '800',
  },
  notifCancelBtn: {
    backgroundColor: 'rgba(148, 163, 184, 0.15)',
    borderColor: '#64748B',
  },
  notifCancelText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  notifDismissBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  notifDismissText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },

  // ── Weekday Holiday 7-Day Notification Alert Styles ────────
  weekdayNotifCard: {
    backgroundColor: '#064E3B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  weekdayNotifTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  weekdayNotifBadge: {
    backgroundColor: '#022C22',
    borderColor: '#34D399',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  weekdayNotifBadgeText: {
    color: '#6EE7B7',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  weekdayNotifLink: {
    color: '#6EE7B7',
    fontSize: 11,
    fontWeight: '700',
  },
  weekdayNotifTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 8,
  },
  weekdayNotifAccountedBox: {
    backgroundColor: 'rgba(2, 44, 34, 0.75)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
  },
  weekdayNotifAccountedText: {
    color: '#A7F3D0',
    fontSize: 11.5,
    fontWeight: '600',
    lineHeight: 16,
  },

  // ── Upcoming Holiday Banner Styles ─────────────────────────
  holidayBannerCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  holidayBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  holidayBannerIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayBannerIcon: {
    fontSize: 18,
  },
  holidayBannerTextCol: {
    flex: 1,
  },
  holidayBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  holidayCountdownBadge: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  holidayWeekendPill: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  holidayWeekendPillText: {
    color: '#FDE047',
    fontSize: 9,
    fontWeight: '700',
  },
  holidayBannerTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  holidayBannerChevron: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
  },
});
