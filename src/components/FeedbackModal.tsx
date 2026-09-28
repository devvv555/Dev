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
  batch = 'A',
}) => {
  const [category, setCategory] = useState<FeedbackCategory>('FEATURE');
  const [rating, setRating] = useState<number>(5);
  const [message, setMessage] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please enter your feedback or improvement suggestion.');
      return;
    }

    setIsSubmitting(true);
    try {
      await FeedbackService.submitFeedback({
        studentName,
        studentRollNo,
        batch,
        isAnonymous,
        category,
        rating,
        message: message.trim(),
      });

      Alert.alert(
        'Thank You! 🙌',
        'Your feedback has been received and will help improve future updates for the batch.',
        [{ text: 'OK', onPress: () => {
          setMessage('');
          onClose();
        }}]
      );
    } catch {
      Alert.alert('Error', 'Could not submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
              <Text style={styles.headerTitle}>Feedback & Improvements 💡</Text>
              <Text style={styles.headerSubtitle}>
                Help shape upcoming features and report timetable inaccuracies.
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
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
                {rating === 5 ? 'Excellent 🌟' : rating === 4 ? 'Very Good 👍' : rating === 3 ? 'Good 👌' : rating === 2 ? 'Needs Work ⚠️' : 'Poor 👎'}
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
                {isSubmitting ? 'Submitting...' : 'Send Feedback 🚀'}
              </Text>
            </TouchableOpacity>
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
});
