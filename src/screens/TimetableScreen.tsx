import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Vibration,
} from 'react-native';
import { DayOfWeek, Subject, TimetableSlot } from '../types';
import { toNewRollNo } from '../data/psgimMasterStudents';

interface TimetableScreenProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  studentRollNo?: string;
  onAddSlot?: (slot: TimetableSlot) => void;
  onRefresh?: () => Promise<void> | void;
  isEnhancedSuit?: boolean;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const getTodayDayOfWeek = (): DayOfWeek => {
  const dayIndex = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  if (dayIndex === 0) {
    return 'Monday'; // Default to Monday on Sundays
  }
  const days: DayOfWeek[] = ['Monday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[dayIndex] || 'Monday';
};

export const TimetableScreen: React.FC<TimetableScreenProps> = ({
  subjects,
  timetable,
  studentRollNo,
  onRefresh,
  isEnhancedSuit = false,
}) => {
  const todayDay = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDay);
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
      console.warn('Timetable refresh error:', e);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  };

  const daySlots = timetable.filter((s) => s.day === selectedDay);

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

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
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, isEnhancedSuit && { color: '#F4E8C1' }]}>Weekly Period Index</Text>
          {studentRollNo ? (
            <View style={[styles.rollBadge, isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#F4E8C1' }]}>
              <Text style={[styles.rollBadgeText, isEnhancedSuit && { color: '#F4E8C1' }]}>Roll No: {toNewRollNo(studentRollNo)}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.headerSubtitle, isEnhancedSuit && { color: '#C5BA9D' }]}>
          {studentRollNo ? `Roll No: ${toNewRollNo(studentRollNo)} • ` : ''}Showing {selectedDay}'s schedule{selectedDay === todayDay ? ' (Today)' : ''}. Hourly attendance alerts trigger at the end of each slot.
        </Text>
      </View>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const isToday = day === todayDay;
          return (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[
                styles.dayButton,
                isSelected && styles.dayButtonActive,
                isToday && !isSelected && styles.dayButtonToday,
                isEnhancedSuit && (
                  isSelected
                    ? { backgroundColor: '#F4E8C1', borderColor: '#F4E8C1' }
                    : { backgroundColor: '#1C2541', borderColor: isToday ? '#F4E8C1' : '#2A3B5C' }
                )
              ]}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.dayTextActive,
                isEnhancedSuit && (
                  isSelected
                    ? { color: '#0B132B', fontWeight: '800' }
                    : { color: '#F4E8C1' }
                )
              ]}>
                {day.slice(0, 3)}{isToday ? ' •' : ''}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Slots List */}
      <View style={styles.slotsContainer}>
        {daySlots.length === 0 ? (
          <View style={[styles.emptyCard, isEnhancedSuit && { backgroundColor: '#1C2541', borderColor: '#2A3B5C' }]}>
            <Text style={[styles.emptyTitle, isEnhancedSuit && { color: '#F4E8C1' }]}>No periods scheduled for {selectedDay}</Text>
            <Text style={[styles.emptySub, isEnhancedSuit && { color: '#C5BA9D' }]}>Enjoy your day off!</Text>
          </View>
        ) : (
          daySlots.map((slot) => {
            const subject = getSubject(slot.subjectId);
            const isSports = subject?.noAttendance || subject?.code === 'SPORTS' || slot.subjectId === 'sub_sports';
            return (
              <View
                key={slot.id}
                style={[
                  styles.slotCard,
                  isEnhancedSuit && { backgroundColor: '#1C2541', borderColor: '#2A3B5C' }
                ]}
              >
                <View style={[styles.timeColumn, isEnhancedSuit && { backgroundColor: '#0B132B' }]}>
                  <Text style={[styles.timeStart, isEnhancedSuit && { color: '#F4E8C1' }]}>{slot.startTime}</Text>
                  <View style={[styles.timeDivider, isEnhancedSuit && { backgroundColor: '#2A3B5C' }]} />
                  <Text style={[styles.timeEnd, isEnhancedSuit && { color: '#C5BA9D' }]}>{slot.endTime}</Text>
                </View>

                <View style={[styles.slotInfo, { borderLeftColor: isEnhancedSuit ? '#F4E8C1' : (subject?.color || '#3B82F6') }]}>
                  <View style={styles.slotTopRow}>
                    <Text style={[styles.subjectCode, isEnhancedSuit && { color: '#F4E8C1' }]}>{subject?.code || 'GEN'}</Text>
                    {isSports ? (
                      <View style={[
                        styles.roomBadge,
                        { backgroundColor: 'rgba(99, 102, 241, 0.18)', borderColor: '#6366F1' },
                        isEnhancedSuit && { backgroundColor: 'rgba(244, 232, 193, 0.15)', borderColor: '#F4E8C1' }
                      ]}>
                        <Text style={[styles.roomText, { color: isEnhancedSuit ? '#F4E8C1' : '#818CF8' }]}>No Attendance</Text>
                      </View>
                    ) : slot.room ? (
                      <View style={[styles.roomBadge, isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C', borderWidth: 1 }]}>
                        <Text style={[styles.roomText, isEnhancedSuit && { color: '#F4E8C1' }]}>{slot.room}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={[styles.subjectName, isEnhancedSuit && { color: '#F4E8C1' }]}>{subject?.name || 'Class Slot'}</Text>

                  <View style={[
                    styles.alertNotice,
                    isEnhancedSuit && { backgroundColor: '#0B132B', borderColor: '#2A3B5C', borderWidth: 1 }
                  ]}>
                    <Text style={[styles.alertNoticeText, isEnhancedSuit && { color: '#C5BA9D' }]}>
                      {isSports ? 'Not tracked in the ERP' : `Hourly alert scheduled for: ${slot.endTime}`}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  rollBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: '#38BDF8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rollBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  daySelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  dayButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dayButtonActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  dayButtonToday: {
    borderColor: '#38BDF8',
  },
  dayText: {
    color: '#94A3B8',
    fontWeight: '700',
    fontSize: 13,
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  slotsContainer: {
    gap: 12,
  },
  slotCard: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  timeColumn: {
    width: 75,
    backgroundColor: '#162032',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeStart: {
    color: '#F1F5F9',
    fontWeight: '700',
    fontSize: 14,
  },
  timeDivider: {
    width: 2,
    height: 12,
    backgroundColor: '#334155',
    marginVertical: 4,
  },
  timeEnd: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  slotInfo: {
    flex: 1,
    padding: 14,
    borderLeftWidth: 4,
  },
  slotTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  subjectCode: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  roomBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roomText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  alertNotice: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  alertNoticeText: {
    color: '#60A5FA',
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  emptySub: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
  },
});
