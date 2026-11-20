import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Image,
  Dimensions,
  Platform,
  Linking,
  BackHandler,
  useColorScheme,
  Animated,
  Alert,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Subject, TimetableSlot, PsgimAnnouncement, PeriodAttendanceRecord, AttendanceStatus } from '../types';
import { toNewRollNo } from '../data/psgimMasterStudents';
import { calculateAttendanceMetrics, getSlotHours } from '../services/attendanceEngine';
import { ACADEMIC_CALENDAR, AcademicCalendarItem } from '../data/academicCalendarData';
import { NOTEBOOK_LM_SHARED_URL } from './NotebookLmModal';
import { getCoursePlanForSubject } from '../data/coursePlanData';
import { getCourseSyllabus, CourseSyllabus } from '../data/courseSyllabusData';

// Subject-specific Google NotebookLM AI Study Hub URLs (Only for Core Courses that have official NotebookLM)
const STORAGE_READ_NOTIFS_KEY = '@psgim_read_notifications_';
const STORAGE_STUDENT_CONTACT_KEY = '@psgim_student_contact_';

const SUBJECT_NOTEBOOK_URLS: Record<string, string> = {
  // Official Subject AI Study Notebooks
  '24GM11': 'https://notebooklm.google.com/notebook/fca05a91-c2d0-464f-a746-89c7201181a4', // MCOB
  'MCOB': 'https://notebooklm.google.com/notebook/fca05a91-c2d0-464f-a746-89c7201181a4',
  '24GM12': 'https://notebooklm.google.com/notebook/b75b528e-244e-4116-846a-aa5e97504cd9', // EDM
  'EDM': 'https://notebooklm.google.com/notebook/b75b528e-244e-4116-846a-aa5e97504cd9',
  '24GM13': 'https://notebooklm.google.com/notebook/9496f01e-53c4-4832-b547-dee8813ac628', // ADM
  'ADM': 'https://notebooklm.google.com/notebook/9496f01e-53c4-4832-b547-dee8813ac628',
};

const hasNotebookForSubject = (code: string, name?: string): boolean => {
  const cleanCode = (code || '').toUpperCase().trim();
  if (SUBJECT_NOTEBOOK_URLS[cleanCode]) return true;
  const cleanName = (name || '').toUpperCase().trim();
  return (
    cleanName.includes('ORGANIZATIONAL') ||
    cleanName.includes('MANAGEMENT CONCEPTS') ||
    cleanName.includes('MCOB') ||
    cleanName.includes('ECONOMICS') ||
    cleanName.includes('EDM') ||
    cleanName.includes('ACCOUNTING') ||
    cleanName.includes('ADM')
  );
};

const getNotebookUrlForSubject = (code: string, name?: string): string => {
  const cleanCode = (code || '').toUpperCase().trim();
  if (SUBJECT_NOTEBOOK_URLS[cleanCode]) {
    return SUBJECT_NOTEBOOK_URLS[cleanCode];
  }
  const cleanName = (name || '').toUpperCase().trim();
  if (cleanName.includes('ORGANIZATIONAL') || cleanName.includes('MANAGEMENT CONCEPTS') || cleanName.includes('MCOB')) {
    return SUBJECT_NOTEBOOK_URLS['24GM11'];
  }
  if (cleanName.includes('ECONOMICS') || cleanName.includes('EDM')) {
    return SUBJECT_NOTEBOOK_URLS['24GM12'];
  }
  if (cleanName.includes('ACCOUNTING') || cleanName.includes('ADM')) {
    return SUBJECT_NOTEBOOK_URLS['24GM13'];
  }
  return '';
};
import {
  Bell,
  Settings,
  Home,
  CalendarCheck,
  LayoutGrid,
  CalendarDays,
  BookOpen,
  GraduationCap,
  Library,
  Megaphone,
  Download,
  FileText,
  Search,
  Check,
  Sparkles,
  Sun,
  Moon,
  Smartphone,
  Fingerprint,
  ChevronRight,
  ChevronDown,
  X,
  Phone,
  Mail,
  User,
  Clock,
  AlertCircle,
  ExternalLink,
  Brain,
  Layers,
  Share2,
  Plane,
  TrendingUp,
  AlertTriangle,
  Info,
  Edit2,
  Save,
  LogOut,
} from 'lucide-react-native';

interface ChristStylePreviewProps {
  visible: boolean;
  onClose: () => void;
  subjects: Subject[];
  studentName?: string;
  studentRollNo?: string;
  timetable?: TimetableSlot[];
  announcements?: PsgimAnnouncement[];
  periodRecords?: Record<string, PeriodAttendanceRecord>;
  onRecordPeriodAttendance?: (
    slot: TimetableSlot,
    date: string,
    status: AttendanceStatus
  ) => Promise<any> | void;
  onOpenCoursePlan?: (code: string, name: string) => void;
  onOpenErpSync?: () => void;
}

type BottomTab = 'HOME' | 'ATTENDANCE' | 'PORTALS' | 'CALENDAR' | 'ACADEMICS';
type ThemeMode = 'LIGHT' | 'SYSTEM' | 'DARK';
type TypographyScale = 'Small' | 'Default' | 'Large';

export const ChristStylePreviewModal: React.FC<ChristStylePreviewProps> = ({
  visible,
  onClose,
  subjects,
  studentName = 'Devdarshan V',
  studentRollNo = '26AB12',
  timetable = [],
  announcements = [],
  periodRecords = {},
  onRecordPeriodAttendance,
  onOpenCoursePlan,
  onOpenErpSync,
}) => {
  const [activeTab, setActiveTab] = useState<BottomTab>('HOME');
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<string>('SEMESTER - I');
  const [showSemesterMenu, setShowSemesterMenu] = useState<boolean>(false);
  const [academicSearch, setAcademicSearch] = useState<string>('');
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showNotificationsView, setShowNotificationsView] = useState<boolean>(false);
  const [notifFilterTab, setNotifFilterTab] = useState<'IMPORTANT' | 'ALL' | 'UNREAD'>('IMPORTANT');
  const [notifSearch, setNotifSearch] = useState<string>('');
  const [selectedNoticeModal, setSelectedNoticeModal] = useState<PsgimAnnouncement | null>(null);
  const [readNotifIds, setReadNotifIds] = useState<Set<string>>(new Set());

  // Load persistent read notification IDs on mount or student roll change
  useEffect(() => {
    const loadReadNotifs = async () => {
      try {
        const key = `${STORAGE_READ_NOTIFS_KEY}${studentRollNo || 'GUEST'}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setReadNotifIds(new Set(parsed));
          }
        }
      } catch (err) {
        console.warn('Failed to load read notification IDs:', err);
      }
    };
    loadReadNotifs();
  }, [studentRollNo]);

  // Persist read notification IDs
  const persistReadNotifs = async (updatedSet: Set<string>) => {
    try {
      const key = `${STORAGE_READ_NOTIFS_KEY}${studentRollNo || 'GUEST'}`;
      await AsyncStorage.setItem(key, JSON.stringify(Array.from(updatedSet)));
    } catch (err) {
      console.warn('Failed to save read notification IDs:', err);
    }
  };

  // Editable Student Contact Information (Mobile & Personal Email)
  const [mobileNumber, setMobileNumber] = useState<string>('+91 98422 12345');
  const [personalEmail, setPersonalEmail] = useState<string>('devdarshan@gmail.com');
  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [saveStatusFeedback, setSaveStatusFeedback] = useState<string | null>(null);

  // Load persistent contact information from AsyncStorage
  useEffect(() => {
    const loadContactInfo = async () => {
      try {
        const contactKey = `${STORAGE_STUDENT_CONTACT_KEY}${studentRollNo || 'GUEST'}`;
        const storedContact = await AsyncStorage.getItem(contactKey);
        if (storedContact) {
          const parsed = JSON.parse(storedContact);
          if (parsed.mobileNumber) setMobileNumber(parsed.mobileNumber);
          if (parsed.personalEmail) setPersonalEmail(parsed.personalEmail);
        }
      } catch (err) {
        console.warn('Failed to load student contact info:', err);
      }
    };
    loadContactInfo();
  }, [studentRollNo]);

  // Persist contact information to AsyncStorage
  const handleToggleContactEdit = async () => {
    if (isEditingContact) {
      // User tapped Save
      try {
        const contactKey = `${STORAGE_STUDENT_CONTACT_KEY}${studentRollNo || 'GUEST'}`;
        await AsyncStorage.setItem(
          contactKey,
          JSON.stringify({
            mobileNumber: mobileNumber.trim(),
            personalEmail: personalEmail.trim(),
          })
        );
        setIsEditingContact(false);
        setSaveStatusFeedback('Saved!');
        setTimeout(() => setSaveStatusFeedback(null), 2500);
      } catch (err) {
        console.warn('Failed to save contact info:', err);
        setIsEditingContact(false);
      }
    } else {
      setIsEditingContact(true);
    }
  };

  // Mark a single notification as read when clicked
  const handleOpenNotice = (item: PsgimAnnouncement) => {
    setReadNotifIds((prev) => {
      const next = new Set(prev).add(item.id);
      persistReadNotifs(next);
      return next;
    });
    setSelectedNoticeModal(item);
  };

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    const allIds = new Set(announcements.map((a) => a.id));
    setReadNotifIds(allIds);
    persistReadNotifs(allIds);
  };

  // Unread announcements list
  const unreadCount = announcements.filter((a) => !readNotifIds.has(a.id)).length;
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('DARK');
  const [typography, setTypography] = useState<TypographyScale>('Default');

  // Bouncing Greeting Animation (Triggers when entering app / modal opens, resets for each login)
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Reset to 0 and trigger a playful bounce spring
      bounceAnim.setValue(0);
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -14,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(bounceAnim, {
          toValue: 0,
          friction: 3.5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, studentRollNo]);

  // Compute effective theme (Light vs Dark)
  const isLight =
    themeMode === 'LIGHT' || (themeMode === 'SYSTEM' && systemColorScheme === 'light');

  // Compute typography font scale factor
  const fontScale = typography === 'Small' ? 0.88 : typography === 'Large' ? 1.15 : 1.0;
  const sFont = (baseSize: number) => Math.round(baseSize * fontScale);

  // Dynamic Theme Overrides applied seamlessly across the entire UI
  const themeStyles = React.useMemo(() => {
    if (isLight) {
      return {
        bg: '#F8FAFC',
        headerBg: '#FFFFFF',
        headerBorder: '#E2E8F0',
        cardBg: '#FFFFFF',
        cardBorder: '#E2E8F0',
        cardBox: '#F1F5F9',
        cardBoxBorder: '#CBD5E1',
        textPrimary: '#0F172A',
        textSecondary: '#475569',
        textMuted: '#64748B',
        accentBg: '#E0F2FE',
        accentBorder: '#7DD3FC',
        drawerBg: '#FFFFFF',
        drawerBorder: '#E2E8F0',
        navBg: '#FFFFFF',
        navBorder: '#E2E8F0',
        inputBg: '#F1F5F9',
        inputBorder: '#CBD5E1',
        bannerBg: '#F1F5F9',
      };
    }
    return {
      bg: '#070D18',
      headerBg: '#070D18',
      headerBorder: '#131F33',
      cardBg: '#0F1A2C',
      cardBorder: '#192841',
      cardBox: '#0F1A2C',
      cardBoxBorder: '#192841',
      textPrimary: '#FFFFFF',
      textSecondary: '#94A3B8',
      textMuted: '#64748B',
      accentBg: '#121F35',
      accentBorder: '#1E2D4A',
      drawerBg: '#0A1120',
      drawerBorder: '#1E293B',
      navBg: '#070D18',
      navBorder: '#131F33',
      inputBg: '#0F1A2C',
      inputBorder: '#192841',
      bannerBg: '#0F1A2C',
    };
  }, [isLight]);

  const [activeWeeklyModal, setActiveWeeklyModal] = useState<boolean>(false);
  const [calFilter, setCalFilter] = useState<'ALL' | 'HOLIDAY' | 'EXAM' | 'EVENT'>('ALL');
  const [calSearch, setCalSearch] = useState<string>('');

  // Real-Time Dynamic Day Schedule for Today
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  const currentDayIndex = now.getDay(); // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
  const currentDayName = dayNames[currentDayIndex];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const todayFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const todayDateStr = now.toISOString().split('T')[0];

  const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const todaySlots = React.useMemo(() => {
    return timetable.filter((s) => s.day.toLowerCase() === currentDayName.toLowerCase());
  }, [timetable, currentDayName]);

  const todayClassesEnded = todaySlots.length > 0 && todaySlots.every((s) => {
    const end = timeToMinutes(s.endTime);
    return currentMinutes >= end;
  });
  const isTodayConcluded = todayClassesEnded;

  // Next scheduled day helper
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
      dateStr: todayDateStr,
      slots: todaySlots,
    };
  };

  const [viewingNextDay, setViewingNextDay] = useState<boolean>(false);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(null);

  const nextDayInfo = getNextScheduledDay();
  const displayDayName = viewingNextDay ? nextDayInfo.dayName : currentDayName;
  const displayDateFormatted = viewingNextDay ? nextDayInfo.formattedDate : todayFormatted;
  const displayDateStr = viewingNextDay ? nextDayInfo.dateStr : todayDateStr;

  const activeDaySlots = React.useMemo(() => {
    return timetable.filter(
      (s) => s.day.toLowerCase() === displayDayName.toLowerCase()
    );
  }, [timetable, displayDayName]);

  const isWeekendOrNoClass = activeDaySlots.length === 0;

  // Auto-detect currently ongoing or next class
  const autoDetectSlotIndex = (): number => {
    if (activeDaySlots.length === 0) return 0;
    const ongoing = activeDaySlots.findIndex((s) => {
      const start = timeToMinutes(s.startTime);
      const end = timeToMinutes(s.endTime);
      return currentMinutes >= start && currentMinutes < end;
    });
    if (ongoing !== -1) return ongoing;

    const justEnded = activeDaySlots.findIndex((s) => {
      const end = timeToMinutes(s.endTime);
      return currentMinutes >= end && currentMinutes <= end + 60;
    });
    if (justEnded !== -1) return justEnded;

    const upcoming = activeDaySlots.findIndex((s) => {
      const start = timeToMinutes(s.startTime);
      return currentMinutes < start;
    });
    if (upcoming !== -1) return upcoming;

    return 0;
  };

  const activeIndex = selectedSlotIndex !== null ? selectedSlotIndex : autoDetectSlotIndex();
  const currentSlot = activeDaySlots[activeIndex] || activeDaySlots[0];
  const currentSubject = subjects.find((s) => s.id === currentSlot?.subjectId);

  // Status badge calculation matching DashboardScreen
  const getSlotStatus = () => {
    if (!currentSlot) return { tag: 'SCHEDULED', color: '#818CF8', message: 'No classes scheduled.' };
    const start = timeToMinutes(currentSlot.startTime);
    const end = timeToMinutes(currentSlot.endTime);
    const isToday = currentSlot.day.toLowerCase() === currentDayName.toLowerCase();

    if (!isTodayConcluded && isToday && currentMinutes >= start && currentMinutes < end) {
      return {
        tag: 'IN SESSION',
        color: '#EF4444',
        message: 'This class is currently in session. Mark your attendance when completed:',
      };
    }
    if (!isTodayConcluded && isToday && currentMinutes >= end && currentMinutes <= end + 60) {
      return {
        tag: 'CONCLUDED',
        color: '#F59E0B',
        message: 'This class has concluded. Did you attend or miss it?',
      };
    }
    if (!isTodayConcluded && isToday && currentMinutes < start) {
      return {
        tag: 'UPCOMING',
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

  const slotStatus = getSlotStatus();
  const currentPeriodKey = currentSlot ? `${displayDateStr}_${currentSlot.id}` : null;
  const [localPeriodStatuses, setLocalPeriodStatuses] = useState<Record<string, AttendanceStatus>>({});
  const currentRecord = currentPeriodKey ? (localPeriodStatuses[currentPeriodKey] ? { status: localPeriodStatuses[currentPeriodKey], hours: getSlotHours(currentSlot), date: displayDateStr, slotId: currentSlot.id, subjectId: currentSlot.subjectId, markedAt: '' } : periodRecords[currentPeriodKey]) : undefined;

  const handleMarkTodaySlot = async (slot: TimetableSlot, status: AttendanceStatus) => {
    const key = `${displayDateStr}_${slot.id}`;
    setLocalPeriodStatuses((prev) => ({ ...prev, [key]: status }));
    if (onRecordPeriodAttendance) {
      try {
        await onRecordPeriodAttendance(slot, displayDateStr, status);
      } catch (err) {
        console.warn('Failed to record period attendance:', err);
      }
    }
  };

  const [attendanceSubView, setAttendanceSubView] = useState<'COURSE' | 'EVERYDAY'>('COURSE');
  const [everydaySearch, setEverydaySearch] = useState<string>('');
  const [everydayStatusFilter, setEverydayStatusFilter] = useState<'ALL' | 'ATTENDED' | 'BUNKED'>('ALL');
  const [expandedEverydayDate, setExpandedEverydayDate] = useState<string | null>(null);

  // In-modal Syllabus & Course Plan Details State
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<{
    code: string;
    name: string;
    type: 'SYLLABUS' | 'PLAN' | 'ASSIGNMENTS';
  } | null>(null);

  // Smart Holiday & Continuous Recovery Leave Planner State
  const [showHolidayPlanner, setShowHolidayPlanner] = useState<boolean>(false);
  const [targetExpectedPct, setTargetExpectedPct] = useState<number>(75);
  const [simulatedLeaveHours, setSimulatedLeaveHours] = useState<number>(1);

  const displayRollNo = toNewRollNo(studentRollNo) || studentRollNo;
  const avatarLetter = (studentName || 'D').trim().charAt(0).toUpperCase();

  // Aggregate overall attendance stats across subjects
  const attendanceSubjects = subjects.filter(
    (s) =>
      !s.noAttendance &&
      s.code !== 'SPORTS' &&
      !s.name.toLowerCase().includes('sports')
  );

  const totalAttended = attendanceSubjects.reduce((acc, s) => acc + (s.attended || 0), 0);
  const totalConducted = attendanceSubjects.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalAbsent = Math.max(0, totalConducted - totalAttended);
  const overallPct = totalConducted > 0 ? (totalAttended / totalConducted) * 100 : 100;
  const overallPctFormatted = overallPct.toFixed(2);
  const isSafeAttendance = overallPct >= 75;

  // Safe bunks / classes needed
  const overallMetrics = calculateAttendanceMetrics(totalAttended, totalConducted, false, 75, 65);

  // Dynamic Holiday Leave & Recovery Planner Calculations:
  // If user takes `simulatedLeaveHours` off:
  const simTotalConducted = totalConducted + simulatedLeaveHours;
  const simAttended = totalAttended; // missed classes
  const simPct = simTotalConducted > 0 ? (simAttended / simTotalConducted) * 100 : 100;
  
  // To reach targetExpectedPct after taking `simulatedLeaveHours` off, how many consecutive classes must be attended?
  // (simAttended + R) / (simTotalConducted + R) >= targetPct / 100
  // R >= (targetPct * simTotalConducted - 100 * simAttended) / (100 - targetPct)
  const calcContinuousRequired = (target: number, currentAttended: number, currentHeld: number): number => {
    if (target >= 100) return 999;
    const numerator = (target * currentHeld) - (100 * currentAttended);
    if (numerator <= 0) return 0;
    return Math.ceil(numerator / (100 - target));
  };

  const continuousClassesNeeded = calcContinuousRequired(targetExpectedPct, simAttended, simTotalConducted);

  // Filter upcoming official holidays & long weekends from calendar
  const upcomingHolidays = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    return ACADEMIC_CALENDAR.filter(
      (item) => item.type === 'HOLIDAY' || item.isLongWeekend
    ).filter((item) => (item.endDate || item.date) >= todayStr);
  }, []);

  // Filter out past events as dates pass by
  const upcomingCalendarEvents = React.useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const todayStr = `${year}-${month}-${day}`;
    const currentHour = now.getHours();

    return ACADEMIC_CALENDAR.filter((item) => {
      const effectiveEnd = item.endDate || item.date;
      return !(effectiveEnd < todayStr || (effectiveEnd === todayStr && currentHour >= 17));
    });
  }, []);

  // Group period records into Day-by-Day everyday attendance logs
  const everydayLogs = React.useMemo(() => {
    const recordsList = Object.values(periodRecords || {});
    // If user has recorded period logs, group them by date
    const dateMap: Record<string, {
      date: string;
      slots: Array<{
        periodKey: string;
        subjectName: string;
        subjectCode: string;
        time: string;
        room: string;
        status: 'attended' | 'bunked' | 'cancelled';
        hours: number;
      }>;
    }> = {};

    recordsList.forEach((rec) => {
      if (!rec.date) return;
      if (!dateMap[rec.date]) {
        dateMap[rec.date] = { date: rec.date, slots: [] };
      }
      const matchedSub = subjects.find((s) => s.id === rec.subjectId);
      const matchedSlot = timetable.find((t) => t.id === rec.slotId);
      dateMap[rec.date].slots.push({
        periodKey: rec.periodKey,
        subjectName: matchedSub ? matchedSub.name : 'Class Session',
        subjectCode: matchedSub ? matchedSub.code : '24GMxx',
        time: matchedSlot ? `${matchedSlot.startTime} - ${matchedSlot.endTime}` : '09:00 - 10:00',
        room: (matchedSlot && matchedSlot.room) || 'LH-101',
        status: rec.status,
        hours: rec.hours || 1,
      });
    });

    let grouped = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));

    // If periodRecords has few or no records, generate realistic everyday logs from academic schedule
    if (grouped.length === 0) {
      const sampleDates = [
        '2026-11-19', '2026-11-18', '2026-11-17', '2026-11-14',
        '2026-11-13', '2026-11-12', '2026-11-11', '2026-11-10',
        '2026-11-07', '2026-11-06', '2026-11-05', '2026-11-04'
      ];
      grouped = sampleDates.map((dStr, idx) => {
        const slotsForDay = (timetable.length > 0 ? timetable.slice(0, 4) : [
          { id: '1', startTime: '09:00', endTime: '10:00', subjectId: subjects[0]?.id || '1', room: 'LH-101' },
          { id: '2', startTime: '10:15', endTime: '11:15', subjectId: subjects[1]?.id || '2', room: 'LH-101' },
          { id: '3', startTime: '11:30', endTime: '12:30', subjectId: subjects[2]?.id || '3', room: 'LH-102' },
          { id: '4', startTime: '13:30', endTime: '14:30', subjectId: subjects[3]?.id || '4', room: 'LH-201' },
        ]).map((slot, sIdx) => {
          const sub = subjects.find((s) => s.id === slot.subjectId) || subjects[sIdx % subjects.length];
          // Occasional absent on specific days to reflect realistic ~80% attendance
          const isAbsent = (idx === 1 && sIdx === 2) || (idx === 4 && sIdx === 0) || (idx === 7 && sIdx === 1);
          return {
            periodKey: `${dStr}_slot_${sIdx}`,
            subjectName: sub ? sub.name : 'Management Course',
            subjectCode: sub ? sub.code : '24GMxx',
            time: `${slot.startTime} - ${slot.endTime}`,
            room: slot.room || 'LH-101',
            status: isAbsent ? ('bunked' as const) : ('attended' as const),
            hours: 1,
          };
        });
        return { date: dStr, slots: slotsForDay };
      });
    }

    return grouped;
  }, [periodRecords, subjects, timetable]);

  // Filtered everyday logs based on search & filter
  const filteredEverydayLogs = React.useMemo(() => {
    return everydayLogs
      .map((day) => {
        // Convert YYYY-MM-DD to DD-MM-YY and DD-MM-YYYY
        const parts = day.date.split('-');
        const yyyy = parts[0] || '';
        const mm = parts[1] || '';
        const dd = parts[2] || '';
        const yy = yyyy.slice(-2);
        const ddmmyy = `${dd}-${mm}-${yy}`;
        const ddmmyyyy = `${dd}-${mm}-${yyyy}`;
        const slashDdmmyy = `${dd}/${mm}/${yy}`;
        const slashDdmmyyyy = `${dd}/${mm}/${yyyy}`;

        const filteredSlots = day.slots.filter((slot) => {
          if (everydayStatusFilter === 'ATTENDED' && slot.status !== 'attended') return false;
          if (everydayStatusFilter === 'BUNKED' && slot.status !== 'bunked') return false;
          if (everydaySearch.trim()) {
            const rawQ = everydaySearch.trim().toLowerCase();
            const qClean = rawQ.replace(/[/.]/g, '-');
            const matchesDate =
              day.date.includes(rawQ) ||
              ddmmyy.includes(rawQ) ||
              ddmmyyyy.includes(rawQ) ||
              slashDdmmyy.includes(rawQ) ||
              slashDdmmyyyy.includes(rawQ) ||
              ddmmyy.includes(qClean) ||
              ddmmyyyy.includes(qClean);

            return (
              matchesDate ||
              slot.subjectName.toLowerCase().includes(rawQ) ||
              slot.subjectCode.toLowerCase().includes(rawQ)
            );
          }
          return true;
        });
        return { ...day, slots: filteredSlots };
      })
      .filter((day) => day.slots.length > 0);
  }, [everydayLogs, everydayStatusFilter, everydaySearch]);

  const filteredAcademics = subjects.filter((s) => {
    if (!academicSearch.trim()) return true;
    const q = academicSearch.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });

  // Centralized hierarchical back action (Phone hardware back button, web popstate & in-app back buttons)
  const handleBackAction = (): boolean => {
    // 1. Notice modal open -> close notice modal
    if (selectedNoticeModal) {
      setSelectedNoticeModal(null);
      return true;
    }
    // 2. Course syllabus/plan modal open -> close it
    if (selectedCourseDetails) {
      setSelectedCourseDetails(null);
      return true;
    }
    // 3. Holiday / Recovery Planner modal open -> close it
    if (showHolidayPlanner) {
      setShowHolidayPlanner(false);
      return true;
    }
    // 4. Notifications full-screen view open -> close it and return to HOME
    if (showNotificationsView) {
      setShowNotificationsView(false);
      setActiveTab('HOME');
      return true;
    }
    // 5. Settings / Profile drawer open -> close it
    if (showSettingsDrawer) {
      setShowSettingsDrawer(false);
      return true;
    }
    // 6. Inside Attendance everyday sub-view -> go back to course view
    if (activeTab === 'ATTENDANCE' && attendanceSubView === 'EVERYDAY') {
      setAttendanceSubView('COURSE');
      return true;
    }
    // 7. Any tab other than HOME -> navigate to HOME
    if (activeTab !== 'HOME') {
      setActiveTab('HOME');
      return true;
    }
    // 8. Already at HOME -> close/exit the prototype
    if (onClose) {
      onClose();
      return true;
    }
    return false;
  };

  // Listen to Android hardware back button and web browser back (popstate)
  useEffect(() => {
    if (!visible) return;

    // React Native hardware back handler (Android)
    const backSubscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        return handleBackAction();
      }
    );

    // Web browser popstate handler
    let popstateHandler: (() => void) | null = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Push history state so back button doesn't leave the whole app
      window.history.pushState({ modal: 'christ-preview' }, '');
      popstateHandler = () => {
        handleBackAction();
      };
      window.addEventListener('popstate', popstateHandler);
    }

    return () => {
      backSubscription.remove();
      if (popstateHandler && Platform.OS === 'web' && typeof window !== 'undefined') {
        window.removeEventListener('popstate', popstateHandler);
      }
    };
  }, [
    visible,
    selectedNoticeModal,
    selectedCourseDetails,
    showHolidayPlanner,
    showNotificationsView,
    showSettingsDrawer,
    activeTab,
    attendanceSubView,
  ]);

  // Dynamically generated themed and typography-scaled stylesheet
  const styles = React.useMemo(() => getStyles(isLight, fontScale), [isLight, fontScale]);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleBackAction}>
      <View style={styles.container}>
        {/* Top Header Bar (Mirroring Screenshot 1, 2, 3) */}
        <View style={styles.topHeader}>
          <View style={styles.headerLeft}>
            {/* Back button when not on HOME */}
            {activeTab !== 'HOME' ? (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setActiveTab('HOME')}
                activeOpacity={0.7}
              >
                <Text style={styles.backBtnText}>‹</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.headerRight}>
            {/* Exit Prototype to OG App Button */}
            <TouchableOpacity
              style={styles.exitPreviewBtn}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LogOut size={13} color="#F87171" strokeWidth={2.4} />
              <Text style={styles.exitPreviewText}>Exit to OG App</Text>
            </TouchableOpacity>

            {/* User Avatar Initial - opens Profile & Settings */}
            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => setShowSettingsDrawer(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.avatarLetter}>{avatarLetter}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content Body Based on Tab */}
        <View style={styles.bodyContent}>
          {activeTab === 'HOME' && (
            <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
              {/* User Greeting Title with Playful Bounce Animation */}
              <Animated.View
                style={[
                  styles.greetingSection,
                  {
                    transform: [{ translateY: bounceAnim }],
                  },
                ]}
              >
                <Text style={styles.greetingTitle}>
                  Hello, <Text style={{ color: isLight ? '#0F172A' : '#FFFFFF' }}>{studentName.toUpperCase()}</Text> ({displayRollNo})
                </Text>
                <View style={styles.classPill}>
                  <Text style={styles.classPillText}>Class: I MBA - Section B</Text>
                </View>
              </Animated.View>

              {/* ════════════════════════════════════════════════════════════
                  HERO CARD: LIVE SCHEDULE & ONGOING CLASS TRACKER
                  ════════════════════════════════════════════════════════════ */}
              <View
                style={[
                  styles.cardBox,
                  {
                    padding: 16,
                    borderRadius: 18,
                    borderWidth: 1.5,
                    borderColor: isLight ? '#BAE6FD' : 'rgba(56, 189, 248, 0.4)',
                    backgroundColor: isLight ? '#FFFFFF' : '#0B1322',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.35,
                    shadowRadius: 14,
                    elevation: 5,
                  },
                ]}
              >
                {/* Header: Dot + TODAY'S SCHEDULE • DD/MM/YYYY + Reset button */}
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    {/* Glowing lavender/cyan dot */}
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: isLight ? '#2563EB' : '#818CF8',
                        shadowColor: '#818CF8',
                        shadowRadius: 4,
                        shadowOpacity: 0.8,
                      }}
                    />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '900',
                        color: isLight ? '#0284C7' : '#38BDF8',
                        letterSpacing: 0.8,
                      }}
                    >
                      {isWeekendOrNoClass ? 'WEEKEND RELAX' : viewingNextDay ? 'NEXT DAY PREVIEW' : "TODAY'S SCHEDULE"}
                      <Text style={{ color: isLight ? '#64748B' : '#94A3B8', fontWeight: '700' }}>
                        {' '}• {displayDateFormatted}
                      </Text>
                    </Text>
                  </View>

                  {/* Reset button pill matching screenshot: red outline with dark crimson fill */}
                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        Vibration.vibrate(30);
                      } catch {}
                      Alert.alert(
                        'Reset Today Attendance?',
                        'This will clear any accidental attendance marks for today and restore them to unmarked so you can freely mark them again.',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Yes, Reset Today',
                            style: 'destructive',
                            onPress: async () => {
                              const today = displayDateStr;
                              const nextLocal = { ...localPeriodStatuses };
                              let changed = false;
                              Object.keys(nextLocal).forEach((key) => {
                                if (key.startsWith(today)) {
                                  delete nextLocal[key];
                                  changed = true;
                                }
                              });
                              setLocalPeriodStatuses(nextLocal);
                              Alert.alert('Reset Complete', "Today's accidental attendance markings have been cleared!");
                            },
                          },
                        ]
                      );
                    }}
                    style={{
                      backgroundColor: isLight ? '#FEF2F2' : 'rgba(153, 27, 27, 0.45)',
                      paddingHorizontal: 10,
                      paddingVertical: 3.5,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: isLight ? '#FCA5A5' : '#EF4444',
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 3,
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: isLight ? '#DC2626' : '#FCA5A5' }}>
                      ↺ Reset
                    </Text>
                  </TouchableOpacity>
                </View>

                {isWeekendOrNoClass ? (
                  <View style={{ backgroundColor: isLight ? '#F1F5F9' : '#0F172A', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 4 }}>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: isLight ? '#0F172A' : '#F1F5F9', marginBottom: 2 }}>
                      No Classes Scheduled Today ({currentDayName})
                    </Text>
                    <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center' }}>
                      Enjoy your break! Classes resume as per official college timetable.
                    </Text>
                  </View>
                ) : currentSlot ? (
                  <>
                    {/* Line 1: Bold Subject Title */}
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: '900',
                        color: isLight ? '#0F172A' : '#FFFFFF',
                        marginBottom: 4,
                        letterSpacing: 0.2,
                      }}
                      numberOfLines={2}
                    >
                      {currentSubject ? currentSubject.name : 'Economics for Decision Making'}
                    </Text>

                    {/* Line 2: Day • Start — End (X hrs) • Room */}
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: '600',
                        color: isLight ? '#475569' : '#94A3B8',
                        marginBottom: 8,
                      }}
                    >
                      {`${currentSlot.day} • ${currentSlot.startTime} — ${currentSlot.endTime} (${getSlotHours(currentSlot)} hrs) • ${currentSlot.room || 'LH-101'}`}
                    </Text>

                    {/* Line 3: Faculty Pill with Cyan highlight text */}
                    {(currentSlot.faculty || currentSubject?.faculty) ? (
                      <View
                        style={{
                          alignSelf: 'flex-start',
                          backgroundColor: isLight ? '#F0F9FF' : 'rgba(15, 23, 42, 0.8)',
                          borderWidth: 1,
                          borderColor: isLight ? '#BAE6FD' : 'rgba(56, 189, 248, 0.35)',
                          borderRadius: 8,
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          marginBottom: 14,
                        }}
                      >
                        <Text style={{ fontSize: 12.5, fontWeight: '600', color: isLight ? '#475569' : '#94A3B8' }}>
                          Faculty: <Text style={{ color: isLight ? '#0284C7' : '#38BDF8', fontWeight: '800' }}>{currentSlot.faculty || currentSubject?.faculty}</Text>
                        </Text>
                      </View>
                    ) : null}

                    {/* Line 4: Square Period Cards (e.g. 08:30 / 24GM12 / Attended) */}
                    {activeDaySlots.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginBottom: 14 }}
                        contentContainerStyle={{ flexDirection: 'row', gap: 10 }}
                      >
                        {activeDaySlots.map((slot, index) => {
                          const slotSub = subjects.find((s) => s.id === slot.subjectId);
                          const isSportsSlot = slot.subjectId === 'sub_sports' || slotSub?.code === 'SPORTS';
                          const pKey = `${displayDateStr}_${slot.id}`;
                          const rec = localPeriodStatuses[pKey] ? { status: localPeriodStatuses[pKey] } : periodRecords[pKey];
                          const isSelected = activeIndex === index;

                          // Compute background color matching screenshot:
                          // Selected/Active: Solid electric blue (#2563EB)
                          // Marked Attended (unselected): Dark pine green with green border
                          // Marked Bunked: Dark wine red with red border
                          // Unmarked: Slate navy
                          let pillBg = '#1E293B';
                          let pillBorder = '#334155';
                          let timeColor = '#FFFFFF';
                          let codeColor = '#FFFFFF';

                          if (isSelected) {
                            pillBg = '#2563EB';
                            pillBorder = '#60A5FA';
                            timeColor = '#FFFFFF';
                            codeColor = '#FFFFFF';
                          } else if (rec?.status === 'attended') {
                            pillBg = isLight ? '#ECFDF5' : 'rgba(6, 78, 59, 0.6)';
                            pillBorder = isLight ? '#A7F3D0' : '#10B981';
                            timeColor = isLight ? '#065F46' : '#A7F3D0';
                            codeColor = isLight ? '#065F46' : '#A7F3D0';
                          } else if (rec?.status === 'bunked') {
                            pillBg = isLight ? '#FEF2F2' : 'rgba(127, 29, 29, 0.6)';
                            pillBorder = isLight ? '#FECACA' : '#EF4444';
                            timeColor = isLight ? '#991B1B' : '#FCA5A5';
                            codeColor = isLight ? '#991B1B' : '#FCA5A5';
                          } else if (rec?.status === 'cancelled') {
                            pillBg = isLight ? '#F1F5F9' : '#1E293B';
                            pillBorder = isLight ? '#CBD5E1' : '#475569';
                            timeColor = '#94A3B8';
                            codeColor = '#94A3B8';
                          } else if (isLight) {
                            pillBg = '#F8FAFC';
                            pillBorder = '#CBD5E1';
                            timeColor = '#334155';
                            codeColor = '#0F172A';
                          }

                          return (
                            <TouchableOpacity
                              key={slot.id}
                              style={{
                                width: 84,
                                height: 72,
                                borderRadius: 12,
                                borderWidth: 1.5,
                                borderColor: pillBorder,
                                backgroundColor: pillBg,
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 6,
                              }}
                              onPress={() => setSelectedSlotIndex(index)}
                              activeOpacity={0.7}
                            >
                              <Text style={{ fontSize: 13, fontWeight: '900', color: timeColor }}>
                                {slot.startTime}
                              </Text>
                              <Text style={{ fontSize: 11.5, fontWeight: '800', color: codeColor, marginVertical: 2 }}>
                                {slotSub?.code || 'CLASS'}
                              </Text>
                              {isSportsSlot ? (
                                <Text style={{ fontSize: 9.5, fontWeight: '700', color: isSelected ? '#FFFFFF' : '#818CF8' }}>
                                  No Att.
                                </Text>
                              ) : rec ? (
                                <Text
                                  style={{
                                    fontSize: 10,
                                    fontWeight: '800',
                                    color: isSelected
                                      ? '#FFFFFF'
                                      : rec.status === 'attended'
                                      ? (isLight ? '#059669' : '#34D399')
                                      : rec.status === 'bunked'
                                      ? (isLight ? '#DC2626' : '#F87171')
                                      : '#94A3B8',
                                  }}
                                >
                                  {rec.status === 'attended' ? '✓ Attended' : rec.status === 'bunked' ? '✕ Missed' : '○ Free'}
                                </Text>
                              ) : (
                                <Text style={{ fontSize: 9.5, fontWeight: '700', color: isSelected ? 'rgba(255,255,255,0.85)' : '#64748B' }}>
                                  ○ Unmarked
                                </Text>
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    )}

                    {/* Line 5: Large Status Banner (e.g. Marked: Attended (2 hrs)) */}
                    {currentRecord ? (
                      <View
                        style={{
                          backgroundColor: currentRecord.status === 'attended'
                            ? (isLight ? '#ECFDF5' : 'rgba(6, 78, 59, 0.45)')
                            : currentRecord.status === 'bunked'
                            ? (isLight ? '#FEF2F2' : 'rgba(127, 29, 29, 0.45)')
                            : (isLight ? '#F1F5F9' : 'rgba(30, 41, 59, 0.5)'),
                          borderWidth: 1.5,
                          borderColor: currentRecord.status === 'attended'
                            ? (isLight ? '#6EE7B7' : '#10B981')
                            : currentRecord.status === 'bunked'
                            ? (isLight ? '#FCA5A5' : '#EF4444')
                            : '#64748B',
                          borderRadius: 14,
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          marginBottom: 14,
                        }}
                      >
                        <Text style={{ fontSize: 22 }}>
                          {currentRecord.status === 'attended' ? '✓' : currentRecord.status === 'bunked' ? '✕' : '○'}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: '900',
                            color: isLight
                              ? (currentRecord.status === 'attended' ? '#065F46' : currentRecord.status === 'bunked' ? '#991B1B' : '#334155')
                              : '#FFFFFF',
                          }}
                        >
                          {currentRecord.status === 'attended' && `Marked: Attended (${currentRecord.hours || getSlotHours(currentSlot)} hrs)`}
                          {currentRecord.status === 'bunked' && `Marked: Missed (${currentRecord.hours || getSlotHours(currentSlot)} hrs)`}
                          {currentRecord.status === 'cancelled' && 'Marked: Free / Cancelled'}
                        </Text>
                      </View>
                    ) : null}

                    {/* Line 6: Exact 3 Action Buttons Matching Screenshot */}
                    {/* Button 1: Emerald Green with White text and highlight inner border (Attended (2h)) */}
                    {/* Button 2: Vibrant Red with White text (I Missed (2h)) */}
                    {/* Button 3: Dark Slate Gray with Muted Light text (Free) */}
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          flex: 1.1,
                          backgroundColor: '#059669',
                          borderRadius: 12,
                          paddingVertical: 11,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: currentRecord?.status === 'attended' ? 2 : 1,
                          borderColor: currentRecord?.status === 'attended' ? '#A7F3D0' : '#10B981',
                          shadowColor: '#10B981',
                          shadowRadius: currentRecord?.status === 'attended' ? 6 : 0,
                          shadowOpacity: currentRecord?.status === 'attended' ? 0.4 : 0,
                        }}
                        onPress={() => handleMarkTodaySlot(currentSlot, 'attended')}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13.5 }}>
                          Attended ({getSlotHours(currentSlot)}h)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          flex: 1.1,
                          backgroundColor: '#DC2626',
                          borderRadius: 12,
                          paddingVertical: 11,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: currentRecord?.status === 'bunked' ? 2 : 1,
                          borderColor: currentRecord?.status === 'bunked' ? '#FECACA' : '#EF4444',
                          shadowColor: '#EF4444',
                          shadowRadius: currentRecord?.status === 'bunked' ? 6 : 0,
                          shadowOpacity: currentRecord?.status === 'bunked' ? 0.4 : 0,
                        }}
                        onPress={() => handleMarkTodaySlot(currentSlot, 'bunked')}
                      >
                        <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 13.5 }}>
                          I Missed ({getSlotHours(currentSlot)}h)
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={{
                          flex: 0.9,
                          backgroundColor: isLight ? '#E2E8F0' : '#334155',
                          borderRadius: 12,
                          paddingVertical: 11,
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: currentRecord?.status === 'cancelled' ? 2 : 1,
                          borderColor: currentRecord?.status === 'cancelled' ? '#94A3B8' : (isLight ? '#CBD5E1' : '#475569'),
                        }}
                        onPress={() => handleMarkTodaySlot(currentSlot, 'cancelled')}
                      >
                        <Text style={{ color: isLight ? '#475569' : '#CBD5E1', fontWeight: '800', fontSize: 13.5 }}>
                          Free
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                ) : null}
              </View>

              {/* BOX 1: LIVE ATTENDANCE STATUS CARD (Replacing "No attendance data available") */}
              <TouchableOpacity
                style={styles.liveAttendanceCard}
                onPress={() => setActiveTab('ATTENDANCE')}
                activeOpacity={0.8}
              >
                <View style={styles.liveAttTopRow}>
                  <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <Text style={styles.liveAttBadge}>LIVE ATTENDANCE</Text>
                      <Text style={{ fontSize: 10, color: '#94A3B8', fontWeight: '700' }}>
                        Upto 14-11-2026
                      </Text>
                    </View>
                    <Text style={styles.liveAttSubTitle}>
                      {totalAttended} of {totalConducted} Total Hours Attended
                    </Text>
                    <Text style={[styles.liveAttBunkText, { color: isSafeAttendance ? '#10B981' : '#F87171' }]}>
                      {overallMetrics.safeBunks > 0
                        ? `You can skip ${overallMetrics.safeBunks} more classes (>75%)`
                        : overallMetrics.recoveryNeeded > 0
                        ? `Shortage: Attend next ${overallMetrics.recoveryNeeded} classes to hit 75%`
                        : 'On track at 75% threshold'}
                    </Text>
                  </View>

                  {/* Overall Percentage Badge (Clean pill replacing the circular ring) */}
                  <View
                    style={{
                      alignItems: 'flex-end',
                      justifyContent: 'center',
                      paddingLeft: 12,
                    }}
                  >
                    <View
                      style={{
                        paddingHorizontal: 12,
                        paddingVertical: 8,
                        borderRadius: 10,
                        backgroundColor: isSafeAttendance ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                        borderWidth: 1,
                        borderColor: isSafeAttendance ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)',
                        alignItems: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 17,
                          fontWeight: '900',
                          color: isSafeAttendance ? '#10B981' : '#EF4444',
                        }}
                      >
                        {overallPctFormatted}%
                      </Text>
                      <Text
                        style={{
                          fontSize: 9,
                          fontWeight: '800',
                          color: isSafeAttendance ? '#10B981' : '#EF4444',
                          letterSpacing: 0.5,
                          marginTop: 2,
                        }}
                      >
                        {isSafeAttendance ? 'ELIGIBLE' : 'SHORTAGE'}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* BOX 2: IMPORTANT NOTIFICATIONS (Screenshot 2 & Screenshot 6 - PSGIM Connect) */}
              <View style={styles.cardBox}>
                <View style={styles.notifCardHeader}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Bell size={17} color="#38BDF8" strokeWidth={2.2} />
                    <Text style={styles.notifCardTitle}>Important Notifications</Text>
                    {unreadCount > 0 && (
                      <View style={styles.notifCountPill}>
                        <Text style={styles.notifCountPillText}>{unreadCount}</Text>
                      </View>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => setShowNotificationsView(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.viewAllText}>VIEW ALL →</Text>
                  </TouchableOpacity>
                </View>

                {/* Display Latest PSGIM Connect Announcement if unread, or if caught up show caught up banner */}
                {unreadCount > 0 && announcements.length > 0 ? (
                  (() => {
                    const latestUnread = announcements.find((a) => !readNotifIds.has(a.id)) || announcements[0];
                    return (
                      <TouchableOpacity
                        style={styles.connectNoticeRow}
                        onPress={() => handleOpenNotice(latestUnread)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.noticeIconCircle}>
                          <Megaphone size={16} color="#38BDF8" strokeWidth={2} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <Text style={styles.noticeCategoryTag}>
                              {latestUnread.category.toUpperCase()}
                            </Text>
                            <Text style={styles.noticeDateTag}>
                              {latestUnread.publish_at ? latestUnread.publish_at.split(' ')[0] : 'Today'}
                            </Text>
                          </View>
                          <Text style={styles.noticeTitleText} numberOfLines={2}>
                            {latestUnread.title}
                          </Text>
                        </View>
                        <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '800' }}>›</Text>
                      </TouchableOpacity>
                    );
                  })()
                ) : (
                  <View style={styles.notifStateCenter}>
                    <View style={styles.checkCircle}>
                      <Check size={18} color="#10B981" strokeWidth={2.5} />
                    </View>
                    <Text style={styles.notifEmptySub}>
                      You’re all caught up — no important notifications right now.
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}

          {activeTab === 'ATTENDANCE' && (
            <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
              {/* Attendance View Switcher: Course-wise vs Everyday */}
              <View style={styles.attendanceSegmentContainer}>
                <TouchableOpacity
                  style={[
                    styles.attendanceSegmentBtn,
                    attendanceSubView === 'COURSE' && styles.attendanceSegmentActive,
                  ]}
                  onPress={() => setAttendanceSubView('COURSE')}
                  activeOpacity={0.8}
                >
                  <BookOpen
                    size={14}
                    color={attendanceSubView === 'COURSE' ? '#38BDF8' : '#64748B'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.attendanceSegmentText,
                      attendanceSubView === 'COURSE' && styles.attendanceSegmentTextActive,
                    ]}
                  >
                    Course-wise
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.attendanceSegmentBtn,
                    attendanceSubView === 'EVERYDAY' && styles.attendanceSegmentActive,
                  ]}
                  onPress={() => setAttendanceSubView('EVERYDAY')}
                  activeOpacity={0.8}
                >
                  <CalendarDays
                    size={14}
                    color={attendanceSubView === 'EVERYDAY' ? '#38BDF8' : '#64748B'}
                    strokeWidth={2.2}
                  />
                  <Text
                    style={[
                      styles.attendanceSegmentText,
                      attendanceSubView === 'EVERYDAY' && styles.attendanceSegmentTextActive,
                    ]}
                  >
                    Everyday Attendance
                  </Text>
                </TouchableOpacity>
              </View>

              {attendanceSubView === 'COURSE' ? (
                <>
                  {/* Semester Dropdown (Screenshot 3) */}
                  <View style={styles.semSelectWrapper}>
                    <Text style={styles.semSelectLabel}>Semester</Text>
                    <TouchableOpacity
                      style={styles.semDropdownBtn}
                      onPress={() => setShowSemesterMenu(!showSemesterMenu)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.semDropdownText}>{selectedSemester}</Text>
                      <Text style={styles.semChevron}>▾</Text>
                    </TouchableOpacity>

                    {showSemesterMenu && (
                      <View style={styles.semMenuPopup}>
                        {['SEMESTER - I', 'SEMESTER - II', 'SEMESTER - III', 'SEMESTER - IV'].map(
                          (sem) => (
                            <TouchableOpacity
                              key={sem}
                              style={styles.semMenuItem}
                              onPress={() => {
                                setSelectedSemester(sem);
                                setShowSemesterMenu(false);
                              }}
                            >
                              <Text
                                style={[
                                  styles.semMenuItemText,
                                  selectedSemester === sem && { color: '#38BDF8', fontWeight: '800' },
                                ]}
                              >
                                {sem}
                              </Text>
                            </TouchableOpacity>
                          )
                        )}
                      </View>
                    )}
                  </View>

                  {/* Title Header */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={[styles.sectionPageTitle, { marginBottom: 0 }]}>Course-wise Attendance</Text>
                  </View>

                  {/* Accordion Cards per Subject (Screenshot 3) */}
                  <View style={{ gap: 12 }}>
                    {attendanceSubjects.map((sub) => {
                      const isExpanded = expandedSubjectId === sub.id;
                      const total = sub.total || 0;
                      const present = sub.attended || 0;
                      const absent = Math.max(0, total - present);
                      const pct = total > 0 ? (present / total) * 100 : 100;
                      const pctFormatted = pct.toFixed(2);
                      const isSafe = pct >= 75;
                      const safeBunks = total > 0 ? Math.max(0, Math.floor((100 * present - 75 * total) / 75)) : 0;
                      const recoveryNeeded = total > 0 && pct < 75 ? Math.ceil((75 * total - 100 * present) / 25) : 0;

                      return (
                        <View key={sub.id} style={styles.accordionCard}>
                          <TouchableOpacity
                            style={styles.accordionHeader}
                            onPress={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                            activeOpacity={0.8}
                          >
                            {/* Course Name */}
                            <View style={{ flex: 1, paddingRight: 8 }}>
                              <Text style={styles.accordionCourseTitle} numberOfLines={2}>
                                {sub.name.toUpperCase()}
                              </Text>
                            </View>
                            
                          </TouchableOpacity>

                          {/* Metric Columns Row: Total, Present, Absent, Percent (Clean 4-column overview) */}
                          <TouchableOpacity
                            style={styles.metricsRow}
                            onPress={() => setExpandedSubjectId(isExpanded ? null : sub.id)}
                            activeOpacity={0.8}
                          >
                            <View style={styles.metricCol}>
                              <Text style={styles.metricLabel}>Total</Text>
                              <Text style={styles.metricValue}>{total}</Text>
                            </View>
                            <View style={styles.metricCol}>
                              <Text style={styles.metricLabel}>Present</Text>
                              <Text style={[styles.metricValue, { color: '#10B981' }]}>{present}</Text>
                            </View>
                            <View style={styles.metricCol}>
                              <Text style={styles.metricLabel}>Absent</Text>
                              <Text style={[styles.metricValue, { color: '#EF4444' }]}>{absent}</Text>
                            </View>
                            <View style={styles.metricCol}>
                              <Text style={styles.metricLabel}>Percent</Text>
                              <Text
                                style={[
                                  styles.metricValue,
                                  { color: isSafe ? '#10B981' : '#EF4444' },
                                ]}
                              >
                                {pctFormatted}%
                              </Text>
                            </View>
                            <View style={[styles.metricCol, { alignItems: 'flex-end', justifyContent: 'center' }]}>
                              <Text style={{ color: '#64748B', fontSize: 13, fontWeight: '700' }}>
                                {isExpanded ? '▲' : '▼'}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          {/* Detailed Leave Metric & Analysis (Appears ONLY when clicking the subject) */}
                          {isExpanded && (
                            <View style={styles.expandedDrawer}>
                              <View style={[styles.subjectLeaveDetailBox, { borderColor: isSafe ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)', backgroundColor: isSafe ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                                  <Text style={[styles.subjectLeaveTitle, { color: isSafe ? '#10B981' : '#EF4444' }]}>
                                    {isSafe ? '✓ SAFE ATTENDANCE MARGIN' : '[!] ATTENDANCE SHORTAGE WARNING'}
                                  </Text>
                                  <View style={[styles.subjectLeaveBadge, { backgroundColor: isSafe ? '#10B981' : '#EF4444' }]}>
                                    <Text style={styles.subjectLeaveBadgeText}>
                                      {isSafe ? `${safeBunks} hrs can bunk` : `+${recoveryNeeded} hrs required`}
                                    </Text>
                                  </View>
                                </View>
                                <Text style={styles.subjectLeaveExplanation}>
                                  {isSafe
                                    ? `You can safely take ${safeBunks} more classes off while maintaining attendance above the mandatory 75% threshold.`
                                    : `You must attend the next ${recoveryNeeded} consecutive classes without missing any sessions to recover and achieve 75% attendance.`}
                                </Text>
                              </View>
                            </View>
                          )}


                        </View>
                      );
                    })}
                  </View>
                </>
              ) : (
                /* EVERYDAY ATTENDANCE VIEW (Day-by-Day Historical Logs) */
                <View>
                  {/* Search and Status Filters */}
                  <View style={styles.searchBar}>
                    <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search date (DD-MM-YY) or course..."
                      placeholderTextColor="#64748B"
                      value={everydaySearch}
                      onChangeText={setEverydaySearch}
                    />
                    {everydaySearch ? (
                      <TouchableOpacity onPress={() => setEverydaySearch('')}>
                        <X size={15} color="#94A3B8" />
                      </TouchableOpacity>
                    ) : null}
                  </View>

                  {/* Day by Day Cards List */}
                  {filteredEverydayLogs.length === 0 ? (
                    <View style={styles.everydayEmptyBox}>
                      <AlertCircle size={28} color="#64748B" style={{ marginBottom: 8 }} />
                      <Text style={styles.everydayEmptyTitle}>No records found</Text>
                      <Text style={styles.everydayEmptySub}>Try adjusting your filter or search query</Text>
                    </View>
                  ) : (
                    <View style={{ gap: 14 }}>
                      {filteredEverydayLogs.map((dayLog) => {
                        // Format friendly date
                        const dObj = new Date(dayLog.date);
                        const dayName = isNaN(dObj.getTime())
                          ? ''
                          : dObj.toLocaleDateString('en-US', { weekday: 'short' });
                        const monthDay = isNaN(dObj.getTime())
                          ? dayLog.date
                          : dObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                        const isDateExpanded = expandedEverydayDate === dayLog.date;

                        return (
                          <View key={dayLog.date} style={styles.everydayDayCard}>
                            {/* Clickable Date Card Header */}
                            <TouchableOpacity
                              style={styles.everydayDayHeader}
                              onPress={() => setExpandedEverydayDate(isDateExpanded ? null : dayLog.date)}
                              activeOpacity={0.7}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                                <View
                                  style={[
                                    styles.everydayCalendarIconBox,
                                    isDateExpanded && { backgroundColor: 'rgba(56, 189, 248, 0.25)' },
                                  ]}
                                >
                                  <CalendarDays
                                    size={17}
                                    color={isDateExpanded ? '#38BDF8' : '#94A3B8'}
                                    strokeWidth={2.2}
                                  />
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.everydayDayTitle}>
                                    {dayName ? `${dayName}, ${monthDay}` : dayLog.date}
                                  </Text>
                                </View>
                              </View>

                              {/* Dropdown Chevron */}
                              <Text style={styles.accordionChevron}>{isDateExpanded ? '⌃' : '⌄'}</Text>
                            </TouchableOpacity>

                            {/* Session Periods List - Appears when Date is clicked */}
                            {isDateExpanded && (
                              <View style={styles.everydaySlotsContainer}>
                                <View style={styles.everydayExpandedHeaderRow}>
                                  <Text style={styles.everydayExpandedHeaderTitle}>
                                    CLASS SESSIONS & ATTENDANCE
                                  </Text>
                                  <Text style={styles.everydayExpandedHeaderSub}>
                                    Tap to inspect course details
                                  </Text>
                                </View>

                                {dayLog.slots.map((slot, sIdx) => {
                                  const isAttended = slot.status === 'attended';
                                  const isBunked = slot.status === 'bunked';

                                  return (
                                    <View key={slot.periodKey || sIdx} style={styles.everydaySlotRow}>
                                      <View style={styles.everydaySlotTimeCol}>
                                        <Text style={styles.everydaySlotTimeText}>{slot.time}</Text>
                                        <Text style={styles.everydaySlotRoomText}>{slot.room}</Text>
                                      </View>

                                      <View style={styles.everydaySlotDivider} />

                                      <View style={{ flex: 1, paddingHorizontal: 10 }}>
                                        <Text style={styles.everydaySlotSubjectName} numberOfLines={1}>
                                          {slot.subjectName}
                                        </Text>
                                        <Text style={styles.everydaySlotSubjectCode}>
                                          {slot.subjectCode} • {slot.hours} hr
                                        </Text>
                                      </View>

                                      {/* Status Badge */}
                                      <View
                                        style={[
                                          styles.everydayStatusBadge,
                                          isAttended
                                            ? styles.everydayStatusAttended
                                            : isBunked
                                            ? styles.everydayStatusBunked
                                            : styles.everydayStatusCancelled,
                                        ]}
                                      >
                                        {isAttended ? (
                                          <Check size={12} color="#10B981" strokeWidth={2.6} />
                                        ) : isBunked ? (
                                          <X size={12} color="#EF4444" strokeWidth={2.6} />
                                        ) : null}
                                        <Text
                                          style={[
                                            styles.everydayStatusText,
                                            isAttended
                                              ? { color: '#10B981' }
                                              : isBunked
                                              ? { color: '#EF4444' }
                                              : { color: '#94A3B8' },
                                          ]}
                                        >
                                          {isAttended ? 'Present' : isBunked ? 'Absent' : 'Cancelled'}
                                        </Text>
                                      </View>
                                    </View>
                                  );
                                })}
                              </View>
                            )}
                          </View>
                        );
                      })}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          )}

          {activeTab === 'ACADEMICS' && (
            <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionPageTitle}>Academics</Text>

              {/* Search Bar (Screenshot 5: Search course name or code...) */}
              <View style={styles.searchBar}>
                <Sparkles size={16} color="#FBBF24" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search course name or code..."
                  placeholderTextColor="#64748B"
                  value={academicSearch}
                  onChangeText={setAcademicSearch}
                />
                <Search size={16} color="#64748B" />
              </View>

                            {/* Course Pack Big Card (Screenshot 1) */}
              <TouchableOpacity
                style={styles.bigCoursePackCard}
                onPress={() => {
                  const defaultSub = filteredAcademics[0] || subjects[0];
                  if (defaultSub) {
                    setSelectedCourseDetails({
                      code: defaultSub.code,
                      name: defaultSub.name,
                      type: 'PLAN',
                    });
                  }
                }}
                activeOpacity={0.85}
              >
                <View style={styles.bookIconWrap}>
                  <BookOpen size={24} color="#38BDF8" strokeWidth={2.2} />
                </View>
                <Text style={styles.coursePackTitle}>Course Pack</Text>
                <Text style={styles.coursePackSub}>Syllabus & 15-Week Course Plan</Text>
              </TouchableOpacity>

              {/* Course Units List (Screenshot 4) */}
              <View style={{ gap: 14, marginTop: 16 }}>
                {filteredAcademics.map((sub) => (
                  <View key={sub.id} style={styles.academicCourseCard}>
                    {/* Header Badges Row */}
                    <View style={styles.academicBadgesRow}>
                      <View style={styles.codeBadge}>
                        <Text style={styles.codeBadgeText}>{sub.code}</Text>
                      </View>
                      <View style={styles.theoryBadge}>
                        <Text style={styles.theoryBadgeText}>THEORY</Text>
                      </View>
                      <View style={styles.creditBadge}>
                        <Text style={styles.creditBadgeText}>4 Credits</Text>
                      </View>
                    </View>

                    {/* Course Category Pill - Core Courses are subjects with official NotebookLM */}
                    {hasNotebookForSubject(sub.code, sub.name) && (
                      <Text style={styles.academicCategory}>• Core Courses</Text>
                    )}

                    {/* Course Title */}
                    <Text style={styles.academicTitleText}>{sub.name.toUpperCase()}</Text>

                    {/* Syllabus Row */}
                    <TouchableOpacity
                      style={styles.academicActionRow}
                      onPress={() => {
                        setSelectedCourseDetails({
                          code: sub.code,
                          name: sub.name,
                          type: 'SYLLABUS',
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <FileText size={18} color="#60A5FA" strokeWidth={2} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.actionRowTitle}>Syllabus</Text>
                          <Text style={styles.actionRowSub}>Units & Course Outcomes</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.actionViewBtn}>
                          <Text style={styles.actionViewText}>View</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Course Plan Row */}
                    <TouchableOpacity
                      style={styles.academicActionRow}
                      onPress={() => {
                        setSelectedCourseDetails({
                          code: sub.code,
                          name: sub.name,
                          type: 'PLAN',
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <CalendarDays size={18} color="#34D399" strokeWidth={2} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.actionRowTitle}>Course Plan</Text>
                          <Text style={styles.actionRowSub}>15-Week Lecture Schedule</Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={styles.actionViewBtn}>
                          <Text style={styles.actionViewText}>View</Text>
                        </View>
                        <TouchableOpacity
                          style={styles.actionIconBtn}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            if (onOpenCoursePlan) onOpenCoursePlan(sub.code, sub.name);
                          }}
                          activeOpacity={0.7}
                        >
                          <ExternalLink size={14} color="#34D399" strokeWidth={2.2} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    {/* Assignments & Submissions Row */}
                    <TouchableOpacity
                      style={styles.academicActionRow}
                      onPress={() => {
                        setSelectedCourseDetails({
                          code: sub.code,
                          name: sub.name,
                          type: 'ASSIGNMENTS',
                        });
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                        <CalendarCheck size={18} color="#F59E0B" strokeWidth={2} />
                        <View style={{ flex: 1 }}>
                          <Text style={styles.actionRowTitle}>Assignments & Submissions</Text>
                          <Text style={styles.actionRowSub}>
                            {getCoursePlanForSubject(sub.code, sub.name).assessments.length} Deliverables • CA & Portfolios
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.actionViewBtn, { borderColor: '#F59E0B' }]}>
                          <Text style={[styles.actionViewText, { color: '#F59E0B' }]}>View</Text>
                        </View>
                      </View>
                    </TouchableOpacity>

                    {/* Google NotebookLM Individual Subject Link Row (Only shown for Core Courses with NotebookLM) */}
                    {hasNotebookForSubject(sub.code, sub.name) && (
                      <View style={styles.academicActionRow}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                          <Brain size={18} color="#A78BFA" strokeWidth={2.2} />
                          <View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                              <Text style={styles.actionRowTitle}>NotebookLM AI Hub</Text>
                              <View style={styles.aiBadgeMini}>
                                <Text style={styles.aiBadgeMiniText}>AI</Text>
                              </View>
                            </View>
                            <Text style={styles.actionRowSub}>Textbooks, Audio Pod & Notes</Text>
                          </View>
                        </View>
                        <TouchableOpacity
                          style={styles.actionNotebookBtn}
                          onPress={() => {
                            const nbUrl = getNotebookUrlForSubject(sub.code, sub.name);
                            if (!nbUrl) return;
                            if (Platform.OS === 'web') {
                              window.open(nbUrl, '_blank');
                            } else {
                              Linking.openURL(nbUrl).catch(() => {});
                            }
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.actionNotebookBtnText}>Open AI Hub</Text>
                          <ExternalLink size={12} color="#C084FC" strokeWidth={2.2} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {activeTab === 'CALENDAR' && (
            <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionPageTitle}>Academic Calendar 2026–27</Text>

              {/* Smart Holiday Leave & Continuous Recovery Card */}
              <TouchableOpacity
                style={styles.holidayLeaveBannerCard}
                onPress={() => setShowHolidayPlanner(true)}
                activeOpacity={0.85}
              >
                <View style={styles.holidayBannerTopRow}>
                  <View style={styles.holidayBannerIconBox}>
                    <Plane size={20} color="#38BDF8" strokeWidth={2.4} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.holidayBannerTitle}>Smart Holiday & Leave Planner</Text>
                      <View style={styles.holidayBannerTag}>
                        <Sparkles size={10} color="#38BDF8" />
                        <Text style={styles.holidayBannerTagText}>AI Planner</Text>
                      </View>
                    </View>
                    <Text style={styles.holidayBannerSub}>
                      {overallMetrics.safeBunksAt75 > 0
                        ? `You can safely take ${overallMetrics.safeBunksAt75} class${overallMetrics.safeBunksAt75 > 1 ? 'es' : ''} off without dropping below 75%`
                        : `Current attendance: ${overallPctFormatted}%. Simulate leaves & calculate continuous recovery`}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#64748B" />
                </View>

                {/* Quick Dynamic Insight Pill Row */}
                <View style={styles.holidayBannerPillRow}>
                  <View style={styles.holidayBannerPill}>
                    <TrendingUp size={12} color="#10B981" />
                    <Text style={styles.holidayBannerPillText}>
                      Current: <Text style={{ color: isLight ? '#0F172A' : '#F8FAFC', fontWeight: '800' }}>{overallPctFormatted}%</Text>
                    </Text>
                  </View>
                  <View style={styles.holidayBannerPill}>
                    <CalendarDays size={12} color="#38BDF8" />
                    <Text style={styles.holidayBannerPillText}>
                      Next: <Text style={{ color: '#38BDF8', fontWeight: '800' }}>Dec 25 (Christmas)</Text>
                    </Text>
                  </View>
                  <View style={[styles.holidayBannerPill, { backgroundColor: 'rgba(56, 189, 248, 0.15)', borderColor: '#38BDF8' }]}>
                    <Text style={[styles.holidayBannerPillText, { color: '#38BDF8', fontWeight: '800' }]}>
                      Open Planner ›
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Calendar Filter Pills: All | Holidays | Exams | Events */}
              <View style={styles.notifFilterRow}>
                {(['ALL', 'HOLIDAY', 'EXAM', 'EVENT'] as const).map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[
                      styles.notifFilterPill,
                      calFilter === f && styles.notifFilterPillActive,
                    ]}
                    onPress={() => setCalFilter(f)}
                  >
                    <Text
                      style={[
                        styles.notifFilterText,
                        calFilter === f && styles.notifFilterTextActive,
                      ]}
                    >
                      {f === 'ALL'
                        ? 'All'
                        : f === 'HOLIDAY'
                        ? 'Holidays'
                        : f === 'EXAM'
                        ? 'Exams'
                        : 'Events'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Search Calendar */}
              <View style={styles.searchBar}>
                <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search holiday, exam, or event..."
                  placeholderTextColor="#64748B"
                  value={calSearch}
                  onChangeText={setCalSearch}
                />
              </View>

              {/* Calendar Event Cards */}
              <View style={{ gap: 10 }}>
                {upcomingCalendarEvents.filter((item) => {
                  if (calFilter !== 'ALL' && item.type !== calFilter) return false;
                  if (!calSearch.trim()) return true;
                  const q = calSearch.toLowerCase();
                  return (
                    item.title.toLowerCase().includes(q) ||
                    item.date.includes(q) ||
                    (item.description && item.description.toLowerCase().includes(q))
                  );
                }).map((item) => {
                  const isHoliday = item.type === 'HOLIDAY';
                  const isExam = item.type === 'EXAM';
                  const isEvent = item.type === 'EVENT';
                  const badgeColor = isHoliday ? '#10B981' : isExam ? '#EF4444' : '#3B82F6';
                  const badgeBg = isHoliday
                    ? 'rgba(16, 185, 129, 0.15)'
                    : isExam
                    ? 'rgba(239, 68, 68, 0.15)'
                    : 'rgba(59, 130, 246, 0.15)';

                  return (
                    <View key={item.id} style={styles.calendarCard}>
                      <View style={styles.calCardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View style={[styles.calTypeBadge, { backgroundColor: badgeBg }]}>
                            <Text style={[styles.calTypeBadgeText, { color: badgeColor }]}>
                              {item.type}
                            </Text>
                          </View>
                          {item.longWeekendTag && (
                            <View style={styles.longWeekendPill}>
                              <Text style={styles.longWeekendText}>{item.longWeekendTag}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.calDateText}>
                          {item.date} • {item.day}
                        </Text>
                      </View>

                      <Text style={styles.calTitleText}>{item.title}</Text>
                      {item.description ? (
                        <Text style={styles.calDescText}>{item.description}</Text>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}

          {activeTab === 'PORTALS' && (
            <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionPageTitle}>Official Campus Portals</Text>

              {/* 1. Studzone Portal Card */}
              <View style={styles.portalCard}>
                <View style={styles.portalCardHeader}>
                  <View style={styles.portalIconCircle}>
                    <GraduationCap size={22} color="#38BDF8" strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.portalTitle}>PSG Studzone Extractor</Text>
                      <View style={styles.portalLivePill}>
                        <Text style={styles.portalLivePillText}>OFFICIAL ERP</Text>
                      </View>
                    </View>
                    <Text style={styles.portalSub}>ecampus.psgtech.ac.in/studzone</Text>
                  </View>
                </View>

                <Text style={styles.portalDesc}>
                  Extract live official attendance hours, OD/medical exemption percentages, and verify course records straight from the college server.
                </Text>

                <TouchableOpacity
                  style={styles.portalActionBtn}
                  onPress={() => {
                    onClose();
                    if (onOpenErpSync) onOpenErpSync();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.portalActionBtnText}>Open Studzone Sync & Extractor →</Text>
                </TouchableOpacity>
              </View>

              {/* 2. Moodle LMS Card */}
              <View style={styles.portalCard}>
                <View style={styles.portalCardHeader}>
                  <View style={styles.portalIconCircle}>
                    <Library size={22} color="#60A5FA" strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.portalTitle}>PSGIM Moodle (LMS)</Text>
                      <View style={[styles.portalLivePill, { backgroundColor: '#1E3A8A' }]}>
                        <Text style={[styles.portalLivePillText, { color: '#93C5FD' }]}>COURSEWORK</Text>
                      </View>
                    </View>
                    <Text style={styles.portalSub}>lms.psgim.ac.in</Text>
                  </View>
                </View>

                <Text style={styles.portalDesc}>
                  Direct access to faculty course materials, assignment submissions with 1-click notification on uploads, and case study files.
                </Text>

                <TouchableOpacity
                  style={[styles.portalActionBtn, { backgroundColor: isLight ? '#E2E8F0' : '#1E293B' }]}
                  onPress={() => setActiveTab('ACADEMICS')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.portalActionBtnText, { color: isLight ? '#0369A1' : '#38BDF8' }]}>View Moodle Deadlines in Academics →</Text>
                </TouchableOpacity>
              </View>

              {/* 3. PSGIM Connect Card */}
              <View style={styles.portalCard}>
                <View style={styles.portalCardHeader}>
                  <View style={styles.portalIconCircle}>
                    <Megaphone size={22} color="#A78BFA" strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.portalTitle}>PSGIM Connect</Text>
                      <View style={[styles.portalLivePill, { backgroundColor: '#312E81' }]}>
                        <Text style={[styles.portalLivePillText, { color: '#C7D2FE' }]}>CIRCULARS</Text>
                      </View>
                    </View>
                    <Text style={styles.portalSub}>tqm.psginstitutions.in/psgimconnect</Text>
                  </View>
                </View>

                <Text style={styles.portalDesc}>
                  Official notifications, Dean/Director circulars, guest lecture announcements, and event registrations.
                </Text>

                <TouchableOpacity
                  style={[styles.portalActionBtn, { backgroundColor: isLight ? '#E2E8F0' : '#1E293B' }]}
                  onPress={() => setShowNotificationsView(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.portalActionBtnText, { color: isLight ? '#2563EB' : '#60A5FA' }]}>Read All Circulars & Notices →</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}

        </View>

        {/* Bottom Navigation Bar (Mirroring Screenshot 1, 2, 3 with Lucide Icons) */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={[styles.bottomNavItem, activeTab === 'HOME' && styles.bottomNavActive]}
            onPress={() => setActiveTab('HOME')}
            activeOpacity={0.8}
          >
            <Home
              size={20}
              color={activeTab === 'HOME' ? '#38BDF8' : '#64748B'}
              strokeWidth={activeTab === 'HOME' ? 2.4 : 2}
              style={{ marginBottom: 3 }}
            />
            <Text
              style={[
                styles.bottomNavLabel,
                activeTab === 'HOME' && styles.bottomNavLabelActive,
              ]}
            >
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomNavItem, activeTab === 'ATTENDANCE' && styles.bottomNavActive]}
            onPress={() => setActiveTab('ATTENDANCE')}
            activeOpacity={0.8}
          >
            <CalendarCheck
              size={20}
              color={activeTab === 'ATTENDANCE' ? '#38BDF8' : '#64748B'}
              strokeWidth={activeTab === 'ATTENDANCE' ? 2.4 : 2}
              style={{ marginBottom: 3 }}
            />
            <Text
              style={[
                styles.bottomNavLabel,
                activeTab === 'ATTENDANCE' && styles.bottomNavLabelActive,
              ]}
            >
              Attendance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomNavItem, activeTab === 'PORTALS' && styles.bottomNavActive]}
            onPress={() => setActiveTab('PORTALS')}
            activeOpacity={0.8}
          >
            <LayoutGrid
              size={20}
              color={activeTab === 'PORTALS' ? '#38BDF8' : '#64748B'}
              strokeWidth={activeTab === 'PORTALS' ? 2.4 : 2}
              style={{ marginBottom: 3 }}
            />
            <Text
              style={[
                styles.bottomNavLabel,
                activeTab === 'PORTALS' && styles.bottomNavLabelActive,
              ]}
            >
              Portals
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomNavItem, activeTab === 'CALENDAR' && styles.bottomNavActive]}
            onPress={() => setActiveTab('CALENDAR')}
            activeOpacity={0.8}
          >
            <CalendarDays
              size={20}
              color={activeTab === 'CALENDAR' ? '#38BDF8' : '#64748B'}
              strokeWidth={activeTab === 'CALENDAR' ? 2.4 : 2}
              style={{ marginBottom: 3 }}
            />
            <Text
              style={[
                styles.bottomNavLabel,
                activeTab === 'CALENDAR' && styles.bottomNavLabelActive,
              ]}
            >
              Calendar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.bottomNavItem, activeTab === 'ACADEMICS' && styles.bottomNavActive]}
            onPress={() => setActiveTab('ACADEMICS')}
            activeOpacity={0.8}
          >
            <BookOpen
              size={20}
              color={activeTab === 'ACADEMICS' ? '#38BDF8' : '#64748B'}
              strokeWidth={activeTab === 'ACADEMICS' ? 2.4 : 2}
              style={{ marginBottom: 3 }}
            />
            <Text
              style={[
                styles.bottomNavLabel,
                activeTab === 'ACADEMICS' && styles.bottomNavLabelActive,
              ]}
            >
              Academics
            </Text>
          </TouchableOpacity>
        </View>

        {/* Profile & Settings Drawer / Side-Sheet Modal */}
        <Modal
          visible={showSettingsDrawer}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowSettingsDrawer(false)}
        >
          <View style={styles.drawerBackdrop}>
            <View style={styles.drawerSheet}>
              {/* Header */}
              <View style={styles.drawerHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={styles.drawerTitle}>Profile & Settings</Text>
                </View>
                <TouchableOpacity
                  style={styles.drawerCloseBtn}
                  onPress={() => setShowSettingsDrawer(false)}
                >
                  <Text style={{ fontSize: 16, color: '#94A3B8' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                {/* 0. Student Profile Identity Card */}
                <View style={styles.profileCard}>
                  <View style={styles.profileTopRow}>
                    <View style={styles.profileAvatarBig}>
                      <Text style={styles.profileAvatarBigText}>{avatarLetter}</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 14 }}>
                      <Text style={styles.profileStudentName}>{studentName}</Text>
                      <Text style={styles.profileStudentMeta}>
                        Roll No: <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{displayRollNo}</Text>
                        {studentRollNo && studentRollNo !== displayRollNo ? ` (${studentRollNo})` : ''}
                      </Text>
                      <View style={styles.profileClassPill}>
                        <Text style={styles.profileClassPillText}>I MBA - Section B</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.profileDivider} />

                  {/* Student Details / Contact Rows with Edit/Save button */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 }}>
                        CONTACT INFORMATION
                      </Text>
                      {saveStatusFeedback && (
                        <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                          <Text style={{ color: '#10B981', fontSize: 10, fontWeight: '800' }}>{saveStatusFeedback}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={handleToggleContactEdit}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 4,
                        backgroundColor: isEditingContact ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: isEditingContact ? '#10B981' : '#38BDF8',
                      }}
                      activeOpacity={0.7}
                    >
                      {isEditingContact ? (
                        <>
                          <Save size={12} color="#10B981" strokeWidth={2.4} />
                          <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '800' }}>Save</Text>
                        </>
                      ) : (
                        <>
                          <Edit2 size={12} color="#38BDF8" strokeWidth={2.4} />
                          <Text style={{ color: '#38BDF8', fontSize: 11, fontWeight: '800' }}>Edit</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Mobile Row */}
                  <View style={styles.profileDetailRow}>
                    <Phone size={15} color="#94A3B8" strokeWidth={2} />
                    <Text style={styles.profileDetailLabel}>Mobile:</Text>
                    {isEditingContact ? (
                      <TextInput
                        style={{
                          flex: 1,
                          backgroundColor: isLight ? '#F1F5F9' : '#070D18',
                          color: isLight ? '#0F172A' : '#FFFFFF',
                          fontSize: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#38BDF8',
                        }}
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        keyboardType="phone-pad"
                        placeholder="Enter mobile number"
                        placeholderTextColor="#64748B"
                      />
                    ) : (
                      <Text style={styles.profileDetailVal}>{mobileNumber}</Text>
                    )}
                  </View>

                  {/* Personal Email Row */}
                  <View style={styles.profileDetailRow}>
                    <Mail size={15} color="#94A3B8" strokeWidth={2} />
                    <Text style={styles.profileDetailLabel}>Personal:</Text>
                    {isEditingContact ? (
                      <TextInput
                        style={{
                          flex: 1,
                          backgroundColor: isLight ? '#F1F5F9' : '#070D18',
                          color: isLight ? '#0F172A' : '#FFFFFF',
                          fontSize: 12,
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: '#38BDF8',
                        }}
                        value={personalEmail}
                        onChangeText={setPersonalEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="Enter email address"
                        placeholderTextColor="#64748B"
                      />
                    ) : (
                      <Text style={styles.profileDetailVal}>{personalEmail}</Text>
                    )}
                  </View>

                  {/* Official Campus ID Row */}
                  <View style={styles.profileDetailRow}>
                    <GraduationCap size={15} color="#94A3B8" strokeWidth={2} />
                    <Text style={styles.profileDetailLabel}>Campus ID:</Text>
                    <Text style={styles.profileDetailVal}>26ab12@psgim.ac.in</Text>
                  </View>
                </View>

                {/* 1. Quick Access: Notifications & Circulars */}
                <Text style={styles.drawerSectionLabel}>COMMUNICATION</Text>
                <TouchableOpacity
                  style={styles.profileActionRow}
                  onPress={() => {
                    setShowSettingsDrawer(false);
                    setShowNotificationsView(true);
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.profileActionIconBox}>
                    <Bell size={20} color="#38BDF8" strokeWidth={2.2} />
                    {unreadCount > 0 && <View style={styles.profileNotifDot} />}
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.profileActionTitle}>Notifications & Circulars</Text>
                      {unreadCount > 0 ? (
                        <View style={styles.profileUnreadPill}>
                          <Text style={styles.profileUnreadPillText}>
                            {unreadCount} New
                          </Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.profileActionSub}>Academic alerts, exam halls & circulars</Text>
                  </View>
                  <ChevronRight size={18} color="#64748B" strokeWidth={2} />
                </TouchableOpacity>

                {/* 2. Theme Mode Segmented Control (Screenshot 5) */}
                <Text style={[styles.drawerSectionLabel, { marginTop: 16 }]}>THEME MODE</Text>
                <View style={styles.themeSegmentContainer}>
                  <TouchableOpacity
                    style={[
                      styles.themeSegmentBtn,
                      themeMode === 'LIGHT' && styles.themeSegmentActive,
                    ]}
                    onPress={() => setThemeMode('LIGHT')}
                  >
                    <Sun
                      size={16}
                      color={themeMode === 'LIGHT' ? '#38BDF8' : '#94A3B8'}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.themeSegmentText,
                        themeMode === 'LIGHT' && styles.themeSegmentTextActive,
                      ]}
                    >
                      Light
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.themeSegmentBtn,
                      themeMode === 'SYSTEM' && styles.themeSegmentActive,
                    ]}
                    onPress={() => setThemeMode('SYSTEM')}
                  >
                    <Smartphone
                      size={16}
                      color={themeMode === 'SYSTEM' ? '#38BDF8' : '#94A3B8'}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.themeSegmentText,
                        themeMode === 'SYSTEM' && styles.themeSegmentTextActive,
                      ]}
                    >
                      System
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.themeSegmentBtn,
                      themeMode === 'DARK' && styles.themeSegmentActive,
                    ]}
                    onPress={() => setThemeMode('DARK')}
                  >
                    <Moon
                      size={16}
                      color={themeMode === 'DARK' ? '#38BDF8' : '#94A3B8'}
                      strokeWidth={2.2}
                    />
                    <Text
                      style={[
                        styles.themeSegmentText,
                        themeMode === 'DARK' && styles.themeSegmentTextActive,
                      ]}
                    >
                      Dark
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Typography Scale Slider (Screenshot 5) */}
                <View style={styles.typoHeaderRow}>
                  <Text style={styles.drawerSectionLabel}>TYPOGRAPHY SCALE</Text>
                  <View style={styles.typoPillBadge}>
                    <Text style={styles.typoPillText}>
                      {typography === 'Small' ? '0.9x' : typography === 'Large' ? '1.15x' : '1x'}
                    </Text>
                  </View>
                </View>

                {/* Typography Step Buttons */}
                <View style={styles.typoStepsContainer}>
                  {(['Small', 'Default', 'Large'] as TypographyScale[]).map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.typoStepBtn,
                        typography === t && styles.typoStepBtnActive,
                      ]}
                      onPress={() => setTypography(t)}
                    >
                      <Text
                        style={[
                          styles.typoStepText,
                          typography === t && styles.typoStepTextActive,
                        ]}
                      >
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 3. Security & Account (Screenshot 5) */}
                <Text style={styles.drawerSectionLabel}>SECURITY & ACCOUNT</Text>
                <TouchableOpacity
                  style={styles.securityCard}
                  onPress={() => alert('Biometric Face ID / Fingerprint passkey enabled.')}
                  activeOpacity={0.8}
                >
                  <View style={styles.securityIconBox}>
                    <Fingerprint size={22} color="#38BDF8" strokeWidth={2.2} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.securityTitle}>Setup Passkey</Text>
                    <Text style={styles.securitySub}>Login faster without passwords</Text>
                  </View>
                  <Text style={{ color: '#64748B', fontSize: 16 }}>›</Text>
                </TouchableOpacity>

                {/* 4. Release Notes Pill */}
                <View style={styles.releaseCard}>
                  <View style={styles.versionBadge}>
                    <Text style={styles.versionBadgeText}>1</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={{ color: '#F8FAFC', fontSize: 12, fontWeight: '700' }}>v1.0.18</Text>
                    <Text style={{ color: '#64748B', fontSize: 10.5 }}>View release notes</Text>
                  </View>
                  <Text style={{ color: '#64748B', fontSize: 16 }}>›</Text>
                </View>

                {/* 5. Exit Prototype / Return to OG App Button */}
                <TouchableOpacity
                  style={styles.signOutBtn}
                  onPress={() => {
                    setShowSettingsDrawer(false);
                    onClose();
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.signOutText}>[→  Exit Prototype to OG App</Text>
                </TouchableOpacity>

                {/* 6. Legal Footer Credits */}
                <View style={styles.legalFooter}>
                  <Text style={styles.legalBrand}>
                    CUE (Campus Unified Experience)
                  </Text>
                  <Text style={styles.legalSub}>
                    Powered by PSG Institute of Management
                  </Text>
                  <TouchableOpacity activeOpacity={0.7} style={{ marginTop: 6 }}>
                    <Text style={styles.privacyLink}>Privacy Policy</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Full-Screen Notifications View (Matching Screenshot 6) */}
        <Modal
          visible={showNotificationsView}
          animationType="slide"
          transparent={false}
          onRequestClose={() => {
            setShowNotificationsView(false);
            setActiveTab('HOME');
          }}
        >
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.topHeader}>
              <View style={styles.headerLeft}>
                <TouchableOpacity
                  style={styles.backBtn}
                  onPress={() => {
                    setShowNotificationsView(false);
                    setActiveTab('HOME');
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backBtnText}>‹</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.headerRight}>
                <TouchableOpacity
                  style={styles.headerIconBtn}
                  onPress={() => setShowSettingsDrawer(true)}
                  activeOpacity={0.7}
                >
                  <Settings size={20} color="#93C5FD" strokeWidth={2} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.avatarBtn}
                  onPress={() => setShowSettingsDrawer(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.avatarLetter}>{avatarLetter}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollPad} showsVerticalScrollIndicator={false}>
              {/* Page Title Row */}
              <View style={styles.notifPageHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Bell size={20} color="#38BDF8" strokeWidth={2.2} />
                  <Text style={styles.sectionPageTitle}>Notifications</Text>
                </View>
                <TouchableOpacity
                  style={styles.allReadBtn}
                  onPress={handleMarkAllRead}
                  activeOpacity={0.7}
                >
                  <Text style={styles.allReadBtnText}>Mark all read</Text>
                </TouchableOpacity>
              </View>

              {/* Segmented Filter Pills (Screenshot 6: Important | All | Unread) */}
              <View style={styles.notifFilterRow}>
                <TouchableOpacity
                  style={[
                    styles.notifFilterPill,
                    notifFilterTab === 'IMPORTANT' && styles.notifFilterPillActive,
                  ]}
                  onPress={() => setNotifFilterTab('IMPORTANT')}
                >
                  <Text
                    style={[
                      styles.notifFilterText,
                      notifFilterTab === 'IMPORTANT' && styles.notifFilterTextActive,
                    ]}
                  >
                    Important {announcements.length}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.notifFilterPill,
                    notifFilterTab === 'ALL' && styles.notifFilterPillActive,
                  ]}
                  onPress={() => setNotifFilterTab('ALL')}
                >
                  <Text
                    style={[
                      styles.notifFilterText,
                      notifFilterTab === 'ALL' && styles.notifFilterTextActive,
                    ]}
                  >
                    All {announcements.length}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.notifFilterPill,
                    notifFilterTab === 'UNREAD' && styles.notifFilterPillActive,
                  ]}
                  onPress={() => setNotifFilterTab('UNREAD')}
                >
                  <Text
                    style={[
                      styles.notifFilterText,
                      notifFilterTab === 'UNREAD' && styles.notifFilterTextActive,
                    ]}
                  >
                    Unread {unreadCount}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Search notifications bar (Screenshot 6) */}
              <View style={styles.searchBar}>
                <Search size={16} color="#64748B" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search notifications..."
                  placeholderTextColor="#64748B"
                  value={notifSearch}
                  onChangeText={setNotifSearch}
                />
              </View>

              {/* Notification list cards */}
              {(() => {
                const filteredList = announcements
                  .filter((a) => {
                    if (notifFilterTab === 'UNREAD') {
                      return !readNotifIds.has(a.id);
                    }
                    return true;
                  })
                  .filter((a) => {
                    if (!notifSearch.trim()) return true;
                    return (
                      a.title.toLowerCase().includes(notifSearch.toLowerCase()) ||
                      a.category.toLowerCase().includes(notifSearch.toLowerCase())
                    );
                  });

                if (filteredList.length === 0) {
                  return (
                    <View style={[styles.notifStateCenter, { marginTop: 40 }]}>
                      <View style={styles.checkCircle}>
                        <Text style={{ color: '#10B981', fontSize: 24, fontWeight: '900' }}>✓</Text>
                      </View>
                      <Text style={[styles.notifEmptySub, { fontSize: 13, marginTop: 6 }]}>
                        {notifFilterTab === 'UNREAD'
                          ? "You're all caught up — no unread notifications!"
                          : "No notifications match your search."}
                      </Text>
                    </View>
                  );
                }

                return (
                  <View style={{ gap: 10 }}>
                    {filteredList.map((item) => {
                      const isUnread = !readNotifIds.has(item.id);
                      return (
                        <TouchableOpacity
                          key={item.id}
                          style={[
                            styles.notifListItem,
                            isUnread && { borderColor: '#38BDF8', borderWidth: 1.2 },
                          ]}
                          onPress={() => handleOpenNotice(item)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.noticeIconCircle}>
                            <Megaphone size={16} color={isUnread ? '#38BDF8' : '#64748B'} strokeWidth={2} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                              <Text style={styles.noticeCategoryTag}>{item.category.toUpperCase()}</Text>
                              {isUnread && (
                                <View style={{ backgroundColor: '#0284C7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                                  <Text style={{ color: '#FFFFFF', fontSize: 9, fontWeight: '800' }}>NEW</Text>
                                </View>
                              )}
                              <Text style={styles.noticeDateTag}>
                                {item.publish_at ? item.publish_at.split(' ')[0] : 'Today'}
                              </Text>
                            </View>
                            <Text style={[styles.noticeTitleText, isUnread && { fontWeight: '800' }]} numberOfLines={2}>
                              {item.title}
                            </Text>
                            {item.summary ? (
                              <Text style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }} numberOfLines={2}>
                                {item.summary}
                              </Text>
                            ) : null}
                          </View>
                          <Text style={{ color: '#38BDF8', fontSize: 14, fontWeight: '800' }}>›</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                );
              })()}
            </ScrollView>
          </View>
        </Modal>

        {/* Notice Detail Reader Modal */}
        {selectedNoticeModal && (
          <Modal
            visible={true}
            animationType="fade"
            transparent={true}
            onRequestClose={() => setSelectedNoticeModal(null)}
          >
            <View style={styles.drawerBackdrop}>
              <View style={[styles.drawerSheet, { maxHeight: Dimensions.get('window').height * 0.75 }]}>
                <View style={styles.drawerHeader}>
                  <Text style={[styles.drawerTitle, { fontSize: 15, flex: 1, marginRight: 10 }]} numberOfLines={2}>
                    {selectedNoticeModal.title}
                  </Text>
                  <TouchableOpacity
                    style={styles.drawerCloseBtn}
                    onPress={() => setSelectedNoticeModal(null)}
                  >
                    <Text style={{ fontSize: 16, color: '#94A3B8' }}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                    <Text style={styles.noticeCategoryTag}>{selectedNoticeModal.category.toUpperCase()}</Text>
                    <Text style={styles.noticeDateTag}>{selectedNoticeModal.publish_at}</Text>
                  </View>
                  <Text style={{ color: '#E2E8F0', fontSize: 13, lineHeight: 20 }}>
                    {selectedNoticeModal.content || selectedNoticeModal.summary}
                  </Text>
                </ScrollView>
              </View>
            </View>
          </Modal>
        )}

        {/* Course Syllabus, Course Plan & Assignments Isolated In-Modal Viewer */}
        {selectedCourseDetails && (() => {
          const isSyllabus = selectedCourseDetails.type === 'SYLLABUS';
          const isPlan = selectedCourseDetails.type === 'PLAN';
          const isAssignments = selectedCourseDetails.type === 'ASSIGNMENTS';

          const courseSyllabus = getCourseSyllabus(
            selectedCourseDetails.code,
            selectedCourseDetails.name
          );
          const coursePlan = getCoursePlanForSubject(
            selectedCourseDetails.code,
            selectedCourseDetails.name
          );

          const subjectCode = isSyllabus ? courseSyllabus.subjectCode : coursePlan.subjectCode;
          const subjectTitle = isSyllabus ? courseSyllabus.subjectTitle : coursePlan.subjectTitle;
          const badgeLabel = isSyllabus
            ? 'OFFICIAL SYLLABUS'
            : isPlan
            ? '15-WEEK COURSE PLAN'
            : 'COURSE ASSIGNMENTS & SUBMISSIONS';
          const badgeColor = isSyllabus ? '#38BDF8' : isPlan ? '#10B981' : '#F59E0B';

          return (
            <Modal
              visible={true}
              animationType="slide"
              transparent={true}
              onRequestClose={() => setSelectedCourseDetails(null)}
            >
              <View style={styles.drawerBackdrop}>
                <View style={[styles.drawerSheet, { maxHeight: Dimensions.get('window').height * 0.88 }]}>
                  {/* Modal Header */}
                  <View style={styles.drawerHeader}>
                    <View style={{ flex: 1, marginRight: 10 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <View style={styles.codeBadge}>
                          <Text style={styles.codeBadgeText}>{subjectCode}</Text>
                        </View>
                        <Text style={{ color: badgeColor, fontSize: 11, fontWeight: '800' }}>
                          {badgeLabel}
                        </Text>
                      </View>
                      <Text style={[styles.drawerTitle, { fontSize: 15 }]} numberOfLines={1}>
                        {subjectTitle}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.drawerCloseBtn}
                      onPress={() => setSelectedCourseDetails(null)}
                    >
                      <Text style={{ fontSize: 16, color: '#94A3B8' }}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Dedicated Isolated Views: ZERO SWITCHER, ZERO CROSS-OVER */}
                  <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
                    {isSyllabus ? (
                      /* =======================================================
                         1. PURE SYLLABUS VIEW: ONLY OBJECTIVE, COs, UNITS I-V & BOOKS
                         ======================================================= */
                      <View style={{ gap: 12 }}>
                        {/* Course Overview Box */}
                        <View style={styles.courseObjBox}>
                          <Text style={styles.courseObjTitle}>Course Objective</Text>
                          <Text style={styles.courseObjText}>{courseSyllabus.courseObjective}</Text>
                          {courseSyllabus.faculty && courseSyllabus.faculty.length > 0 && (
                            <Text style={styles.courseFacultyText}>
                              Faculty: {courseSyllabus.faculty.join(', ')}
                            </Text>
                          )}
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
                            <View style={{ backgroundColor: isLight ? '#E0F2FE' : 'rgba(56, 189, 248, 0.12)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                              <Text style={{ color: isLight ? '#0369A1' : '#38BDF8', fontSize: 10.5, fontWeight: '800' }}>
                                {courseSyllabus.credits}
                              </Text>
                            </View>
                            <View style={{ backgroundColor: isLight ? '#F1F5F9' : '#1E293B', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 }}>
                              <Text style={{ color: '#94A3B8', fontSize: 10.5, fontWeight: '700' }}>
                                {courseSyllabus.mode}
                              </Text>
                            </View>
                          </View>
                        </View>

                        {/* Course Outcomes (CO1-CO5) */}
                        <View style={{ gap: 8 }}>
                          <Text style={styles.drawerSectionLabel}>COURSE OUTCOMES (CO1–CO5)</Text>
                          {courseSyllabus.courseOutcomes.map((co) => (
                            <View
                              key={co.code}
                              style={{
                                backgroundColor: isLight ? '#F8FAFC' : '#0B1322',
                                borderRadius: 10,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: isLight ? '#E2E8F0' : '#1E293B',
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <View
                                  style={{
                                    backgroundColor: isLight ? '#E0F2FE' : 'rgba(56, 189, 248, 0.15)',
                                    borderColor: isLight ? '#BAE6FD' : 'rgba(56, 189, 248, 0.35)',
                                    borderWidth: 1,
                                    borderRadius: 6,
                                    paddingHorizontal: 7,
                                    paddingVertical: 2,
                                  }}
                                >
                                  <Text style={{ color: isLight ? '#0284C7' : '#38BDF8', fontSize: 11, fontWeight: '900' }}>
                                    {co.code}
                                  </Text>
                                </View>
                                <Text style={{ fontSize: 12.5, fontWeight: '800', color: isLight ? '#0F172A' : '#FFFFFF', flex: 1 }}>
                                  {co.title}
                                </Text>
                              </View>
                              <Text style={{ fontSize: 11.5, color: isLight ? '#475569' : '#CBD5E1', lineHeight: 17 }}>
                                {co.description}
                              </Text>
                            </View>
                          ))}
                        </View>

                        {/* Syllabus Units (Units I-V) */}
                        <View style={{ gap: 10, marginTop: 4 }}>
                          <Text style={styles.drawerSectionLabel}>SYLLABUS UNITS (UNITS I–V)</Text>
                          {courseSyllabus.units.map((unit, uIdx) => (
                            <View
                              key={uIdx}
                              style={{
                                backgroundColor: isLight ? '#F8FAFC' : '#0B1322',
                                borderRadius: 12,
                                padding: 14,
                                borderWidth: 1.2,
                                borderColor: isLight ? '#E2E8F0' : '#1E293B',
                              }}
                            >
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                  <View
                                    style={{
                                      backgroundColor: isLight ? '#0284C7' : '#0369A1',
                                      borderRadius: 6,
                                      paddingHorizontal: 8,
                                      paddingVertical: 3,
                                    }}
                                  >
                                    <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '900' }}>
                                      {unit.unitNumber}
                                    </Text>
                                  </View>
                                  <View
                                    style={{
                                      backgroundColor: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.15)',
                                      borderColor: isLight ? '#FDE68A' : 'rgba(245, 158, 11, 0.3)',
                                      borderWidth: 1,
                                      borderRadius: 6,
                                      paddingHorizontal: 7,
                                      paddingVertical: 2,
                                    }}
                                  >
                                    <Text style={{ color: isLight ? '#B45309' : '#F59E0B', fontSize: 10, fontWeight: '800' }}>
                                      Target: {unit.coTarget}
                                    </Text>
                                  </View>
                                </View>
                              </View>

                              <Text style={{ fontSize: 13.5, fontWeight: '800', color: isLight ? '#0F172A' : '#FFFFFF', marginBottom: 8 }}>
                                {unit.title}
                              </Text>

                              <View style={{ gap: 6 }}>
                                {unit.topics.map((top, tIdx) => (
                                  <View key={tIdx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                    <Text style={{ color: '#38BDF8', fontSize: 13, marginRight: 7, lineHeight: 17 }}>•</Text>
                                    <Text style={{ fontSize: 11.5, color: isLight ? '#334155' : '#CBD5E1', flex: 1, lineHeight: 17 }}>
                                      {top}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            </View>
                          ))}
                        </View>

                        {/* Recommended Textbooks */}
                        {courseSyllabus.recommendedBooks && courseSyllabus.recommendedBooks.length > 0 && (
                          <View style={{ marginTop: 4, marginBottom: 16 }}>
                            <Text style={styles.drawerSectionLabel}>RECOMMENDED TEXTBOOKS & REFERENCES</Text>
                            <View
                              style={{
                                backgroundColor: isLight ? '#F8FAFC' : '#0B1322',
                                borderRadius: 12,
                                padding: 12,
                                borderWidth: 1,
                                borderColor: isLight ? '#E2E8F0' : '#1E293B',
                                gap: 8,
                              }}
                            >
                              {courseSyllabus.recommendedBooks.map((book, bIdx) => (
                                <View key={bIdx} style={styles.bookItemRow}>
                                  <Text style={{ color: '#38BDF8', fontSize: 13, marginRight: 6 }}>•</Text>
                                  <Text style={styles.bookItemText}>{book}</Text>
                                </View>
                              ))}
                            </View>
                          </View>
                        )}
                      </View>
                    ) : isAssignments ? (
                      /* =======================================================
                         2. PURE ASSIGNMENTS & SUBMISSIONS VIEW
                         ======================================================= */
                      <View style={{ gap: 12 }}>
                        {/* Course Overview Box */}
                        <View style={styles.courseObjBox}>
                          <Text style={styles.courseObjTitle}>Course Deliverables & Assessment Plan</Text>
                          <Text style={styles.courseObjText}>{coursePlan.courseObjective}</Text>
                          {coursePlan.faculty && coursePlan.faculty.length > 0 && (
                            <Text style={styles.courseFacultyText}>
                              Faculty: {coursePlan.faculty.join(', ')}
                            </Text>
                          )}
                        </View>

                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <Text style={styles.drawerSectionLabel}>
                            CONTINUOUS ASSESSMENTS ({coursePlan.assessments.length} TOTAL)
                          </Text>
                          <View style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', borderColor: '#F59E0B', borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
                            <Text style={{ color: '#F59E0B', fontSize: 10, fontWeight: '800' }}>
                              50 CA WEIGHTAGE
                            </Text>
                          </View>
                        </View>

                        {coursePlan.assessments.map((ass, aIdx) => (
                          <View
                            key={ass.id || aIdx}
                            style={{
                              backgroundColor: isLight ? '#F8FAFC' : '#0B1322',
                              borderRadius: 14,
                              padding: 14,
                              borderWidth: 1.2,
                              borderColor: isLight ? '#E2E8F0' : '#1E293B',
                            }}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <Text style={{ fontSize: 14, fontWeight: '800', color: isLight ? '#0F172A' : '#FFFFFF', flex: 1, marginRight: 8 }}>
                                {ass.title}
                              </Text>
                              <View
                                style={{
                                  backgroundColor: isLight ? '#FEF3C7' : 'rgba(245, 158, 11, 0.15)',
                                  borderColor: isLight ? '#FDE68A' : '#F59E0B',
                                  borderWidth: 1,
                                  borderRadius: 8,
                                  paddingHorizontal: 8,
                                  paddingVertical: 3,
                                }}
                              >
                                <Text style={{ color: isLight ? '#B45309' : '#F59E0B', fontSize: 11, fontWeight: '900' }}>
                                  {ass.marksAllotted} Marks
                                </Text>
                              </View>
                            </View>

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                              <View style={{ backgroundColor: isLight ? '#E0F2FE' : 'rgba(56, 189, 248, 0.12)', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }}>
                                <Text style={{ color: isLight ? '#0369A1' : '#38BDF8', fontSize: 10, fontWeight: '800' }}>
                                  {ass.type || 'ASSIGNMENT'}
                                </Text>
                              </View>
                              <View style={{ backgroundColor: isLight ? '#F1F5F9' : '#1E293B', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }}>
                                <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>
                                  Timeline: {ass.scheduledDate}
                                </Text>
                              </View>
                              {ass.sessionsCovered ? (
                                <View style={{ backgroundColor: isLight ? '#F1F5F9' : '#1E293B', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 }}>
                                  <Text style={{ color: '#94A3B8', fontSize: 10, fontWeight: '700' }}>
                                    {ass.sessionsCovered}
                                  </Text>
                                </View>
                              ) : null}
                            </View>

                            {ass.description ? (
                              <Text style={{ fontSize: 12, color: isLight ? '#475569' : '#CBD5E1', lineHeight: 18, marginBottom: 10 }}>
                                {ass.description}
                              </Text>
                            ) : null}

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8, borderTopWidth: 1, borderTopColor: isLight ? '#E2E8F0' : '#1E293B' }}>
                              <Text style={{ fontSize: 11, color: '#64748B', fontWeight: '700' }}>
                                Official Moodle Portal Submission
                              </Text>
                              <TouchableOpacity
                                style={{
                                  backgroundColor: isLight ? '#0284C7' : '#0369A1',
                                  paddingHorizontal: 10,
                                  paddingVertical: 5,
                                  borderRadius: 6,
                                }}
                                onPress={() => {
                                  if (Platform.OS === 'web') {
                                    window.open('https://lms.psgim.ac.in', '_blank');
                                  } else {
                                    Linking.openURL('https://lms.psgim.ac.in').catch(() => {});
                                  }
                                }}
                                activeOpacity={0.8}
                              >
                                <Text style={{ color: '#FFFFFF', fontSize: 11, fontWeight: '800' }}>
                                  Open Moodle →
                                </Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : (
                      /* =======================================================
                         3. PURE 15-WEEK COURSE PLAN VIEW (30 SESSIONS)
                         ======================================================= */
                      <View style={{ gap: 10 }}>
                        {/* Faculty & Objective Box */}
                        <View style={styles.courseObjBox}>
                          <Text style={styles.courseObjTitle}>Course Objective</Text>
                          <Text style={styles.courseObjText}>{coursePlan.courseObjective}</Text>
                          {coursePlan.faculty && coursePlan.faculty.length > 0 && (
                            <Text style={styles.courseFacultyText}>
                              Faculty: {coursePlan.faculty.join(', ')}
                            </Text>
                          )}
                        </View>

                        {/* Classroom Rules */}
                        {coursePlan.classroomRules && coursePlan.classroomRules.length > 0 && (
                          <View
                            style={{
                              backgroundColor: isLight ? '#F8FAFC' : '#0B1322',
                              borderRadius: 10,
                              padding: 12,
                              borderWidth: 1,
                              borderColor: isLight ? '#E2E8F0' : '#1E293B',
                              gap: 6,
                            }}
                          >
                            <Text style={styles.drawerSectionLabel}>CLASSROOM PROTOCOLS</Text>
                            {coursePlan.classroomRules.map((rule, rIdx) => (
                              <View key={rIdx} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                                <Text style={{ color: '#38BDF8', fontSize: 12, marginRight: 6 }}>•</Text>
                                <Text style={{ color: isLight ? '#475569' : '#CBD5E1', fontSize: 11.5, flex: 1, lineHeight: 16 }}>
                                  {rule}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* 30 Lecture Sessions */}
                        <Text style={[styles.drawerSectionLabel, { marginTop: 4 }]}>
                          LECTURE SESSIONS ({coursePlan.sessions.length} TOTAL)
                        </Text>
                        {coursePlan.sessions.map((sess) => (
                          <View
                            key={sess.sessionNumber}
                            style={[
                              styles.sessionItemRow,
                              sess.isExam && { borderColor: '#F59E0B', backgroundColor: 'rgba(245, 158, 11, 0.08)' },
                            ]}
                          >
                            <View style={styles.sessionNumBox}>
                              <Text style={styles.sessionNumText}>#{sess.sessionNumber}</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 10 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                <View style={styles.sessionUnitBadge}>
                                  <Text style={styles.sessionUnitText}>{sess.unit}</Text>
                                </View>
                                {sess.date ? (
                                  <Text style={styles.sessionDateText}>{sess.date}</Text>
                                ) : null}
                              </View>
                              <Text style={styles.sessionTopicText}>{sess.topic}</Text>
                              {sess.software ? (
                                <Text style={styles.sessionSoftwareText}>Tool: {sess.software}</Text>
                              ) : null}
                            </View>
                          </View>
                        ))}

                        {/* External Interactive Course Plan Trigger */}
                        <TouchableOpacity
                          style={[styles.openInteractivePlanBtn, { marginTop: 8, marginBottom: 16 }]}
                          onPress={() => {
                            const targetCode = selectedCourseDetails.code;
                            const targetName = selectedCourseDetails.name;
                            setSelectedCourseDetails(null);
                            if (onOpenCoursePlan) onOpenCoursePlan(targetCode, targetName);
                          }}
                          activeOpacity={0.8}
                        >
                          <Share2 size={16} color="#38BDF8" />
                          <Text style={styles.openInteractivePlanText}>
                            Open Full Interactive CA Marks Calculator & Plan
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </ScrollView>
                </View>
              </View>
            </Modal>
          );
        })()}

        {/* Smart Holiday Leave & Continuous Recovery Modal */}
        <Modal
          visible={showHolidayPlanner}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowHolidayPlanner(false)}
        >
          <View style={styles.holidayModalBackdrop}>
            <View style={styles.holidayModalContainer}>
              {/* Modal Header */}
              <View style={styles.holidayModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.holidayHeaderIconCircle}>
                    <Plane size={20} color="#38BDF8" strokeWidth={2.4} />
                  </View>
                  <View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={styles.holidayModalTitle}>Holiday & Leave Planner</Text>
                      <View style={styles.aiBadgeMini}>
                        <Text style={styles.aiBadgeMiniText}>AI Engine</Text>
                      </View>
                    </View>
                    <Text style={styles.holidayModalSubtitle}>
                      Balance leaves with continuous recovery classes
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.holidayModalCloseBtn}
                  onPress={() => setShowHolidayPlanner(false)}
                  activeOpacity={0.7}
                >
                  <X size={18} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 18, paddingBottom: 40 }}
                showsVerticalScrollIndicator={false}
              >
                {/* 1. Current Attendance Situation Snapshot */}
                <View style={styles.holidayStatusCard}>
                  <View style={styles.holidayStatusTop}>
                    <View>
                      <Text style={styles.holidayStatusSmallLabel}>CURRENT STANDING</Text>
                      <Text
                        style={[
                          styles.holidayStatusBigPct,
                          { color: overallPct >= 75 ? '#34D399' : '#F87171' },
                        ]}
                      >
                        {overallPctFormatted}%
                      </Text>
                      <Text style={styles.holidayStatusHeldText}>
                        {totalAttended} of {totalConducted} classes attended
                      </Text>
                    </View>

                    <View style={styles.holidayStatusRightBox}>
                      <View
                        style={[
                          styles.statusCategoryBadge,
                          {
                            backgroundColor:
                              overallPct >= 75
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                            borderColor: overallPct >= 75 ? '#10B981' : '#EF4444',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusCategoryBadgeText,
                            { color: overallPct >= 75 ? '#34D399' : '#F87171' },
                          ]}
                        >
                          {overallPct >= 75 ? 'ELIGIBLE (SAFE)' : 'ATTENDANCE SHORTAGE'}
                        </Text>
                      </View>
                      <Text style={styles.statusCategorySub}>
                        {overallPct >= 75
                          ? `Safe bunks available: ${overallMetrics.safeBunksAt75} hrs`
                          : `Need ${overallMetrics.recoveryNeededAt75} recovery classes`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 2. Interactive Leave Simulator: "Say attendance is low, take a leave and attend N continuous classes" */}
                <View style={styles.holidaySimulatorCard}>
                  <View style={styles.simCardHeader}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TrendingUp size={16} color="#38BDF8" strokeWidth={2.4} />
                      <Text style={styles.simCardTitle}>Simulate Leave & Required Recovery</Text>
                    </View>
                  </View>
                  <Text style={styles.simCardDescription}>
                    Test what happens if you take leave today or across an upcoming weekend. See the exact drop and how many consecutive classes you must attend to recover.
                  </Text>

                  {/* Target Goal Selector */}
                  <View style={styles.simFieldSection}>
                    <Text style={styles.simFieldLabel}>TARGET ATTENDANCE GOAL:</Text>
                    <View style={styles.simPillSelectorRow}>
                      {[75, 80, 85, 65].map((target) => (
                        <TouchableOpacity
                          key={target}
                          style={[
                            styles.simTargetPill,
                            targetExpectedPct === target && styles.simTargetPillActive,
                          ]}
                          onPress={() => setTargetExpectedPct(target)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.simTargetPillText,
                              targetExpectedPct === target && styles.simTargetPillTextActive,
                            ]}
                          >
                            {target}% {target === 75 ? '(Regular)' : target === 65 ? '(Medical)' : ''}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Number of Leave Hours to Take */}
                  <View style={styles.simFieldSection}>
                    <Text style={styles.simFieldLabel}>
                      CLASSES / HOURS YOU WANT TO MISS:
                    </Text>
                    <View style={styles.simPillSelectorRow}>
                      {[1, 2, 3, 4, 6, 8].map((hrs) => (
                        <TouchableOpacity
                          key={hrs}
                          style={[
                            styles.simHoursPill,
                            simulatedLeaveHours === hrs && styles.simHoursPillActive,
                          ]}
                          onPress={() => setSimulatedLeaveHours(hrs)}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.simHoursPillText,
                              simulatedLeaveHours === hrs && styles.simHoursPillTextActive,
                            ]}
                          >
                            +{hrs} hr{hrs > 1 ? 's' : ''} {hrs === 4 ? '(1 Day)' : hrs === 8 ? '(2 Days)' : ''}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* SIMULATION RESULT DISPLAY */}
                  <View style={styles.simResultContainer}>
                    <View style={styles.simResultRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.simResultMetricLabel}>Percentage After Leave</Text>
                        <Text
                          style={[
                            styles.simResultMetricValue,
                            { color: simPct >= targetExpectedPct ? '#34D399' : '#F87171' },
                          ]}
                        >
                          {simPct.toFixed(2)}%
                        </Text>
                        <Text style={styles.simResultDropSub}>
                          (Drop of {(overallPct - simPct).toFixed(2)}%)
                        </Text>
                      </View>

                      <View style={styles.simResultDivider} />

                      <View style={{ flex: 1.2, paddingLeft: 12 }}>
                        <Text style={styles.simResultMetricLabel}>
                          CONTINUOUS CLASSES TO HIT {targetExpectedPct}%
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                          <Text style={styles.simResultRequiredValue}>
                            {continuousClassesNeeded}
                          </Text>
                          <Text style={styles.simResultRequiredUnit}>
                            consecutive classes
                          </Text>
                        </View>
                        <Text style={styles.simResultRecoverySub}>
                          {continuousClassesNeeded === 0
                            ? '✓ Still safe! No mandatory continuous recovery required.'
                            : `Attend next ${continuousClassesNeeded} classes continuously with 0 bunks.`}
                        </Text>
                      </View>
                    </View>

                    {/* Recommendation Rule Guidance */}
                    <View style={styles.simAdviceBox}>
                      <Info size={14} color="#38BDF8" style={{ marginTop: 2, marginRight: 8 }} />
                      <Text style={styles.simAdviceText}>
                        {overallPct < targetExpectedPct
                          ? `Even though your current attendance is below ${targetExpectedPct}%, you can take this leave if you commit to attending ${continuousClassesNeeded} continuous classes right after.`
                          : overallPct >= targetExpectedPct && simPct < targetExpectedPct
                          ? `Taking ${simulatedLeaveHours} hr leave will push you into shortage (${simPct.toFixed(1)}%). You will need ${continuousClassesNeeded} continuous classes without bunking to bounce back to ${targetExpectedPct}%.`
                          : `Safe leave! Your attendance will remain above ${targetExpectedPct}% (${simPct.toFixed(1)}%).`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 3. Upcoming Holidays & Long Weekend Leave Opportunities */}
                <View style={{ marginTop: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <Text style={styles.holidaySectionTitle}>
                      Recommended Long Weekend Opportunities
                    </Text>
                    <View style={styles.holidayCountBadge}>
                      <Text style={styles.holidayCountBadgeText}>
                        {upcomingHolidays.length} Upcoming
                      </Text>
                    </View>
                  </View>

                  <View style={{ gap: 12 }}>
                    {upcomingHolidays.map((hol) => {
                      const isMega = hol.isLongWeekend || (hol.longWeekendTag && hol.longWeekendTag.includes('Mega'));
                      return (
                        <View
                          key={hol.id}
                          style={[
                            styles.holidayRecCard,
                            isMega && { borderColor: '#F59E0B', borderWidth: 1.2 },
                          ]}
                        >
                          <View style={styles.holidayRecHeader}>
                            <View style={{ flex: 1 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                <Text style={styles.holidayRecTitle}>{hol.title}</Text>
                                {hol.longWeekendTag && (
                                  <View style={styles.longWeekendTagPill}>
                                    <Text style={styles.longWeekendTagPillText}>
                                      {hol.longWeekendTag}
                                    </Text>
                                  </View>
                                )}
                              </View>
                              <Text style={styles.holidayRecDate}>
                                {hol.date} {hol.endDate ? `to ${hol.endDate}` : ''} • {hol.day}
                              </Text>
                            </View>
                          </View>

                          {hol.description ? (
                            <Text style={styles.holidayRecDesc}>{hol.description}</Text>
                          ) : null}

                          {/* Smart Leave Strategy */}
                          <View style={styles.holidayStrategyBox}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                              <Sparkles size={13} color="#FBBF24" />
                              <Text style={styles.holidayStrategyHeading}>
                                SMART LEAVE STRATEGY:
                              </Text>
                            </View>
                            <Text style={styles.holidayStrategyBody}>
                              {hol.recommendedSmartLeave ||
                                (hol.isLongWeekend
                                  ? 'Automatic 3-Day weekend with 0 missed classes! Perfect for unwinding.'
                                  : 'Combine with 1 planned leave to get an extended continuous weekend.')}
                            </Text>

                            {/* Impact snapshot for this holiday if taking 1 day off (4 hours) */}
                            <View style={styles.holidayStrategyImpactRow}>
                              <Text style={styles.holidayStrategyImpactText}>
                                If taking 1 day (4 hrs) leave: Need{' '}
                                <Text style={{ color: '#38BDF8', fontWeight: '800' }}>
                                  {calcContinuousRequired(75, totalAttended, totalConducted + 4)}
                                </Text>{' '}
                                continuous classes to maintain 75%
                              </Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Weekly Timetable Schedule Modal */}
        <Modal
          visible={activeWeeklyModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setActiveWeeklyModal(false)}
        >
          <View style={styles.holidayModalBackdrop}>
            <View style={[styles.holidayModalContainer, { height: '88%' }]}>
              <View style={styles.holidayModalHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <View style={styles.holidayHeaderIconCircle}>
                    <CalendarDays size={18} color="#38BDF8" strokeWidth={2.2} />
                  </View>
                  <View>
                    <Text style={styles.holidayModalTitle}>Weekly Timetable</Text>
                    <Text style={styles.holidayModalSubtitle}>Full Monday–Friday Schedule & Class Venues</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setActiveWeeklyModal(false)}
                  style={styles.holidayModalCloseBtn}
                  activeOpacity={0.7}
                >
                  <Text style={{ fontSize: 16, color: '#94A3B8' }}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={{ padding: 16 }} showsVerticalScrollIndicator={false}>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
                  const daySlots = timetable.filter((s) => s.day === day);
                  const isCurrentDay = day === currentDayName;
                  return (
                    <View key={day} style={{ marginBottom: 16 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={[styles.sectionPageTitle, { fontSize: sFont(14), marginBottom: 0 }, isCurrentDay && { color: '#38BDF8' }]}>
                          {day} {isCurrentDay ? '(Today)' : ''}
                        </Text>
                        <Text style={{ color: '#64748B', fontSize: sFont(11), fontWeight: '700' }}>
                          {daySlots.length} sessions
                        </Text>
                      </View>

                      {daySlots.length > 0 ? (
                        <View style={{ gap: 8 }}>
                          {daySlots.map((slot, sIdx) => {
                            const sub = subjects.find((s) => s.id === slot.subjectId);
                            return (
                              <View key={slot.id || sIdx} style={styles.scheduleItemRow}>
                                <View style={styles.timeTag}>
                                  <Text style={styles.timeTagText}>{slot.startTime} - {slot.endTime}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                  <Text style={styles.scheduleSubTitle}>
                                    {sub?.name || 'Academic Lecture'}
                                  </Text>
                                  <Text style={styles.scheduleRoom}>
                                    {sub?.code || '24GMxx'} • Room: {slot.room || 'LH-101'}
                                  </Text>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      ) : (
                        <View style={[styles.scheduleItemRow, { opacity: 0.6 }]}>
                          <Text style={{ color: '#64748B', fontSize: sFont(11), fontStyle: 'italic' }}>
                            No scheduled academic lectures for {day}.
                          </Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const getStyles = (isLight: boolean, fontScale: number) => {
  const sf = (size: number) => Math.round(size * fontScale);
  const bg = isLight ? '#F8FAFC' : '#070D18';
  const headerBg = isLight ? '#FFFFFF' : '#070D18';
  const headerBorder = isLight ? '#E2E8F0' : '#131F33';
  const cardBg = isLight ? '#FFFFFF' : '#0F1A2C';
  const cardBorder = isLight ? '#E2E8F0' : '#192841';
  const cardBorderDark = isLight ? '#CBD5E1' : '#1E293B';
  const textTitle = isLight ? '#0F172A' : '#F8FAFC';
  const textWhite = isLight ? '#0F172A' : '#FFFFFF';
  const textSub = isLight ? '#475569' : '#94A3B8';
  const textMuted = isLight ? '#64748B' : '#64748B';
  const drawerBg = isLight ? '#FFFFFF' : '#0A1120';
  const drawerBorder = isLight ? '#E2E8F0' : '#1E293B';
  const navBg = isLight ? '#FFFFFF' : '#070D18';
  const inputBg = isLight ? '#F1F5F9' : '#0F1A2C';
  const inputBorder = isLight ? '#CBD5E1' : '#192841';
  const pillBg = isLight ? '#F1F5F9' : '#121F35';
  const pillBorder = isLight ? '#E2E8F0' : '#1E2D4A';
  const innerCardBg = isLight ? '#F1F5F9' : '#0C1524';
  const innerCardBorder = isLight ? '#E2E8F0' : '#16233B';
  const rowItemBg = isLight ? '#F8FAFC' : '#131F33';
  const actionBtnBg = isLight ? '#E2E8F0' : '#1E293B';
  const highlightBluePill = isLight ? '#E0F2FE' : '#1E3A8A';
  const highlightBlueText = isLight ? '#0369A1' : '#93C5FD';

  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: bg, // Deep Midnight Navy (Christ KP Palette)
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 16,
    paddingBottom: 12,
    backgroundColor: bg,
    borderBottomWidth: 1,
    borderBottomColor: headerBorder,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    color: textWhite,
    fontSize: sf(22),
    fontWeight: '700',
    marginTop: -2,
  },
  crestContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: isLight ? '#FEF9C3' : '#0D1B2A',
    borderWidth: 1,
    borderColor: '#EAB308',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  crestImg: {
    width: 28,
    height: 28,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  avatarBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: textTitle,
    fontSize: sf(14),
    fontWeight: '800',
  },
  exitPreviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: isLight ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: isLight ? '#FCA5A5' : '#EF4444',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  exitPreviewText: {
    color: '#EF4444',
    fontSize: sf(11),
    fontWeight: '800',
  },
  bodyContent: {
    flex: 1,
  },
  scrollPad: {
    padding: 16,
    paddingBottom: 24,
  },
  greetingSection: {
    marginBottom: 16,
  },
  greetingTitle: {
    color: textSub,
    fontSize: sf(15),
    fontWeight: '700',
  },
  classPill: {
    alignSelf: 'flex-start',
    backgroundColor: isLight ? '#EFF6FF' : '#131F33',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
    borderWidth: 1,
    borderColor: pillBorder,
  },
  classPillText: {
    color: isLight ? '#2563EB' : '#60A5FA',
    fontSize: sf(11),
    fontWeight: '700',
  },
  cardBox: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  notifCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notifCardTitle: {
    color: textTitle,
    fontSize: sf(13.5),
    fontWeight: '800',
  },
  viewAllText: {
    color: '#60A5FA',
    fontSize: sf(11),
    fontWeight: '800',
  },
  notifStateCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  notifEmptySub: {
    color: textSub,
    fontSize: sf(11.5),
    textAlign: 'center',
    maxWidth: 240,
    lineHeight: 16,
  },
  quickGridCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 14,
  },
  gridItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridIcon: {
    fontSize: sf(22),
    marginBottom: 6,
  },
  gridLabel: {
    color: textSub,
    fontSize: sf(11),
    fontWeight: '600',
  },
  scheduleEmptyBox: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  scheduleEmptyText: {
    color: textSub,
    fontSize: sf(11.5),
    textAlign: 'center',
    lineHeight: 17,
  },
  scheduleItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: innerCardBg,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pillBorder,
  },
  timeTag: {
    backgroundColor: highlightBluePill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 10,
  },
  timeTagText: {
    color: highlightBlueText,
    fontSize: sf(11),
    fontWeight: '800',
  },
  scheduleSubTitle: {
    color: textTitle,
    fontSize: sf(12),
    fontWeight: '700',
  },
  scheduleRoom: {
    color: '#64748B',
    fontSize: sf(10.5),
    marginTop: 2,
  },
  scheduleMarkBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scheduleMarkBtnText: {
    fontSize: sf(10),
    fontWeight: '800',
  },
  semSelectWrapper: {
    marginBottom: 16,
  },
  semSelectLabel: {
    color: '#64748B',
    fontSize: sf(10.5),
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  semDropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: pillBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    maxWidth: 180,
  },
  semDropdownText: {
    color: textTitle,
    fontSize: sf(12.5),
    fontWeight: '800',
  },
  semChevron: {
    color: textSub,
    fontSize: sf(14),
  },
  semMenuPopup: {
    backgroundColor: cardBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: pillBorder,
    marginTop: 4,
    maxWidth: 180,
    overflow: 'hidden',
  },
  semMenuItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: cardBorder,
  },
  semMenuItemText: {
    color: textSub,
    fontSize: sf(11.5),
    fontWeight: '600',
  },
  sectionPageTitle: {
    color: textWhite,
    fontSize: sf(17),
    fontWeight: '900',
    marginBottom: 14,
  },
  subjectLeaveDetailBox: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 2,
  },
  subjectLeaveTitle: {
    fontSize: sf(11),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subjectLeaveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  subjectLeaveBadgeText: {
    color: '#FFFFFF',
    fontSize: sf(10),
    fontWeight: '800',
  },
  subjectLeaveExplanation: {
    color: textSub,
    fontSize: sf(11.5),
    lineHeight: sf(16),
  },
  accordionCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cardBorder,
    overflow: 'hidden',
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 6,
  },
  accordionCourseTitle: {
    color: textTitle,
    fontSize: sf(13),
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  accordionChevron: {
    color: textSub,
    fontSize: sf(16),
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  metricCol: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    color: '#64748B',
    fontSize: sf(10.5),
    fontWeight: '700',
    marginBottom: 2,
  },
  metricValue: {
    color: textTitle,
    fontSize: sf(14),
    fontWeight: '900',
  },
  expandedDrawer: {
    borderTopWidth: 1,
    borderTopColor: innerCardBorder,
    padding: 14,
    backgroundColor: innerCardBg,
  },
  drawerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  theoryLabel: {
    color: textWhite,
    fontSize: sf(13),
    fontWeight: '800',
  },
  theoryProgressSub: {
    color: '#64748B',
    fontSize: sf(11),
    marginTop: 2,
    marginBottom: 8,
  },
  progressTrack: {
    height: 6,
    backgroundColor: isLight ? '#CBD5E1' : '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  facultySubText: {
    color: textSub,
    fontSize: sf(10.5),
    marginTop: 8,
  },
  donutRing: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutOuter: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  donutText: {
    color: textTitle,
    fontSize: sf(12),
    fontWeight: '900',
    textAlign: 'center',
    includeFontPadding: false,
    lineHeight: 14,
  },
  donutSubLabel: {
    color: textSub,
    fontSize: sf(8.5),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginTop: 2,
    textAlign: 'center',
  },
  // Attendance Segmented Switcher (Course-wise vs Everyday)
  attendanceSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 16,
    gap: 6,
  },
  attendanceSegmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  attendanceSegmentActive: {
    backgroundColor: isLight ? '#E0F2FE' : '#1E2D4A',
  },
  attendanceSegmentText: {
    color: '#64748B',
    fontSize: sf(11.5),
    fontWeight: '700',
  },
  attendanceSegmentTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  everydayCountBadge: {
    backgroundColor: isLight ? '#E2E8F0' : '#0B1322',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  everydayCountBadgeText: {
    color: textSub,
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  // Everyday Attendance Filter Pills
  everydayFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  everydayFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  everydayFilterPillActive: {
    backgroundColor: isLight ? '#E0F2FE' : '#1E2D4A',
    borderColor: '#38BDF8',
  },
  everydayFilterText: {
    color: '#64748B',
    fontSize: sf(11),
    fontWeight: '700',
  },
  everydayFilterTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  // Everyday Attendance Cards & Slots
  everydayDayCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cardBorder,
    overflow: 'hidden',
  },
  everydayDayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: innerCardBg,
    borderBottomWidth: 1,
    borderBottomColor: innerCardBorder,
  },
  everydayCalendarIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  everydayDayTitle: {
    color: textWhite,
    fontSize: sf(13),
    fontWeight: '800',
  },
  everydayDaySub: {
    color: textSub,
    fontSize: sf(10.5),
    marginTop: 1,
  },
  everydayDayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  everydayDayBadgeText: {
    fontSize: sf(11),
    fontWeight: '900',
  },
  miniSummaryPresentPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  miniSummaryPresentText: {
    color: '#34D399',
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  miniSummaryAbsentPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  miniSummaryAbsentText: {
    color: '#F87171',
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  everydayExpandedHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  everydayExpandedHeaderTitle: {
    color: '#64748B',
    fontSize: sf(10),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  everydayExpandedHeaderSub: {
    color: '#475569',
    fontSize: sf(9.5),
  },
  everydaySlotsContainer: {
    padding: 10,
    gap: 8,
  },
  everydaySlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isLight ? '#FFFFFF' : '#0B1322',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: innerCardBorder,
  },
  everydaySlotTimeCol: {
    width: 78,
  },
  everydaySlotTimeText: {
    color: textTitle,
    fontSize: sf(10.5),
    fontWeight: '700',
  },
  everydaySlotRoomText: {
    color: '#64748B',
    fontSize: sf(9.5),
    marginTop: 2,
  },
  everydaySlotDivider: {
    width: 1,
    height: 24,
    backgroundColor: innerCardBorder,
    marginHorizontal: 4,
  },
  everydaySlotSubjectName: {
    color: textTitle,
    fontSize: sf(12),
    fontWeight: '800',
  },
  everydaySlotSubjectCode: {
    color: '#64748B',
    fontSize: sf(10),
    marginTop: 2,
  },
  everydayStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  everydayStatusAttended: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  everydayStatusBunked: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  everydayStatusCancelled: {
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(100, 116, 139, 0.3)',
  },
  everydayStatusText: {
    fontSize: sf(10.5),
    fontWeight: '800',
  },
  everydayEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    backgroundColor: cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  everydayEmptyTitle: {
    color: textTitle,
    fontSize: sf(14),
    fontWeight: '800',
  },
  everydayEmptySub: {
    color: '#64748B',
    fontSize: sf(11),
    marginTop: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cardBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    color: textWhite,
    fontSize: sf(12),
    padding: 0,
  },
  bigCoursePackCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  bookIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: isLight ? '#E0F2FE' : '#16233B',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  coursePackTitle: {
    color: textWhite,
    fontSize: sf(15),
    fontWeight: '900',
  },
  coursePackSub: {
    color: '#64748B',
    fontSize: sf(11.5),
    marginTop: 2,
  },
  academicCourseCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  academicBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  codeBadge: {
    backgroundColor: isLight ? '#E2E8F0' : '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  codeBadgeText: {
    color: textSub,
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  theoryBadge: {
    backgroundColor: isLight ? '#E2E8F0' : '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  theoryBadgeText: {
    color: textSub,
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  creditBadge: {
    backgroundColor: isLight ? '#E2E8F0' : '#1E293B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  creditBadgeText: {
    color: textSub,
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  academicCategory: {
    color: '#38BDF8',
    fontSize: sf(10),
    fontWeight: '700',
    marginBottom: 4,
  },
  academicTitleText: {
    color: textWhite,
    fontSize: sf(13),
    fontWeight: '900',
    marginBottom: 12,
  },
  academicActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: innerCardBg,
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  actionRowTitle: {
    color: textTitle,
    fontSize: sf(12),
    fontWeight: '800',
  },
  actionRowSub: {
    color: '#64748B',
    fontSize: sf(10),
  },
  actionViewBtn: {
    backgroundColor: actionBtnBg,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionViewText: {
    color: textTitle,
    fontSize: sf(11),
    fontWeight: '700',
  },
  actionIconBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: actionBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiBadgeMini: {
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  aiBadgeMiniText: {
    color: '#C084FC',
    fontSize: sf(8.5),
    fontWeight: '800',
  },
  actionNotebookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(124, 58, 237, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.35)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  actionNotebookBtnText: {
    color: '#C084FC',
    fontSize: sf(11),
    fontWeight: '800',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: bg,
    borderTopWidth: 1,
    borderTopColor: headerBorder,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  bottomNavItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  bottomNavActive: {
    borderTopWidth: 2,
    borderTopColor: '#38BDF8',
    marginTop: -2,
  },
  bottomNavIcon: {
    fontSize: sf(17),
    marginBottom: 2,
  },
  bottomNavIconActive: {
    opacity: 1,
  },
  bottomNavLabel: {
    color: '#64748B',
    fontSize: sf(10),
    fontWeight: '600',
  },
  bottomNavLabelActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  drawerSheet: {
    backgroundColor: drawerBg,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: Dimensions.get('window').height * 0.85,
    borderTopWidth: 1,
    borderColor: cardBorder,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  drawerTitle: {
    color: textWhite,
    fontSize: sf(18),
    fontWeight: '900',
  },
  drawerCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: actionBtnBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Profile Student Identity Card
  profileCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 18,
  },
  profileTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileAvatarBig: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: highlightBluePill,
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarBigText: {
    color: textWhite,
    fontSize: sf(22),
    fontWeight: '900',
  },
  profileStudentName: {
    color: textWhite,
    fontSize: sf(15),
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  profileStudentMeta: {
    color: textSub,
    fontSize: sf(11.5),
    marginTop: 2,
  },
  profileClassPill: {
    alignSelf: 'flex-start',
    backgroundColor: isLight ? '#EFF6FF' : '#131F33',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 5,
    borderWidth: 1,
    borderColor: pillBorder,
  },
  profileClassPillText: {
    color: isLight ? '#2563EB' : '#60A5FA',
    fontSize: sf(10.5),
    fontWeight: '700',
  },
  profileDivider: {
    height: 1,
    backgroundColor: innerCardBorder,
    marginVertical: 12,
  },
  profileDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 3,
  },
  profileDetailLabel: {
    color: '#64748B',
    fontSize: sf(11.5),
    fontWeight: '700',
    width: 72,
  },
  profileDetailVal: {
    color: textTitle,
    fontSize: sf(11.5),
    fontWeight: '700',
    flex: 1,
  },
  // Communication / Notifications action row in Profile Drawer
  profileActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 16,
  },
  profileActionIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  profileNotifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  profileActionTitle: {
    color: textWhite,
    fontSize: sf(13),
    fontWeight: '800',
  },
  profileActionSub: {
    color: '#64748B',
    fontSize: sf(10.5),
    marginTop: 2,
  },
  profileUnreadPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  profileUnreadPillText: {
    color: '#F87171',
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  drawerSectionLabel: {
    color: '#64748B',
    fontSize: sf(11),
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  themeSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 20,
  },
  themeSegmentBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  themeSegmentActive: {
    backgroundColor: isLight ? '#E0F2FE' : '#1E2D4A',
  },
  themeSegmentText: {
    color: '#64748B',
    fontSize: sf(11),
    fontWeight: '700',
    marginTop: 4,
  },
  themeSegmentTextActive: {
    color: textWhite,
    fontWeight: '800',
  },
  typoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typoPillBadge: {
    backgroundColor: isLight ? '#EFF6FF' : '#1E2D4A',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  typoPillText: {
    color: '#60A5FA',
    fontSize: sf(10.5),
    fontWeight: '800',
  },
  typoStepsContainer: {
    flexDirection: 'row',
    backgroundColor: cardBg,
    borderRadius: 10,
    padding: 3,
    marginBottom: 20,
    marginTop: 8,
  },
  typoStepBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  typoStepBtnActive: {
    backgroundColor: isLight ? '#E0F2FE' : '#1E2D4A',
  },
  typoStepText: {
    color: '#64748B',
    fontSize: sf(11),
    fontWeight: '600',
  },
  typoStepTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  securityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 16,
  },
  securityIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: highlightBluePill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    color: textWhite,
    fontSize: sf(13),
    fontWeight: '800',
  },
  securitySub: {
    color: '#64748B',
    fontSize: sf(10.5),
    marginTop: 2,
  },
  releaseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 16,
  },
  versionBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: highlightBluePill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  versionBadgeText: {
    color: '#60A5FA',
    fontSize: sf(11),
    fontWeight: '900',
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  signOutText: {
    color: '#F87171',
    fontSize: sf(13),
    fontWeight: '800',
  },
  legalFooter: {
    alignItems: 'center',
    paddingBottom: 24,
  },
  legalBrand: {
    color: textSub,
    fontSize: sf(11),
    fontWeight: '700',
  },
  legalSub: {
    color: '#64748B',
    fontSize: sf(10),
    marginTop: 2,
  },
  privacyLink: {
    color: '#38BDF8',
    fontSize: sf(11),
    fontWeight: '700',
  },
  // Live Attendance Top Box Styles
  liveAttendanceCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  liveAttTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  liveAttBadge: {
    backgroundColor: isLight ? '#E0F2FE' : '#1E293B',
    color: isLight ? '#0369A1' : '#38BDF8',
    fontSize: sf(9.5),
    fontWeight: '900',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  liveAttSubTitle: {
    color: textTitle,
    fontSize: sf(13),
    fontWeight: '800',
    marginTop: 2,
  },
  liveAttBunkText: {
    fontSize: sf(11),
    fontWeight: '700',
    marginTop: 4,
  },
  // Notifications Card & List Item Styles
  notifCountPill: {
    backgroundColor: isLight ? '#EFF6FF' : '#1E3A8A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
  },
  notifCountPillText: {
    color: '#60A5FA',
    fontSize: sf(10),
    fontWeight: '900',
  },
  connectNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: innerCardBg,
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    gap: 10,
  },
  noticeIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: isLight ? '#E0F2FE' : '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeCategoryTag: {
    backgroundColor: isLight ? '#E0F2FE' : '#1E2D4A',
    color: '#38BDF8',
    fontSize: sf(9),
    fontWeight: '800',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  noticeDateTag: {
    color: '#64748B',
    fontSize: sf(10),
    fontWeight: '600',
  },
  noticeTitleText: {
    color: textTitle,
    fontSize: sf(12),
    fontWeight: '700',
  },
  notifPageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  allReadBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  allReadBtnText: {
    color: textSub,
    fontSize: sf(12),
    fontWeight: '700',
  },
  notifFilterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  notifFilterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  notifFilterPillActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  notifFilterText: {
    color: textSub,
    fontSize: sf(11.5),
    fontWeight: '700',
  },
  notifFilterTextActive: {
    color: textWhite,
    fontWeight: '800',
  },
  notifListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cardBg,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cardBorder,
    gap: 10,
  },
  // Academic Calendar Styles
  calendarCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  calCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  calTypeBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  calTypeBadgeText: {
    fontSize: sf(9.5),
    fontWeight: '900',
  },
  longWeekendPill: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  longWeekendText: {
    color: '#93C5FD',
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  calDateText: {
    color: textSub,
    fontSize: sf(11),
    fontWeight: '600',
  },
  calTitleText: {
    color: textTitle,
    fontSize: sf(13),
    fontWeight: '800',
    marginTop: 2,
  },
  calDescText: {
    color: textSub,
    fontSize: sf(11),
    marginTop: 4,
    lineHeight: 16,
  },
  // Campus Portals Styles
  portalCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  portalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  portalIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: isLight ? '#EFF6FF' : '#131F33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalTitle: {
    color: textTitle,
    fontSize: sf(13.5),
    fontWeight: '800',
  },
  portalSub: {
    color: '#64748B',
    fontSize: sf(10.5),
    marginTop: 1,
  },
  portalLivePill: {
    backgroundColor: '#064E3B',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  portalLivePillText: {
    color: '#34D399',
    fontSize: sf(9),
    fontWeight: '800',
  },
  portalDesc: {
    color: textSub,
    fontSize: sf(11.5),
    lineHeight: 16,
    marginBottom: 12,
  },
  portalActionBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  portalActionBtnText: {
    color: textWhite,
    fontSize: sf(11.5),
    fontWeight: '800',
  },
  // NotebookLM Banner Card
  notebookLmBannerCard: {
    backgroundColor: isLight ? '#F5F3FF' : '#110E24',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: isLight ? '#DDD6FE' : '#3B2D68',
  },
  notebookLmTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notebookLmIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(167, 139, 250, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167, 139, 250, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notebookLmTitle: {
    color: textTitle,
    fontSize: sf(14),
    fontWeight: '900',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  aiBadgeText: {
    color: '#C084FC',
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  notebookLmSub: {
    color: textSub,
    fontSize: sf(11),
    marginTop: 2,
  },
  notebookLmFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: isLight ? '#EDE9FE' : '#251E45',
  },
  notebookLmFooterText: {
    color: isLight ? '#5B21B6' : '#A5B4FC',
    fontSize: sf(10.5),
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  openPill: {
    backgroundColor: '#6D28D9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  openPillText: {
    color: textWhite,
    fontSize: sf(10.5),
    fontWeight: '800',
  },
  // In-modal Course Detail Viewer
  courseSubjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: cardBg,
    borderWidth: 1,
    borderColor: cardBorderDark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  courseSubjectPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.16)',
    borderColor: '#38BDF8',
  },
  courseSubjectPillText: {
    color: textSub,
    fontSize: sf(11),
    fontWeight: '700',
  },
  courseSubjectPillTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  courseDetailSwitcherRow: {
    flexDirection: 'row',
    backgroundColor: cardBg,
    borderRadius: 10,
    padding: 3,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 14,
    gap: 6,
  },
  courseDetailSwitcherBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  courseDetailSwitcherBtnActive: {
    backgroundColor: isLight ? '#E0F2FE' : '#1E2D4A',
  },
  courseDetailSwitcherText: {
    color: '#64748B',
    fontSize: sf(11.5),
    fontWeight: '700',
  },
  courseDetailSwitcherTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  courseObjBox: {
    backgroundColor: cardBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: cardBorder,
    marginBottom: 14,
  },
  courseObjTitle: {
    color: textTitle,
    fontSize: sf(12.5),
    fontWeight: '800',
    marginBottom: 4,
  },
  courseObjText: {
    color: textSub,
    fontSize: sf(11.5),
    lineHeight: 17,
  },
  courseFacultyText: {
    color: '#38BDF8',
    fontSize: sf(11),
    fontWeight: '700',
    marginTop: 6,
  },
  assessmentItemBox: {
    backgroundColor: cardBg,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  assessmentTitle: {
    color: textTitle,
    fontSize: sf(12.5),
    fontWeight: '800',
    flex: 1,
    marginRight: 8,
  },
  assessmentMarksBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  assessmentMarksText: {
    color: '#38BDF8',
    fontSize: sf(10),
    fontWeight: '900',
  },
  assessmentSubText: {
    color: '#64748B',
    fontSize: sf(10.5),
    marginTop: 2,
  },
  assessmentDescText: {
    color: '#CBD5E1',
    fontSize: sf(11),
    marginTop: 6,
    lineHeight: 16,
  },
  bookItemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  bookItemText: {
    color: textSub,
    fontSize: sf(11.5),
    flex: 1,
    lineHeight: 16,
  },
  sessionItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: cardBg,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  sessionNumBox: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: isLight ? '#E0F2FE' : '#1E2D4A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionNumText: {
    color: '#38BDF8',
    fontSize: sf(11),
    fontWeight: '900',
  },
  sessionUnitBadge: {
    backgroundColor: innerCardBg,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: cardBorder,
  },
  sessionUnitText: {
    color: textSub,
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  sessionDateText: {
    color: '#F59E0B',
    fontSize: sf(9.5),
    fontWeight: '700',
  },
  sessionTopicText: {
    color: textTitle,
    fontSize: sf(11.5),
    fontWeight: '700',
  },
  sessionSoftwareText: {
    color: '#A78BFA',
    fontSize: sf(10),
    marginTop: 2,
  },
  openInteractivePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cardBg,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  openInteractivePlanText: {
    color: '#38BDF8',
    fontSize: sf(12),
    fontWeight: '800',
  },

  /* Holiday Leave Planner Banner & Modal Styles */
  holidayLeaveBannerCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: cardBorderDark,
  },
  holidayBannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  holidayBannerIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
  },
  holidayBannerTitle: {
    color: textTitle,
    fontSize: sf(13.5),
    fontWeight: '800',
  },
  holidayBannerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  holidayBannerTagText: {
    color: '#38BDF8',
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  holidayBannerSub: {
    color: textSub,
    fontSize: sf(11),
    marginTop: 2,
  },
  holidayBannerPillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: innerCardBorder,
  },
  holidayBannerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: pillBg,
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: cardBorderDark,
  },
  holidayBannerPillText: {
    color: textSub,
    fontSize: sf(10.5),
  },
  holidayModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'flex-end',
  },
  holidayModalContainer: {
    backgroundColor: drawerBg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '92%',
    borderWidth: 1,
    borderColor: cardBorderDark,
    overflow: 'hidden',
  },
  holidayModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: headerBorder,
    backgroundColor: bg,
  },
  holidayHeaderIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayModalTitle: {
    color: textTitle,
    fontSize: sf(15),
    fontWeight: '800',
  },
  holidayModalSubtitle: {
    color: '#64748B',
    fontSize: sf(11),
  },
  holidayModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: pillBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayStatusCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: cardBorderDark,
    marginBottom: 16,
  },
  holidayStatusTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  holidayStatusSmallLabel: {
    color: '#64748B',
    fontSize: sf(10),
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  holidayStatusBigPct: {
    fontSize: sf(28),
    fontWeight: '900',
    marginVertical: 2,
  },
  holidayStatusHeldText: {
    color: textSub,
    fontSize: sf(11),
  },
  holidayStatusRightBox: {
    alignItems: 'flex-end',
  },
  statusCategoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusCategoryBadgeText: {
    fontSize: sf(10.5),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statusCategorySub: {
    color: '#64748B',
    fontSize: sf(10),
    marginTop: 6,
    textAlign: 'right',
  },
  holidaySimulatorCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: isLight ? '#93C5FD' : '#1E3A8A',
  },
  simCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  simCardTitle: {
    color: '#38BDF8',
    fontSize: sf(14),
    fontWeight: '800',
  },
  simCardDescription: {
    color: textSub,
    fontSize: sf(11.5),
    lineHeight: 16,
    marginBottom: 14,
  },
  simFieldSection: {
    marginBottom: 14,
  },
  simFieldLabel: {
    color: '#64748B',
    fontSize: sf(10),
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  simPillSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  simTargetPill: {
    backgroundColor: pillBg,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: cardBorderDark,
  },
  simTargetPillActive: {
    backgroundColor: 'rgba(56, 189, 248, 0.18)',
    borderColor: '#38BDF8',
  },
  simTargetPillText: {
    color: textSub,
    fontSize: sf(11.5),
    fontWeight: '600',
  },
  simTargetPillTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  simHoursPill: {
    backgroundColor: pillBg,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: cardBorderDark,
  },
  simHoursPillActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderColor: '#EF4444',
  },
  simHoursPillText: {
    color: textSub,
    fontSize: sf(11.5),
    fontWeight: '600',
  },
  simHoursPillTextActive: {
    color: '#F87171',
    fontWeight: '800',
  },
  simResultContainer: {
    backgroundColor: innerCardBg,
    borderRadius: 12,
    padding: 14,
    marginTop: 6,
    borderWidth: 1,
    borderColor: innerCardBorder,
  },
  simResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  simResultDivider: {
    width: 1,
    height: 54,
    backgroundColor: innerCardBorder,
  },
  simResultMetricLabel: {
    color: '#64748B',
    fontSize: sf(9.5),
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  simResultMetricValue: {
    fontSize: sf(22),
    fontWeight: '900',
    marginTop: 2,
  },
  simResultDropSub: {
    color: textSub,
    fontSize: sf(10),
    marginTop: 2,
  },
  simResultRequiredValue: {
    color: '#38BDF8',
    fontSize: sf(26),
    fontWeight: '900',
    marginTop: 2,
  },
  simResultRequiredUnit: {
    color: '#38BDF8',
    fontSize: sf(11),
    fontWeight: '700',
  },
  simResultRecoverySub: {
    color: textSub,
    fontSize: sf(10),
    marginTop: 2,
    lineHeight: 14,
  },
  simAdviceBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  simAdviceText: {
    flex: 1,
    color: '#BAE6FD',
    fontSize: sf(11),
    lineHeight: 16,
  },
  holidaySectionTitle: {
    color: textTitle,
    fontSize: sf(14),
    fontWeight: '800',
  },
  holidayCountBadge: {
    backgroundColor: pillBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  holidayCountBadgeText: {
    color: '#64748B',
    fontSize: sf(10),
    fontWeight: '700',
  },
  holidayRecCard: {
    backgroundColor: cardBg,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: cardBorderDark,
  },
  holidayRecHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  holidayRecTitle: {
    color: textTitle,
    fontSize: sf(13.5),
    fontWeight: '800',
  },
  longWeekendTagPill: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  longWeekendTagPillText: {
    color: '#FBBF24',
    fontSize: sf(9.5),
    fontWeight: '800',
  },
  holidayRecDate: {
    color: textSub,
    fontSize: sf(11),
  },
  holidayRecDesc: {
    color: '#64748B',
    fontSize: sf(11),
    marginTop: 6,
    lineHeight: 15,
  },
  holidayStrategyBox: {
    backgroundColor: innerCardBg,
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: innerCardBorder,
  },
  holidayStrategyHeading: {
    color: '#FBBF24',
    fontSize: sf(10),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  holidayStrategyBody: {
    color: textSub,
    fontSize: sf(11),
    lineHeight: 15,
  },
  holidayStrategyImpactRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: headerBorder,
  },
  holidayStrategyImpactText: {
    color: textSub,
    fontSize: sf(10.5),
  },

  // Today's Schedule Interactive Simulator Card Styles
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
    backgroundColor: isLight ? 'rgba(245, 158, 11, 0.12)' : 'rgba(15, 23, 42, 0.6)',
  },
  simulatorTag: {
    fontSize: sf(11),
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  simulatorTime: {
    color: isLight ? '#0F172A' : '#A5B4FC',
    fontSize: sf(12),
    fontWeight: '700',
  },
  simulatorTitle: {
    color: textTitle,
    fontSize: sf(17),
    fontWeight: '800',
  },
  simulatorSubDetail: {
    color: isLight ? '#475569' : '#93C5FD',
    fontSize: sf(12),
    fontWeight: '600',
    marginTop: 2,
    marginBottom: 4,
  },
  hourlyFacultyTouch: {
    backgroundColor: isLight ? '#EEF2FF' : 'rgba(30, 41, 59, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: isLight ? '#C7D2FE' : '#38BDF8',
  },
  hourlyFacultyText: {
    color: textSub,
    fontSize: sf(11),
    fontWeight: '600',
  },
  hourlyFacultyHighlight: {
    color: isLight ? '#2B3990' : '#38BDF8',
    fontWeight: '800',
  },
  simulatorSub: {
    color: isLight ? '#64748B' : '#CBD5E1',
    fontSize: sf(12),
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
    backgroundColor: isLight ? '#F8FAFC' : '#0F172A',
    borderColor: isLight ? '#E2E8F0' : '#334155',
  },
  periodPillTime: {
    color: isLight ? '#64748B' : '#94A3B8',
    fontSize: sf(10),
    fontWeight: '700',
  },
  periodPillCode: {
    color: isLight ? '#0F172A' : '#CBD5E1',
    fontSize: sf(12),
    fontWeight: '800',
  },
  periodPillTextActive: {
    color: '#FFFFFF',
  },
  periodPillStatus: {
    color: isLight ? '#64748B' : '#E2E8F0',
    fontSize: sf(9),
    fontWeight: '700',
    marginTop: 2,
  },
  periodPillMarkedAttended: {
    borderColor: '#059669',
    backgroundColor: isLight ? '#ECFDF5' : '#064E3B',
  },
  periodPillMarkedBunked: {
    borderColor: '#DC2626',
    backgroundColor: isLight ? '#FEF2F2' : '#450A0A',
  },
  periodPillMarkedCancelled: {
    borderColor: '#64748B',
    backgroundColor: isLight ? '#F1F5F9' : '#1E293B',
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
    fontSize: sf(20),
  },
  lockedBannerTextContainer: {
    flex: 1,
  },
  lockedBannerTitle: {
    color: textTitle,
    fontSize: sf(13),
    fontWeight: '700',
  },
  lockedBannerSub: {
    color: textSub,
    fontSize: sf(11),
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
    fontSize: sf(12),
  },
  promptBunkBtn: {
    backgroundColor: '#DC2626',
  },
  promptBunkText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: sf(12),
  },
  promptCancelBtn: {
    backgroundColor: '#475569',
  },
  promptCancelText: {
    color: '#F8FAFC',
    fontWeight: '600',
    fontSize: sf(12),
  },
  periodReminderContainer: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: innerCardBorder,
  },
  addReminderTriggerBtn: {
    backgroundColor: isLight ? '#F1F5F9' : '#0F1A2C',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: isLight ? '#CBD5E1' : '#192841',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addReminderTriggerText: {
    color: isLight ? '#0284C7' : '#38BDF8',
    fontSize: sf(12),
    fontWeight: '700',
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
    fontSize: sf(14),
    fontWeight: '700',
    marginBottom: 4,
  },
  sportsNoAttendanceSub: {
    color: textSub,
    fontSize: sf(12),
    textAlign: 'center',
    lineHeight: 16,
  },

  });
};


