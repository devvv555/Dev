import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Vibration,
  RefreshControl,
} from 'react-native';
import { Subject, TimetableSlot, PeriodAttendanceRecord, AttendanceStatus, PeriodReminder, SurplusAttendanceAlert, LmsAssignment, LmsQuiz, PsgimAnnouncement } from '../types';
import { calculateOverallMetrics, getSlotHours } from '../services/attendanceEngine';
import { AttendanceGauge } from '../components/AttendanceGauge';

import { SubjectCard } from '../components/SubjectCard';
import { PsgimService } from '../services/psgimService';
import { getNextHoliday, getUpcomingWeekdayHolidayNotification } from '../data/academicCalendarData';
import { NotificationService } from '../services/notificationService';
import { StorageService } from '../services/storageService';
import { LmsService } from '../services/lmsService';
import { LmsAssignmentCard } from '../components/LmsAssignmentCard';
import { LmsQuizCard } from '../components/LmsQuizCard';
import { MoodleQuizModal } from '../components/MoodleQuizModal';
import { PsgimConnectService } from '../services/psgimConnectService';
import { PsgimAnnouncementCard } from '../components/PsgimAnnouncementCard';
import { PsgimNoticeModal } from '../components/PsgimNoticeModal';
import { DigitalIdModal } from '../components/DigitalIdModal';
import { CoursePlanModal } from '../components/CoursePlanModal';
import { AttendanceDisputeModal } from '../components/AttendanceDisputeModal';


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

  // Period Reminder state
  const [reminders, setReminders] = useState<PeriodReminder[]>([]);
  const [surplusAlerts, setSurplusAlerts] = useState<SurplusAttendanceAlert[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderNote, setReminderNote] = useState('');
  const [reminderTiming, setReminderTiming] = useState<'NEXT_CLASS' | 'TONIGHT_8PM' | 'TOMORROW_8AM'>('NEXT_CLASS');

  // LMS Moodle state
  const [lmsAssignments, setLmsAssignments] = useState<LmsAssignment[]>([]);
  const [lmsQuizzes, setLmsQuizzes] = useState<LmsQuiz[]>([]);
  const [lmsActiveTab, setLmsActiveTab] = useState<'ASSIGNMENTS' | 'QUIZZES'>('ASSIGNMENTS');
  const [moodleModal, setMoodleModal] = useState<{
    visible: boolean;
    title: string;
    url: string;
  }>({ visible: false, title: '', url: '' });
  const [lmsPassword, setLmsPassword] = useState('Welcome@123');

  // PSGIM Connect Notices state
  const [announcements, setAnnouncements] = useState<PsgimAnnouncement[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<PsgimAnnouncement | null>(null);

  // Campus Companion Utility Modals state
  const [showDigitalIdModal, setShowDigitalIdModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [coursePlanModalInfo, setCoursePlanModalInfo] = useState<{
    visible: boolean;
    code: string;
    name: string;
  }>({ visible: false, code: '24GM14', name: 'Business Statistics' });

  useEffect(() => {
    PsgimConnectService.fetchAnnouncements().then(setAnnouncements);
    if (studentRollNo) {
      StorageService.getPeriodReminders(studentRollNo).then(setReminders);
      StorageService.getSurplusAlerts(studentRollNo).then(setSurplusAlerts);
      LmsService.getAssignments(studentRollNo).then(setLmsAssignments);
      LmsService.getQuizzes(studentRollNo).then(setLmsQuizzes);
      LmsService.getCredentials(studentRollNo).then((c) => {
        if (c?.password) setLmsPassword(c.password);
      });
    }
  }, [studentRollNo]);

  const handleSaveReminder = async () => {
    if (!reminderNote.trim()) {
      Alert.alert('Empty Reminder', 'Please enter a reminder or task note.');
      return;
    }
    try {
      Vibration.vibrate(25);
    } catch {}

    const timingDesc =
      reminderTiming === 'NEXT_CLASS'
        ? 'Before Next Class'
        : reminderTiming === 'TONIGHT_8PM'
        ? 'Tonight at 8:00 PM'
        : 'Tomorrow at 8:00 AM';

    const newReminder: PeriodReminder = {
      id: `rem_${Date.now()}`,
      slotId: currentSlot?.id || 'slot_today',
      subjectId: currentSlot?.subjectId || 'sub_general',
      subjectName: currentSubject?.name || 'Class',
      rollNo: studentRollNo,
      note: reminderNote.trim(),
      dueTiming: reminderTiming,
      createdAt: Date.now(),
      completed: false,
    };

    const next = [newReminder, ...reminders];
    setReminders(next);
    await StorageService.savePeriodReminders(studentRollNo, next);

    await NotificationService.notifyPeriodReminder(
      newReminder.subjectName,
      newReminder.note,
      timingDesc
    );

    setShowReminderModal(false);
    setReminderNote('');
    Alert.alert(
      'Reminder Set! ⏰',
      `Reminder saved: "${newReminder.note}" (${timingDesc}).`
    );
  };

  const handleToggleReminder = async (id: string) => {
    try {
      Vibration.vibrate(20);
    } catch {}
    const next = reminders.map((r) =>
      r.id === id ? { ...r, completed: !r.completed } : r
    );
    setReminders(next);
    await StorageService.savePeriodReminders(studentRollNo, next);
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      Vibration.vibrate(20);
    } catch {}
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    await StorageService.savePeriodReminders(studentRollNo, next);
  };


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
            // Send system notification directly to phone's notification tab/shade
            NotificationService.notifyClassEnded(endedSlot, sub);
          }
        }
      }

      // Check upcoming weekday holiday and notify system notification tray
      if (weekdayHolidayAlert && !alertedSlotsRef.current.has(`holiday_${today}_${weekdayHolidayAlert.holiday.id}`)) {
        alertedSlotsRef.current.add(`holiday_${today}_${weekdayHolidayAlert.holiday.id}`);
        NotificationService.notifyUpcomingHoliday(
          weekdayHolidayAlert.holiday.title,
          weekdayHolidayAlert.holiday.day,
          weekdayHolidayAlert.daysRemaining
        );
      }

      // Check for upcoming class with pending surplus second notification (actual > period)
      surplusAlerts.forEach((alert) => {
        if (!alert.notifiedBeforeClass) {
          const upcomingSlot = timetable.find((slot) => {
            if (slot.subjectId !== alert.subjectId) return false;
            if (slot.day.toLowerCase() !== todayDay) return false;
            const start = timeToMinutes(slot.startTime);
            return mins >= start - 30 && mins < start + 30;
          });

          if (upcomingSlot) {
            const key = `surplus_pre_${today}_${upcomingSlot.id}`;
            if (!alertedSlotsRef.current.has(key)) {
              alertedSlotsRef.current.add(key);
              NotificationService.notifyUpcomingClassWithSurplus(
                alert.subjectName,
                upcomingSlot,
                alert.officialAttended,
                alert.periodAttended
              );
              StorageService.markSurplusAlertNotifiedBeforeClass(studentRollNo, alert.id);
              setSurplusAlerts((prev) =>
                prev.map((a) => (a.id === alert.id ? { ...a, notifiedBeforeClass: true } : a))
              );
            }
          }
        }
      });
    };

    checkEndedClasses();
    const interval = setInterval(checkEndedClasses, 30000);
    return () => clearInterval(interval);
  }, [timetable, periodRecords, subjects, weekdayHolidayAlert, surplusAlerts, studentRollNo]);

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
      PsgimConnectService.fetchAnnouncements().then(setAnnouncements);
      if (studentRollNo) {
        const [asg, qz] = await Promise.all([
          LmsService.getAssignments(studentRollNo),
          LmsService.getQuizzes(studentRollNo),
        ]);
        setLmsAssignments(asg);
        setLmsQuizzes(qz);
      }
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

      {/* 🚀 Quick Campus Utilities: Emergency Digital ID, Course Plans & CA Marks, Attendance Proof */}
      <View style={styles.quickUtilitiesRow}>
        <TouchableOpacity
          style={styles.utilityPillBtn}
          onPress={() => setShowDigitalIdModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.utilityPillIcon}>🪪</Text>
          <View style={styles.utilityPillTextCol}>
            <Text style={styles.utilityPillTitle}>Digital ID</Text>
            <Text style={styles.utilityPillSub}>Emergency Pass</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.utilityPillBtn}
          onPress={() =>
            setCoursePlanModalInfo({
              visible: true,
              code: '24GM14',
              name: 'Business Statistics',
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.utilityPillIcon}>📊</Text>
          <View style={styles.utilityPillTextCol}>
            <Text style={styles.utilityPillTitle}>Course Plan</Text>
            <Text style={styles.utilityPillSub}>50M CA Marks</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.utilityPillBtn}
          onPress={() => setShowDisputeModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.utilityPillIcon}>📄</Text>
          <View style={styles.utilityPillTextCol}>
            <Text style={styles.utilityPillTitle}>Dispute Proof</Text>
            <Text style={styles.utilityPillSub}>Official Dossier</Text>
          </View>
        </TouchableOpacity>
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
              {overall.totalAttended} of {overall.totalHeld} total hours attended
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
          {currentSlot ? `${currentSlot.day} • ${currentSlot.startTime} – ${currentSlot.endTime} (${getSlotHours(currentSlot)} ${getSlotHours(currentSlot) === 1 ? 'hr' : 'hrs'}) • ${currentSlot.room || 'Lecture Hall'}` : ''}
        </Text>
        <Text style={styles.simulatorSub}>
          {slotStatus.message}
        </Text>

        {/* Discrepancy & Surplus Status Indicators */}
        {(() => {
          const slotSurplus = surplusAlerts.find(
            (a) => a.subjectId === currentSlot?.subjectId && a.difference > 0
          );
          const slotDeficit = subjects.find(
            (s) => s.id === currentSlot?.subjectId && s.officialAttended < s.attended
          );
          if (slotSurplus) {
            return (
              <View style={styles.surplusNoticeBanner}>
                <Text style={styles.surplusNoticeText}>
                  🎉 Portal Extra Attendance: {slotSurplus.officialAttended} hrs vs {slotSurplus.periodAttended} hrs logged (+{slotSurplus.difference} hrs bonus/OD granted).
                </Text>
              </View>
            );
          }
          if (slotDeficit) {
            return (
              <View style={styles.discrepancyNoticeBanner}>
                <Text style={styles.discrepancyNoticeText}>
                  ⚠️ Attendance Discrepancy: Portal marked {slotDeficit.officialAttended} hrs vs {slotDeficit.attended} hrs logged ({slotDeficit.attended - slotDeficit.officialAttended} hrs lower in portal).
                </Text>
              </View>
            );
          }
          return null;
        })()}

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
              const hasPendingReminder = reminders.some(
                (r) => !r.completed && (r.slotId === slot.id || r.subjectId === slot.subjectId)
              );

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
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
                      {hasPendingReminder && (
                        <Text style={styles.pillReminderIndicator}>📌</Text>
                      )}
                      {rec && (
                        <Text style={styles.pillStatusIndicator}>
                          {rec.status === 'attended' ? '✅' : rec.status === 'bunked' ? '❌' : '⚪'}
                        </Text>
                      )}
                    </View>
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
                  {currentRecord.status === 'attended' && `Recorded: Attended (${currentRecord.hours || getSlotHours(currentSlot)} hrs)`}
                  {currentRecord.status === 'bunked' && `Recorded: Bunked (${currentRecord.hours || getSlotHours(currentSlot)} hrs)`}
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
              {currentRecord?.status === 'attended'
                ? `✅ Attended (${getSlotHours(currentSlot)} hrs)`
                : `✅ I Attended (${getSlotHours(currentSlot)} hrs)`}
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
              {currentRecord?.status === 'bunked'
                ? `❌ Bunked (${getSlotHours(currentSlot)} hrs)`
                : `❌ I Bunked (${getSlotHours(currentSlot)} hrs)`}
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

        {/* Next Class Tasks & Reminders Section */}
        {(() => {
          const slotReminders = reminders.filter(
            (r) => r.slotId === currentSlot?.id || r.subjectId === currentSlot?.subjectId
          );

          return (
            <View style={styles.periodReminderContainer}>
              {slotReminders.length > 0 && (
                <View style={styles.activeRemindersBox}>
                  <Text style={styles.activeRemindersTitle}>
                    📌 Tasks / Instructions for this Class:
                  </Text>
                  {slotReminders.map((rem) => (
                    <View key={rem.id} style={styles.reminderRowItem}>
                      <TouchableOpacity
                        onPress={() => handleToggleReminder(rem.id)}
                        style={styles.reminderCheckBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.reminderCheckIcon}>
                          {rem.completed ? '✅' : '⭕'}
                        </Text>
                      </TouchableOpacity>

                      <View style={styles.reminderContentCol}>
                        <Text
                          style={[
                            styles.reminderNoteText,
                            rem.completed && styles.reminderNoteTextCompleted,
                          ]}
                        >
                          {rem.note}
                        </Text>
                        <Text style={styles.reminderTimingText}>
                          ⏰ {rem.dueTiming === 'NEXT_CLASS' ? 'Before Next Class' : rem.dueTiming === 'TONIGHT_8PM' ? 'Tonight at 8:00 PM' : 'Tomorrow at 8:00 AM'}
                          {rem.completed ? ' • Done' : ''}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDeleteReminder(rem.id)}
                        style={styles.reminderDeleteAction}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.reminderDeleteActionText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.addReminderTriggerBtn}
                onPress={() => {
                  setReminderNote('');
                  setReminderTiming('NEXT_CLASS');
                  setShowReminderModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.addReminderTriggerIcon}>⏰</Text>
                <Text style={styles.addReminderTriggerText}>
                  + Set Task / Reminder for Next Class
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </View>

      {/* 🎓 PSGIM LMS Moodle Section: Assignments & 1-Tap Quizzes */}
      <View style={styles.lmsSection}>
        <View style={styles.lmsHeaderRow}>
          <View style={styles.lmsIconCircle}>
            <Text style={styles.lmsIcon}>🎓</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.lmsSectionTitle}>Moodle LMS Portal</Text>
              <View style={styles.lmsDirectBadge}>
                <Text style={styles.lmsDirectBadgeText}>DIRECT SUBMIT & ATTEMPT</Text>
              </View>
            </View>
            <Text style={styles.lmsSectionSub}>
              lms.psgim.ac.in • In-app submissions & 1-tap test attempts
            </Text>
          </View>
        </View>

        {/* Tab Switcher: Assignments vs Quizzes */}
        <View style={styles.lmsTabRow}>
          <TouchableOpacity
            style={[
              styles.lmsTabBtn,
              lmsActiveTab === 'ASSIGNMENTS' && styles.lmsTabBtnActive,
            ]}
            onPress={() => setLmsActiveTab('ASSIGNMENTS')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.lmsTabBtnText,
                lmsActiveTab === 'ASSIGNMENTS' && styles.lmsTabBtnTextActive,
              ]}
            >
              📝 Assignments ({lmsAssignments.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.lmsTabBtn,
              lmsActiveTab === 'QUIZZES' && styles.lmsTabBtnActive,
            ]}
            onPress={() => setLmsActiveTab('QUIZZES')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.lmsTabBtnText,
                lmsActiveTab === 'QUIZZES' && styles.lmsTabBtnTextActive,
              ]}
            >
              ⚡ Quizzes ({lmsQuizzes.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab Content */}
        {lmsActiveTab === 'ASSIGNMENTS' ? (
          <View style={styles.lmsCardsList}>
            {lmsAssignments.length === 0 ? (
              <Text style={styles.lmsEmptyText}>No active assignments in Moodle.</Text>
            ) : (
              lmsAssignments.map((asg) => (
                <LmsAssignmentCard
                  key={asg.id}
                  assignment={asg}
                  rollNo={studentRollNo}
                  onUpdated={(updated) => {
                    setLmsAssignments((prev) =>
                      prev.map((a) => (a.id === updated.id ? updated : a))
                    );
                  }}
                  onOpenInMoodle={(title, url) => {
                    setMoodleModal({ visible: true, title, url });
                  }}
                />
              ))
            )}
          </View>
        ) : (
          <View style={styles.lmsCardsList}>
            {lmsQuizzes.length === 0 ? (
              <Text style={styles.lmsEmptyText}>No active quizzes in Moodle.</Text>
            ) : (
              lmsQuizzes.map((quiz) => (
                <LmsQuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onAttemptQuiz={(title, url) => {
                    setMoodleModal({ visible: true, title, url });
                  }}
                />
              ))
            )}
          </View>
        )}
      </View>

      {/* 📢 PSGIM Connect • Official College Notices & Circulars */}
      <View style={styles.connectSection}>
        <View style={styles.connectHeaderRow}>
          <View style={styles.connectIconCircle}>
            <Text style={styles.connectIcon}>📢</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.connectSectionTitle}>PSGIM Connect Circulars</Text>
              <View style={styles.connectLiveBadge}>
                <Text style={styles.connectLiveBadgeText}>OFFICIAL PORTAL</Text>
              </View>
            </View>
            <Text style={styles.connectSectionSub}>
              tqm.psginstitutions.in • Live notices & circular posters
            </Text>
          </View>
        </View>

        {announcements.length === 0 ? (
          <Text style={styles.connectEmptyText}>No circulars posted at this time.</Text>
        ) : (
          announcements.map((item) => (
            <PsgimAnnouncementCard
              key={item.id}
              announcement={item}
              onPress={() => {
                setSelectedNotice(item);
                PsgimConnectService.markAnnouncementAsRead(item.id);
              }}
            />
          ))
        )}
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
              {tab === 'MEDICAL' && '🏥 Med'}
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
          onOpenCoursePlan={(code, name) =>
            setCoursePlanModalInfo({ visible: true, code, name })
          }
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
                <Text style={styles.notifAttendText}>
                  ✅ Attended ({getSlotHours(endedSlotNotification?.slot)} hrs)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.notifBtn, styles.notifBunkBtn]}
                onPress={() => handleRecordFromNotification('bunked')}
                activeOpacity={0.8}
              >
                <Text style={styles.notifBunkText}>
                  ❌ Bunked ({getSlotHours(endedSlotNotification?.slot)} hrs)
                </Text>
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

      {/* Next Class Reminder / Task Modal */}
      <Modal
        visible={showReminderModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowReminderModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.reminderModalCard}>
            <View style={styles.reminderModalHeader}>
              <View style={styles.reminderModalIconCircle}>
                <Text style={styles.reminderModalIcon}>⏰</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.reminderModalTag}>CLASS INSTRUCTION / HOMEWORK</Text>
                <Text style={styles.reminderModalSubject} numberOfLines={1}>
                  {currentSubject?.name || 'Class Task'}
                </Text>
                <Text style={styles.reminderModalSlot}>
                  {currentSlot ? `${currentSlot.startTime} – ${currentSlot.endTime} • ${currentSlot.day}` : ''}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowReminderModal(false)}
                style={styles.closeTripModalBtn}
              >
                <Text style={styles.closeTripModalBtnText}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.reminderInputLabel}>
              What did sir / ma'am say to complete before next class?
            </Text>
            <TextInput
              style={styles.reminderTextInput}
              placeholder="e.g. Submit Assignment 2, Bring scientific calculator, Prepare case PPT"
              placeholderTextColor="#64748B"
              value={reminderNote}
              onChangeText={setReminderNote}
              multiline
              numberOfLines={3}
            />

            <Text style={styles.reminderTimingLabel}>When should we remind you?</Text>
            <View style={styles.reminderTimingRow}>
              <TouchableOpacity
                style={[
                  styles.timingChip,
                  reminderTiming === 'NEXT_CLASS' && styles.timingChipActive,
                ]}
                onPress={() => setReminderTiming('NEXT_CLASS')}
              >
                <Text
                  style={[
                    styles.timingChipText,
                    reminderTiming === 'NEXT_CLASS' && styles.timingChipTextActive,
                  ]}
                >
                  ⏰ Before Next Class
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timingChip,
                  reminderTiming === 'TONIGHT_8PM' && styles.timingChipActive,
                ]}
                onPress={() => setReminderTiming('TONIGHT_8PM')}
              >
                <Text
                  style={[
                    styles.timingChipText,
                    reminderTiming === 'TONIGHT_8PM' && styles.timingChipTextActive,
                  ]}
                >
                  🌙 Tonight (8 PM)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timingChip,
                  reminderTiming === 'TOMORROW_8AM' && styles.timingChipActive,
                ]}
                onPress={() => setReminderTiming('TOMORROW_8AM')}
              >
                <Text
                  style={[
                    styles.timingChipText,
                    reminderTiming === 'TOMORROW_8AM' && styles.timingChipTextActive,
                  ]}
                >
                  🌅 Tomorrow (8 AM)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.reminderModalActions}>
              <TouchableOpacity
                style={styles.cancelReminderBtn}
                onPress={() => setShowReminderModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelReminderBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveReminderBtn}
                onPress={handleSaveReminder}
                activeOpacity={0.8}
              >
                <Text style={styles.saveReminderBtnText}>Set Reminder 🔔</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Moodle Login-Bypassed WebView Modal for Quizzes & Submissions */}
      <MoodleQuizModal
        visible={moodleModal.visible}
        title={moodleModal.title}
        url={moodleModal.url}
        rollNo={studentRollNo}
        password={lmsPassword}
        onClose={() => setMoodleModal({ visible: false, title: '', url: '' })}
      />

      {/* PSGIM Connect Official Circular & Poster Modal */}
      <PsgimNoticeModal
        visible={!!selectedNotice}
        announcement={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      {/* 🪪 Emergency Digital Student ID Modal */}
      <DigitalIdModal
        visible={showDigitalIdModal}
        onClose={() => setShowDigitalIdModal(false)}
        studentRollNo={studentRollNo}
      />

      {/* 📊 Course Plan & CA Marks Tracker Modal */}
      <CoursePlanModal
        visible={coursePlanModalInfo.visible}
        onClose={() =>
          setCoursePlanModalInfo((prev) => ({ ...prev, visible: false }))
        }
        subjectCode={coursePlanModalInfo.code}
        subjectName={coursePlanModalInfo.name}
        studentRollNo={studentRollNo}
      />

      {/* 📄 Attendance Dispute & Proof Dossier Modal */}
      <AttendanceDisputeModal
        visible={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        studentRollNo={studentRollNo}
        subjects={subjects}
      />
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

  // ── Period Reminders & Next Class Task Styles ──────────────
  pillReminderIndicator: {
    fontSize: 9,
  },
  periodReminderContainer: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  activeRemindersBox: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  activeRemindersTitle: {
    color: '#FDE047',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  reminderRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  reminderCheckBtn: {
    paddingRight: 8,
  },
  reminderCheckIcon: {
    fontSize: 14,
  },
  reminderContentCol: {
    flex: 1,
  },
  reminderNoteText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
  },
  reminderNoteTextCompleted: {
    color: '#64748B',
    textDecorationLine: 'line-through',
  },
  reminderTimingText: {
    color: '#94A3B8',
    fontSize: 10,
    marginTop: 2,
  },
  reminderDeleteAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  reminderDeleteActionText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  addReminderTriggerBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  addReminderTriggerIcon: {
    fontSize: 14,
  },
  addReminderTriggerText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Next Class Reminder Modal ──────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  reminderModalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  reminderModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  reminderModalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderModalIcon: {
    fontSize: 20,
  },
  reminderModalTag: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  reminderModalSubject: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  reminderModalSlot: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  closeTripModalBtn: {
    backgroundColor: '#334155',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTripModalBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  reminderInputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  reminderTextInput: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    color: '#F8FAFC',
    padding: 12,
    fontSize: 13,
    marginBottom: 14,
    minHeight: 70,
    textAlignVertical: 'top',
  },
  reminderTimingLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  reminderTimingRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timingChip: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  timingChipActive: {
    backgroundColor: '#2563EB',
    borderColor: '#38BDF8',
  },
  timingChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  timingChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  reminderModalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelReminderBtn: {
    flex: 1,
    backgroundColor: '#334155',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelReminderBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  saveReminderBtn: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveReminderBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  surplusNoticeBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  surplusNoticeText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  discrepancyNoticeBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 8,
  },
  discrepancyNoticeText: {
    color: '#F87171',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  lmsSection: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  lmsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  lmsIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  lmsIcon: {
    fontSize: 22,
  },
  lmsSectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  lmsDirectBadge: {
    backgroundColor: '#065F46',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  lmsDirectBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  lmsSectionSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  lmsTabRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  lmsTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  lmsTabBtnActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#38BDF8',
  },
  lmsTabBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  lmsTabBtnTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  lmsCardsList: {
    gap: 12,
  },
  lmsEmptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  connectSection: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  connectHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  connectIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  connectIcon: {
    fontSize: 22,
  },
  connectSectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  connectLiveBadge: {
    backgroundColor: '#1E3A8A',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  connectLiveBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  connectSectionSub: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  connectEmptyText: {
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 20,
    fontStyle: 'italic',
  },
  quickUtilitiesRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  utilityPillBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 6,
  },
  utilityPillIcon: {
    fontSize: 20,
  },
  utilityPillTextCol: {
    flex: 1,
  },
  utilityPillTitle: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  utilityPillSub: {
    color: '#94A3B8',
    fontSize: 9.5,
    marginTop: 1,
  },
});

