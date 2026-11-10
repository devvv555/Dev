import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { FacultyMember, FacultyDataService } from '../data/psgimFacultyData';
import { FacultyAttendanceService, HourlyRollCallRecord } from '../services/facultyAttendanceService';
import { PsgimStudentInfo } from '../data/psgimMasterStudents';
import { ThemeManager } from '../constants/theme';

interface FacultyPortalScreenProps {
  visible: boolean;
  faculty: FacultyMember;
  onLogout: () => void;
  onClose?: () => void;
}

export const FacultyPortalScreen: React.FC<FacultyPortalScreenProps> = ({
  visible,
  faculty,
  onLogout,
  onClose,
}) => {
  const [themeMode, setThemeMode] = useState<string>(ThemeManager.getMode());
  const isLight = themeMode === 'LIGHT';

  // Day selector (Defaults to current day of week)
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const [selectedDay, setSelectedDay] = useState<string>(
    daysOfWeek.includes(todayDayName) ? todayDayName : 'Monday'
  );

  // Selected Slot for Roll Call
  const [activeSlot, setActiveSlot] = useState<any | null>(null);
  const [enrolledStudents, setEnrolledStudents] = useState<PsgimStudentInfo[]>([]);
  // Attendance map: key is collegeRollNo, value is 'present' | 'absent' | 'od'
  const [attendanceMap, setAttendanceMap] = useState<Record<string, 'present' | 'absent' | 'od'>>({});
  const [searchFilter, setSearchFilter] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessMsg, setSubmissionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const unsub = ThemeManager.subscribe(setThemeMode);
    return () => unsub();
  }, []);

  // Fetch faculty's schedule for selected day
  const scheduleSlots = FacultyDataService.getFacultySchedule(faculty.email, selectedDay);

  const handleOpenRollCall = async (slot: any) => {
    setActiveSlot(slot);
    setSearchFilter('');
    setSubmissionSuccessMsg(null);

    // Retrieve students for this course & batch
    const students = FacultyDataService.getStudentsForBatch(slot.courseKey, slot.batchCode);
    setEnrolledStudents(students);

    // Check if previously recorded today
    const todayStr = new Date().toISOString().split('T')[0];
    const prev = await FacultyAttendanceService.getSavedPeriodRecord(faculty.email, todayStr, slot.slotId);

    const initialMap: Record<string, 'present' | 'absent' | 'od'> = {};
    if (prev && prev.attendanceMap) {
      students.forEach((s) => {
        initialMap[s.collegeRollNo] = prev.attendanceMap[s.collegeRollNo] || 'present';
      });
    } else {
      // DEFAULT TO PRESENT (Fast Negative Marking)
      students.forEach((s) => {
        initialMap[s.collegeRollNo] = 'present';
      });
    }
    setAttendanceMap(initialMap);
  };

  const toggleStudentStatus = (rollNo: string) => {
    setAttendanceMap((prev) => {
      const current = prev[rollNo] || 'present';
      const nextStatus = current === 'present' ? 'absent' : current === 'absent' ? 'od' : 'present';
      return { ...prev, [rollNo]: nextStatus };
    });
  };

  const markAllPresent = () => {
    const nextMap: Record<string, 'present' | 'absent' | 'od'> = {};
    enrolledStudents.forEach((s) => {
      nextMap[s.collegeRollNo] = 'present';
    });
    setAttendanceMap(nextMap);
  };

  const handleSubmitAttendance = async () => {
    if (!activeSlot) return;

    setIsSubmitting(true);
    setSubmissionSuccessMsg(null);

    const todayStr = new Date().toISOString().split('T')[0];
    let presentCount = 0;
    let absentCount = 0;
    let odCount = 0;

    Object.values(attendanceMap).forEach((st) => {
      if (st === 'present') presentCount++;
      else if (st === 'absent') absentCount++;
      else if (st === 'od') odCount++;
    });

    const record: HourlyRollCallRecord = {
      periodId: activeSlot.slotId,
      date: todayStr,
      day: activeSlot.day,
      startTime: activeSlot.startTime,
      endTime: activeSlot.endTime,
      hours: activeSlot.hours || 1,
      courseKey: activeSlot.courseKey,
      courseTitle: activeSlot.courseTitle,
      batchCode: activeSlot.batchCode,
      room: activeSlot.room,
      facultyEmail: faculty.email,
      facultyName: faculty.name,
      submittedAt: Date.now(),
      totalStudents: enrolledStudents.length,
      presentCount,
      absentCount,
      odCount,
      attendanceMap,
    };

    const result = await FacultyAttendanceService.submitHourlyAttendance(record);
    setIsSubmitting(false);

    if (result.success) {
      setSubmissionSuccessMsg(result.message);
      setTimeout(() => {
        setActiveSlot(null);
        setSubmissionSuccessMsg(null);
      }, 1500);
    } else {
      Alert.alert('Submission Error', result.message);
    }
  };

  // Filter students by search term
  const filteredStudents = enrolledStudents.filter((s) => {
    const q = searchFilter.toLowerCase().trim();
    if (!q) return true;
    return (
      s.collegeRollNo.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.dRollNo && s.dRollNo.toLowerCase().includes(q))
    );
  });

  const absentList = enrolledStudents.filter((s) => attendanceMap[s.collegeRollNo] === 'absent');
  const odList = enrolledStudents.filter((s) => attendanceMap[s.collegeRollNo] === 'od');

  if (!visible) return null;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose || onLogout}>
      <SafeAreaView style={[styles.container, isLight && styles.containerLight]}>
        {/* Top Header */}
        <View style={[styles.header, isLight && styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.facultyBadge}>
                <Text style={styles.facultyBadgeText}>FACULTY PORTAL</Text>
              </View>
              <Text style={[styles.deptText, isLight && { color: '#64748B' }]}>{faculty.department}</Text>
            </View>
            <Text style={[styles.facultyName, isLight && { color: '#0F172A' }]} numberOfLines={1}>
              {faculty.name}
            </Text>
            <Text style={[styles.facultyEmail, isLight && { color: '#475569' }]}>{faculty.email}</Text>
          </View>

          <TouchableOpacity
            style={[styles.logoutBtn, isLight && styles.logoutBtnLight]}
            onPress={onLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutBtnText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {/* Day Selector Pills */}
        <View style={[styles.dayScrollWrapper, isLight && { borderBottomColor: '#E2E8F0' }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayScrollContent}>
            {daysOfWeek.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.dayPill,
                    isSelected && styles.dayPillActive,
                    isLight && !isSelected && styles.dayPillLight,
                  ]}
                  onPress={() => setSelectedDay(day)}
                >
                  <Text
                    style={[
                      styles.dayPillText,
                      isSelected && styles.dayPillTextActive,
                      isLight && !isSelected && { color: '#475569' },
                    ]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Schedule List */}
        <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentScrollInner}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isLight && { color: '#0F172A' }]}>
              Scheduled Periods for {selectedDay}
            </Text>
            <Text style={[styles.sectionSubtitle, isLight && { color: '#64748B' }]}>
              Tap "Take Hourly Attendance" to mark student roll-call for that hour.
            </Text>
          </View>

          {scheduleSlots.length === 0 ? (
            <View style={[styles.emptyCard, isLight && styles.emptyCardLight]}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>☕</Text>
              <Text style={[styles.emptyTitle, isLight && { color: '#0F172A' }]}>No Lectures Scheduled</Text>
              <Text style={[styles.emptySub, isLight && { color: '#64748B' }]}>
                You have no scheduled class periods on {selectedDay} in the MBA master timetable.
              </Text>
            </View>
          ) : (
            scheduleSlots.map((slot) => {
              const students = FacultyDataService.getStudentsForBatch(slot.courseKey, slot.batchCode);
              return (
                <View
                  key={slot.slotId}
                  style={[styles.slotCard, isLight && styles.slotCardLight]}
                >
                  <View style={styles.slotCardHeader}>
                    <View style={styles.timeBadge}>
                      <Text style={styles.timeBadgeText}>
                        🕒 {slot.startTime} – {slot.endTime}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                      <View style={[styles.hoursBadge, { backgroundColor: slot.hours > 1 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(56, 189, 248, 0.15)', borderColor: slot.hours > 1 ? '#F59E0B' : '#38BDF8' }]}>
                        <Text style={[styles.hoursBadgeText, { color: slot.hours > 1 ? '#F59E0B' : '#38BDF8' }]}>
                          ⏱️ {slot.hours} {slot.hours === 1 ? 'Hour' : 'Hours'} Block
                        </Text>
                      </View>
                      <View style={[styles.roomBadge, isLight && { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }]}>
                        <Text style={[styles.roomBadgeText, isLight && { color: '#2B3990' }]}>📍 {slot.room}</Text>
                      </View>
                    </View>
                  </View>

                  <Text style={[styles.courseTitle, isLight && { color: '#0F172A' }]}>{slot.courseTitle}</Text>
                  <View style={styles.slotMetaRow}>
                    <Text style={[styles.slotMetaText, isLight && { color: '#475569' }]}>
                      Batch: <Text style={{ fontWeight: '800', color: isLight ? '#0F172A' : '#38BDF8' }}>{slot.batchCode}</Text>
                    </Text>
                    <Text style={{ color: '#64748B' }}>•</Text>
                    <Text style={[styles.slotMetaText, isLight && { color: '#475569' }]}>
                      Duration: <Text style={{ fontWeight: '800', color: isLight ? '#0F172A' : '#F59E0B' }}>{slot.hours} {slot.hours === 1 ? 'Academic Hour' : 'Academic Hours'}</Text>
                    </Text>
                    <Text style={{ color: '#64748B' }}>•</Text>
                    <Text style={[styles.slotMetaText, isLight && { color: '#475569' }]}>
                      Enrolled: <Text style={{ fontWeight: '800', color: isLight ? '#0F172A' : '#10B981' }}>{students.length} Students</Text>
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.takeAttendanceBtn}
                    onPress={() => handleOpenRollCall(slot)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.takeAttendanceBtnText}>📋 Take Hourly Attendance</Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}

          {/* Quick Info Box */}
          <View style={[styles.infoBanner, isLight && styles.infoBannerLight]}>
            <Text style={[styles.infoBannerTitle, isLight && { color: '#0F172A' }]}>⚡ Negative-Marking Principle</Text>
            <Text style={[styles.infoBannerText, isLight && { color: '#475569' }]}>
              All enrolled students in the batch start as <Text style={{ color: '#10B981', fontWeight: '800' }}>PRESENT</Text>. Simply tap on any absent student to switch them to <Text style={{ color: '#EF4444', fontWeight: '800' }}>ABSENT</Text> or <Text style={{ color: '#F59E0B', fontWeight: '800' }}>ON DUTY (OD)</Text>.
            </Text>
          </View>
        </ScrollView>

        {/* ── ROLL CALL MODAL ── */}
        {activeSlot && (
          <Modal visible={!!activeSlot} animationType="slide" onRequestClose={() => setActiveSlot(null)}>
            <SafeAreaView style={[styles.modalContainer, isLight && styles.modalContainerLight]}>
              {/* Modal Header */}
              <View style={[styles.modalHeader, isLight && styles.modalHeaderLight]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.modalTitle, isLight && { color: '#0F172A' }]}>
                    {activeSlot.courseKey} • {activeSlot.batchCode}
                  </Text>
                  <Text style={[styles.modalSubtitle, isLight && { color: '#64748B' }]}>
                    {activeSlot.startTime} – {activeSlot.endTime} ({activeSlot.hours} {activeSlot.hours === 1 ? 'hr' : 'hrs'}) • {activeSlot.room} • {enrolledStudents.length} Students
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.closeModalBtn, isLight && styles.closeModalBtnLight]}
                  onPress={() => setActiveSlot(null)}
                >
                  <Text style={[styles.closeModalBtnText, isLight && { color: '#0F172A' }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Status Counters */}
              <View style={styles.statsSummaryRow}>
                <View style={[styles.statBox, { borderColor: '#10B981' }]}>
                  <Text style={[styles.statNum, { color: '#10B981' }]}>
                    {enrolledStudents.length - absentList.length - odList.length}
                  </Text>
                  <Text style={styles.statLabel}>PRESENT</Text>
                </View>
                <View style={[styles.statBox, { borderColor: '#EF4444' }]}>
                  <Text style={[styles.statNum, { color: '#EF4444' }]}>{absentList.length}</Text>
                  <Text style={styles.statLabel}>ABSENT</Text>
                </View>
                <View style={[styles.statBox, { borderColor: '#F59E0B' }]}>
                  <Text style={[styles.statNum, { color: '#F59E0B' }]}>{odList.length}</Text>
                  <Text style={styles.statLabel}>ON DUTY</Text>
                </View>
              </View>

              {/* Search & Reset */}
              <View style={styles.searchRow}>
                <TextInput
                  style={[styles.searchInput, isLight && styles.searchInputLight]}
                  placeholder="Search by Roll No or Name..."
                  placeholderTextColor="#64748B"
                  value={searchFilter}
                  onChangeText={setSearchFilter}
                  autoCapitalize="characters"
                />
                <TouchableOpacity style={styles.markAllBtn} onPress={markAllPresent}>
                  <Text style={styles.markAllBtnText}>Reset All</Text>
                </TouchableOpacity>
              </View>

              {/* Student Roster List */}
              <ScrollView style={styles.rosterScroll} keyboardShouldPersistTaps="handled">
                {filteredStudents.map((student) => {
                  const status = attendanceMap[student.collegeRollNo] || 'present';
                  const isPresent = status === 'present';
                  const isAbsent = status === 'absent';
                  const isOd = status === 'od';

                  return (
                    <TouchableOpacity
                      key={student.collegeRollNo}
                      style={[
                        styles.studentRow,
                        isLight && styles.studentRowLight,
                        isPresent && styles.studentRowPresent,
                        isAbsent && styles.studentRowAbsent,
                        isOd && styles.studentRowOd,
                      ]}
                      onPress={() => toggleStudentStatus(student.collegeRollNo)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Text style={[styles.studentRollText, isLight && { color: '#0F172A' }]}>
                            {student.collegeRollNo}
                          </Text>
                          {student.dRollNo && (
                            <Text style={{ fontSize: 11, color: '#64748B' }}>({student.dRollNo})</Text>
                          )}
                        </View>
                        <Text style={[styles.studentNameText, isLight && { color: '#475569' }]} numberOfLines={1}>
                          {student.name}
                        </Text>
                      </View>

                      {/* Status Button Badge */}
                      <View
                        style={[
                          styles.statusToggleBadge,
                          isPresent && { backgroundColor: '#10B98120', borderColor: '#10B981' },
                          isAbsent && { backgroundColor: '#EF444420', borderColor: '#EF4444' },
                          isOd && { backgroundColor: '#F59E0B20', borderColor: '#F59E0B' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusToggleText,
                            isPresent && { color: '#10B981' },
                            isAbsent && { color: '#EF4444' },
                            isOd && { color: '#F59E0B' },
                          ]}
                        >
                          {isPresent ? '✓ PRESENT' : isAbsent ? '✕ ABSENT' : '★ OD'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Success Notification */}
              {submissionSuccessMsg && (
                <View style={styles.successToast}>
                  <Text style={styles.successToastText}>{submissionSuccessMsg}</Text>
                </View>
              )}

              {/* Bottom Submit Bar */}
              <View style={[styles.bottomBar, isLight && styles.bottomBarLight]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bottomBarTitle, isLight && { color: '#0F172A' }]}>
                    {absentList.length === 0
                      ? 'All students present'
                      : `${absentList.length} Absent: ${absentList.map((s) => s.collegeRollNo).join(', ')}`}
                  </Text>
                  <Text style={{ fontSize: 11, color: '#64748B' }}>
                    Tapping broadcast pushes attendance immediately to students.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.submitRosterBtn, isSubmitting && { opacity: 0.6 }]}
                  onPress={handleSubmitAttendance}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.submitRosterBtnText}>Submit & Broadcast</Text>
                  )}
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </Modal>
        )}
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  containerLight: {
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#1E293B',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
  },
  facultyBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  facultyBadgeText: {
    color: '#38BDF8',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  deptText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
  },
  facultyName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginTop: 4,
  },
  facultyEmail: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 1,
  },
  logoutBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  logoutBtnLight: {
    backgroundColor: '#FEE2E2',
    borderColor: '#F87171',
  },
  logoutBtnText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '700',
  },
  dayScrollWrapper: {
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 8,
  },
  dayScrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  dayPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayPillLight: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  dayPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  dayPillText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  dayPillTextActive: {
    color: '#FFFFFF',
  },
  contentScroll: {
    flex: 1,
  },
  contentScrollInner: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 20,
  },
  emptyCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  emptySub: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  slotCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  slotCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    shadowColor: '#64748B',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  slotCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  timeBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  hoursBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
  },
  hoursBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  roomBadge: {
    backgroundColor: '#0F172A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#334155',
  },
  roomBadgeText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  courseTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  slotMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  slotMetaText: {
    fontSize: 12.5,
    color: '#94A3B8',
  },
  takeAttendanceBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  takeAttendanceBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  infoBanner: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    marginTop: 10,
  },
  infoBannerLight: {
    backgroundColor: '#EFF6FF',
    borderColor: '#DBEAFE',
  },
  infoBannerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#38BDF8',
    marginBottom: 4,
  },
  infoBannerText: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
  },

  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  modalContainerLight: {
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#1E293B',
  },
  modalHeaderLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeModalBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeModalBtnLight: {
    backgroundColor: '#E2E8F0',
  },
  closeModalBtnText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    padding: 12,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
  },
  statNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#94A3B8',
    marginTop: 2,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#F8FAFC',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  searchInputLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
    color: '#0F172A',
  },
  markAllBtn: {
    backgroundColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  markAllBtnText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '700',
  },
  rosterScroll: {
    flex: 1,
    paddingHorizontal: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 8,
  },
  studentRowLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  studentRowPresent: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  studentRowAbsent: {
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  studentRowOd: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
  },
  studentRollText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  studentNameText: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusToggleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  statusToggleText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  successToast: {
    backgroundColor: '#10B981',
    padding: 10,
    alignItems: 'center',
  },
  successToastText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  bottomBarLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
  },
  bottomBarTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  submitRosterBtn: {
    backgroundColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitRosterBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});
