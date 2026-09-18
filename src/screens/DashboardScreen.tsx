import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Subject, TimetableSlot } from '../types';
import { calculateOverallMetrics } from '../services/attendanceEngine';
import { AttendanceGauge } from '../components/AttendanceGauge';
import { SubjectCard } from '../components/SubjectCard';
import { PsgimService } from '../services/psgimService';

interface DashboardScreenProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  studentRollNo: string;
  studentName: string;
  onUpdateSubject: (subject: Subject) => void;
  onToggleMedicalClaim: (id: string) => void;
  onQuickAttend: (id: string) => void;
  onQuickBunk: (id: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  subjects,
  timetable,
  studentRollNo,
  studentName,
  onUpdateSubject,
  onToggleMedicalClaim,
  onQuickAttend,
  onQuickBunk,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'SHORTAGE' | 'MEDICAL' | 'SAFE'>('ALL');
  const [showSimulatorModal, setShowSimulatorModal] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);

  const overall = calculateOverallMetrics(subjects);
  const profile = PsgimService.getStudentProfile(studentRollNo);

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

  const slotStatus = getSlotStatus();

  const handleAutoRecord = (status: 'attended' | 'bunked' | 'cancelled') => {
    if (!currentSubject) return;
    if (status === 'attended') {
      onQuickAttend(currentSubject.id);
      Alert.alert('Logged Present ✅', `+1 hour added for ${currentSubject.name}! Attendance updated.`);
    } else if (status === 'bunked') {
      onQuickBunk(currentSubject.id);
      Alert.alert('Logged Bunk ❌', `Bunk logged for ${currentSubject.name}. Safe bunk allowance recalculated.`);
    } else {
      Alert.alert('Class Cancelled ⚪', `${currentSubject.name} hour skipped without affecting percentage.`);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
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
              {studentName !== studentRollNo ? studentName : studentRollNo}
            </Text>
            <Text style={styles.welcomeSub}>
              Roll No: <Text style={styles.welcomeRoll}>{studentRollNo}</Text>
              {profile.dRollNo && profile.dRollNo !== studentRollNo ? ` • ID: ${profile.dRollNo}` : ''} • {profile.section} • PSG MBA (2026–28)
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
              return (
                <TouchableOpacity
                  key={idx}
                  activeOpacity={0.7}
                  onPress={() => setSelectedSlotIndex(idx)}
                  style={[
                    styles.periodPill,
                    isSelected ? styles.periodPillActive : styles.periodPillInactive,
                  ]}
                >
                  <Text style={[styles.periodPillTime, isSelected && styles.periodPillTextActive]}>
                    {slot.startTime}
                  </Text>
                  <Text style={[styles.periodPillCode, isSelected && styles.periodPillTextActive]}>
                    {sub?.code || slot.subjectId.replace('sub_', '').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* 1-Tap Attendance Actions */}
        <View style={styles.promptActionsRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.promptActionBtn, styles.promptAttendBtn]}
            onPress={() => handleAutoRecord('attended')}
          >
            <Text style={styles.promptAttendText}>✅ I Attended</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.promptActionBtn, styles.promptBunkBtn]}
            onPress={() => handleAutoRecord('bunked')}
          >
            <Text style={styles.promptBunkText}>❌ I Bunked</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[styles.promptActionBtn, styles.promptCancelBtn]}
            onPress={() => handleAutoRecord('cancelled')}
          >
            <Text style={styles.promptCancelText}>⚪ Free / Cancelled</Text>
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
          onQuickAttend={onQuickAttend}
          onQuickBunk={onQuickBunk}
        />
      ))}
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
});
