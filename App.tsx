import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
  Image,
  AppState,
  Vibration,
} from 'react-native';

import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { Subject, TimetableSlot, MedicalClaimRecord, PeriodAttendanceRecord, AttendanceStatus } from './src/types';
import { StorageService, INITIAL_MEDICAL_CLAIMS } from './src/services/storageService';
import { NotificationService } from './src/services/notificationService';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { ReconcileScreen } from './src/screens/ReconcileScreen';
import { CalendarScreen } from './src/screens/CalendarScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { AdminDashboardScreen } from './src/screens/AdminDashboardScreen';
import { FeedbackModal } from './src/components/FeedbackModal';
import { AnalyticsService } from './src/services/analyticsService';
import { PsgimService } from './src/services/psgimService';
import { toNewRollNo, toOldRollNo, getMasterStudent } from './src/data/psgimMasterStudents';
import { CloudSyncService } from './src/services/cloudSyncService';
import { getSlotHours, isPeriodLocked } from './src/services/attendanceEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DigitalIdModal } from './src/components/DigitalIdModal';
import { CoursePlanModal } from './src/components/CoursePlanModal';
import { AttendanceDisputeModal } from './src/components/AttendanceDisputeModal';
import { ProtocolGate } from './src/engines/starkProtocol/protocolGate';
import { StarkVideoModal } from './src/components/StarkVideoModal';
import { KarenGuide } from './src/components/KarenGuide';
import { MissMinutesScheduler } from './src/services/missMinutesScheduler';
import { EnhancedHubScreen } from './src/screens/EnhancedHubScreen';
import { ThemeManager, AppThemeMode } from './src/constants/theme';
import { FacultyMember } from './src/data/psgimFacultyData';
import { FacultyPortalScreen } from './src/screens/FacultyPortalScreen';
import { FacultyAttendanceService } from './src/services/facultyAttendanceService';

type Tab = 'DASHBOARD' | 'TIMETABLE' | 'CALENDAR' | 'ERP_SYNC' | 'ENHANCED';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [activeRollNo, setActiveRollNo] = useState<string>('');
  const [loggedInFaculty, setLoggedInFaculty] = useState<FacultyMember | null>(null);

  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showDigitalIdModal, setShowDigitalIdModal] = useState<boolean>(false);
  const [showCoursePlanModal, setShowCoursePlanModal] = useState<boolean>(false);
  const [showDisputeModal, setShowDisputeModal] = useState<boolean>(false);
  const [showStarkVideoModal, setShowStarkVideoModal] = useState<boolean>(false);
  const [showKarenGuide, setShowKarenGuide] = useState<boolean>(false);
  const [isEnhancedSuit, setIsEnhancedSuit] = useState<boolean>(false);
  const [themeMode, setThemeMode] = useState<AppThemeMode>(ThemeManager.getMode());
  const isLightMode = themeMode === 'LIGHT';

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [medicalClaims, setMedicalClaims] = useState<MedicalClaimRecord[]>(INITIAL_MEDICAL_CLAIMS);
  const [periodRecords, setPeriodRecords] = useState<Record<string, PeriodAttendanceRecord>>({});

  // Sync ThemeManager state on mount and updates
  useEffect(() => {
    ThemeManager.init().then(setThemeMode);
    const unsubTheme = ThemeManager.subscribe(setThemeMode);
    return () => unsubTheme();
  }, []);

  const handleToggleTheme = async () => {
    try {
      Vibration.vibrate(25);
    } catch {}
    await ThemeManager.toggleTheme();
  };

  // Sync protocol mode tier (Enhanced Suit vs Training Wheels) across entire app
  useEffect(() => {
    ProtocolGate.isSuitUnlocked().then(setIsEnhancedSuit);
    const unsub = ProtocolGate.onModeChange((mode) => {
      setIsEnhancedSuit(mode === 'ENHANCED_SUIT');
    });
    return () => unsub();
  }, []);

  const handleLogoTap = () => {
    // Disable Stark 576 Easter Egg when logged in as Guest
    if (activeRollNo?.toUpperCase() === 'GUEST') {
      return;
    }
    const isTriggered = ProtocolGate.recordTap(2500, 5);
    if (isTriggered) {
      try {
        Vibration.vibrate([0, 50, 100, 50]);
      } catch {}
      setShowStarkVideoModal(true);
    }
  };

  // Keep active refs so listeners always access latest state without re-triggering useEffect
  const timetableRef = React.useRef(timetable);
  timetableRef.current = timetable;
  const handleRecordPeriodAttendanceRef = React.useRef<any>(null);

  // 1. Initial session check (MOUNT ONLY)
  useEffect(() => {
    async function initSession() {
      try {
        const savedRollNo = await StorageService.getAuthUser();
        if (savedRollNo && PsgimService.getStudent(savedRollNo)) {
          const officialRoll = toNewRollNo(savedRollNo) || savedRollNo;
          const oldRoll = toOldRollNo(savedRollNo);
          if (oldRoll && oldRoll !== officialRoll) {
            await StorageService.migrateStudentData(oldRoll, officialRoll);
          }
          await StorageService.setAuthUser(officialRoll);
          setActiveRollNo(officialRoll);
          const initialTimetable = PsgimService.generateTimetableForStudent(officialRoll);
          const defaultGenerated = PsgimService.generateSubjectsForStudent(officialRoll);
          const savedSubjects = await StorageService.getSubjects(officialRoll);
          // Prefer saved/customized subjects over static generation
          const initialSubjects = savedSubjects && savedSubjects.length > 0 ? savedSubjects : defaultGenerated;

          // Apply saved faculty overrides if any
          for (const sub of initialSubjects) {
            const override = await AsyncStorage.getItem(`@user_faculty_override_${officialRoll}_${sub.id}`);
            if (override) {
              sub.faculty = override;
            }
          }

          initialTimetable.forEach((slot) => {
            const matchingSub = initialSubjects.find((s) => s.id === slot.subjectId);
            if (matchingSub && matchingSub.faculty) {
              slot.faculty = matchingSub.faculty;
            }
          });

          if (officialRoll?.toUpperCase() === 'GUEST') {
            await ProtocolGate.engageTrainingWheels();
            setIsEnhancedSuit(false);
          }

          setSubjects(initialSubjects);
          setTimetable(initialTimetable);
          const storedRecords = await StorageService.getPeriodRecords(officialRoll);
          setPeriodRecords(storedRecords);
          setIsAuthenticated(true);
          setIsCheckingAuth(false);

          const student = getMasterStudent(officialRoll);
          AnalyticsService.recordLogin(officialRoll, student?.name || '', student?.batch || 'A');
          CloudSyncService.syncStudentProfile(officialRoll, student?.name || '', student?.batch || 'A');

          // Sync with latest cloud updates asynchronously in background without blocking startup
          (async () => {
            try {
              const cloudSubjects = await Promise.race([
                CloudSyncService.fetchCloudSubjects(officialRoll),
                new Promise<null>((resolve) => setTimeout(() => resolve(null), 2500))
              ]);
              if (cloudSubjects && cloudSubjects.length > 0) {
                for (const sub of cloudSubjects) {
                  const override = await AsyncStorage.getItem(`@user_faculty_override_${officialRoll}_${sub.id}`);
                  if (override) {
                    sub.faculty = override;
                  }
                }
                initialTimetable.forEach((slot) => {
                  const matchingSub = cloudSubjects.find((s) => s.id === slot.subjectId);
                  if (matchingSub && matchingSub.faculty) {
                    slot.faculty = matchingSub.faculty;
                  }
                });
                setSubjects(cloudSubjects);
                setTimetable([...initialTimetable]);
                await StorageService.saveSubjects(cloudSubjects);
                await StorageService.saveTimetable(initialTimetable);
              }

              const cloudPeriods = await Promise.race([
                CloudSyncService.fetchCloudPeriodRecords(officialRoll),
                new Promise<Record<string, PeriodAttendanceRecord>>((resolve) => setTimeout(() => resolve({}), 2500))
              ]);
              if (cloudPeriods && Object.keys(cloudPeriods).length > 0) {
                const mergedRecords = { ...storedRecords, ...cloudPeriods };
                setPeriodRecords(mergedRecords);
                await StorageService.savePeriodRecords(officialRoll, mergedRecords);
              }
            } catch (err) {
              console.warn('Background cloud sync warning:', err);
            }
          })();
        }

        const savedFaculty = await FacultyAttendanceService.getFacultySession();
        if (savedFaculty) {
          setLoggedInFaculty(savedFaculty);
        }

        const storedMed = await StorageService.getMedicalClaims();
        setMedicalClaims(storedMed);

        if (Platform.OS !== 'web') {
          await NotificationService.requestPermissions();
          await NotificationService.setupNotificationCategories();
        }
      } catch (e) {
        console.warn('Init session error:', e);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    initSession();

    // Global Real-time Listener (Mount once):
    let lastKnownSyncTime = Date.now();
    const unsubGlobal = CloudSyncService.listenToGlobalAttendanceUpdates((update) => {
      if (update && update.timestamp && update.timestamp > lastKnownSyncTime) {
        lastKnownSyncTime = update.timestamp;
        NotificationService.notifyAttendanceUpdated(
          update.updatedByName,
          update.subjectsCount,
          update.portalUpdatedDate
        );
      }
    });

    // Lock Screen Interactive Notification Action Listener (Native Android & iOS)
    let notifSub: any = null;
    if (Platform.OS !== 'web') {
      notifSub = NotificationService.addNotificationResponseListener((actionId, data) => {
        if (data && (actionId === 'present' || actionId === 'absent')) {
          const slotId = data.slotId;
          const status = actionId === 'present' ? 'attended' : 'bunked';
          const today = new Date().toISOString().split('T')[0];
          const slot = timetableRef.current.find((s) => s.id === slotId);
          if (slot) {
            handleRecordPeriodAttendanceRef.current(slot, today, status);
            NotificationService.dismissAllNotifications();
          }
        }
      });
    } else if (typeof window !== 'undefined' && 'navigator' in window && 'serviceWorker' in navigator) {
      // PWA Web / Android Chrome service worker message listener
      const onSwMessage = (e: MessageEvent) => {
        if (e.data && e.data.type === 'NOTIFICATION_ATTENDANCE_ACTION') {
          const { action, data } = e.data;
          if (data && (action === 'present' || action === 'absent')) {
            const slotId = data.slotId;
            const status = action === 'present' ? 'attended' : 'bunked';
            const today = new Date().toISOString().split('T')[0];
            const slot = timetableRef.current.find((s) => s.id === slotId);
            if (slot) {
              handleRecordPeriodAttendanceRef.current(slot, today, status);
              NotificationService.dismissAllNotifications();
            }
          }
        }
      };
      navigator.serviceWorker.addEventListener('message', onSwMessage);
    }

    return () => {
      unsubGlobal();
      if (notifSub && notifSub.remove) notifSub.remove();
    };
  }, []);

  // Active Foreground Time Tracking (Increments active time per minute while student uses the app)
  useEffect(() => {
    if (!isAuthenticated || !activeRollNo) return;

    let timer: any = null;

    const startTimer = () => {
      if (!timer) {
        timer = setInterval(() => {
          if (AppState.currentState === 'active') {
            AnalyticsService.trackActiveMinutes(activeRollNo, 1);
          }
        }, 60000);
      }
    };

    const stopTimer = () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    };

    startTimer();

    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        startTimer();
      } else {
        stopTimer();
      }
    });

    return () => {
      stopTimer();
      subscription.remove();
    };
  }, [isAuthenticated, activeRollNo]);

  // Miss Minutes Scheduled Daily 9:00 PM Cloud Sync Check (Mon-Sat protocol)
  useEffect(() => {
    // Check if the current time matches the 9:00 PM Mon-Sat window on mount & periodic interval
    const checkMissMinutesSchedule = async () => {
      if (MissMinutesScheduler.isScheduledWindow()) {
        const lastLog = await MissMinutesScheduler.getLastSyncLog();
        const todayStr = new Date().toISOString().split('T')[0];
        // Only run once per night
        if (!lastLog || !new Date(lastLog.timestamp).toISOString().startsWith(todayStr) || lastLog.status !== 'SUCCESS') {
          await MissMinutesScheduler.executeNightlyAttendanceSync();
        }
      }
    };

    checkMissMinutesSchedule();
    const interval = setInterval(checkMissMinutesSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
    const featureMap: Record<Tab, any> = {
      DASHBOARD: 'HOURLY_TRACK',
      TIMETABLE: 'TIMETABLE',
      CALENDAR: 'CALENDAR',
      ERP_SYNC: 'ERP_SYNC',
      ENHANCED: 'ENHANCED_HUB',
    };
    AnalyticsService.trackFeatureEvent(activeRollNo, featureMap[newTab]);
  };


  // Login handler
  const handleLoginSuccess = async (rawRollNo: string) => {
    const rollNo = toNewRollNo(rawRollNo) || rawRollNo;
    const oldRoll = toOldRollNo(rawRollNo);
    if (oldRoll && oldRoll !== rollNo) {
      await StorageService.migrateStudentData(oldRoll, rollNo);
    }
    await StorageService.setAuthUser(rollNo);

    const studentSubjects = PsgimService.generateSubjectsForStudent(rollNo);
    const studentTimetable = PsgimService.generateTimetableForStudent(rollNo);

    // Apply saved faculty overrides if any
    for (const sub of studentSubjects) {
      const override = await AsyncStorage.getItem(`@user_faculty_override_${rollNo}_${sub.id}`);
      if (override) {
        sub.faculty = override;
      }
    }
    studentTimetable.forEach((slot) => {
      const matchingSub = studentSubjects.find((s) => s.id === slot.subjectId);
      if (matchingSub && matchingSub.faculty) {
        slot.faculty = matchingSub.faculty;
      }
    });

    const storedRecords = await StorageService.getPeriodRecords(rollNo);

    if (rollNo?.toUpperCase() === 'GUEST') {
      await ProtocolGate.engageTrainingWheels();
      setIsEnhancedSuit(false);
    }

    setActiveRollNo(rollNo);
    setSubjects(studentSubjects);
    setTimetable(studentTimetable);
    setPeriodRecords(storedRecords);
    setIsAuthenticated(true);

    const student = getMasterStudent(rollNo);
    AnalyticsService.recordLogin(rollNo, student?.name || '', student?.batch || 'A');
    CloudSyncService.syncStudentProfile(rollNo, student?.name || '', student?.batch || 'A');
    CloudSyncService.syncSubjects(rollNo, studentSubjects);
  };

  // Faculty assignment & customization handler
  const handleUpdateFaculty = async (subjectId: string, newFaculty: string) => {
    const updatedSubjects = subjects.map((s) => (s.id === subjectId ? { ...s, faculty: newFaculty } : s));
    setSubjects(updatedSubjects);
    await StorageService.saveSubjects(updatedSubjects);

    const updatedTimetable = timetable.map((slot) =>
      slot.subjectId === subjectId ? { ...slot, faculty: newFaculty } : slot
    );
    setTimetable(updatedTimetable);
    await StorageService.saveTimetable(updatedTimetable);

    try {
      if (activeRollNo) {
        await AsyncStorage.setItem(`@user_faculty_override_${activeRollNo}_${subjectId}`, newFaculty);
        await CloudSyncService.syncSubjects(activeRollNo, updatedSubjects);
      }
    } catch (e) {
      console.warn('Error saving faculty override:', e);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await StorageService.clearAuthUser();
    await FacultyAttendanceService.clearFacultySession();
    setIsAuthenticated(false);
    setActiveRollNo('');
    setLoggedInFaculty(null);
    setPeriodRecords({});
    setActiveTab('DASHBOARD');
  };

  const handleFacultyLoginSuccess = async (faculty: FacultyMember) => {
    await FacultyAttendanceService.saveFacultySession(faculty);
    setLoggedInFaculty(faculty);
  };

  // Dedicated single-marking handler for hourly periods (prevents double-marking)
  const handleRecordPeriodAttendance = async (
    slot: TimetableSlot,
    date: string,
    newStatus: AttendanceStatus
  ): Promise<{ success: boolean; message: string; isChange: boolean; alreadyMarked?: boolean }> => {
    const periodKey = `${date}_${slot.id}`;
    const existing = periodRecords[periodKey];

    if (existing && existing.status === newStatus) {
      return {
        success: false,
        message: `You have already marked this period as "${newStatus.toUpperCase()}". A period cannot be marked twice.`,
        isChange: false,
        alreadyMarked: true,
      };
    }

    const subject = subjects.find((s) => s.id === slot.subjectId);
    if (!subject) {
      return {
        success: false,
        message: 'Course not found in your assigned curriculum.',
        isChange: false,
      };
    }

    // Check if the timer has completed and period is locked pending college portal update
    if (existing) {
      const lockCheck = isPeriodLocked({
        slot,
        recordDate: date,
        subject,
        isWindowOpen: true, // Allow editing if attendance window or student is actively recording
      });

      if (lockCheck.isLocked) {
        return {
          success: false,
          message: lockCheck.reason || 'This period timer has ended and attendance is uploaded to the cloud. It cannot be altered until the college updates the portal.',
          isChange: false,
        };
      }
    }

    // Compute delta based on actual academic hours of the slot (e.g. 2 hrs or 1 hr)
    const slotHours = getSlotHours(slot);
    let deltaAttended = 0;
    let deltaTotal = 0;

    if (!existing) {
      // First time recording this period
      if (newStatus === 'attended') {
        deltaAttended = slotHours;
        deltaTotal = slotHours;
      } else if (newStatus === 'bunked') {
        deltaAttended = 0;
        deltaTotal = slotHours;
      } else if (newStatus === 'cancelled') {
        deltaAttended = 0;
        deltaTotal = 0;
      }
    } else {
      // Correcting/switching previously recorded status
      const existingHours = existing.hours ?? slotHours;
      if (existing.status === 'attended') {
        deltaAttended -= existingHours;
        deltaTotal -= existingHours;
      } else if (existing.status === 'bunked') {
        deltaTotal -= existingHours;
      }

      if (newStatus === 'attended') {
        deltaAttended += slotHours;
        deltaTotal += slotHours;
      } else if (newStatus === 'bunked') {
        deltaTotal += slotHours;
      }
    }

    const updatedSubjects = subjects.map((s) => {
      if (s.id === slot.subjectId) {
        const nextAttended = Math.max(0, s.attended + deltaAttended);
        const nextTotal = Math.max(nextAttended, s.total + deltaTotal);
        return {
          ...s,
          attended: nextAttended,
          total: nextTotal,
        };
      }
      return s;
    });

    const lockCheck = isPeriodLocked({
      slot,
      recordDate: date,
      subject,
    });

    const newRecord: PeriodAttendanceRecord = {
      periodKey,
      date,
      slotId: slot.id,
      subjectId: slot.subjectId,
      status: newStatus,
      hours: slotHours,
      recordedAt: Date.now(),
      cloudSyncedAt: new Date().toISOString(),
      lockedUntilPortalUpdate: lockCheck.isLocked,
    };


    const updatedRecords = {
      ...periodRecords,
      [periodKey]: newRecord,
    };

    setSubjects(updatedSubjects);
    setPeriodRecords(updatedRecords);

    await StorageService.saveSubjects(updatedSubjects);
    await StorageService.savePeriodRecords(activeRollNo, updatedRecords);

    // Sync to Firebase Cloud
    if (activeRollNo) {
      CloudSyncService.syncPeriodRecord(activeRollNo, newRecord);
      CloudSyncService.syncSubjects(activeRollNo, updatedSubjects);
    }

    const isChange = Boolean(existing);
    const hoursLabel = `${slotHours} ${slotHours === 1 ? 'hr' : 'hrs'}`;
    return {
      success: true,
      message: isChange
        ? `Status updated: Marked ${hoursLabel} as ${newStatus.toUpperCase()} for ${subject.name}.`
        : `Marked ${hoursLabel} as ${newStatus.toUpperCase()} for ${subject.name}. (Period locked)`,
      isChange,
    };
  };
  handleRecordPeriodAttendanceRef.current = handleRecordPeriodAttendance;

  // Update subject helper
  const handleUpdateSubject = (updated: Subject) => {
    const next = subjects.map((s) => (s.id === updated.id ? updated : s));
    setSubjects(next);
    StorageService.saveSubjects(next);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, next);
    }
  };

  // Toggle Medical Claim Concession (switches threshold to 65% vs 75%)
  const handleToggleMedicalClaim = (id: string) => {
    const next = subjects.map((s) => {
      if (s.id === id) {
        return { ...s, hasMedicalClaim: !s.hasMedicalClaim };
      }
      return s;
    });
    setSubjects(next);
    StorageService.saveSubjects(next);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, next);
    }
  };

  // Quick action: +1 Present
  const handleQuickAttend = (id: string) => {
    const next = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          attended: s.attended + 1,
          total: s.total + 1,
        };
      }
      return s;
    });
    setSubjects(next);
    StorageService.saveSubjects(next);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, next);
    }
  };

  // Quick action: +1 Bunk
  const handleQuickBunk = (id: string) => {
    const next = subjects.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          total: s.total + 1,
        };
      }
      return s;
    });
    setSubjects(next);
    StorageService.saveSubjects(next);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, next);
    }
  };

  // Add new Medical Claim record
  const handleAddMedicalClaim = (claim: MedicalClaimRecord) => {
    const next = [claim, ...medicalClaims];
    setMedicalClaims(next);
    StorageService.saveMedicalClaims(next);
    if (activeRollNo) {
      CloudSyncService.syncMedicalClaim(activeRollNo, claim);
    }
  };

  // Cycle claim status: SUBMITTED → APPROVED → DRAFT (tap to update)
  const handleUpdateClaimStatus = (claimId: string) => {
    const next = medicalClaims.map((c) => {
      if (c.id !== claimId) return c;
      const cycle: Record<string, MedicalClaimRecord['status']> = {
        SUBMITTED: 'APPROVED',
        APPROVED: 'DRAFT',
        DRAFT: 'SUBMITTED',
      };
      return { ...c, status: cycle[c.status] ?? 'SUBMITTED' };
    });
    setMedicalClaims(next);
    StorageService.saveMedicalClaims(next);
  };

  // Delete a Medical Claim record
  const handleDeleteMedicalClaim = (claimId: string) => {
    const claimToDelete = medicalClaims.find((c) => c.id === claimId);
    const next = medicalClaims.filter((c) => c.id !== claimId);
    setMedicalClaims(next);
    StorageService.saveMedicalClaims(next);

    // If deleted claim had affected subjects, check if any remaining claim still covers them
    if (claimToDelete) {
      const remainingClaimedSubjectIds = new Set<string>();
      next.forEach((c) => {
        if (c.subjectId === 'ALL') {
          subjects.forEach((s) => remainingClaimedSubjectIds.add(s.id));
        } else {
          c.subjectId.split(',').forEach((id) => remainingClaimedSubjectIds.add(id.trim()));
        }
      });

      const updatedSubjects = subjects.map((s) => {
        if (s.hasMedicalClaim && !remainingClaimedSubjectIds.has(s.id)) {
          return { ...s, hasMedicalClaim: false };
        }
        return s;
      });
      setSubjects(updatedSubjects);
      StorageService.saveSubjects(updatedSubjects);
      if (activeRollNo) {
        CloudSyncService.syncSubjects(activeRollNo, updatedSubjects);
      }
    }
  };


  // Bulk-activate 65% threshold for multiple subjects (from date-range auto-detection)
  const handleAutoApplyMedicalClaims = (subjectIds: string[]) => {
    const next = subjects.map((s) => {
      if (subjectIds.includes(s.id) && !s.hasMedicalClaim) {
        return { ...s, hasMedicalClaim: true };
      }
      return s;
    });
    setSubjects(next);
    StorageService.saveSubjects(next);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, next);
    }
  };

  // Update attendance in Attendance Sync (both App counts and official ERP baseline)
  const handleUpdateAttendance = (
    subjectId: string,
    appAttended: number,
    appTotal: number,
    officialAttended: number,
    officialTotal: number
  ) => {
    const next = subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          attended: appAttended,
          total: appTotal,
          officialAttended,
          officialTotal,
          lastOfficialUpdate: new Date().toISOString().split('T')[0],
        };
      }
      return s;
    });
    setSubjects(next);
    StorageService.saveSubjects(next, activeRollNo);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, next);
    }
  };

  // Batch update subjects (e.g. from Studzone automated extraction)
  const handleBatchUpdateSubjects = (updatedSubjects: Subject[]) => {
    setSubjects(updatedSubjects);
    StorageService.saveSubjects(updatedSubjects, activeRollNo);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, updatedSubjects);
    }
  };

  // Full-app refresh handler (triggered by pull-down / slide up to down)
  const handleRefresh = async () => {
    try {
      if (activeRollNo) {
        const studentTimetable = PsgimService.generateTimetableForStudent(activeRollNo);
        const storedRecords = await StorageService.getPeriodRecords(activeRollNo);
        const storedMed = await StorageService.getMedicalClaims();
        const savedSubjects = await StorageService.getSubjects(activeRollNo);
        const studentSubjects = savedSubjects && savedSubjects.length > 0
          ? savedSubjects
          : PsgimService.generateSubjectsForStudent(activeRollNo);

        // Apply saved faculty overrides if any
        for (const sub of studentSubjects) {
          const override = await AsyncStorage.getItem(`@user_faculty_override_${activeRollNo}_${sub.id}`);
          if (override) {
            sub.faculty = override;
          }
        }
        studentTimetable.forEach((slot) => {
          const matchingSub = studentSubjects.find((s) => s.id === slot.subjectId);
          if (matchingSub && matchingSub.faculty) {
            slot.faculty = matchingSub.faculty;
          }
        });

        setSubjects(studentSubjects);
        setTimetable(studentTimetable);
        setPeriodRecords(storedRecords);
        setMedicalClaims(storedMed);

        // Fetch cloud-persisted subjects if available
        const cloudSubjects = await CloudSyncService.fetchCloudSubjects(activeRollNo);
        if (cloudSubjects && cloudSubjects.length > 0) {
          for (const sub of cloudSubjects) {
            const override = await AsyncStorage.getItem(`@user_faculty_override_${activeRollNo}_${sub.id}`);
            if (override) {
              sub.faculty = override;
            }
          }
          studentTimetable.forEach((slot) => {
            const matchingSub = cloudSubjects.find((s) => s.id === slot.subjectId);
            if (matchingSub && matchingSub.faculty) {
              slot.faculty = matchingSub.faculty;
            }
          });
          setSubjects(cloudSubjects);
          setTimetable([...studentTimetable]);
          await StorageService.saveSubjects(cloudSubjects);
          await StorageService.saveTimetable(studentTimetable);
        }

        // Fetch cloud-persisted period attendance records (marked by teacher from Google Sheets)
        const cloudPeriods = await CloudSyncService.fetchCloudPeriodRecords(activeRollNo);
        if (cloudPeriods && Object.keys(cloudPeriods).length > 0) {
          const mergedRecords = { ...storedRecords, ...cloudPeriods };
          setPeriodRecords(mergedRecords);
          await StorageService.savePeriodRecords(activeRollNo, mergedRecords);
        }
      }
    } catch (e) {
      console.warn('App refresh error:', e);
    }
  };

  // Loading spinner during auth check
  if (isCheckingAuth) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#38BDF8" />
        </View>
      </SafeAreaProvider>
    );
  }

  // If logged in as Faculty, render Faculty Portal directly
  if (loggedInFaculty) {
    return (
      <SafeAreaProvider>
        <FacultyPortalScreen
          visible={true}
          faculty={loggedInFaculty}
          onLogout={async () => {
            await FacultyAttendanceService.clearFacultySession();
            setLoggedInFaculty(null);
          }}
        />
      </SafeAreaProvider>
    );
  }

  // If not logged in, display Sign In screen
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onAdminLogin={() => setShowAdminModal(true)}
          onFacultyLogin={handleFacultyLoginSuccess}
        />
        {showAdminModal && (
          <AdminDashboardScreen
            visible={showAdminModal}
            onClose={() => setShowAdminModal(false)}
            initiallyAuthenticated={false}
          />
        )}
      </SafeAreaProvider>
    );
  }

  const activeMedCount = subjects.filter((s) => s.hasMedicalClaim).length;
  const studentName = PsgimService.getStudentName(activeRollNo);

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[
          styles.safeArea,
          isLightMode ? { backgroundColor: '#F8FAFC' } : isEnhancedSuit && { backgroundColor: '#050505' },
        ]}
      >
      <StatusBar
        barStyle={isLightMode ? 'dark-content' : 'light-content'}
        backgroundColor={isLightMode ? '#F8FAFC' : isEnhancedSuit ? '#050505' : '#0F172A'}
      />

      {/* Main Top Header (Balanced 2-Row Clean Layout) */}
      <View style={[
        styles.appHeader,
        isLightMode
          ? {
              backgroundColor: '#F8FAFC',
              borderBottomColor: '#E2E8F0',
              borderBottomWidth: 1,
            }
          : isEnhancedSuit && {
              backgroundColor: '#121212',
              borderBottomColor: '#262626',
              borderBottomWidth: 1.5,
            }
      ]}>
        {/* Row 1: Brand Logo & Title + Actions */}
        <View style={styles.headerTopRow}>
          <TouchableOpacity
            style={styles.brandContainer}
            onPress={handleLogoTap}
            activeOpacity={0.8}
          >
            <Image
              source={require('./assets/icon.png')}
              style={[
                styles.headerLogoImg,
                isLightMode && { borderWidth: 1, borderColor: '#CBD5E1' },
                isEnhancedSuit && !isLightMode && { borderWidth: 1, borderColor: '#10B981' }
              ]}
              resizeMode="cover"
            />
            <Text
              style={[
                styles.appName,
                isLightMode ? { color: '#2B3990', fontSize: 19, fontWeight: '900', letterSpacing: 0.5 } : isEnhancedSuit && { color: '#10B981' },
              ]}
              numberOfLines={1}
            >
              PSGIM ONE
            </Text>
          </TouchableOpacity>

          <View style={styles.headerActionsRow}>
            {/* Profile Avatar Icon (Tap to access Karen, Feedback, Theme Switcher, ID, and Logout) */}
            <TouchableOpacity
              style={[
                {
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 1,
                },
                isLightMode
                  ? { backgroundColor: '#EEF2FF', borderColor: '#CBD5E1' }
                  : { backgroundColor: '#1E293B', borderColor: '#334155' }
              ]}
              onPress={() => setShowProfileMenu((prev) => !prev)}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 18 }}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Cohort Sub-bar & Logged In Student Identity */}
        <View style={[
          styles.headerSubRow,
          isLightMode
            ? { borderTopColor: '#E2E8F0', backgroundColor: '#F8FAFC' }
            : isEnhancedSuit && { borderTopColor: 'rgba(38, 38, 38, 0.6)', backgroundColor: '#121212' }
        ]}>
          <Text
            style={[
              styles.appTagline,
              isLightMode ? { color: '#64748B', fontWeight: '600' } : isEnhancedSuit && { color: '#10B981' },
            ]}
          >
            {activeRollNo?.toUpperCase() === 'GUEST'
              ? 'Institutional Inspection • Faculty & Admin Preview'
              : isEnhancedSuit
              ? 'Level One'
              : 'PSGIM Campus Super-App • I MBA'}
          </Text>
          <View
            style={[
              styles.studentBadge,
              activeRollNo?.toUpperCase() === 'GUEST'
                ? { backgroundColor: 'rgba(245, 158, 11, 0.18)', borderColor: '#F59E0B' }
                : isLightMode
                ? { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1' }
                : isEnhancedSuit && {
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    borderColor: '#10B981',
                  }
            ]}
          >
            <Text
              style={[
                styles.studentBadgeText,
                activeRollNo?.toUpperCase() === 'GUEST'
                  ? { color: '#F59E0B', fontWeight: '800' }
                  : isLightMode
                  ? { color: '#2B3990', fontWeight: '800' }
                  : isEnhancedSuit && { color: '#10B981' },
              ]}
              numberOfLines={1}
            >
              {activeRollNo?.toUpperCase() === 'GUEST' ? '🏛️ Guest Mode' : activeRollNo ? `Roll: ${toNewRollNo(activeRollNo)}` : 'Student'}
            </Text>
          </View>
        </View>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <View style={[
            styles.profileDropdownMenu,
            isLightMode
              ? { backgroundColor: '#FFFFFF', borderColor: '#CBD5E1', borderWidth: 1, shadowColor: '#64748B', shadowOpacity: 0.15 }
              : isEnhancedSuit && { backgroundColor: '#121212', borderColor: '#262626', borderWidth: 1.5 }
          ]}>
            {/* Theme Switcher inside Dropdown */}
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                handleToggleTheme();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, isLightMode && { color: '#0F172A' }, isEnhancedSuit && !isLightMode && { color: '#10B981' }]}>
                {isLightMode ? '🌙 Switch to Dark Mode' : '☀️ Switch to White Mode'}
              </Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>
                Toggle Executive Light / Stealth OLED
              </Text>
            </TouchableOpacity>

            <View style={[styles.profileDropdownDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />

            {/* Karen AI Guide */}
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                setShowKarenGuide(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, isLightMode && { color: '#0F172A' }, isEnhancedSuit && !isLightMode && { color: '#10B981' }]}>
                🤖 {isEnhancedSuit ? 'Karen AI Assistant' : 'Campus Guide'}
              </Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>
                Instant answers, regulations & Jarvis protocol
              </Text>
            </TouchableOpacity>

            <View style={[styles.profileDropdownDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />

            {/* Feedback */}
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                setShowFeedbackModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, isLightMode && { color: '#0F172A' }, isEnhancedSuit && !isLightMode && { color: '#10B981' }]}>
                💬 Send Feedback
              </Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>
                Feature requests, bugs & suggestions
              </Text>
            </TouchableOpacity>

            <View style={[styles.profileDropdownDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />

            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                AnalyticsService.trackFeatureEvent(activeRollNo, 'DIGITAL_ID');
                setShowDigitalIdModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, isLightMode && { color: '#0F172A' }, isEnhancedSuit && !isLightMode && { color: '#10B981' }]}>🪪 Digital ID</Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>Emergency Pass & QR Verification</Text>
            </TouchableOpacity>

            <View style={[styles.profileDropdownDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />

            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                AnalyticsService.trackFeatureEvent(activeRollNo, 'COURSE_PLAN');
                setShowCoursePlanModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, isLightMode && { color: '#0F172A' }, isEnhancedSuit && !isLightMode && { color: '#10B981' }]}>📚 Course Plans</Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>All 8 Subjects & CA Marks</Text>
            </TouchableOpacity>

            <View style={[styles.profileDropdownDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />

            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                setShowDisputeModal(true);
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, isLightMode && { color: '#0F172A' }, isEnhancedSuit && !isLightMode && { color: '#10B981' }]}>⚖️ Attendance Dispute Report</Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>Official Dossier & Discrepancies</Text>
            </TouchableOpacity>

            {/* Switch to Guest or Student Mode */}
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                if (activeRollNo?.toUpperCase() === 'GUEST') {
                  handleLogout();
                } else {
                  handleLoginSuccess('GUEST');
                }
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, { color: '#F59E0B' }]}>
                {activeRollNo?.toUpperCase() === 'GUEST' ? '🎓 Exit Guest • Student Login' : '🏛️ Switch to Guest Mode'}
              </Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>
                {activeRollNo?.toUpperCase() === 'GUEST' ? 'Log into a specific student roll number' : 'Instant 1-tap view without password'}
              </Text>
            </TouchableOpacity>

            <View style={[styles.profileDropdownDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />

            {/* Direct Faculty Attendance Portal shortcut */}
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                handleLogout();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, { color: '#10B981' }]}>
                👨‍🏫 Teacher / Faculty Portal Login
              </Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>
                Sign in with @psgim.ac.in and welcome@123 to mark class attendance
              </Text>
            </TouchableOpacity>

            <View style={[styles.profileDropdownDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />

            {/* Logout */}
            <TouchableOpacity
              style={styles.profileDropdownItem}
              onPress={() => {
                setShowProfileMenu(false);
                handleLogout();
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.profileDropdownTitle, { color: '#EF4444' }]}>
                🚪 Logout
              </Text>
              <Text style={[styles.profileDropdownSub, isLightMode && { color: '#64748B' }, isEnhancedSuit && !isLightMode && { color: '#9CA3AF' }]}>
                Sign out of this session
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Main Content View */}
      <View style={[styles.screenContainer, isLightMode ? { backgroundColor: '#F1F5F9' } : isEnhancedSuit && { backgroundColor: '#050505' }]}>
        {activeTab === 'DASHBOARD' && (
          <DashboardScreen
            subjects={subjects}
            timetable={timetable}
            studentRollNo={activeRollNo}
            studentName={studentName}
            periodRecords={periodRecords}
            onRecordPeriodAttendance={handleRecordPeriodAttendance}
            onUpdateFaculty={handleUpdateFaculty}
            onOpenCalendar={() => handleTabChange('CALENDAR')}
            onOpenEnhancedHub={() => handleTabChange('ENHANCED')}
            onOpenErpSync={() => handleTabChange('ERP_SYNC')}
            onRefresh={handleRefresh}
            isEnhancedSuit={isEnhancedSuit}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'TIMETABLE' && (
          <TimetableScreen
            subjects={subjects}
            timetable={timetable}
            studentRollNo={activeRollNo}
            onAddSlot={(slot) => {
              const next = [...timetable, slot];
              setTimetable(next);
              StorageService.saveTimetable(next);
            }}
            onRefresh={handleRefresh}
            isEnhancedSuit={isEnhancedSuit}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'CALENDAR' && (
          <CalendarScreen
            subjects={subjects}
            timetable={timetable}
            studentRollNo={activeRollNo}
            onBack={() => handleTabChange('DASHBOARD')}
            onRefresh={handleRefresh}
            isEnhancedSuit={isEnhancedSuit}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'ERP_SYNC' && (
          <ReconcileScreen
            subjects={subjects}
            timetable={timetable}
            periodRecords={periodRecords}
            activeRollNo={activeRollNo}
            onUpdateAttendance={handleUpdateAttendance}
            onBatchUpdateSubjects={handleBatchUpdateSubjects}
            onRefresh={handleRefresh}
            isEnhancedSuit={isEnhancedSuit}
            isLightMode={isLightMode}
          />
        )}

        {activeTab === 'ENHANCED' && (
          <EnhancedHubScreen
            studentRollNo={activeRollNo}
            studentName={studentName}
            onRefresh={handleRefresh}
            isEnhancedSuit={isEnhancedSuit}
            isLightMode={isLightMode}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[
        styles.tabBar,
        isLightMode ? {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          borderTopWidth: 1,
        } : isEnhancedSuit && {
          backgroundColor: '#121212',
          borderTopColor: '#262626',
          borderTopWidth: 1.5,
        }
      ]}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.tabItem,
            activeTab === 'DASHBOARD' && (isLightMode ? { backgroundColor: '#EFF6FF' } : isEnhancedSuit ? { backgroundColor: '#050505' } : styles.tabItemActive)
          ]}
          onPress={() => handleTabChange('DASHBOARD')}
        >
          <Text style={styles.tabIcon}>⏱️</Text>
          <Text style={[
            styles.tabLabel,
            isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' },
            activeTab === 'DASHBOARD' && (isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit ? { color: '#10B981', fontWeight: '800' } : styles.tabLabelActive)
          ]}>
            Hourly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.tabItem,
            activeTab === 'TIMETABLE' && (isLightMode ? { backgroundColor: '#EFF6FF' } : isEnhancedSuit ? { backgroundColor: '#050505' } : styles.tabItemActive)
          ]}
          onPress={() => handleTabChange('TIMETABLE')}
        >
          <Text style={styles.tabIcon}>📑</Text>
          <Text
            style={[
              styles.tabLabel,
              isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' },
              activeTab === 'TIMETABLE' && (isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit ? { color: '#10B981', fontWeight: '800' } : styles.tabLabelActive)
            ]}
            numberOfLines={1}
          >
            Period Index
          </Text>
        </TouchableOpacity>

        {/* 3rd (Middle Tab): Enhanced */}
        {isEnhancedSuit && (
          <TouchableOpacity
            activeOpacity={0.7}
            style={[
              styles.tabItem,
              activeTab === 'ENHANCED' && (isLightMode ? { backgroundColor: '#EFF6FF' } : { backgroundColor: '#050505' })
            ]}
            onPress={() => handleTabChange('ENHANCED')}
          >
            <Text
              style={[
                styles.tabIcon,
                { fontSize: 14, fontWeight: '900', color: activeTab === 'ENHANCED' ? (isLightMode ? '#2B3990' : '#10B981') : (isLightMode ? '#64748B' : '#9CA3AF') }
              ]}
            >
              ★
            </Text>
            <Text
              style={[
                styles.tabLabel,
                { color: isLightMode ? '#64748B' : '#9CA3AF' },
                activeTab === 'ENHANCED' && { color: isLightMode ? '#2B3990' : '#10B981', fontWeight: '800' }
              ]}
              numberOfLines={1}
            >
              Enhanced
            </Text>
          </TouchableOpacity>
        )}

        {/* 4th Tab: Calendar */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.tabItem,
            activeTab === 'CALENDAR' && (isLightMode ? { backgroundColor: '#EFF6FF' } : isEnhancedSuit ? { backgroundColor: '#050505' } : styles.tabItemActive)
          ]}
          onPress={() => handleTabChange('CALENDAR')}
        >
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={[
            styles.tabLabel,
            isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' },
            activeTab === 'CALENDAR' && (isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit ? { color: '#10B981', fontWeight: '800' } : styles.tabLabelActive)
          ]}>
            Calendar
          </Text>
        </TouchableOpacity>

        {/* 5th Tab: Portals */}
        <TouchableOpacity
          activeOpacity={0.7}
          style={[
            styles.tabItem,
            activeTab === 'ERP_SYNC' && (isLightMode ? { backgroundColor: '#EFF6FF' } : isEnhancedSuit ? { backgroundColor: '#050505' } : styles.tabItemActive)
          ]}
          onPress={() => handleTabChange('ERP_SYNC')}
        >
          <Text style={styles.tabIcon}>🌐</Text>
          <Text
            style={[
              styles.tabLabel,
              isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' },
              activeTab === 'ERP_SYNC' && (isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit ? { color: '#10B981', fontWeight: '800' } : styles.tabLabelActive)
            ]}
            numberOfLines={1}
          >
            Portals
          </Text>
        </TouchableOpacity>
      </View>

      {/* Student Feedback & Improvement Suggestions Modal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        studentName={studentName}
        studentRollNo={activeRollNo}
        studentDob={getMasterStudent(activeRollNo)?.dob || ''}
        batch={getMasterStudent(activeRollNo)?.batch || 'A'}
        isLightMode={isLightMode}
      />

      {/* Secret Admin Dashboard Protected by PIN */}
      <AdminDashboardScreen
        visible={showAdminModal}
        onClose={() => setShowAdminModal(false)}
      />

      {/* Emergency Digital Student ID Modal */}
      <DigitalIdModal
        visible={showDigitalIdModal}
        onClose={() => setShowDigitalIdModal(false)}
        studentRollNo={activeRollNo}
        isLightMode={isLightMode}
      />

      {/* Academic Syllabus & Course Plan Modal */}
      <CoursePlanModal
        visible={showCoursePlanModal}
        onClose={() => setShowCoursePlanModal(false)}
        subjectCode="24GM11"
        subjectName="Management & Organisational Behaviour"
        studentRollNo={activeRollNo}
        allowSubjectSwitching={true}
      />

      {/* Attendance Dispute & Proof Report Dossier Modal */}
      <AttendanceDisputeModal
        visible={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        studentRollNo={activeRollNo}
        subjects={subjects}
        medicalClaims={medicalClaims}
      />

      {/* Karen Welcoming & Suit Guide Modal */}
      <KarenGuide
        visible={showKarenGuide}
        onClose={() => setShowKarenGuide(false)}
        studentName={studentName}
        isEnhancedSuit={isEnhancedSuit}
      />

      {/* Stark Protocol 5-Tap Video Easter Egg Modal */}
      <StarkVideoModal
        visible={showStarkVideoModal}
        onClose={() => setShowStarkVideoModal(false)}
        onSuitUnlocked={() => {
          setIsEnhancedSuit(true);
          // Automatically launch Karen Feature Guide immediately after video
          setTimeout(() => {
            setShowKarenGuide(true);
          }, 350);
        }}
      />
    </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  appHeader: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
    gap: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  headerLogoImg: {
    width: 26,
    height: 26,
    borderRadius: 7,
  },
  appName: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    flexShrink: 1,
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSubRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 41, 59, 0.6)',
  },
  appTagline: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  studentBadge: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    maxWidth: 170,
  },
  studentBadgeText: {
    color: '#93C5FD',
    fontSize: 11,
    fontWeight: '700',
  },
  adminHeaderBtn: {
    backgroundColor: 'rgba(99, 102, 241, 0.18)',
    borderWidth: 1,
    borderColor: '#6366F1',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adminHeaderBtnText: {
    color: '#818CF8',
    fontSize: 11,
    fontWeight: '700',
  },
  feedbackHeaderBtn: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  feedbackHeaderBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '700',
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0B1120',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    borderRadius: 10,
  },
  tabItemActive: {
    backgroundColor: '#1E293B',
  },
  tabIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabLabelActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  profileDropdownMenu: {
    marginTop: 10,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  profileDropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  profileDropdownTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  profileDropdownSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  profileDropdownDivider: {
    height: 1,
    backgroundColor: '#334155',
    marginHorizontal: 10,
  },
});
