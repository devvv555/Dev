import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { DayOfWeek, Subject, TimetableSlot } from '../types';

interface TimetableScreenProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  onAddSlot: (slot: TimetableSlot) => void;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetableScreen: React.FC<TimetableScreenProps> = ({
  subjects,
  timetable,
}) => {
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Thursday');

  const daySlots = timetable.filter((s) => s.day === selectedDay);

  const getSubject = (id: string) => subjects.find((s) => s.id === id);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Weekly Timetable</Text>
        <Text style={styles.headerSubtitle}>
          The app triggers hourly attendance alerts at the end of each slot.
        </Text>
      </View>

      {/* Day Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
        {DAYS.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={[styles.dayButton, selectedDay === day && styles.dayButtonActive]}
          >
            <Text style={[styles.dayText, selectedDay === day && styles.dayTextActive]}>
              {day.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Slots List */}
      <View style={styles.slotsContainer}>
        {daySlots.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>No classes scheduled for {selectedDay}</Text>
            <Text style={styles.emptySub}>Enjoy your day off!</Text>
          </View>
        ) : (
          daySlots.map((slot) => {
            const subject = getSubject(slot.subjectId);
            return (
              <View key={slot.id} style={styles.slotCard}>
                <View style={styles.timeColumn}>
                  <Text style={styles.timeStart}>{slot.startTime}</Text>
                  <View style={styles.timeDivider} />
                  <Text style={styles.timeEnd}>{slot.endTime}</Text>
                </View>

                <View style={[styles.slotInfo, { borderLeftColor: subject?.color || '#3B82F6' }]}>
                  <View style={styles.slotTopRow}>
                    <Text style={styles.subjectCode}>{subject?.code || 'GEN'}</Text>
                    {slot.room && (
                      <View style={styles.roomBadge}>
                        <Text style={styles.roomText}>📍 {slot.room}</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.subjectName}>{subject?.name || 'Class Slot'}</Text>

                  <View style={styles.alertNotice}>
                    <Text style={styles.alertNoticeText}>
                      🔔 Hourly alert scheduled for: {slot.endTime}
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
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
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
