import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LmsQuiz } from '../types';

interface LmsQuizCardProps {
  quiz: LmsQuiz;
  onAttemptQuiz: (title: string, url: string) => void;
}

export const LmsQuizCard: React.FC<LmsQuizCardProps> = ({
  quiz,
  onAttemptQuiz,
}) => {
  const isOpen = quiz.status === 'OPEN';

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.courseBadge}>
          <Text style={styles.courseCode}>{quiz.courseCode}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            isOpen ? styles.statusOpen : styles.statusUpcoming,
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              isOpen ? styles.statusOpenText : styles.statusUpcomingText,
            ]}
          >
            {isOpen ? '🔴 LIVE NOW' : '⏳ UPCOMING'}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{quiz.title}</Text>
      <Text style={styles.courseName}>{quiz.courseName}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {quiz.description}
      </Text>

      {/* Quiz Metadata (Timer & Attempts) */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>⏱️</Text>
          <Text style={styles.metaText}>{quiz.timeLimitMinutes} Mins Limit</Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaIcon}>🎯</Text>
          <Text style={styles.metaText}>
            {quiz.attemptsUsed} / {quiz.attemptsAllowed} Attempts
          </Text>
        </View>
      </View>

      {/* 1-Tap Attempt Test Button */}
      <TouchableOpacity
        style={[styles.attemptBtn, !isOpen && styles.attemptBtnDisabled]}
        onPress={() => onAttemptQuiz(quiz.title, quiz.moodleUrl)}
        disabled={!isOpen}
        activeOpacity={0.7}
      >
        <Text style={styles.attemptBtnText}>
          {isOpen ? '🚀 Attempt Test (Direct Bypass)' : 'Test Not Open Yet'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  courseCode: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusOpen: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
  },
  statusUpcoming: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderColor: '#F59E0B',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusOpenText: {
    color: '#F87171',
  },
  statusUpcomingText: {
    color: '#FBBF24',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 2,
  },
  courseName: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  description: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 14,
    backgroundColor: '#0F172A',
    padding: 10,
    borderRadius: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  attemptBtn: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attemptBtnDisabled: {
    backgroundColor: '#334155',
  },
  attemptBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
