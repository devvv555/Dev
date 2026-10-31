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
  Platform,
} from 'react-native';
import { Subject, TimetableSlot, PeriodAttendanceRecord, AttendanceStatus, PeriodReminder, SurplusAttendanceAlert, LmsAssignment, LmsQuiz, PsgimAnnouncement } from '../types';
import { calculateOverallMetrics, getSlotHours, isPeriodLocked } from '../services/attendanceEngine';
import { CloudSyncService } from '../services/cloudSyncService';

import { AttendanceGauge } from '../components/AttendanceGauge';

import { SubjectCard } from '../components/SubjectCard';
import { PsgimService } from '../services/psgimService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getNextHoliday, getUpcomingWeekdayHolidayNotification } from '../data/academicCalendarData';
import { NotificationService } from '../services/notificationService';
import { AnalyticsService } from '../services/analyticsService';

import { StorageService } from '../services/storageService';
import { PsgimConnectService } from '../services/psgimConnectService';
import { PsgimAnnouncementCard } from '../components/PsgimAnnouncementCard';
import { PsgimNoticeModal } from '../components/PsgimNoticeModal';
import { DigitalIdModal } from '../components/DigitalIdModal';
import { CoursePlanModal } from '../components/CoursePlanModal';
import { AttendanceDisputeModal } from '../components/AttendanceDisputeModal';
import { FacultySelectModal } from '../components/FacultySelectModal';
import { LmsService } from '../services/lmsService';
import { toNewRollNo } from '../data/psgimMasterStudents';
import { KarenGuide } from '../components/KarenGuide';
import { WhatIfForecasterModal } from '../components/WhatIfForecasterModal';
import { StarkArsenalModal } from '../components/StarkArsenalModal';
import { ProtocolGate } from '../engines/starkProtocol/protocolGate';


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
  onUpdateFaculty?: (subjectId: string, newFaculty: string) => void;
  onQuickAttend?: (id: string) => void;
  onQuickBunk?: (id: string) => void;
  onOpenCalendar?: () => void;
  onOpenAdmin?: () => void;
  onRefresh?: () => Promise<void> | void;
  isEnhancedSuit?: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  subjects,
  timetable,
  studentRollNo,
  studentName,
  periodRecords,
  onRecordPeriodAttendance,
  onUpdateFaculty,
  onOpenCalendar,
  onOpenAdmin,
  onRefresh,
  isEnhancedSuit: isEnhancedSuitProp,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'SHORTAGE' | 'SAFE'>('ALL');
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  // Period Reminder state
  const [reminders, setReminders] = useState<PeriodReminder[]>([]);
  const [surplusAlerts, setSurplusAlerts] = useState<SurplusAttendanceAlert[]>([]);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderNote, setReminderNote] = useState('');
  const [reminderTiming, setReminderTiming] = useState<
    'PREV_NIGHT_8PM' | 'NEXT_CLASS' | 'TONIGHT_8PM' | 'TOMORROW_8AM' | 'CUSTOM'
  >('PREV_NIGHT_8PM');
  const [reminderCustomTime, setReminderCustomTime] = useState('');

  // PSGIM Connect Notices state & Register No check
  const [announcements, setAnnouncements] = useState<PsgimAnnouncement[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<PsgimAnnouncement | null>(null);
  const [hasConnectRegisterNo, setHasConnectRegisterNo] = useState<boolean>(true);
  const [announcementFilter, setAnnouncementFilter] = useState<'ALL' | 'EVENT' | 'CIRCULAR' | 'ACADEMIC'>('ALL');

  // Moodle Assignments state
  const [assignments, setAssignments] = useState<LmsAssignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<LmsAssignment | null>(null);

  // Campus Companion Utility Modals state
  const [showDigitalIdModal, setShowDigitalIdModal] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showSubjectPickerModal, setShowSubjectPickerModal] = useState(false);
  const [showKarenGuide, setShowKarenGuide] = useState(false);
  const [showWhatIfForecaster, setShowWhatIfForecaster] = useState(false);
  const [showStarkArsenal, setShowStarkArsenal] = useState(false);
  const [isEnhancedSuit, setIsEnhancedSuit] = useState(isEnhancedSuitProp ?? false);
  const [coursePlanModalInfo, setCoursePlanModalInfo] = useState<{
    visible: boolean;
    code: string;
    name?: string;
    allowSubjectSwitching?: boolean;
  }>({ visible: false, code: '24GM11', name: 'Management & Organisational Behaviour', allowSubjectSwitching: true });
  const [facultyModalSubject, setFacultyModalSubject] = useState<Subject | null>(null);
  const [showRescheduledModal, setShowRescheduledModal] = useState(false);
  const [selectedRescheduleSubjectId, setSelectedRescheduleSubjectId] = useState<string>('');
  const [rescheduleDate, setRescheduleDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [rescheduleTime, setRescheduleTime] = useState<string>('16:45 - 17:45');

  useEffect(() => {
    if (isEnhancedSuitProp !== undefined) {
      setIsEnhancedSuit(isEnhancedSuitProp);
    }
  }, [isEnhancedSuitProp]);

  // Check Stark Protocol tier (Enhanced Suit vs Training Wheels)
  useEffect(() => {
    const checkSuit = async () => {
      const isUnlocked = await ProtocolGate.isSuitUnlocked();
      setIsEnhancedSuit(isUnlocked);
    };
    checkSuit();
    const unsub = ProtocolGate.onModeChange((mode) => {
      setIsEnhancedSuit(mode === 'ENHANCED_SUIT');
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    PsgimConnectService.fetchAnnouncements().then(setAnnouncements);
    if (studentRollNo) {
      StorageService.getPeriodReminders(studentRollNo).then(setReminders);
      StorageService.getSurplusAlerts(studentRollNo).then(setSurplusAlerts);
      LmsService.getAssignments(studentRollNo).then(setAssignments);
      PsgimConnectService.getCredentials(studentRollNo).then((creds) => {
        setHasConnectRegisterNo(!!creds?.registerNo);
      });

      // Refetch assignments after 4 seconds to pick up live background sync from Moodle
      const timer = setTimeout(() => {
        LmsService.getAssignments(studentRollNo).then(setAssignments);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [studentRollNo]);

  const handleSaveReminder = async () => {
    if (!reminderNote.trim()) {
      Alert.alert('Empty Reminder', 'Please enter a reminder or task note.');
      return;
    }
    if (reminderTiming === 'CUSTOM' && !reminderCustomTime.trim()) {
      Alert.alert('Enter Time', 'Please specify the custom time for your reminder.');
      return;
    }
    try {
      Vibration.vibrate(25);
    } catch {}

    const timingDesc =
      reminderTiming === 'PREV_NIGHT_8PM'
        ? 'Previous Night at 8:00 PM'
        : reminderTiming === 'NEXT_CLASS'
        ? '30 Mins Before Class'
        : reminderTiming === 'TONIGHT_8PM'
        ? 'Tonight at 8:00 PM'
        : reminderTiming === 'TOMORROW_8AM'
        ? 'Tomorrow at 8:00 AM'
        : reminderCustomTime.trim();

    const newReminder: PeriodReminder = {
      id: `rem_${Date.now()}`,
      slotId: currentSlot?.id || 'slot_today',
      subjectId: currentSlot?.subjectId || 'sub_general',
      subjectName: currentSubject?.name || 'Class',
      rollNo: studentRollNo,
      note: reminderNote.trim(),
      dueTiming: reminderTiming,
      customTime: reminderTiming === 'CUSTOM' ? reminderCustomTime.trim() : undefined,
      scheduledTimeText: timingDesc,
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
    setReminderCustomTime('');
    Alert.alert(
      'Reminder Set!',
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
  const nextHolidayInfo = React.useMemo(() => getNextHoliday(), []);
  const weekdayHolidayAlert = React.useMemo(
    () => getUpcomingWeekdayHolidayNotification(undefined, timetable, subjects),
    [timetable, subjects]
  );


  // Filter subjects based on selected tab
  const filteredSubjects = subjects.filter((s) => {
    const isSports = s.noAttendance || s.code === 'SPORTS' || s.id === 'sub_sports' || s.name.toLowerCase().includes('sports');
    if (isSports) return filter !== 'SHORTAGE';
    const pct = s.total === 0 ? 100 : (s.attended / s.total) * 100;
    if (filter === 'SAFE') return pct >= 75;
    if (filter === 'SHORTAGE') return pct < 75;
    return true;
  });

  // Auto-detect ongoing or recently ended class based on real-time clock
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);
  const [attendanceWindow, setAttendanceWindow] = useState<{
    status: 'OPEN' | 'LOCKED';
    durationSeconds?: number;
    durationMinutes?: number;
    expiresAt?: string;
    date?: string;
  } | null>(null);

  // Subscribe to live 5-minute attendance window
  useEffect(() => {
    const unsub = CloudSyncService.listenToAttendanceWindow((data) => {
      if (data && data.status) {
        setAttendanceWindow(data as any);
        // Automatically trigger push notification on device when window opens
        if (data.status === 'OPEN' && data.expiresAt && new Date(data.expiresAt).getTime() > Date.now()) {
          NotificationService.sendLocalNotification(
            "Attendance Window Open: Today's Final Attendance",
            "Today's live attendance is open now. Tap to record or change your attendance before the countdown ends.",
            { windowOpen: true }
          );
        }
      }
    });
    return () => unsub();
  }, []);

  // Real-time second-by-second countdown timer for the open window
  const [windowRemainingSeconds, setWindowRemainingSeconds] = useState<number>(0);
  useEffect(() => {
    if (!attendanceWindow || attendanceWindow.status !== 'OPEN' || !attendanceWindow.expiresAt) {
      setWindowRemainingSeconds(0);
      return;
    }
    const calcRemaining = () => {
      const diff = Math.max(0, Math.floor((new Date(attendanceWindow.expiresAt!).getTime() - Date.now()) / 1000));
      setWindowRemainingSeconds(diff);
    };
    calcRemaining();
    const timer = setInterval(calcRemaining, 1000);
    return () => clearInterval(timer);
  }, [attendanceWindow]);

  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const now = new Date();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = dayNames[now.getDay()];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Date formatted as DD/MM/YYYY
  const todayFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const formatDateDMY = (dateStr?: string): string => {
    if (!dateStr) return '';
    const clean = dateStr.trim();
    if (clean.includes('-')) {
      const parts = clean.split('-');
      if (parts[0].length === 4) {
        // YYYY-MM-DD -> DD/MM/YYYY
        return `${parts[2].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[0]}`;
      } else if (parts[2].length === 4) {
        // DD-MM-YYYY -> DD/MM/YYYY
        return `${parts[0].padStart(2, '0')}/${parts[1].padStart(2, '0')}/${parts[2]}`;
      }
    }
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
    return dateStr;
  };

  // Get slots for today
  const todaySlots = timetable.filter(
    (s) => s.day.toLowerCase() === currentDayName.toLowerCase()
  );

  // Check if today's attendance has been concluded and locked in the cloud (only if date matches today)
  const isTodayLockedInCloud = Boolean(
    attendanceWindow &&
    attendanceWindow.status === 'LOCKED' &&
    (!attendanceWindow.date || attendanceWindow.date === now.toISOString().split('T')[0])
  );
  const todayClassesEnded = todaySlots.length > 0 && todaySlots.every((s) => {
    const end = timeToMinutes(s.endTime);
    return currentMinutes >= end;
  });
  // Today's classes have finished for the day
  const isTodayConcluded = todayClassesEnded || isTodayLockedInCloud;

  // Compute next day with scheduled classes
  const getNextScheduledDay = () => {
    for (let offset = 1; offset <= 7; offset++) {
      const nextDate = new Date(now);
      nextDate.setDate(now.getDate() + offset);
      const nextDayName = dayNames[nextDate.getDay()];
      const slotsOnNextDay = timetable.filter((s) => s.day.toLowerCase() === nextDayName.toLowerCase());
      if (slotsOnNextDay.length > 0) {
        return {
          dayName: nextDayName,
          date: nextDate,
          formattedDate: `${String(nextDate.getDate()).padStart(2, '0')}/${String(nextDate.getMonth() + 1).padStart(2, '0')}/${nextDate.getFullYear()}`,
          dateStr: nextDate.toISOString().split('T')[0],
          slots: slotsOnNextDay,
        };
      }
    }
    return {
      dayName: currentDayName,
      date: now,
      formattedDate: todayFormatted,
      dateStr: now.toISOString().split('T')[0],
      slots: todaySlots,
    };
  };

  const [selectedDay, setSelectedDay] = useState<string>(
    currentDayName === 'Sunday' ? 'Sunday' : currentDayName
  );
  // Allow user to toggle between viewing Today's attendance vs Next Day preview
  const [viewingNextDay, setViewingNextDay] = useState<boolean>(false);

  const nextDayInfo = getNextScheduledDay();
  const displayDayName = viewingNextDay ? nextDayInfo.dayName : (selectedDay || currentDayName);
  const displayDateFormatted = viewingNextDay ? nextDayInfo.formattedDate : todayFormatted;
  const displayDateStr = viewingNextDay ? nextDayInfo.dateStr : now.toISOString().split('T')[0];

  // Selected day's slots
  const activeDaySlots = timetable.filter(
    (s) => s.day.toLowerCase() === displayDayName.toLowerCase()
  );
  const isWeekendOrNoClass = activeDaySlots.length === 0;

  // Auto-detect which slot is active, just ended, or upcoming
  const autoDetectSlotIndex = (): number => {
    if (activeDaySlots.length === 0) return 0;

    if (isTodayConcluded) {
      return 0; // First slot of next day
    }

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
    if (!currentSlot) return { tag: 'SCHEDULED', color: '#818CF8', message: 'No classes scheduled.' };
    const start = timeToMinutes(currentSlot.startTime);
    const end = timeToMinutes(currentSlot.endTime);
    const isToday = currentSlot.day.toLowerCase() === currentDayName.toLowerCase();

    if (!isTodayConcluded && isToday && currentMinutes >= start && currentMinutes < end) {
      const left = end - currentMinutes;
      return {
        tag: `LIVE NOW (${left}m left)`,
        color: '#EF4444',
        message: 'This class is currently in session. Mark your attendance when completed:',
      };
    }
    if (!isTodayConcluded && isToday && currentMinutes >= end && currentMinutes <= end + 60) {
      return {
        tag: 'CLASS JUST ENDED',
        color: '#F59E0B',
        message: 'This class has just ended. Did you attend or miss it?',
      };
    }
    if (!isTodayConcluded && isToday && currentMinutes < start) {
      const startsIn = start - currentMinutes;
      return {
        tag: `STARTS IN ${startsIn}m`,
        color: '#38BDF8',
        message: `Upcoming class today at ${currentSlot.startTime}. Pre-log or plan your attendance:`,
      };
    }
    return {
      tag: isTodayConcluded ? `NEXT CLASS • ${currentSlot.day.toUpperCase()}` : `${currentSlot.day.toUpperCase()} SCHEDULE`,
      color: '#818CF8',
      message: isTodayConcluded
        ? `Today's attendance is closed. Next scheduled class on ${displayDayName} (${displayDateFormatted}):`
        : 'Automatic slot tracker based on your weekly timetable:',
    };
  };

  const todayDate = displayDateStr;
  const currentPeriodKey = currentSlot ? `${todayDate}_${currentSlot.id}` : null;
  const currentRecord = currentPeriodKey ? periodRecords[currentPeriodKey] : undefined;
  const slotStatus = getSlotStatus();

  // Interactive Class Ended Notification popup state
  const [endedSlotNotification, setEndedSlotNotification] = useState<{
    slot: TimetableSlot;
    subject: Subject;
  } | null>(null);
  const alertedSlotsRef = useRef<Set<string>>(new Set());

  // Restore already alerted class starts for today from AsyncStorage on mount
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    AsyncStorage.getItem(`@alerted_slots_${today}`).then((val) => {
      if (val) {
        try {
          const parsed = JSON.parse(val);
          if (Array.isArray(parsed)) {
            parsed.forEach((k: string) => alertedSlotsRef.current.add(k));
          }
        } catch {}
      }
    });
  }, []);

  // Automatic detector that fires notification strictly ONCE at the beginning of every class
  useEffect(() => {
    let isSubscribed = true;

    const checkClassBeginning = async () => {
      if (!isSubscribed) return;
      const currentTime = new Date();
      const mins = currentTime.getHours() * 60 + currentTime.getMinutes();
      const today = currentTime.toISOString().split('T')[0];
      const todayDay = dayNames[currentTime.getDay()].toLowerCase();

      // Find active class that has started and is currently ongoing
      const currentSlot = timetable.find((slot) => {
        if (slot.day.toLowerCase() !== todayDay) return false;
        const start = timeToMinutes(slot.startTime);
        const end = timeToMinutes(slot.endTime);
        return mins >= start && mins < end;
      });

      if (!currentSlot) return;

      const periodStartKey = `start_${today}_${currentSlot.id}`;

      // Check in-memory ref first
      if (alertedSlotsRef.current.has(periodStartKey)) {
        return;
      }

      // Check persistent storage to prevent duplicate notifications across re-renders or reloads
      try {
        const storedAlertsRaw = await AsyncStorage.getItem(`@alerted_slots_${today}`);
        const storedAlerts: string[] = storedAlertsRaw ? JSON.parse(storedAlertsRaw) : [];
        if (storedAlerts.includes(periodStartKey)) {
          alertedSlotsRef.current.add(periodStartKey);
          return;
        }

        // Mark as alerted immediately before async notification call
        alertedSlotsRef.current.add(periodStartKey);
        storedAlerts.push(periodStartKey);
        await AsyncStorage.setItem(`@alerted_slots_${today}`, JSON.stringify(storedAlerts));
      } catch (e) {
        alertedSlotsRef.current.add(periodStartKey);
      }

      const sub = subjects.find((s) => s.id === currentSlot.subjectId);
      if (sub && isSubscribed) {
        try {
          Vibration.vibrate(200);
        } catch {}
        const periodKey = `${today}_${currentSlot.id}`;
        const recorded = periodRecords[periodKey];
        NotificationService.notifyClassStarted(currentSlot, sub, recorded?.status);
      }
    };

    checkClassBeginning();
    const interval = setInterval(checkClassBeginning, 30000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [timetable, subjects]);


  // Check if today's 5-minute live attendance window is active
  const isAttendanceWindowActive = Boolean(
    attendanceWindow &&
    attendanceWindow.status === 'OPEN' &&
    (!attendanceWindow.date || attendanceWindow.date === todayDate) &&
    (!attendanceWindow.expiresAt || new Date(attendanceWindow.expiresAt).getTime() > Date.now())
  );

  // Calculate if the currently selected slot is locked
  const lockInfo = currentSlot
    ? isPeriodLocked({
        slot: currentSlot,
        recordDate: todayDate,
        subject: currentSubject,
        now,
        isWindowOpen: isAttendanceWindowActive,
      })
    : { isLocked: false };
  const isCurrentSlotLocked = lockInfo.isLocked;

  // Auto-sync completed slot attendance to the cloud once timer completes
  useEffect(() => {
    if (!studentRollNo || !timetable || timetable.length === 0) return;

    const checkAndUploadCompletedSlots = async () => {
      const nowCheck = new Date();
      const currentMins = nowCheck.getHours() * 60 + nowCheck.getMinutes();
      const todayStr = nowCheck.toISOString().split('T')[0];
      const todayDayStr = dayNames[nowCheck.getDay()].toLowerCase();

      // Find slots for today whose timer has completed
      const todaySlotsList = timetable.filter(
        (s) => s.day.toLowerCase() === todayDayStr
      );

      for (const slot of todaySlotsList) {
        const endMins = timeToMinutes(slot.endTime);
        if (currentMins >= endMins) {
          const pKey = `${todayStr}_${slot.id}`;
          const existingRec = periodRecords[pKey];
          if (existingRec && !existingRec.cloudSyncedAt) {
            // Auto-upload to cloud
            const syncedRec: PeriodAttendanceRecord = {
              ...existingRec,
              cloudSyncedAt: new Date().toISOString(),
              lockedUntilPortalUpdate: true,
            };
            try {
              await CloudSyncService.syncPeriodRecord(studentRollNo, syncedRec);
              await CloudSyncService.syncSubjects(studentRollNo, subjects);
            } catch (err) {
              console.warn('[AutoUpload] Failed to sync completed class to cloud:', err);
            }
          }
        }
      }
    };

    checkAndUploadCompletedSlots();
    const uploadInterval = setInterval(checkAndUploadCompletedSlots, 60000);
    return () => clearInterval(uploadInterval);
  }, [studentRollNo, timetable, periodRecords, subjects]);

  // Periodic active student heartbeat tracker (syncs online presence & active minutes to cloud)
  useEffect(() => {
    if (!studentRollNo) return;
    // Initial ping on load
    const userBatch = (profile as any)?.batch || profile?.section || 'B';
    AnalyticsService.initStudentActivity(studentRollNo, studentName, userBatch);
    AnalyticsService.trackActiveMinutes(studentRollNo, 1);

    // Heartbeat every 60 seconds while app is in foreground
    const heartbeatTimer = setInterval(() => {
      AnalyticsService.trackActiveMinutes(studentRollNo, 1);
    }, 60000);

    return () => clearInterval(heartbeatTimer);
  }, [studentRollNo, studentName, (profile as any)?.batch, profile?.section]);

  const handleRecordFromNotification = async (status: AttendanceStatus) => {
    if (!endedSlotNotification) return;
    const { slot, subject } = endedSlotNotification;
    const lockCheck = isPeriodLocked({
      slot,
      recordDate: todayDate,
      subject,
    });
    if (lockCheck.isLocked) {
      Alert.alert('Attendance Locked', lockCheck.reason || 'This period is locked until the college updates portal attendance.');
      setEndedSlotNotification(null);
      return;
    }
    const res = await onRecordPeriodAttendance(slot, todayDate, status);
    setEndedSlotNotification(null);
    if (res.success) {
      Alert.alert(
        status === 'attended' ? 'Marked Present' : status === 'bunked' ? 'Marked Absent' : 'Class Cancelled',
        `Attendance recorded for ${subject.name}.`
      );
    }
  };

  const handleAutoRecord = async (status: AttendanceStatus) => {
    if (!currentSlot || !currentSubject) return;

    if (isCurrentSlotLocked) {
      Alert.alert(
        'Attendance Locked',
        lockInfo.reason || 'The class timer has completed and attendance has been synced to the cloud. You cannot modify it until the college updates the portal.'
      );
      return;
    }

    if (currentRecord) {
      if (currentRecord.status === status) {
        Alert.alert(
          'Already Recorded',
          `This period is already marked as "${status.toUpperCase()}".`
        );
        return;
      }

      // Check if locked before switching
      const check = isPeriodLocked({
        slot: currentSlot,
        recordDate: todayDate,
        subject: currentSubject,
        isWindowOpen: isAttendanceWindowActive,
      });
      if (check.isLocked) {
        Alert.alert(
          'Attendance Locked',
          check.reason || 'The class timer has completed and attendance has been uploaded to the cloud. It cannot be altered until the college updates the portal.'
        );
        return;
      }

      try {
        Vibration.vibrate(35);
      } catch {}

      const fromStatus = currentRecord.status.toUpperCase();
      const toStatus = status.toUpperCase();

      const res = await onRecordPeriodAttendance(currentSlot, todayDate, status);
      if (res.success) {
        Alert.alert(
          'Attendance Updated',
          `Changed from "${fromStatus}" to "${toStatus}" (${getSlotHours(currentSlot)} hrs). Your attendance totals and percentages have been recalculated.`
        );
      } else {
        Alert.alert('Notice', res.message);
      }
      return;
    }

    // First time recording this period
    try {
      Vibration.vibrate(25);
    } catch {}
    const res = await onRecordPeriodAttendance(currentSlot, todayDate, status);
    if (res.success) {
      Alert.alert(
        status === 'attended'
          ? 'Logged Present'
          : status === 'bunked'
          ? 'Logged Absent'
          : 'Class Cancelled',
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
      style={[styles.container, isEnhancedSuit && { backgroundColor: '#0B132B' }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={isEnhancedSuit ? '#F4E8C1' : '#38BDF8'}
          colors={isEnhancedSuit ? ['#F4E8C1', '#1C2541'] : ['#38BDF8', '#2563EB']}
          progressBackgroundColor={isEnhancedSuit ? '#1C2541' : '#1E293B'}
        />
      }
    >
      {/* Student Welcome Card */}
      <View style={[
        styles.welcomeCard,
        isEnhancedSuit && {
          backgroundColor: '#1C2541',
          borderColor: '#2A3B5C',
          borderWidth: 1.5,
          shadowColor: '#000',
        }
      ]}>
        <View style={styles.welcomeTopRow}>
          <TouchableOpacity
            style={[
              styles.welcomeAvatar,
              isEnhancedSuit && {
                backgroundColor: 'rgba(244, 232, 193, 0.15)',
                borderColor: '#F4E8C1',
              }
            ]}
            onPress={() => setShowDigitalIdModal(true)}
            activeOpacity={0.7}
          >
            <Text style={[styles.welcomeAvatarText, isEnhancedSuit && { color: '#F4E8C1' }]}>
              {studentName ? studentName.charAt(0) : 'S'}
            </Text>
          </TouchableOpacity>
          <View style={styles.welcomeInfo}>
            <Text style={[styles.welcomeGreeting, isEnhancedSuit && { color: '#F4E8C1' }]}>
              {isEnhancedSuit ? 'Tactical HUD Active,' : 'Welcome,'}
            </Text>
            <Text style={[styles.welcomeName, isEnhancedSuit && { color: '#F4E8C1' }]} numberOfLines={1}>
              {studentName || 'Student'}
            </Text>
            <Text style={[styles.welcomeSub, isEnhancedSuit && { color: '#F4E8C1' }]}>
              <Text style={[styles.welcomeRoll, isEnhancedSuit && { color: '#F4E8C1' }]}>
                Roll No: {toNewRollNo(studentRollNo)}
              </Text>
              {profile.section ? ` • ${profile.section}` : ''} • {isEnhancedSuit ? 'Enhanced Stark Mark XLVII' : 'MBA (2026–28)'}
            </Text>
          </View>
          {onOpenAdmin && (
            <TouchableOpacity
              style={[
                styles.welcomeAdminBadge,
                isEnhancedSuit && {
                  backgroundColor: 'rgba(244, 232, 193, 0.15)',
                  borderColor: '#F4E8C1',
                }
              ]}
              onPress={onOpenAdmin}
              activeOpacity={0.7}
            >
              <Text style={[styles.welcomeAdminBadgeText, isEnhancedSuit && { color: '#F4E8C1' }]}>
                Admin
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Verified Student Details Row */}
        <View style={[styles.profileDetailsRow, isEnhancedSuit && { borderTopColor: '#2A3B5C' }]}>
          {studentRollNo ? (
            <View style={[styles.profilePill, isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C' }]}>
              <Text style={[styles.profilePillText, isEnhancedSuit && { color: '#F4E8C1' }]}>
                Roll No: {toNewRollNo(studentRollNo)}
              </Text>
            </View>
          ) : null}
          {profile.email ? (
            <View style={[styles.profilePill, isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C' }]}>
              <Text style={[styles.profilePillText, isEnhancedSuit && { color: '#F4E8C1' }]} numberOfLines={1}>
                {profile.email}
              </Text>
            </View>
          ) : null}
          {isEnhancedSuit && (
            <View style={[styles.profilePill, { backgroundColor: 'rgba(244, 232, 193, 0.15)', borderColor: '#F4E8C1' }]}>
              <Text style={{ color: '#F4E8C1', fontSize: 11, fontWeight: '800' }}>
                STARK 576 ACTIVE
              </Text>
            </View>
          )}
        </View>

        {/* Latest Announcement Banner */}
        {announcements.length > 0 && (
          <TouchableOpacity
            style={styles.welcomeAnnouncementBanner}
            onPress={() => {
              setSelectedNotice(announcements[0]);
              PsgimConnectService.markAnnouncementAsRead(announcements[0].id);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.welcomeAnnouncementBadge}>
              <Text style={styles.welcomeAnnouncementBadgeText}>ANNOUNCEMENT</Text>
            </View>
            <Text style={styles.welcomeAnnouncementTitle} numberOfLines={1}>
              {announcements[0].title}
            </Text>
            <Text style={styles.welcomeAnnouncementChevron}>View →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Weekday Holiday 7-Day Notification Alert (Strictly NO notification for weekend holidays) */}
      {weekdayHolidayAlert ? (
        <TouchableOpacity
          style={[
            styles.weekdayNotifCard,
            isEnhancedSuit && {
              backgroundColor: '#1C2541',
              borderColor: '#2A3B5C',
              borderWidth: 1.5,
            }
          ]}
          onPress={onOpenCalendar}
          activeOpacity={0.85}
        >
          <View style={styles.weekdayNotifTop}>
            <View style={[
              styles.weekdayNotifBadge,
              isEnhancedSuit && { backgroundColor: 'rgba(244, 232, 193, 0.15)', borderColor: '#F4E8C1' }
            ]}>
              <Text style={[styles.weekdayNotifBadgeText, isEnhancedSuit && { color: '#F4E8C1' }]}>
                HOLIDAY ALERT • {weekdayHolidayAlert.daysRemaining === 0 ? 'TODAY' : weekdayHolidayAlert.daysRemaining === 1 ? 'TOMORROW' : `IN ${weekdayHolidayAlert.daysRemaining} DAYS`}
              </Text>
            </View>
            <Text style={[styles.weekdayNotifLink, isEnhancedSuit && { color: '#F4E8C1' }]}>View Calendar →</Text>
          </View>

          <Text style={[styles.weekdayNotifTitle, isEnhancedSuit && { color: '#F4E8C1' }]}>
            {weekdayHolidayAlert.holiday.title} ({formatDateDMY(weekdayHolidayAlert.holiday.date)} • {weekdayHolidayAlert.holiday.day})
          </Text>

          {/* Academic calendar pre-accounted message */}
          <View style={[
            styles.weekdayNotifAccountedBox,
            isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C' }
          ]}>
            <Text style={[styles.weekdayNotifAccountedText, isEnhancedSuit && { color: '#C5BA9D' }]}>
              ✓ {weekdayHolidayAlert.accountingNote}
            </Text>
          </View>

          {/* Expected After-College Rescheduled / Makeup Classes breakdown */}
          {weekdayHolidayAlert.expectedMakeupClasses && weekdayHolidayAlert.expectedMakeupClasses.length > 0 && (
            <View style={[
              styles.makeupClassesBox,
              isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C' }
            ]}>
              <View style={styles.makeupClassesHeader}>
                <Text style={[styles.makeupClassesBadge, isEnhancedSuit && { color: '#F4E8C1' }]}>
                  {weekdayHolidayAlert.totalExpectedHours} {weekdayHolidayAlert.totalExpectedHours === 1 ? 'HOUR' : 'HOURS'} EXPECTED AFTER COLLEGE
                </Text>
                <Text style={[styles.makeupClassesSub, isEnhancedSuit && { color: '#C5BA9D' }]}>
                  {weekdayHolidayAlert.expectedMakeupClasses.length} regular periods will be compensated:
                </Text>
              </View>

              <View style={styles.makeupClassesList}>
                {weekdayHolidayAlert.expectedMakeupClasses.map((item, idx) => (
                  <View key={idx} style={[
                    styles.makeupClassItem,
                    isEnhancedSuit && { borderTopColor: '#2A3B5C' }
                  ]}>
                    <View style={styles.makeupClassItemInfo}>
                      <Text style={[styles.makeupClassCode, isEnhancedSuit && { color: '#F4E8C1' }]}>{item.code}</Text>
                      <Text style={[styles.makeupClassName, isEnhancedSuit && { color: '#F4E8C1' }]} numberOfLines={1}>
                        {item.subjectName}
                      </Text>
                      <Text style={[styles.makeupClassTime, isEnhancedSuit && { color: '#C5BA9D' }]}>
                        Original slot: {item.originalTime} • {item.hours} {item.hours === 1 ? 'hr' : 'hrs'}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.makeupMarkBtn,
                        isEnhancedSuit && { backgroundColor: '#F4E8C1' }
                      ]}
                      activeOpacity={0.8}
                      onPress={(e) => {
                        e.stopPropagation();
                        setSelectedRescheduleSubjectId(item.subjectId);
                        setShowRescheduledModal(true);
                      }}
                    >
                      <Text style={[styles.makeupMarkBtnText, isEnhancedSuit && { color: '#0B132B', fontWeight: '800' }]}>Mark Attendance</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}
        </TouchableOpacity>

      ) : nextHolidayInfo ? (
        /* Regular calendar access card when no weekday holiday is within 7 days */
        <TouchableOpacity
          style={[
            styles.holidayBannerCard,
            isEnhancedSuit && {
              backgroundColor: '#1C2541',
              borderColor: '#2A3B5C',
              borderWidth: 1.5,
            }
          ]}
          onPress={onOpenCalendar}
          activeOpacity={0.8}
        >
          <View style={styles.holidayBannerLeft}>
            <View style={styles.holidayBannerTextCol}>
              <View style={styles.holidayBadgeRow}>
                <Text style={[
                  styles.holidayCountdownBadge,
                  isEnhancedSuit && { color: '#0B132B', backgroundColor: '#F4E8C1' }
                ]}>
                  ACADEMIC CALENDAR & HOLIDAYS
                </Text>
                {nextHolidayInfo.holiday.longWeekendTag && (
                  <View style={[
                    styles.holidayWeekendPill,
                    isEnhancedSuit && { backgroundColor: 'rgba(244, 232, 193, 0.15)', borderColor: '#F4E8C1' }
                  ]}>
                    <Text style={[
                      styles.holidayWeekendPillText,
                      isEnhancedSuit && { color: '#F4E8C1' }
                    ]}>
                      {nextHolidayInfo.holiday.longWeekendTag}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={[
                styles.holidayBannerTitle,
                isEnhancedSuit && { color: '#F4E8C1' }
              ]} numberOfLines={1}>
                Next: {nextHolidayInfo.holiday.title} ({formatDateDMY(nextHolidayInfo.holiday.date)} • {nextHolidayInfo.holiday.day})
              </Text>
            </View>
          </View>
          <Text style={[styles.holidayBannerChevron, isEnhancedSuit && { color: '#F4E8C1' }]}>→</Text>
        </TouchableOpacity>
      ) : null}

      {/* Top Banner: Overall Attendance Metric */}
      <View style={[
        styles.summaryCard,
        isEnhancedSuit && {
          backgroundColor: '#1C2541',
          borderColor: '#2A3B5C',
          borderWidth: 1.5,
          shadowColor: '#000',
        }
      ]}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={[styles.summaryTitle, isEnhancedSuit && { color: '#F4E8C1' }]}>Overall Attendance</Text>
            <Text style={[styles.summarySubtitle, isEnhancedSuit && { color: '#F4E8C1' }]}>
              {overall.totalAttended} of {overall.totalHeld} total hours attended
            </Text>
          </View>
          <View style={styles.badgeContainer}>
            {overall.percentage >= 75 ? (
              <View style={[
                styles.activeMedBadge,
                isEnhancedSuit
                  ? { backgroundColor: 'rgba(244, 232, 193, 0.15)', borderColor: '#F4E8C1' }
                  : { backgroundColor: '#064E3B', borderColor: '#059669' }
              ]}>
                <Text style={[styles.activeMedBadgeText, isEnhancedSuit ? { color: '#F4E8C1' } : { color: '#34D399' }]}>
                  {isEnhancedSuit ? 'Stark Safe (≥75%)' : 'Target Safe (≥75%)'}
                </Text>
              </View>
            ) : (
              <View style={[styles.activeMedBadge, { backgroundColor: '#450A0A', borderColor: '#DC2626' }]}>
                <Text style={[styles.activeMedBadgeText, { color: '#F87171' }]}>Shortage (&lt;75%)</Text>
              </View>
            )}
          </View>
        </View>

        <AttendanceGauge metrics={overall} />

        <View style={[styles.summaryFooter, isEnhancedSuit && { borderTopColor: '#2A3B5C' }]}>
          <Text style={[styles.summaryFooterText, isEnhancedSuit && { color: '#F4E8C1' }]}>{overall.summaryMessage}</Text>
        </View>
      </View>

      {/* Live Auto-Class Tracker Card (Strictly Today's Real-Time Schedule) */}
      <View style={[
        styles.promptSimulatorCard,
        isEnhancedSuit && {
          backgroundColor: '#1C2541',
          borderColor: '#2A3B5C',
          borderWidth: 1.5,
        }
      ]}>
        {/* Header: Strictly Today's Schedule */}
        <View style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[{ fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5 }, isEnhancedSuit && { color: '#F4E8C1' }]}>
                {isWeekendOrNoClass ? 'WEEKEND RELAX' : viewingNextDay ? 'NEXT DAY PREVIEW' : "TODAY'S SCHEDULE"}
              </Text>
              <Text style={[{ fontSize: 12, fontWeight: '600', color: '#64748B' }, isEnhancedSuit && { color: '#C5BA9D' }]}>
                • {displayDateFormatted}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              {isTodayConcluded && (
                <TouchableOpacity
                  onPress={() => setViewingNextDay(!viewingNextDay)}
                  style={[
                    {
                      backgroundColor: viewingNextDay ? '#312E81' : '#1E293B',
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderRadius: 6,
                      borderWidth: 1,
                      borderColor: viewingNextDay ? '#6366F1' : '#334155',
                    },
                    isEnhancedSuit && {
                      backgroundColor: viewingNextDay ? '#F4E8C1' : '#0B132B',
                      borderColor: '#2A3B5C',
                    }
                  ]}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    { fontSize: 10, fontWeight: '700', color: viewingNextDay ? '#A5B4FC' : '#94A3B8' },
                    isEnhancedSuit && { color: viewingNextDay ? '#0B132B' : '#F4E8C1' }
                  ]}>
                    {viewingNextDay ? '← View Today' : 'Preview Next Day →'}
                  </Text>
                </TouchableOpacity>
              )}
              <View style={[
                { backgroundColor: '#1E293B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: '#334155' },
                isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C' }
              ]}>
                <Text style={[
                  { fontSize: 10, fontWeight: '700', color: viewingNextDay ? '#818CF8' : '#38BDF8' },
                  isEnhancedSuit && { color: '#F4E8C1' }
                ]}>
                  {viewingNextDay ? 'UPCOMING DAY' : 'LIVE REAL-TIME'}
                </Text>
              </View>
            </View>
          </View>

          {isWeekendOrNoClass ? (
            <View style={[
              { backgroundColor: '#1E293B', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#334155', alignItems: 'center', marginTop: 10 },
              isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C' }
            ]}>
              <Text style={[{ fontSize: 16, fontWeight: '800', color: '#F1F5F9', marginBottom: 4 }, isEnhancedSuit && { color: '#F4E8C1' }]}>
                No Classes Scheduled Today ({currentDayName})
              </Text>
              <Text style={[{ fontSize: 12, color: '#94A3B8', textAlign: 'center' }, isEnhancedSuit && { color: '#C5BA9D' }]}>
                Enjoy your weekend break! Classes resume on Monday as per official college timetable.
              </Text>
            </View>
          ) : null}
        </View>

        {!isWeekendOrNoClass && (
          <>
            <View style={styles.simulatorHeader}>
              <View style={[styles.statusTagBadge, { borderColor: slotStatus.color }]}>
                <Text style={[styles.simulatorTag, { color: slotStatus.color }]}>
                  {slotStatus.tag}
                </Text>
              </View>
              <Text style={[styles.simulatorTime, isEnhancedSuit && { color: '#F4E8C1' }]}>
                {currentSlot ? `${currentSlot.startTime} - ${currentSlot.endTime}` : ''}
              </Text>
            </View>

            <Text style={[styles.simulatorTitle, isEnhancedSuit && { color: '#F4E8C1' }]}>
              {currentSubject ? `${currentSubject.name}` : 'No Class in Session'}
            </Text>
            <Text style={[styles.simulatorSubDetail, isEnhancedSuit && { color: '#C5BA9D' }]}>
              {currentSlot ? `${currentSlot.day} • ${currentSlot.startTime} – ${currentSlot.endTime} (${getSlotHours(currentSlot)} ${getSlotHours(currentSlot) === 1 ? 'hr' : 'hrs'}) • ${currentSlot.room || 'Lecture Hall'}` : ''}
            </Text>
            {currentSlot && (currentSlot.faculty || currentSubject?.faculty) ? (
              <TouchableOpacity
                style={styles.hourlyFacultyTouch}
                activeOpacity={0.7}
                onPress={() => currentSubject && setFacultyModalSubject(currentSubject)}
              >
                <Text style={[styles.hourlyFacultyText, isEnhancedSuit && { color: '#C5BA9D' }]}>
                  Teaching Faculty: <Text style={[styles.hourlyFacultyHighlight, isEnhancedSuit && { color: '#F4E8C1' }]}>{currentSlot.faculty || currentSubject?.faculty}</Text>
                </Text>
              </TouchableOpacity>
            ) : null}
            <Text style={[styles.simulatorSub, isEnhancedSuit && { color: '#C5BA9D' }]}>
              {slotStatus.message}
            </Text>
          </>
        )}

        {/* Horizontal Period Selector: All today's periods with live status badges */}
        {!isWeekendOrNoClass && activeDaySlots.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.periodPillScroll}
            contentContainerStyle={styles.periodPillContainer}
          >
            {activeDaySlots.map((slot, index) => {
              const slotSub = subjects.find((s) => s.id === slot.subjectId);
              const isSportsSlot = slot.subjectId === 'sub_sports' || slotSub?.code === 'SPORTS';
              const pKey = `${todayDate}_${slot.id}`;
              const rec = periodRecords[pKey];
              const isSelected = activeIndex === index;

              return (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.periodPill,
                    isSelected ? styles.periodPillActive : styles.periodPillInactive,
                    rec?.status === 'attended' && !isSelected && styles.periodPillMarkedAttended,
                    rec?.status === 'bunked' && !isSelected && styles.periodPillMarkedBunked,
                    rec?.status === 'cancelled' && !isSelected && styles.periodPillMarkedCancelled,
                    isEnhancedSuit && (
                      isSelected
                        ? { backgroundColor: '#F4E8C1', borderColor: '#F4E8C1' }
                        : { backgroundColor: '#0B132B', borderColor: '#2A3B5C' }
                    )
                  ]}
                  onPress={() => setSelectedSlotIndex(index)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.periodPillTime,
                      isSelected && styles.periodPillTextActive,
                      isEnhancedSuit && (isSelected ? { color: '#0B132B', fontWeight: '800' } : { color: '#F4E8C1' })
                    ]}
                  >
                    {slot.startTime}
                  </Text>
                  <Text
                    style={[
                      styles.periodPillCode,
                      isSelected && styles.periodPillTextActive,
                      isEnhancedSuit && (isSelected ? { color: '#0B132B', fontWeight: '800' } : { color: '#F4E8C1' })
                    ]}
                  >
                    {slotSub?.code || 'CLASS'}
                  </Text>
                  {isSportsSlot ? (
                    <Text style={[styles.periodPillStatus, { color: isEnhancedSuit ? '#F4E8C1' : '#818CF8' }]}>
                      No Attendance
                    </Text>
                  ) : rec ? (
                    <Text style={[styles.periodPillStatus, isEnhancedSuit && { color: '#C5BA9D' }]}>
                      {rec.status === 'attended' ? 'Attended' : rec.status === 'bunked' ? 'Missed' : 'Free'}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* If this period was already marked, display locked status banner */}
        {!isWeekendOrNoClass && currentRecord && (
          <View
            style={[
              styles.periodLockedBanner,
              isCurrentSlotLocked && styles.lockedBannerCloudSync,
              !isCurrentSlotLocked && currentRecord.status === 'attended' && styles.lockedBannerAttended,
              !isCurrentSlotLocked && currentRecord.status === 'bunked' && styles.lockedBannerBunked,
              !isCurrentSlotLocked && currentRecord.status === 'cancelled' && styles.lockedBannerCancelled,
            ]}
          >
            <View style={styles.lockedBannerRow}>
              <Text style={styles.lockedBannerIcon}>
                {isCurrentSlotLocked ? '[LOCKED]' : currentRecord.status === 'attended' ? '[ATTENDED]' : currentRecord.status === 'bunked' ? '[MISSED]' : '[FREE]'}
              </Text>
              <View style={styles.lockedBannerTextContainer}>
                <Text style={styles.lockedBannerTitle}>
                  {currentRecord.status === 'attended' && `Recorded: Attended (${currentRecord.hours || getSlotHours(currentSlot)} hrs)`}
                  {currentRecord.status === 'bunked' && `Recorded: Missed (${currentRecord.hours || getSlotHours(currentSlot)} hrs)`}
                  {currentRecord.status === 'cancelled' && 'Recorded: Free / Cancelled'}
                </Text>
                {isCurrentSlotLocked ? (
                  <>
                    <Text style={styles.lockedBannerSub}>
                      Class timer completed. Attendance has been synced to the cloud and locked. It cannot be altered until the college updates portal attendance.
                    </Text>
                    <Text style={styles.lockedCloudBadge}>
                      Synced to Cloud • Portal Update Pending
                    </Text>
                  </>
                ) : isAttendanceWindowActive ? (
                  <>
                    <Text style={[styles.lockedBannerSub, { color: '#6ee7b7', fontWeight: '700' }]}>
                      Live attendance window open. Closes in {Math.floor(windowRemainingSeconds / 60)}:{String(windowRemainingSeconds % 60).padStart(2, '0')}. You can mark or change your attendance now.
                    </Text>
                    <Text style={[styles.lockedCloudBadge, { color: '#34d399', backgroundColor: 'rgba(16, 185, 129, 0.15)' }]}>
                      Window Active • Closes in {Math.floor(windowRemainingSeconds / 60)}m {windowRemainingSeconds % 60}s
                    </Text>
                  </>
                ) : (
                  <Text style={styles.lockedBannerSub}>
                    Live class session. Editable until the class timer ends. Tap any option below to change status.
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* 1-Tap Attendance Actions */}
        {!isWeekendOrNoClass && (
          currentSubject?.code === 'SPORTS' || currentSlot?.subjectId === 'sub_sports' ? (
            <View style={styles.sportsNoAttendanceBox}>
              <Text style={styles.sportsNoAttendanceTitle}>Sports has no attendance</Text>
              <Text style={styles.sportsNoAttendanceSub}>
                Physical Education & Sports is a physical activity session. Not tracked in the ERP.
              </Text>
            </View>
          ) : (
            <View style={styles.promptActionsRow}>
              <TouchableOpacity
                activeOpacity={isCurrentSlotLocked ? 1 : 0.8}
                disabled={isCurrentSlotLocked}
                style={[
                  styles.promptActionBtn,
                  styles.promptAttendBtn,
                  currentRecord?.status === 'attended' && styles.promptBtnSelected,
                  (currentRecord && currentRecord.status !== 'attended') && styles.promptBtnDimmed,
                  isCurrentSlotLocked && styles.promptActionBtnDisabled,
                ]}
                onPress={() => handleAutoRecord('attended')}
              >
                <Text style={styles.promptAttendText}>
                  {currentRecord?.status === 'attended'
                    ? `Attended (${getSlotHours(currentSlot)} hrs)`
                    : `I Attended (${getSlotHours(currentSlot)} hrs)`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={isCurrentSlotLocked ? 1 : 0.8}
                disabled={isCurrentSlotLocked}
                style={[
                  styles.promptActionBtn,
                  styles.promptBunkBtn,
                  currentRecord?.status === 'bunked' && styles.promptBtnSelected,
                  (currentRecord && currentRecord.status !== 'bunked') && styles.promptBtnDimmed,
                  isCurrentSlotLocked && styles.promptActionBtnDisabled,
                ]}
                onPress={() => handleAutoRecord('bunked')}
              >
                <Text style={styles.promptBunkText}>
                  {currentRecord?.status === 'bunked'
                    ? `Missed (${getSlotHours(currentSlot)} hrs)`
                    : `I Missed (${getSlotHours(currentSlot)} hrs)`}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={isCurrentSlotLocked ? 1 : 0.8}
                disabled={isCurrentSlotLocked}
                style={[
                  styles.promptActionBtn,
                  styles.promptCancelBtn,
                  currentRecord?.status === 'cancelled' && styles.promptBtnSelected,
                  (currentRecord && currentRecord.status !== 'cancelled') && styles.promptBtnDimmed,
                  isCurrentSlotLocked && styles.promptActionBtnDisabled,
                ]}
                onPress={() => handleAutoRecord('cancelled')}
              >
                <Text style={styles.promptCancelText}>
                  {currentRecord?.status === 'cancelled' ? 'Free (Marked)' : 'Free / Cancelled'}
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}


        {/* Next Class Tasks & Reminders Section */}
        {!(isWeekendOrNoClass && selectedDay === currentDayName) && (() => {
          const slotReminders = reminders.filter(
            (r) => r.slotId === currentSlot?.id || r.subjectId === currentSlot?.subjectId
          );

          return (
            <View style={styles.periodReminderContainer}>
              {slotReminders.length > 0 && (
                <View style={styles.activeRemindersBox}>
                  <Text style={styles.activeRemindersTitle}>
                    Tasks / Instructions for this Class:
                  </Text>
                  {slotReminders.map((rem) => (
                    <View key={rem.id} style={styles.reminderRowItem}>
                      <TouchableOpacity
                        onPress={() => handleToggleReminder(rem.id)}
                        style={styles.reminderCheckBtn}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.reminderCheckIcon}>
                          {rem.completed ? '[DONE]' : '[TODO]'}
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
                          {rem.dueTiming === 'PREV_NIGHT_8PM'
                            ? 'Previous Night at 8:00 PM'
                            : rem.dueTiming === 'NEXT_CLASS'
                            ? '30 Mins Before Class'
                            : rem.dueTiming === 'TONIGHT_8PM'
                            ? 'Tonight at 8:00 PM'
                            : rem.dueTiming === 'TOMORROW_8AM'
                            ? 'Tomorrow at 8:00 AM'
                            : (rem.customTime || rem.scheduledTimeText || 'Custom Time')}
                          {rem.completed ? ' • Done' : ''}
                        </Text>
                      </View>

                      <TouchableOpacity
                        onPress={() => handleDeleteReminder(rem.id)}
                        style={styles.reminderDeleteAction}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.reminderDeleteActionText}>X</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              <TouchableOpacity
                style={styles.addReminderTriggerBtn}
                onPress={() => {
                  setReminderNote('');
                  setReminderTiming('PREV_NIGHT_8PM');
                  setReminderCustomTime('');
                  setShowReminderModal(true);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.addReminderTriggerText}>
                  + Set Task / Reminder for Next Class
                </Text>
              </TouchableOpacity>
            </View>
          );
        })()}
      </View>



      {/* PSGIM Moodle • Upcoming Course Assignments & Deadlines */}
      <View style={styles.connectSection}>
        <View style={styles.connectHeaderRow}>
          <View style={styles.connectIconCircle}>
            <Text style={styles.connectIcon}>📚</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.connectSectionTitle}>Moodle Course Assignments</Text>
              <View style={styles.connectLiveBadge}>
                <Text style={styles.connectLiveBadgeText}>LMS DEADLINES</Text>
              </View>
            </View>
            <Text style={styles.connectSectionSub}>
              lms.psgim.ac.in • Active faculty coursework submissions
            </Text>
          </View>
        </View>

        {assignments.length === 0 ? (
          <Text style={styles.connectEmptyText}>No pending assignments on Moodle.</Text>
        ) : (
          assignments.slice(0, 3).map((asg) => {
            const isSubmitted = asg.status === 'SUBMITTED';
            const dueDateFormatted = new Date(asg.dueDate).toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <View
                key={asg.id}
                style={[
                  styles.assignmentCard,
                  isSubmitted && { borderColor: '#10B981', backgroundColor: '#064E3B15' },
                ]}
              >
                <View style={styles.assignmentHeaderRow}>
                  <View style={styles.asgCodeBadge}>
                    <Text style={styles.asgCodeText}>{asg.courseCode}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.asgTitle} numberOfLines={2}>
                      {asg.title}
                    </Text>
                    <Text style={styles.asgCourseName}>{asg.courseName}</Text>
                  </View>
                  <View
                    style={[
                      styles.asgStatusBadge,
                      { backgroundColor: isSubmitted ? '#05966920' : '#EF444420' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.asgStatusText,
                        { color: isSubmitted ? '#10B981' : '#F87171' },
                      ]}
                    >
                      {isSubmitted ? 'SUBMITTED' : 'DUE SOON'}
                    </Text>
                  </View>
                </View>

                <View style={styles.asgFooterRow}>
                  <Text style={styles.asgDueText}>Due: {dueDateFormatted}</Text>
                  <Text style={styles.asgFilesText}>
                    Max {asg.maxFiles} files ({asg.acceptedFileTypes.join(', ')})
                  </Text>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* PSGIM Connect • Official Campus Announcements & Circulars */}
      <View style={styles.connectSection}>
        <View style={styles.connectHeaderRow}>
          <View style={styles.connectIconCircle}>
            <Text style={styles.connectIcon}>📢</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.connectSectionTitle}>PSGIM Connect Announcements</Text>
              <View style={styles.connectLiveBadge}>
                <Text style={styles.connectLiveBadgeText}>ANNOUNCEMENTS • LIVE</Text>
              </View>
            </View>
            <Text style={styles.connectSectionSub}>
              tqm.psginstitutions.in • Official campus notices & circulars
            </Text>
          </View>
        </View>

        {/* Category Filter Chips */}
        <View style={styles.connectCategoryFilterRow}>
          {(['ALL', 'EVENT', 'CIRCULAR', 'ACADEMIC'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.connectCategoryChip,
                announcementFilter === cat && styles.connectCategoryChipActive,
              ]}
              onPress={() => setAnnouncementFilter(cat)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.connectCategoryChipText,
                  announcementFilter === cat && styles.connectCategoryChipTextActive,
                ]}
              >
                {cat === 'ALL' ? `All (${announcements.length})` : cat === 'EVENT' ? 'Events' : cat === 'CIRCULAR' ? 'Circulars' : 'Academic'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {announcements.filter((item) => announcementFilter === 'ALL' || item.category?.toUpperCase() === announcementFilter).length === 0 ? (
          <Text style={styles.connectEmptyText}>No announcements found in this category.</Text>
        ) : (
          announcements
            .filter((item) => announcementFilter === 'ALL' || item.category?.toUpperCase() === announcementFilter)
            .map((item) => (
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

      {/* MCU AI Fleet Companion Card - Strictly Visible in Enhanced Suit Mode Only */}
      {isEnhancedSuit && (
        <View style={[styles.mcuAiCard, { backgroundColor: '#1C2541', borderColor: '#2A3B5C', borderWidth: 1.5 }]}>
          <View style={styles.mcuAiHeaderRow}>
            <View style={[styles.mcuAiAvatar, { backgroundColor: 'rgba(244, 232, 193, 0.15)', borderColor: '#F4E8C1', borderWidth: 1 }]}>
              <Text style={[styles.mcuAiAvatarText, { color: '#F4E8C1' }]}>SP</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.mcuAiTitle, { color: '#F4E8C1' }]}>
                  Stark Protocol: Enhanced Suit
                </Text>
                <View style={[styles.mcuAiActiveBadge, { backgroundColor: 'rgba(244, 232, 193, 0.15)', borderColor: '#F4E8C1' }]}>
                  <Text style={[styles.mcuAiActiveBadgeText, { color: '#F4E8C1' }]}>
                    MIDNIGHT GOLD
                  </Text>
                </View>
              </View>
              <Text style={[styles.mcuAiSubtitle, { color: '#C5BA9D' }]}>
                576 Tactical Matrix • Karen Suit AI • 3D Altitude Clamping • Ultrasonic Radar • CrowdMesh
              </Text>
            </View>
          </View>

          <View style={styles.mcuAiActionsRow}>
            <TouchableOpacity
              style={[styles.mcuAiBtnPrimary, { backgroundColor: '#F4E8C1', borderColor: '#F4E8C1' }]}
              onPress={() => setShowKarenGuide(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.mcuAiBtnPrimaryText, { color: '#0B132B', fontWeight: '800' }]}>Talk to Karen Guide</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mcuAiBtnSecondary,
                { borderColor: '#F4E8C1', backgroundColor: 'rgba(244, 232, 193, 0.12)' }
              ]}
              onPress={() => setShowStarkArsenal(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.mcuAiBtnSecondaryText, { color: '#F4E8C1', fontWeight: '800' }]}>Stark Arsenal</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mcuAiBtnSecondary, { borderColor: '#F4E8C1', backgroundColor: 'rgba(244, 232, 193, 0.12)' }]}
              onPress={() => setShowWhatIfForecaster(true)}
              activeOpacity={0.8}
            >
              <Text style={[styles.mcuAiBtnSecondaryText, { color: '#F4E8C1', fontWeight: '800' }]}>What-If Forecaster</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.mcuAiBtnSecondary, { borderColor: '#2A3B5C', backgroundColor: '#0B132B' }]}
              onPress={async () => {
                try {
                  Vibration.vibrate(40);
                } catch {}
                await ProtocolGate.engageTrainingWheels();
                setIsEnhancedSuit(false);
                Alert.alert('Training Wheels Re-engaged', 'Suit reset to standard blue student interface.');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.mcuAiBtnSecondaryText, { color: '#F4E8C1', fontWeight: '600' }]}>Training Wheels</Text>
            </TouchableOpacity>

            {onOpenAdmin && (
              <TouchableOpacity
                style={styles.mcuAiBtnSecondary}
                onPress={onOpenAdmin}
                activeOpacity={0.8}
              >
                <Text style={styles.mcuAiBtnSecondaryText}>Open AI Operations</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        {(['ALL', 'SAFE', 'SHORTAGE'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[styles.filterChip, filter === tab && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, filter === tab && styles.filterChipTextActive]}>
              {tab === 'ALL' && 'All Subjects'}
              {tab === 'SAFE' && 'Safe (>=75%)'}
              {tab === 'SHORTAGE' && 'Shortage (<75%)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subjects List */}
      {filteredSubjects.map((subject) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          studentRollNo={toNewRollNo(studentRollNo)}
          isEnhancedSuit={isEnhancedSuit}
          onOpenCoursePlan={(code, name) =>
            setCoursePlanModalInfo({
              visible: true,
              code,
              name,
              allowSubjectSwitching: false,
            })
          }
          onEditFaculty={(subj) => setFacultyModalSubject(subj)}
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
                <Text style={styles.notifIconText}>[Alert]</Text>
              </View>
              <View style={styles.notifHeaderInfo}>
                <Text style={styles.notifHeaderBadge}>CLASS CONCLUDED</Text>
                <Text style={styles.notifSubjectName} numberOfLines={1}>
                  {endedSlotNotification?.subject.name}
                </Text>
                <Text style={styles.notifTimeSlot}>
                  {endedSlotNotification?.slot.startTime} – {endedSlotNotification?.slot.endTime} • {endedSlotNotification?.slot.day}
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
                  Attended ({getSlotHours(endedSlotNotification?.slot)} hrs)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.notifBtn, styles.notifBunkBtn]}
                onPress={() => handleRecordFromNotification('bunked')}
                activeOpacity={0.8}
              >
                <Text style={styles.notifBunkText}>
                  Missed ({getSlotHours(endedSlotNotification?.slot)} hrs)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.notifBtn, styles.notifCancelBtn]}
                onPress={() => handleRecordFromNotification('cancelled')}
                activeOpacity={0.8}
              >
                <Text style={styles.notifCancelText}>Free / Off</Text>
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
                <Text style={styles.reminderModalIcon}>TASK</Text>
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
                <Text style={styles.closeTripModalBtnText}>X</Text>
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
                  reminderTiming === 'PREV_NIGHT_8PM' && styles.timingChipActive,
                ]}
                onPress={() => setReminderTiming('PREV_NIGHT_8PM')}
              >
                <Text
                  style={[
                    styles.timingChipText,
                    reminderTiming === 'PREV_NIGHT_8PM' && styles.timingChipTextActive,
                  ]}
                >
                  Prev Night (8 PM)
                </Text>
              </TouchableOpacity>

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
                  30m Before Class
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
                  Morning (8 AM)
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.timingChip,
                  reminderTiming === 'CUSTOM' && styles.timingChipActive,
                ]}
                onPress={() => setReminderTiming('CUSTOM')}
              >
                <Text
                  style={[
                    styles.timingChipText,
                    reminderTiming === 'CUSTOM' && styles.timingChipTextActive,
                  ]}
                >
                  Custom Time
                </Text>
              </TouchableOpacity>
            </View>

            {reminderTiming === 'CUSTOM' && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.reminderInputLabel}>Specify Custom Alert Time:</Text>
                <TextInput
                  style={styles.reminderTextInput}
                  placeholder="e.g. Tonight 9:00 PM, Tomorrow 6:30 PM"
                  placeholderTextColor="#64748B"
                  value={reminderCustomTime}
                  onChangeText={setReminderCustomTime}
                />
              </View>
            )}

            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 8, fontStyle: 'italic' }}>
              "Prev Night (8 PM)" alerts you at 8:00 PM the evening before this class so you can prepare readings or assignments.
            </Text>

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
                <Text style={styles.saveReminderBtnText}>Set Reminder</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>



      {/* PSGIM Connect Official Circular & Poster Modal */}
      <PsgimNoticeModal
        visible={!!selectedNotice}
        announcement={selectedNotice}
        onClose={() => setSelectedNotice(null)}
      />

      {/* Emergency Digital Student ID Modal */}
      <DigitalIdModal
        visible={showDigitalIdModal}
        onClose={() => setShowDigitalIdModal(false)}
        studentRollNo={toNewRollNo(studentRollNo)}
      />

      {/* Course Plan Subject Selector Modal */}
      <Modal
        visible={showSubjectPickerModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSubjectPickerModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.subjectPickerModalCard}>
            <View style={styles.subjectPickerHeader}>
              <View>
                <Text style={styles.subjectPickerBadge}>ACADEMIC SYLLABUS</Text>
                <Text style={styles.subjectPickerTitle}>Select Course Plan</Text>
                <Text style={styles.subjectPickerSub}>Continuous Assessment (50M) & 30-Session Schedule</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowSubjectPickerModal(false)}
                style={styles.closeTripModalBtn}
                activeOpacity={0.7}
              >
                <Text style={styles.closeTripModalBtnText}>X</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {subjects.map((sub) => (
                <TouchableOpacity
                  key={sub.id}
                  style={[styles.subjectPickerItem, { borderLeftColor: sub.color || '#38BDF8' }]}
                  activeOpacity={0.7}
                  onPress={() => {
                    setShowSubjectPickerModal(false);
                    setCoursePlanModalInfo({
                      visible: true,
                      code: sub.code,
                      name: sub.name,
                    });
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <View style={styles.subjectPickerCodeBadge}>
                        <Text style={styles.subjectPickerCodeText}>{sub.code}</Text>
                      </View>
                      {sub.batch ? (
                        <Text style={styles.subjectPickerBatchText}>Batch {sub.batch}</Text>
                      ) : null}
                    </View>
                    <Text style={styles.subjectPickerItemName} numberOfLines={1}>{sub.name}</Text>
                    {sub.faculty ? (
                      <Text style={styles.subjectPickerFacultyText} numberOfLines={1}>{sub.faculty}</Text>
                    ) : null}
                  </View>
                  <Text style={styles.subjectPickerChevron}>→</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Course Plan & CA Marks Tracker Modal */}
      <CoursePlanModal
        visible={coursePlanModalInfo.visible}
        onClose={() =>
          setCoursePlanModalInfo((prev) => ({ ...prev, visible: false }))
        }
        subjectCode={coursePlanModalInfo.code}
        subjectName={coursePlanModalInfo.name}
        studentRollNo={toNewRollNo(studentRollNo)}
        allowSubjectSwitching={coursePlanModalInfo.allowSubjectSwitching}
      />

      {/* Attendance Dispute & Proof Dossier Modal */}
      <AttendanceDisputeModal
        visible={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        studentRollNo={toNewRollNo(studentRollNo)}
        subjects={subjects}
      />

      {/* Faculty Assignment & Customization Modal */}
      <FacultySelectModal
        visible={facultyModalSubject !== null}
        subject={facultyModalSubject}
        onClose={() => setFacultyModalSubject(null)}
        onSaveFaculty={(subId, newFac) => {
          onUpdateFaculty?.(subId, newFac);
          setFacultyModalSubject(null);
        }}
      />

      {/* Rescheduled / After-College Makeup Class Attendance Modal */}
      <Modal
        visible={showRescheduledModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRescheduledModal(false)}
      >
        <View style={styles.rescheduledModalOverlay}>
          <View style={styles.rescheduledModalCard}>
            <View style={styles.rescheduledModalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.rescheduledBadge}>AFTER-COLLEAGE COMPENSATION CLASS</Text>
                <Text style={styles.rescheduledModalTitle}>Mark Rescheduled Attendance</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowRescheduledModal(false)}
                style={styles.closeRescheduledBtn}
              >
                <Text style={styles.closeRescheduledText}>X</Text>
              </TouchableOpacity>
            </View>

            {(() => {
              const targetSub = subjects.find((s) => s.id === selectedRescheduleSubjectId) || subjects[0];
              const slotHours = 1; // 1 hour compensation

              const handleMarkRescheduled = async (status: AttendanceStatus) => {
                if (!targetSub) return;
                const tempSlot: TimetableSlot = {
                  id: `resched_${targetSub.id}_${rescheduleDate}_${Date.now()}`,
                  day: (dayNames[new Date(rescheduleDate).getDay()] || 'Friday') as any,
                  startTime: rescheduleTime.split('-')[0]?.trim() || '16:45',
                  endTime: rescheduleTime.split('-')[1]?.trim() || '17:45',
                  subjectId: targetSub.id,
                  isRescheduled: true,
                  rescheduledDate: rescheduleDate,
                  originalHolidayTitle: weekdayHolidayAlert?.holiday.title,
                };

                const res = await onRecordPeriodAttendance(tempSlot, rescheduleDate, status);
                setShowRescheduledModal(false);
                if (res.success) {
                  Alert.alert(
                    status === 'attended'
                      ? 'Marked Attended'
                      : status === 'bunked'
                      ? 'Marked Absent'
                      : 'Free / Cancelled',
                    `Rescheduled class attendance recorded for ${targetSub.name} (${slotHours} hr).`
                  );
                } else {
                  Alert.alert('Notice', res.message);
                }
              };

              return (
                <View style={styles.rescheduledModalBody}>
                  <View style={styles.rescheduledSubjectCard}>
                    <Text style={styles.rescheduledSubCode}>{targetSub?.code || 'COURSE'}</Text>
                    <Text style={styles.rescheduledSubName}>{targetSub?.name || 'Class'}</Text>
                    <Text style={styles.rescheduledMeta}>
                      Date: {formatDateDMY(rescheduleDate)} • Time: {rescheduleTime} (1 hr)
                    </Text>
                    {weekdayHolidayAlert && (
                      <Text style={styles.rescheduledHolidayRef}>
                        Compensating for: {weekdayHolidayAlert.holiday.title}
                      </Text>
                    )}
                  </View>

                  <Text style={styles.rescheduledPromptQuestion}>
                    Did you attend this after-college rescheduled class?
                  </Text>

                  <View style={styles.rescheduledActionsRow}>
                    <TouchableOpacity
                      style={[styles.rescheduledActionBtn, styles.rescheduledAttendBtn]}
                      activeOpacity={0.8}
                      onPress={() => handleMarkRescheduled('attended')}
                    >
                      <Text style={styles.rescheduledBtnText}>I Attended (1 hr)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rescheduledActionBtn, styles.rescheduledBunkBtn]}
                      activeOpacity={0.8}
                      onPress={() => handleMarkRescheduled('bunked')}
                    >
                      <Text style={styles.rescheduledBtnText}>I Missed (1 hr)</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.rescheduledActionBtn, styles.rescheduledCancelBtn]}
                      activeOpacity={0.8}
                      onPress={() => handleMarkRescheduled('cancelled')}
                    >
                      <Text style={styles.rescheduledBtnText}>Not Conducted</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* Karen Guide Modal */}
      <KarenGuide
        visible={showKarenGuide}
        onClose={() => setShowKarenGuide(false)}
        studentName={studentName}
        isEnhancedSuit={isEnhancedSuit}
      />

      {/* What-If Bunk & Exam Forecaster Modal */}
      <WhatIfForecasterModal
        visible={showWhatIfForecaster}
        onClose={() => setShowWhatIfForecaster(false)}
        subjects={subjects}
        timetable={timetable}
      />

      {/* Stark Tactical Arsenal Modal (News, Canteen #004, Faculty #005, Syllabus #006, Library #011, Karen Voice #025) */}
      <StarkArsenalModal
        visible={showStarkArsenal}
        onClose={() => setShowStarkArsenal(false)}
        studentName={studentName}
        subjects={subjects}
        timetable={timetable}
        isSuitUnlocked={isEnhancedSuit}
        onOpenWhatIf={() => {
          setShowStarkArsenal(false);
          setShowWhatIfForecaster(true);
        }}
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
  hourlyFacultyTouch: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  hourlyFacultyText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  hourlyFacultyHighlight: {
    color: '#38BDF8',
    fontWeight: '800',
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
  periodPillStatus: {
    color: '#E2E8F0',
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
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
  lockedBannerCloudSync: {
    backgroundColor: 'rgba(30, 41, 59, 0.95)',
    borderColor: '#38BDF8',
    borderWidth: 1.5,
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
  lockedCloudBadge: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
    letterSpacing: 0.3,
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
  promptActionBtnDisabled: {
    opacity: 0.45,
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
    opacity: 0.85,
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
  welcomeAdminBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: '#6366F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'center',
  },
  welcomeAdminBadgeText: {
    color: '#818CF8',
    fontSize: 12,
    fontWeight: '800',
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
    fontSize: 10,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.5,
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
  subjectPickerModalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    width: '94%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subjectPickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  subjectPickerBadge: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subjectPickerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  subjectPickerSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  subjectPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    borderLeftWidth: 4,
  },
  subjectPickerCodeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subjectPickerCodeText: {
    color: '#38BDF8',
    fontSize: 10.5,
    fontWeight: '800',
  },
  subjectPickerBatchText: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '600',
  },
  subjectPickerItemName: {
    color: '#F1F5F9',
    fontSize: 13.5,
    fontWeight: '700',
    marginTop: 1,
  },
  subjectPickerFacultyText: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  subjectPickerChevron: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
    marginLeft: 8,
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
  connectUnlinkedNotice: {
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    borderColor: '#0284C7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  connectUnlinkedText: {
    color: '#38BDF8',
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700',
  },
  assignmentCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  assignmentHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 8,
  },
  asgCodeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#475569',
  },
  asgCodeText: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
  },
  asgTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  asgCourseName: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  asgStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  asgStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  asgFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 8,
    marginTop: 4,
  },
  asgDueText: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
  },
  asgFilesText: {
    color: '#64748B',
    fontSize: 10,
  },

  // ── Makeup / Rescheduled Classes Alert Card Styles ──────────────
  makeupClassesBox: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  makeupClassesHeader: {
    marginBottom: 10,
  },
  makeupClassesBadge: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  makeupClassesSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  makeupClassesList: {
    gap: 8,
  },
  makeupClassItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  makeupClassItemInfo: {
    flex: 1,
  },
  makeupClassCode: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  makeupClassName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 1,
  },
  makeupClassTime: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  makeupMarkBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8,
  },
  makeupMarkBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },

  // ── Rescheduled Modal Styles ───────────────────────────────────
  rescheduledModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  rescheduledModalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 480,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  rescheduledModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  rescheduledBadge: {
    color: '#F59E0B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  rescheduledModalTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  closeRescheduledBtn: {
    padding: 6,
  },
  closeRescheduledText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  rescheduledModalBody: {
    marginTop: 4,
  },
  rescheduledSubjectCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  rescheduledSubCode: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  rescheduledSubName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  rescheduledMeta: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 4,
  },
  rescheduledHolidayRef: {
    color: '#FBBF24',
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 4,
  },
  rescheduledPromptQuestion: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  rescheduledActionsRow: {
    gap: 8,
  },
  rescheduledActionBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rescheduledAttendBtn: {
    backgroundColor: '#059669',
  },
  rescheduledBunkBtn: {
    backgroundColor: '#DC2626',
  },
  rescheduledCancelBtn: {
    backgroundColor: '#475569',
  },
  rescheduledBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },

  // Welcome Announcement Banner Styles
  welcomeAnnouncementBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 10,
    gap: 8,
  },
  welcomeAnnouncementBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  welcomeAnnouncementBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  welcomeAnnouncementTitle: {
    flex: 1,
    color: '#E0F2FE',
    fontSize: 12,
    fontWeight: '700',
  },
  welcomeAnnouncementChevron: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },

  // Announcement Category Filter Styles
  connectCategoryFilterRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  connectCategoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  connectCategoryChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  connectCategoryChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  connectCategoryChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  sportsNoAttendanceBox: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.35)',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginVertical: 4,
  },
  sportsNoAttendanceTitle: {
    color: '#818CF8',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  sportsNoAttendanceSub: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
  mcuAiCard: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#38BDF8',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  mcuAiHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  mcuAiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  mcuAiAvatarText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  mcuAiTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
  },
  mcuAiActiveBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  mcuAiActiveBadgeText: {
    color: '#10B981',
    fontSize: 9,
    fontWeight: '800',
  },
  mcuAiSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  mcuAiActionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mcuAiBtnPrimary: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mcuAiBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  mcuAiBtnSecondary: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  mcuAiBtnSecondaryText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
});


