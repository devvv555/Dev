import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Subject, TimetableSlot, MedicalClaimRecord, PeriodAttendanceRecord, AttendanceStatus } from './src/types';
import { StorageService, INITIAL_MEDICAL_CLAIMS } from './src/services/storageService';
import { NotificationService } from './src/services/notificationService';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { TimetableScreen } from './src/screens/TimetableScreen';
import { MedicalVaultScreen } from './src/screens/MedicalVaultScreen';
import { ReconcileScreen } from './src/screens/ReconcileScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { PsgimService } from './src/services/psgimService';
import { toNewRollNo } from './src/data/psgimMasterStudents';

type Tab = 'DASHBOARD' | 'TIMETABLE' | 'MEDICAL' | 'ERP_SYNC';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [activeRollNo, setActiveRollNo] = useState<string>('');

  const [activeTab, setActiveTab] = useState<Tab>('DASHBOARD');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [medicalClaims, setMedicalClaims] = useState<MedicalClaimRecord[]>(INITIAL_MEDICAL_CLAIMS);
  const [periodRecords, setPeriodRecords] = useState<Record<string, PeriodAttendanceRecord>>({});

  // Check saved session on launch
  useEffect(() => {
    async function initSession() {
      try {
        const savedRollNo = await StorageService.getAuthUser();
        if (savedRollNo && PsgimService.getStudent(savedRollNo)) {
          const officialRoll = toNewRollNo(savedRollNo);
          setActiveRollNo(officialRoll);
          setSubjects(PsgimService.generateSubjectsForStudent(officialRoll));
          setTimetable(PsgimService.generateTimetableForStudent(officialRoll));
          const storedRecords = await StorageService.getPeriodRecords(officialRoll);
          setPeriodRecords(storedRecords);
          setIsAuthenticated(true);
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
  }, []);

  // Login handler
  const handleLoginSuccess = async (rollNo: string) => {
    const studentSubjects = PsgimService.generateSubjectsForStudent(rollNo);
    const studentTimetable = PsgimService.generateTimetableForStudent(rollNo);
    const storedRecords = await StorageService.getPeriodRecords(rollNo);

    setActiveRollNo(rollNo);
    setSubjects(studentSubjects);
    setTimetable(studentTimetable);
    setPeriodRecords(storedRecords);
    setIsAuthenticated(true);
    await StorageService.setAuthUser(rollNo);
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

    // Compute delta to correctly adjust attendance totals without duplicate increments
    let deltaAttended = 0;
    let deltaTotal = 0;

    if (!existing) {
      // First time recording this period
      if (newStatus === 'attended') {
        deltaAttended = 1;
        deltaTotal = 1;
      } else if (newStatus === 'bunked') {
        deltaAttended = 0;
        deltaTotal = 1;
      } else if (newStatus === 'cancelled') {
        deltaAttended = 0;
        deltaTotal = 0;
      }
    } else {
      // Correcting/switching previously recorded status
      if (existing.status === 'attended') {
        deltaAttended -= 1;
        deltaTotal -= 1;
      } else if (existing.status === 'bunked') {
        deltaTotal -= 1;
      }

      if (newStatus === 'attended') {
        deltaAttended += 1;
        deltaTotal += 1;
      } else if (newStatus === 'bunked') {
        deltaTotal += 1;
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

    const isChange = Boolean(existing);
    return {
      success: true,
      message: isChange
        ? `Status updated from ${existing?.status.toUpperCase()} to ${newStatus.toUpperCase()}. Totals adjusted accurately.`
        : `Marked as ${newStatus.toUpperCase()} for ${subject.name}. (Period locked)`,
      isChange,
    };
  };

  // Update subject helper
  const handleUpdateSubject = (updated: Subject) => {
    const next = subjects.map((s) => (s.id === updated.id ? updated : s));
    setSubjects(next);
    StorageService.saveSubjects(next);
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
  };

  // Add new Medical Claim record
  const handleAddMedicalClaim = (claim: MedicalClaimRecord) => {
    const next = [claim, ...medicalClaims];
    setMedicalClaims(next);
    StorageService.saveMedicalClaims(next);
  };

  // Update official ERP baseline for weekly sync
  const handleUpdateSubjectOfficial = (subjectId: string, officialAttended: number, officialTotal: number) => {
    const next = subjects.map((s) => {
      if (s.id === subjectId) {
        return {
          ...s,
          officialAttended,
          officialTotal,
          lastOfficialUpdate: new Date().toISOString().split('T')[0],
        };
      }
      return s;
    });
    setSubjects(next);
    StorageService.saveSubjects(next);
  };

  // Loading spinner during auth check
  if (isCheckingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  // If not logged in, display Sign In screen
  if (!isAuthenticated) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const activeMedCount = subjects.filter((s) => s.hasMedicalClaim).length;
  const studentName = PsgimService.getStudentName(activeRollNo);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Main Top Header */}
      <View style={styles.appHeader}>
        <View style={styles.appHeaderLeft}>
          <Text style={styles.appLogo}>🏛️</Text>
          <View>
            <Text style={styles.appName}>PSG Institute of Management</Text>
            <Text style={styles.appTagline}>I MBA (2026–28) • Semester 1</Text>
          </View>
        </View>

        {/* Logged in student badge & Logout button */}
        <View style={styles.userProfileRow}>
          <View style={styles.studentBadge}>
            <Text style={styles.studentBadgeText}>🎓 {activeRollNo}</Text>
            {studentName !== activeRollNo && (
              <Text style={styles.studentNameBadgeText} numberOfLines={1}>
                {studentName}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
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
            onUpdateSubject={handleUpdateSubject}
            onToggleMedicalClaim={handleToggleMedicalClaim}
            onQuickAttend={handleQuickAttend}
            onQuickBunk={handleQuickBunk}
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
          />
        )}

        {activeTab === 'MEDICAL' && (
          <MedicalVaultScreen
            subjects={subjects}
            medicalClaims={medicalClaims}
            onToggleMedicalClaim={handleToggleMedicalClaim}
            onAddMedicalClaim={handleAddMedicalClaim}
          />
        )}

        {activeTab === 'ERP_SYNC' && (
          <ReconcileScreen
            subjects={subjects}
            onUpdateSubjectOfficial={handleUpdateSubjectOfficial}
          />
        )}
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'DASHBOARD' && styles.tabItemActive]}
          onPress={() => setActiveTab('DASHBOARD')}
        >
          <Text style={styles.tabIcon}>⚡</Text>
          <Text style={[styles.tabLabel, activeTab === 'DASHBOARD' && styles.tabLabelActive]}>
            Hourly
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'TIMETABLE' && styles.tabItemActive]}
          onPress={() => setActiveTab('TIMETABLE')}
        >
          <Text style={styles.tabIcon}>📅</Text>
          <Text style={[styles.tabLabel, activeTab === 'TIMETABLE' && styles.tabLabelActive]}>
            Timetable
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'MEDICAL' && styles.tabItemActive]}
          onPress={() => setActiveTab('MEDICAL')}
        >
          <Text style={styles.tabIcon}>🏥</Text>
          <Text style={[styles.tabLabel, activeTab === 'MEDICAL' && styles.tabLabelActive]}>
            Med (65%)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          style={[styles.tabItem, activeTab === 'ERP_SYNC' && styles.tabItemActive]}
          onPress={() => setActiveTab('ERP_SYNC')}
        >
          <Text style={styles.tabIcon}>🔄</Text>
          <Text style={[styles.tabLabel, activeTab === 'ERP_SYNC' && styles.tabLabelActive]}>
            ERP Sync
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  appHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  appLogo: {
    fontSize: 24,
  },
  appName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  appTagline: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
  },
  userProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  studentBadge: {
    backgroundColor: '#1E293B',
    borderColor: '#3B82F6',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  studentBadgeText: {
    color: '#93C5FD',
    fontSize: 12,
    fontWeight: '700',
  },
  studentNameBadgeText: {
    color: '#CBD5E1',
    fontSize: 10,
    fontWeight: '600',
    maxWidth: 120,
  },
  logoutBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 4,
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
    fontSize: 11,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#38BDF8',
    fontWeight: '700',
  },
});
