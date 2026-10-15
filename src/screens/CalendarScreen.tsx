import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Vibration,
  Modal,
} from 'react-native';
import {
  ACADEMIC_CALENDAR,
  AcademicCalendarItem,
  CalendarEventType,
  getNextHoliday,
  getHolidaySmartTripSuggestion,
  SmartTripSuggestion,
} from '../data/academicCalendarData';
import { Subject, TimetableSlot } from '../types';

interface CalendarScreenProps {
  subjects?: Subject[];
  timetable?: TimetableSlot[];
  onBack?: () => void;
  onRefresh?: () => Promise<void> | void;
}

const getTodayDateStr = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const isItemPassed = (item: AcademicCalendarItem, todayStr: string): boolean => {
  const effectiveEnd = item.endDate || item.date;
  return effectiveEnd < todayStr;
};

export const CalendarScreen: React.FC<CalendarScreenProps> = ({
  subjects = [],
  timetable = [],
  onBack,
  onRefresh,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'HOLIDAY' | 'EXAM' | 'EVENT'>('HOLIDAY');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<AcademicCalendarItem | null>(null);


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
      console.warn('Calendar refresh error:', e);
    } finally {
      setTimeout(() => {
        setRefreshing(false);
      }, 600);
    }
  };

  const nextHolidayInfo = getNextHoliday();
  const todayStr = getTodayDateStr();

  const upcomingHolidaysCount = ACADEMIC_CALENDAR.filter(
    (item) => item.type === 'HOLIDAY' && !isItemPassed(item, todayStr)
  ).length;

  const upcomingExamsCount = ACADEMIC_CALENDAR.filter(
    (item) => item.type === 'EXAM' && !isItemPassed(item, todayStr)
  ).length;

  const upcomingEventsCount = ACADEMIC_CALENDAR.filter(
    (item) => (item.type === 'EVENT' || item.type === 'ACADEMIC') && !isItemPassed(item, todayStr)
  ).length;

  const filteredItems = ACADEMIC_CALENDAR.filter((item) => {
    // Strictly exclude items that have already passed across all categories (Holidays, Exams, Events & Trips)
    if (isItemPassed(item, todayStr)) {
      return false;
    }
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
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#38BDF8"
          colors={['#38BDF8', '#2563EB']}
          progressBackgroundColor="#1E293B"
        />
      }
    >
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
            🌴 Holidays ({upcomingHolidaysCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'EXAM' && styles.filterChipActive]}
          onPress={() => setFilter('EXAM')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'EXAM' && styles.filterChipTextActive]}>
            📝 Exams ({upcomingExamsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'EVENT' && styles.filterChipActive]}
          onPress={() => setFilter('EVENT')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'EVENT' && styles.filterChipTextActive]}>
            ⛺ Events & Trips ({upcomingEventsCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, filter === 'ALL' && styles.filterChipActive]}
          onPress={() => setFilter('ALL')}
          activeOpacity={0.7}
        >
          <Text style={[styles.filterChipText, filter === 'ALL' && styles.filterChipTextActive]}>
            All ({upcomingHolidaysCount + upcomingExamsCount + upcomingEventsCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timeline List */}
      <View style={styles.timelineList}>
        {filteredItems.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗓️</Text>
            <Text style={styles.emptyTitle}>No Upcoming Events</Text>
            <Text style={styles.emptySub}>All scheduled items for this category have passed or concluded.</Text>
          </View>
        ) : (
          filteredItems.map((item) => {
          const typeBadge = getTypeBadge(item.type);
          const dateParts = item.date.split('-');
          const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
          const monthLabel = months[parseInt(dateParts[1], 10) - 1];
          const dayNumber = dateParts[2];
          const isHoliday = item.type === 'HOLIDAY';

          return (
            <TouchableOpacity
              key={item.id}
              style={[styles.itemCard, isHoliday && styles.itemCardHolidayClickable]}
              activeOpacity={isHoliday ? 0.75 : 1}
              onPress={() => {
                if (isHoliday) {
                  try {
                    Vibration.vibrate(20);
                  } catch {}
                  setSelectedHoliday(item);
                }
              }}
            >
              <View style={styles.itemLeftCol}>
                <View style={[styles.dateBlock, isHoliday && styles.dateBlockHoliday]}>
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

                  {isHoliday && (
                    <View style={styles.tapToPlanPill}>
                      <Text style={styles.tapToPlanText}>✈️ Smart Leave Planner ›</Text>
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
            </TouchableOpacity>
          );
        }))}
      </View>

      {/* Smart Holiday Trip & Leave Planner Modal */}
      {selectedHoliday && (() => {
        const suggestion = getHolidaySmartTripSuggestion(selectedHoliday, subjects, timetable);
        return (
          <Modal
            visible={!!selectedHoliday}
            transparent
            animationType="fade"
            onRequestClose={() => setSelectedHoliday(null)}
          >
            <View style={styles.modalBackdrop}>
              <View style={styles.tripModalCard}>
                <View style={styles.tripModalHeader}>
                  <View style={styles.tripModalIconCircle}>
                    <Text style={styles.tripModalIcon}>🌴</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tripModalTag}>
                      {selectedHoliday.day.toUpperCase()} HOLIDAY
                    </Text>
                    <Text style={styles.tripModalTitle} numberOfLines={2}>
                      {selectedHoliday.title}
                    </Text>
                    <Text style={styles.tripModalDate}>
                      📅 {selectedHoliday.date} ({selectedHoliday.day})
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedHoliday(null)}
                    style={styles.closeTripModalBtn}
                  >
                    <Text style={styles.closeTripModalBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                {suggestion && (
                  <ScrollView style={styles.tripModalBody} showsVerticalScrollIndicator={false}>
                    <View style={styles.tripHeroBanner}>
                      <View style={styles.tripHeroRow}>
                        <Text style={styles.tripHeroTitle}>{suggestion.tripTitle}</Text>
                        {suggestion.hasPersonalizedAttendance && (
                          <View style={styles.liveSyncBadge}>
                            <Text style={styles.liveSyncBadgeText}>⚡ Real Attendance Synced</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.tripHeroSubtitle}>
                        {suggestion.explanation}
                      </Text>
                    </View>

                    <Text style={styles.smartLeaveSectionHeader}>
                      🎯 ATTENDANCE-BASED LEAVE RECOMMENDATIONS
                    </Text>

                    {suggestion.suggestedLeaves.map((leave, idx) => (
                      <View key={idx} style={styles.leaveOptionCard}>
                        {/* Option Tag & Status Badge */}
                        <View style={styles.leaveOptionTopRow}>
                          <View style={styles.leaveDayBadge}>
                            <Text style={styles.leaveDayBadgeText}>{leave.optionLabel}</Text>
                          </View>
                          <View
                            style={[
                              styles.statusLeavePill,
                              { backgroundColor: leave.statusBadgeBg, borderColor: leave.statusBadgeColor },
                            ]}
                          >
                            <Text style={[styles.statusLeavePillText, { color: leave.statusBadgeColor }]}>
                              {leave.statusBadge}
                            </Text>
                          </View>
                        </View>

                        {/* Headline */}
                        <Text style={styles.leaveOptionHeadline}>{leave.headline}</Text>

                        {/* Reason / Advice */}
                        <Text style={styles.leaveReasonText}>{leave.reason}</Text>

                        {/* Subject Breakdown if classes exist on this day */}
                        {leave.subjectBreakdown && leave.subjectBreakdown.length > 0 && (
                          <View style={styles.subjectBreakdownBox}>
                            <Text style={styles.breakdownTitle}>
                              📚 Scheduled on {leave.day} ({leave.subjectBreakdown.reduce((sum, it) => sum + (it.slotHours || 1), 0)} hrs):
                            </Text>
                            {leave.subjectBreakdown.map((item, sIdx) => (
                              <View key={sIdx} style={styles.subjectRowItem}>
                                <View style={styles.subjectRowLeft}>
                                  <View style={styles.subjectBadgeRow}>
                                    <View
                                      style={[
                                        styles.sessionTag,
                                        item.session === 'FN' ? styles.sessionTagFN : styles.sessionTagAN,
                                      ]}
                                    >
                                      <Text
                                        style={[
                                          styles.sessionTagText,
                                          item.session === 'FN' ? styles.sessionTagTextFN : styles.sessionTagTextAN,
                                        ]}
                                      >
                                        {item.sessionLabel}
                                      </Text>
                                    </View>
                                    <Text style={styles.subjectCodeText}>{item.code}</Text>
                                  </View>
                                  <Text style={styles.subjectNameText} numberOfLines={1}>
                                    {item.subjectName}
                                  </Text>
                                  <Text style={styles.subjectTimeText}>
                                    ⏰ {item.timeSlot} {item.room ? `• ${item.room}` : ''}
                                  </Text>
                                </View>

                                <View style={styles.subjectRowRight}>
                                  <View
                                    style={[
                                      styles.attendanceBufferBadge,
                                      item.isSafe ? styles.bufferSafe : styles.bufferTight,
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.attendanceBufferText,
                                        item.isSafe ? styles.bufferTextSafe : styles.bufferTextTight,
                                      ]}
                                    >
                                      {item.isSafe ? `+${item.safeBunks} hrs safe` : `Tight (+${item.safeBunks}h)`}
                                    </Text>
                                  </View>
                                  <Text style={styles.subjectPctText}>
                                    {item.attended}/{item.total} hrs ({item.percentage}%)
                                  </Text>
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    ))}

                    <View style={styles.tripTipsBox}>
                      <Text style={styles.tripTipsTitle}>💡 Smart Leave Rule of Thumb:</Text>
                      <Text style={styles.tripTipsText}>
                        If you take leave only for subjects where you have surplus buffer (+1 or more safe bunks), your overall percentage remains above 75%. If any subject shows "0 safe", attending that class is essential to avoid condonation!
                      </Text>
                    </View>
                  </ScrollView>
                )}

                <TouchableOpacity
                  style={styles.tripModalCloseAction}
                  onPress={() => setSelectedHoliday(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.tripModalCloseActionText}>Got it, Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        );
      })()}

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
  emptyCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
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
    textAlign: 'center',
  },
  itemCardHolidayClickable: {
    borderColor: 'rgba(16, 185, 129, 0.4)',
  },
  dateBlockHoliday: {
    borderColor: '#10B981',
  },
  tapToPlanPill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  tapToPlanText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  tripModalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#334155',
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  tripModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    paddingBottom: 14,
    marginBottom: 12,
  },
  tripModalIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripModalIcon: {
    fontSize: 22,
  },
  tripModalTag: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tripModalTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  tripModalDate: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  closeTripModalBtn: {
    backgroundColor: '#334155',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeTripModalBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  tripModalBody: {
    maxHeight: 380,
  },
  tripHeroBanner: {
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    marginBottom: 14,
  },
  tripHeroTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  tripHeroSubtitle: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 18,
  },
  smartLeaveSectionHeader: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  leaveOptionCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  leaveOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  leaveDayBadge: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  leaveDayBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  leaveTargetDay: {
    color: '#FDE047',
    fontSize: 13,
    fontWeight: '700',
  },
  leaveReasonText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 17,
  },
  tripTipsBox: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
    marginTop: 4,
    marginBottom: 10,
  },
  tripTipsTitle: {
    color: '#FDE047',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  tripTipsText: {
    color: '#E2E8F0',
    fontSize: 11,
    lineHeight: 16,
  },
  tripModalCloseAction: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  tripModalCloseActionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  tripHeroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  liveSyncBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  liveSyncBadgeText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '800',
  },
  leaveOptionTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  statusLeavePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusLeavePillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  leaveOptionHeadline: {
    color: '#FDE047',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  subjectBreakdownBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  breakdownTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 8,
  },
  subjectRowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  subjectRowLeft: {
    flex: 1,
    marginRight: 8,
  },
  subjectBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  sessionTag: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  sessionTagFN: {
    backgroundColor: 'rgba(56, 189, 248, 0.2)',
  },
  sessionTagAN: {
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  sessionTagText: {
    fontSize: 9,
    fontWeight: '700',
  },
  sessionTagTextFN: {
    color: '#38BDF8',
  },
  sessionTagTextAN: {
    color: '#C084FC',
  },
  subjectCodeText: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '800',
  },
  subjectNameText: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  subjectTimeText: {
    color: '#64748B',
    fontSize: 10,
    marginTop: 2,
  },
  subjectRowRight: {
    alignItems: 'flex-end',
  },
  attendanceBufferBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 2,
  },
  bufferSafe: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  bufferTight: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  attendanceBufferText: {
    fontSize: 10,
    fontWeight: '800',
  },
  bufferTextSafe: {
    color: '#10B981',
  },
  bufferTextTight: {
    color: '#EF4444',
  },
  subjectPctText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
});
