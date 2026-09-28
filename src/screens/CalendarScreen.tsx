import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {
  ACADEMIC_CALENDAR,
  AcademicCalendarItem,
  CalendarEventType,
  getNextHoliday,
} from '../data/academicCalendarData';

interface CalendarScreenProps {
  onBack?: () => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ onBack }) => {
  const [filter, setFilter] = useState<'ALL' | 'HOLIDAY' | 'EXAM' | 'EVENT'>('HOLIDAY');

  const nextHolidayInfo = getNextHoliday();

  const filteredItems = ACADEMIC_CALENDAR.filter((item) => {
    if (filter === 'ALL') return true;
    if (filter === 'HOLIDAY') return item.type === 'HOLIDAY';
    if (filter === 'EXAM') return item.type === 'EXAM';
    if (filter === 'EVENT') return item.type === 'EVENT' || item.type === 'ACADEMIC';
    return true;
  });

  const formatDisplayDate = (dateStr: string, endDateStr?: string) => {
    const parse = (d: string) => {
      const parts = d.split('-');
      const year = parts[0];
      const monthIndex = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return { day, month: months[monthIndex], year };
    };

    const start = parse(dateStr);
    if (!endDateStr) {
      return `${start.day} ${start.month} ${start.year}`;
    }
    const end = parse(endDateStr);
    if (start.month === end.month) {
      return `${start.day}–${end.day} ${start.month} ${start.year}`;
    }
    return `${start.day} ${start.month} – ${end.day} ${end.month} ${start.year}`;
  };

  const getTypeBadge = (type: CalendarEventType) => {
    switch (type) {
      case 'HOLIDAY':
        return { label: '🌴 Holiday', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)' };
      case 'EXAM':
        return { label: '📝 Exam', color: '#EF4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'EVENT':
        return { label: '⛺ Event / Trip', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)' };
      case 'ACADEMIC':
        return { label: '🎓 Academic', color: '#38BDF8', bg: 'rgba(56, 189, 248, 0.15)' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>Academic Calendar 2026–27</Text>
        <Text style={styles.headerSubtitle}>
          Official schedule, holidays, exam blackout dates & long weekend trip planner.
        </Text>
      </View>

      {/* Pre-accounted calendar notice */}
      <View style={styles.calendarNoticeBox}>
        <Text style={styles.calendarNoticeText}>
          ✓ All holidays in this academic calendar are already pre-accounted for in the schedule and will not affect your attendance percentage.
        </Text>
      </View>

      {/* Next Upcoming Holiday Spotlight */}
      {nextHolidayInfo && (
        <View style={styles.spotlightCard}>
          <View style={styles.spotlightHeaderRow}>
            <View style={styles.spotlightIconCircle}>
              <Text style={styles.spotlightIconText}>🌴</Text>
            </View>
            <View style={styles.spotlightInfo}>
              <Text style={styles.spotlightTag}>
                {nextHolidayInfo.daysRemaining === 0
                  ? 'TODAY IS A HOLIDAY! 🎉'
                  : nextHolidayInfo.daysRemaining === 1
                  ? 'HOLIDAY TOMORROW! 🚀'
                  : `NEXT HOLIDAY IN ${nextHolidayInfo.daysRemaining} DAYS`}
              </Text>
              <Text style={styles.spotlightTitle} numberOfLines={1}>
                {nextHolidayInfo.holiday.title}
              </Text>
              <Text style={styles.spotlightDate}>
                📅 {formatDisplayDate(nextHolidayInfo.holiday.date, nextHolidayInfo.holiday.endDate)} • {nextHolidayInfo.holiday.day}
              </Text>
            </View>
          </View>

          {nextHolidayInfo.holiday.longWeekendTag && (
            <View style={styles.longWeekendBanner}>
              <Text style={styles.longWeekendBannerText}>
                {nextHolidayInfo.holiday.longWeekendTag} • {nextHolidayInfo.holiday.description}
              </Text>
            </View>
          )}

          {nextHolidayInfo.holiday.recommendedSmartLeave && (
            <View style={styles.smartLeaveBox}>
              <Text style={styles.smartLeaveText}>
                💡 {nextHolidayInfo.holiday.recommendedSmartLeave}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Filter Chips */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === 'HOLIDAY' && styles.filterChipActive]}
          onPress={() => setFilter('HOLIDAY')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'HOLIDAY' && styles.filterChipTextActive]}>
            🌴 Holidays (18)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'EXAM' && styles.filterChipActive]}
          onPress={() => setFilter('EXAM')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'EXAM' && styles.filterChipTextActive]}>
            📝 Exams (7)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'EVENT' && styles.filterChipActive]}
          onPress={() => setFilter('EVENT')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'EVENT' && styles.filterChipTextActive]}>
            ⛺ Events & Trips
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
          onPress={() => setFilter('ALL')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timeline List */}
      <View style={styles.timelineList}>
        {filteredItems.map((item) => {
          const typeBadge = getTypeBadge(item.type);
          const dateParts = item.date.split('-');
          const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
          const monthLabel = months[parseInt(dateParts[1], 10) - 1];
          const dayNumber = dateParts[2];

          return (
            <View key={item.id} style={styles.itemCard}>
              <View style={styles.itemLeftCol}>
                <View style={styles.dateBlock}>
                  <Text style={styles.dateBlockMonth}>{monthLabel}</Text>
                  <Text style={styles.dateBlockDay}>{dayNumber}</Text>
                </View>
                <Text style={styles.itemDayName} numberOfLines={1}>
                  {item.day.slice(0, 3)}
                </Text>
              </View>

              <View style={styles.itemContentCol}>
                <View style={styles.itemBadgeRow}>
                  <View style={[styles.typeBadge, { backgroundColor: typeBadge.bg }]}>
                    <Text style={[styles.typeBadgeText, { color: typeBadge.color }]}>
                      {typeBadge.label}
                    </Text>
                  </View>

                  {item.longWeekendTag && (
                    <View style={styles.longWeekendPill}>
                      <Text style={styles.longWeekendPillText}>{item.longWeekendTag}</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.itemTitle}>{item.title}</Text>

                {item.description && (
                  <Text style={styles.itemDescription}>{item.description}</Text>
                )}

                {item.recommendedSmartLeave && (
                  <View style={styles.smartLeaveBox}>
                    <Text style={styles.smartLeaveText}>
                      💡 {item.recommendedSmartLeave}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
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
  backBtn: {
    marginBottom: 10,
    alignSelf: 'flex-start',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  backBtnText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
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
    lineHeight: 18,
  },
  calendarNoticeBox: {
    backgroundColor: 'rgba(6, 78, 59, 0.35)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  calendarNoticeText: {
    color: '#A7F3D0',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  spotlightCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 1.5,
    borderColor: '#10B981',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  spotlightHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  spotlightIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spotlightIconText: {
    fontSize: 22,
  },
  spotlightInfo: {
    flex: 1,
  },
  spotlightTag: {
    color: '#34D399',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  spotlightTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },
  spotlightDate: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  longWeekendBanner: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  longWeekendBannerText: {
    color: '#6EE7B7',
    fontSize: 12,
    fontWeight: '600',
  },
  smartLeaveBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  smartLeaveText: {
    color: '#FCD34D',
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  filterChipActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
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
  timelineList: {
    gap: 12,
  },
  itemCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  itemLeftCol: {
    alignItems: 'center',
    width: 48,
  },
  dateBlock: {
    backgroundColor: '#0F172A',
    borderRadius: 10,
    width: 48,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateBlockMonth: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  dateBlockDay: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 1,
  },
  itemDayName: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    textTransform: 'uppercase',
  },
  itemContentCol: {
    flex: 1,
  },
  itemBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  typeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  longWeekendPill: {
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  longWeekendPillText: {
    color: '#FDE047',
    fontSize: 10,
    fontWeight: '700',
  },
  itemTitle: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '700',
  },
  itemDescription: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
    lineHeight: 17,
  },
});
