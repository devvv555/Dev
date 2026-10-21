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
import { toNewRollNo, getMasterStudent } from './src/data/psgimMasterStudents';
import { CloudSyncService } from './src/services/cloudSyncService';
import { getSlotHours } from './src/services/attendanceEngine';
import AsyncStorage from '@react-native-async-storage/async-storage';


type Tab = 'DASHBOARD' | 'TIMETABLE' | 'CALENDAR' | 'ERP_SYNC';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [activeRollNo, setActiveRollNo] = useState<string>('');

  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [showAdminModal, setShowAdminModal] = useState<boolean>(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [medicalClaims, setMedicalClaims] = useState<MedicalClaimRecord[]>(INITIAL_MEDICAL_CLAIMS);
  const [periodRecords, setPeriodRecords] = useState<Record<string, PeriodAttendanceRecord>>({});

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
          const officialRoll = toNewRollNo(savedRollNo);
          setActiveRollNo(officialRoll);
          const initialSubjects = PsgimService.generateSubjectsForStudent(officialRoll);
          const initialTimetable = PsgimService.generateTimetableForStudent(officialRoll);

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

          setSubjects(initialSubjects);
          setTimetable(initialTimetable);
          const storedRecords = await StorageService.getPeriodRecords(officialRoll);
          setPeriodRecords(storedRecords);

          // Sync with latest cloud updates (e.g. from Teacher Google Sheets)
          const cloudSubjects = await CloudSyncService.fetchCloudSubjects(officialRoll);
          if (cloudSubjects && cloudSubjects.length > 0) {
            setSubjects(cloudSubjects);
            await StorageService.saveSubjects(cloudSubjects);
          }

          const cloudPeriods = await CloudSyncService.fetchCloudPeriodRecords(officialRoll);
          if (cloudPeriods && Object.keys(cloudPeriods).length > 0) {
            const mergedRecords = { ...storedRecords, ...cloudPeriods };
            setPeriodRecords(mergedRecords);
            await StorageService.savePeriodRecords(officialRoll, mergedRecords);
          }

          setIsAuthenticated(true);

          const student = getMasterStudent(officialRoll);
          AnalyticsService.recordLogin(officialRoll, student?.name || '', student?.batch || 'A');
          CloudSyncService.syncStudentProfile(officialRoll, student?.name || '', student?.batch || 'A');
        }

        const storedMed = await StorageService.getMedicalClaims();
        setMedicalClaims(storedMed);

        await NotificationService.requestPermissions();
        await NotificationService.setupNotificationCategories();
      } catch (e) {
        console.warn('Init session error:', e);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    initSession();

    // 🌟 Global Real-time Listener (Mount once):
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

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
    const featureMap: Record<Tab, 'HOURLY' | 'TIMETABLE' | 'CALENDAR' | 'ERP_SYNC'> = {
      DASHBOARD: 'HOURLY',
      TIMETABLE: 'TIMETABLE',
      CALENDAR: 'CALENDAR',
      ERP_SYNC: 'ERP_SYNC',
    };
    AnalyticsService.recordFeatureVisit(featureMap[newTab] as any);
  };

  // Login handler
  const handleLoginSuccess = async (rollNo: string) => {
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

    setActiveRollNo(rollNo);
    setSubjects(studentSubjects);
    setTimetable(studentTimetable);
    setPeriodRecords(storedRecords);
    setIsAuthenticated(true);
    await StorageService.setAuthUser(rollNo);

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
      }
    } catch (e) {
      console.warn('Error saving faculty override:', e);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await StorageService.clearAuthUser();
    setIsAuthenticated(false);
    setActiveRollNo('');
    setPeriodRecords({});
    setActiveTab('DASHBOARD');
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

    const newRecord: PeriodAttendanceRecord = {
      periodKey,
      date,
      slotId: slot.id,
      subjectId: slot.subjectId,
      status: newStatus,
      hours: slotHours,
      recordedAt: Date.now(),
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
    StorageService.saveSubjects(next);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, next);
    }
  };

  // Batch update subjects (e.g. from Studzone automated extraction)
  const handleBatchUpdateSubjects = (updatedSubjects: Subject[]) => {
    setSubjects(updatedSubjects);
    StorageService.saveSubjects(updatedSubjects);
    if (activeRollNo) {
      CloudSyncService.syncSubjects(activeRollNo, updatedSubjects);
    }
  };

  // Full-app refresh handler (triggered by pull-down / slide up to down)
  const handleRefresh = async () => {
    try {
      if (activeRollNo) {
        const studentSubjects = PsgimService.generateSubjectsForStudent(activeRollNo);
        const studentTimetable = PsgimService.generateTimetableForStudent(activeRollNo);
        const storedRecords = await StorageService.getPeriodRecords(activeRollNo);
        const storedMed = await StorageService.getMedicalClaims();

        setSubjects(studentSubjects);
        setTimetable(studentTimetable);
        setPeriodRecords(storedRecords);
        setMedicalClaims(storedMed);

        // Fetch cloud-persisted subjects if available
        const cloudSubjects = await CloudSyncService.fetchCloudSubjects(activeRollNo);
        if (cloudSubjects && cloudSubjects.length > 0) {
          setSubjects(cloudSubjects);
          await StorageService.saveSubjects(cloudSubjects);
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

  // If not logged in, display Sign In screen
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <AuthScreen
          onLoginSuccess={handleLoginSuccess}
          onAdminLogin={() => setShowAdminModal(true)}
        />
        {showAdminModal && (
          <AdminDashboardScreen
            visible={showAdminModal}
            onClose={() => setShowAdminModal(false)}
            initiallyAuthenticated={true}
          />
        )}
      </SafeAreaProvider>
    );
  }

  const activeMedCount = subjects.filter((s) => s.hasMedicalClaim).length;
  const studentName = PsgimService.getStudentName(activeRollNo);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Main Top Header (Balanced 2-Row Clean Layout) */}
      <View style={styles.appHeader}>
        {/* Row 1: Brand Logo & Title + Actions */}
        <View style={styles.headerTopRow}>
          <View style={styles.brandContainer}>
            <Image
              source={require('./assets/icon.png')}
              style={styles.headerLogoImg}
              resizeMode="cover"
            />
            <Text style={styles.appName} numberOfLines={1}>
              PSGIM One
            </Text>
          </View>

          <View style={styles.headerActionsRow}>
            <TouchableOpacity
              style={styles.feedbackHeaderBtn}
              onPress={() => setShowFeedbackModal(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.feedbackHeaderBtnText}>💡 Feedback</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.logoutBtn}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Text style={styles.logoutBtnText}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Row 2: Cohort Sub-bar & Logged In Student Identity */}
        <View style={styles.headerSubRow}>
          <Text style={styles.appTagline}>PSGIM Campus Super-App • I MBA</Text>
          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText} numberOfLines={1}>
              👤 {studentName || 'Student'}
            </Text>
          </View>
        </View>
      </View>

      {/* Main Content View */}
      <View style={styles.screenContainer}>
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
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'TIMETABLE' && (
          <TimetableScreen
            subjects={subjects}
            timetable={timetable}
            onAddSlot={(slot) => {
              const next = [...timetable, slot];
              setTimetable(next);
              StorageService.saveTimetable(next);
            }}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'CALENDAR' && (
          <CalendarScreen
            subjects={subjects}
            timetable={timetable}
            onBack={() => handleTabChange('DASHBOARD')}
            onRefresh={handleRefresh}
          />
        )}

        {activeTab === 'ERP_SYNC' && (
          <ReconcileScreen
            subjects={subjects}
            timetable={timetable}
            activeRollNo={activeRollNo}
            onUpdateAttendance={handleUpdateAttendance}
            onBatchUpdateSubjects={handleBatchUpdateSubjects}
            onRefresh={handleRefresh}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'DASHBOARD' && styles.tabItemActive]}
          onPress={() => handleTabChange('DASHBOARD')}
        >
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === 'DASHBOARD' && styles.tabLabelActive]}>
            Hourly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'TIMETABLE' && styles.tabItemActive]}
          onPress={() => handleTabChange('TIMETABLE')}
        >
          <Text style={styles.tabIcon}>🗂️</Text>
          <Text
            style={[styles.tabLabel, activeTab === 'TIMETABLE' && styles.tabLabelActive]}
            numberOfLines={1}
          >
            Period Index
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'CALENDAR' && styles.tabItemActive]}
          onPress={() => handleTabChange('CALENDAR')}
        >
          <Text style={styles.tabIcon}>🗓️</Text>
          <Text style={[styles.tabLabel, activeTab === 'CALENDAR' && styles.tabLabelActive]}>
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'ERP_SYNC' && styles.tabItemActive]}
          onPress={() => handleTabChange('ERP_SYNC')}
        >
          <Text style={styles.tabIcon}>🌐</Text>
          <Text
            style={[styles.tabLabel, activeTab === 'ERP_SYNC' && styles.tabLabelActive]}
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
      />

      {/* Secret Admin Dashboard Protected by PIN */}
      <AdminDashboardScreen
        visible={showAdminModal}
        onClose={() => setShowAdminModal(false)}
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
  feedbackHeaderBtn: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    borderWidth: 1,
    borderColor: '#EAB308',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  feedbackHeaderBtnText: {
    color: '#FDE047',
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
});
