import React, { useState, useEffect } from 'react';
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
import { ThemeManager } from '../constants/theme';

interface TimetableScreenProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  studentRollNo?: string;
  onAddSlot?: (slot: TimetableSlot) => void;
  onRefresh?: () => Promise<void> | void;
  isEnhancedSuit?: boolean;
  isLightMode?: boolean;
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
  isLightMode: isLightModeProp,
}) => {
  const todayDay = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDay);
  const [refreshing, setRefreshing] = useState(false);
  const [themeMode, setThemeMode] = useState<'LIGHT' | 'DARK'>(ThemeManager.getMode());
  const isLightMode = isLightModeProp !== undefined ? isLightModeProp : themeMode === 'LIGHT';

  useEffect(() => {
    ThemeManager.init().then(setThemeMode);
    const unsub = ThemeManager.subscribe((mode) => setThemeMode(mode));
    return unsub;
  }, []);

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
      style={[styles.container, isLightMode ? { backgroundColor: '#F1F5F9' } : isEnhancedSuit && { backgroundColor: '#050505' }]}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={isLightMode ? '#2B3990' : isEnhancedSuit ? '#10B981' : '#38BDF8'}
          colors={isLightMode ? ['#2B3990', '#3B82F6'] : isEnhancedSuit ? ['#10B981', '#121212'] : ['#38BDF8', '#2563EB']}
          progressBackgroundColor={isLightMode ? '#FFFFFF' : isEnhancedSuit ? '#121212' : '#1E293B'}
        />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <Text style={[styles.headerTitle, isLightMode ? { color: '#0F172A', fontWeight: '900' } : isEnhancedSuit && { color: '#10B981' }]}>Weekly Period Index</Text>
          {studentRollNo ? (
            <View style={[
              styles.rollBadge,
              isLightMode
                ? { backgroundColor: '#EEF2FF', borderColor: '#CBD5E1', borderWidth: 1 }
                : isEnhancedSuit && { backgroundColor: '#050505', borderColor: '#10B981' }
            ]}>
              <Text style={[styles.rollBadgeText, isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>Roll No: {toNewRollNo(studentRollNo)}</Text>
            </View>
          ) : null}
        </View>
        <Text style={[styles.headerSubtitle, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]}>
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
                isLightMode && (
                  isSelected
                    ? { backgroundColor: '#2B3990', borderColor: '#2B3990' }
                    : { backgroundColor: '#FFFFFF', borderColor: isToday ? '#2B3990' : '#E2E8F0' }
                ),
                isEnhancedSuit && !isLightMode && (
                  isSelected
                    ? { backgroundColor: '#10B981', borderColor: '#10B981' }
                    : { backgroundColor: '#121212', borderColor: isToday ? '#10B981' : '#262626' }
                )
              ]}
            >
              <Text style={[
                styles.dayText,
                isSelected && styles.dayTextActive,
                isLightMode && (
                  isSelected
                    ? { color: '#FFFFFF', fontWeight: '800' }
                    : { color: isToday ? '#2B3990' : '#64748B', fontWeight: isToday ? '800' : '600' }
                ),
                isEnhancedSuit && !isLightMode && (
                  isSelected
                    ? { color: '#050505', fontWeight: '800' }
                    : { color: '#10B981' }
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
          <View style={[
            styles.emptyCard,
            isLightMode
              ? { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0', borderWidth: 1 }
              : isEnhancedSuit && { backgroundColor: '#121212', borderColor: '#262626' }
          ]}>
            <Text style={[styles.emptyTitle, isLightMode ? { color: '#0F172A', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>No periods scheduled for {selectedDay}</Text>
            <Text style={[styles.emptySub, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]}>Enjoy your day off!</Text>
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
                  isLightMode
                    ? {
                        backgroundColor: '#FFFFFF',
                        borderColor: '#E2E8F0',
                        borderWidth: 1,
                        shadowColor: '#64748B',
                        shadowOpacity: 0.08,
                        shadowOffset: { width: 0, height: 2 },
                        shadowRadius: 6,
                        elevation: 2,
                      }
                    : isEnhancedSuit && { backgroundColor: '#121212', borderColor: '#262626' }
                ]}
              >
                <View style={[styles.timeColumn, isLightMode ? { backgroundColor: '#F8FAFC' } : isEnhancedSuit && { backgroundColor: '#050505' }]}>
                  <Text style={[styles.timeStart, isLightMode ? { color: '#0F172A', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>{slot.startTime}</Text>
                  <View style={[styles.timeDivider, isLightMode ? { backgroundColor: '#E2E8F0' } : isEnhancedSuit && { backgroundColor: '#262626' }]} />
                  <Text style={[styles.timeEnd, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]}>{slot.endTime}</Text>
                </View>

                <View style={[styles.slotInfo, { borderLeftColor: isLightMode ? '#2B3990' : isEnhancedSuit ? '#10B981' : (subject?.color || '#3B82F6') }]}>
                  <View style={styles.slotTopRow}>
                    <Text style={[styles.subjectCode, isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>{subject?.code || 'GEN'}</Text>
                    {isSports ? (
                      <View style={[
                        styles.roomBadge,
                        isLightMode
                          ? { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE', borderWidth: 1 }
                          : { backgroundColor: 'rgba(99, 102, 241, 0.18)', borderColor: '#6366F1' },
                        isEnhancedSuit && !isLightMode && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }
                      ]}>
                        <Text style={[styles.roomText, isLightMode ? { color: '#2B3990', fontWeight: '700' } : { color: isEnhancedSuit ? '#10B981' : '#818CF8' }]}>No Attendance</Text>
                      </View>
                    ) : slot.room ? (
                      <View style={[
                        styles.roomBadge,
                        isLightMode
                          ? { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0', borderWidth: 1 }
                          : isEnhancedSuit && { backgroundColor: '#050505', borderColor: '#262626', borderWidth: 1 }
                      ]}>
                        <Text style={[styles.roomText, isLightMode ? { color: '#475569', fontWeight: '700' } : isEnhancedSuit && { color: '#10B981' }]}>{slot.room}</Text>
                      </View>
                    ) : null}
                  </View>

                  <Text style={[styles.subjectName, isLightMode ? { color: '#0F172A', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>{subject?.name || 'Class Slot'}</Text>

                  <View style={[
                    styles.alertNotice,
                    isLightMode
                      ? { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0', borderWidth: 1 }
                      : isEnhancedSuit && { backgroundColor: '#050505', borderColor: '#262626', borderWidth: 1 }
                  ]}>
                    <Text style={[styles.alertNoticeText, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]}>
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
