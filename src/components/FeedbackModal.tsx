import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { FeedbackCategory } from '../types';
import { FeedbackService } from '../services/feedbackService';

interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  studentName?: string;
  studentRollNo?: string;
  studentDob?: string;
  batch?: string;
}

const CATEGORIES: { label: string; value: FeedbackCategory; icon: string }[] = [
  { label: 'Feature Request', value: 'FEATURE', icon: '💡' },
  { label: 'Schedule / Room', value: 'SCHEDULE', icon: '📅' },
  { label: 'Bug / Error', value: 'BUG', icon: '🐛' },
  { label: 'General Feedback', value: 'GENERAL', icon: '💬' },
];

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onClose,
  studentName = 'Student',
  studentRollNo = '26AA04',
  studentDob,
  batch = 'A',
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('FEATURE');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<'NEW' | 'HISTORY'>('NEW');
  const [historyList, setHistoryList] = useState<any[]>([]);

  React.useEffect(() => {
    if (visible) {
      FeedbackService.getAllFeedbacks().then((all) => {
        const myItems = all.filter(
          (f) =>
            (studentRollNo && f.studentRollNo && f.studentRollNo.toUpperCase() === studentRollNo.toUpperCase()) ||
            (f.studentName && f.studentName.toUpperCase() === studentName.toUpperCase())
        );
        setHistoryList(myItems);
      });
    }
  }, [visible, studentRollNo, studentName]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
        window.alert('Message Required: Please enter your feedback or improvement suggestion.');
      } else {
        Alert.alert('Message Required', 'Please enter your feedback or improvement suggestion.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await FeedbackService.submitFeedback({
        studentName,
        studentRollNo,
        studentDob,
        batch,
        isAnonymous,
        category,
        rating,
        message: message.trim(),
      });

      setMessage('');
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
        window.alert('Thank You! Your feedback has been received and will help improve future updates for the batch.');
        onClose();
      } else {
        Alert.alert(
          'Thank You!',
          'Your feedback has been received and will help improve future updates for the batch.',
          [{ text: 'OK', onPress: onClose }]
        );
      }
    } catch (err) {
      console.warn('[FeedbackModal] Error submitting feedback:', err);
      if (Platform.OS === 'web' && typeof window !== 'undefined' && window.alert) {
        window.alert('Could not submit feedback. Please try again.');
      } else {
        Alert.alert('Error', 'Could not submit feedback. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const repliedCount = historyList.filter((h) => !!h.adminReply).length;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Feedback & Improvements</Text>
              <Text style={styles.headerSubtitle}>
                Help shape upcoming features and receive official developer replies.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Sub Navigation Tabs */}
          <View style={styles.tabToggleRow}>
            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'NEW' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('NEW')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, activeTab === 'NEW' && styles.toggleBtnTextActive]}>
                Submit Feedback
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.toggleBtn, activeTab === 'HISTORY' && styles.toggleBtnActive]}
              onPress={() => setActiveTab('HISTORY')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, activeTab === 'HISTORY' && styles.toggleBtnTextActive]}>
                Admin Replies ({repliedCount}/{historyList.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {activeTab === 'NEW' ? (
              <>
                {/* Category Selector */}
                <Text style={styles.sectionLabel}>SELECT CATEGORY</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.categoryChip,
                        category === cat.value && styles.categoryChipActive,
                      ]}
                      onPress={() => setCategory(cat.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.categoryIcon}>{cat.icon}</Text>
                      <Text
                        style={[
                          styles.categoryLabel,
                          category === cat.value && styles.categoryLabelActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Star Rating */}
                <Text style={styles.sectionLabel}>EXPERIENCE RATING</Text>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setRating(star)}
                      style={styles.starBtn}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.starText, star <= rating && styles.starActive]}>
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                  <Text style={styles.ratingText}>
                    {rating === 5 ? 'Excellent' : rating === 4 ? 'Very Good' : rating === 3 ? 'Good' : rating === 2 ? 'Needs Work' : 'Poor'}
                  </Text>
                </View>

                {/* Message Box */}
                <Text style={styles.sectionLabel}>YOUR SUGGESTION OR REPORT</Text>
                <TextInput
                  style={styles.textArea}
                  placeholder="e.g. Can you add GPA tracking? Or Friday room changed to LH-104..."
                  placeholderTextColor="#64748B"
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />

                {/* Anonymous Toggle */}
                <TouchableOpacity
                  style={styles.anonymousRow}
                  onPress={() => setIsAnonymous(!isAnonymous)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, isAnonymous && styles.checkboxActive]}>
                    {isAnonymous && <Text style={styles.checkmark}>✓</Text>}
                  </View>
                  <View style={styles.anonymousTextCol}>
                    <Text style={styles.anonymousTitle}>Submit Anonymously</Text>
                    <Text style={styles.anonymousSub}>
                      Hide your name and roll number from the feedback list.
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Submit Button */}
                <TouchableOpacity
                  style={[styles.submitBtn, isSubmitting && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                >
                  <Text style={styles.submitBtnText}>
                    {isSubmitting ? 'Submitting...' : 'Send Feedback'}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              /* HISTORY & ADMIN REPLIES TAB */
              <View style={styles.historyContainer}>
                {historyList.length === 0 ? (
                  <View style={styles.historyEmptyBox}>
                    <Text style={styles.historyEmptyTitle}>No Feedback Submissions Yet</Text>
                    <Text style={styles.historyEmptySub}>
                      When you submit feedback or questions, developer replies will appear here.
                    </Text>
                  </View>
                ) : (
                  historyList.map((item) => (
                    <View key={item.id} style={styles.historyCard}>
                      <View style={styles.historyCardTop}>
                        <View style={styles.historyCategoryBadge}>
                          <Text style={styles.historyCategoryText}>{item.category}</Text>
                        </View>
                        <Text style={styles.historyDate}>
                          {new Date(item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>

                      <Text style={styles.historyMessage}>{item.message}</Text>

                      {/* Official Admin Reply */}
                      {item.adminReply ? (
                        <View style={styles.studentReplyBox}>
                          <View style={styles.studentReplyHeader}>
                            <Text style={styles.studentReplyLabel}>Official Admin Reply</Text>
                            {item.repliedAt && (
                              <Text style={styles.studentReplyDate}>
                                {new Date(item.repliedAt).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                          <Text style={styles.studentReplyBody}>{item.adminReply}</Text>
                        </View>
                      ) : (
                        <View style={styles.pendingReplyBox}>
                          <Text style={styles.pendingReplyText}>
                            Status: {item.status} • Pending developer review
                          </Text>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '88%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
    maxWidth: 270,
  },
  closeBtn: {
    backgroundColor: '#334155',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  categoryChipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  categoryIcon: {
    fontSize: 14,
  },
  categoryLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryLabelActive: {
    color: '#60A5FA',
    fontWeight: '700',
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  starBtn: {
    padding: 4,
  },
  starText: {
    fontSize: 26,
    color: '#475569',
  },
  starActive: {
    color: '#FBBF24',
  },
  ratingText: {
    color: '#FDE047',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
  },
  textArea: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 14,
    minHeight: 90,
    marginBottom: 12,
  },
  anonymousRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  anonymousTextCol: {
    flex: 1,
  },
  anonymousTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  anonymousSub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tabToggleRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 10,
    padding: 3,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleBtnActive: {
    backgroundColor: '#2563EB',
  },
  toggleBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleBtnTextActive: {
    color: '#FFFFFF',
  },
  historyContainer: {
    paddingBottom: 20,
  },
  historyEmptyBox: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyEmptyTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  historyEmptySub: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  historyCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  historyCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyCategoryBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  historyCategoryText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  historyDate: {
    color: '#64748B',
    fontSize: 11,
  },
  historyMessage: {
    color: '#F1F5F9',
    fontSize: 13,
    lineHeight: 18,
  },
  studentReplyBox: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#34D399',
  },
  studentReplyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentReplyLabel: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  studentReplyDate: {
    color: '#64748B',
    fontSize: 10,
  },
  studentReplyBody: {
    color: '#E2E8F0',
    fontSize: 12.5,
    lineHeight: 17,
  },
  pendingReplyBox: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  pendingReplyText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
  },
});
