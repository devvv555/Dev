import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { LmsAssignment } from '../types';
import { LmsService } from '../services/lmsService';

interface LmsAssignmentCardProps {
  assignment: LmsAssignment;
  rollNo: string;
  onUpdated: (updated: LmsAssignment) => void;
  onOpenInMoodle: (title: string, url: string) => void;
}

export const LmsAssignmentCard: React.FC<LmsAssignmentCardProps> = ({
  assignment,
  rollNo,
  onUpdated,
  onOpenInMoodle,
}) => {
  const [isUploading, setIsUploading] = useState(false);

  // Compute countdown or overdue status
  const now = Date.now();
  const diffHours = Math.round((assignment.dueTimestamp - now) / (1000 * 60 * 60));
  const isPastDue = diffHours < 0;

  let dueBadgeText = '';
  let dueBadgeColor = '#38BDF8';

  if (assignment.status === 'SUBMITTED' || assignment.status === 'GRADED') {
    dueBadgeText = '✅ SUBMITTED';
    dueBadgeColor = '#10B981';
  } else if (isPastDue) {
    dueBadgeText = '⚠️ PAST DUE';
    dueBadgeColor = '#EF4444';
  } else if (diffHours <= 12) {
    dueBadgeText = `🔥 DUE IN ${diffHours} HRS`;
    dueBadgeColor = '#EF4444';
  } else if (diffHours <= 48) {
    dueBadgeText = `⏳ DUE IN ${Math.round(diffHours / 24)} DAYS`;
    dueBadgeColor = '#F59E0B';
  } else {
    dueBadgeText = `📅 DUE IN ${Math.round(diffHours / 24)} DAYS`;
    dueBadgeColor = '#38BDF8';
  }

  // Handle document picking & submitting
  const handlePickAndSubmit = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '*/*'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const file = result.assets[0];

      Alert.alert(
        'Confirm Moodle Submission',
        `Submit "${file.name}" (${file.size ? (file.size / (1024 * 1024)).toFixed(1) + ' MB' : 'file'}) for "${assignment.title}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit to Moodle 🚀',
            onPress: async () => {
              setIsUploading(true);
              try {
                Vibration.vibrate(30);
              } catch {}

              const res = await LmsService.submitAssignmentDocument(rollNo, assignment.id, {
                name: file.name,
                size: file.size,
                uri: file.uri,
                mimeType: file.mimeType,
              });

              setIsUploading(false);
              if (res.success && res.updatedAssignment) {
                onUpdated(res.updatedAssignment);
                Alert.alert(
                  'Submission Verified! 🎉',
                  `"${file.name}" has been recorded as officially submitted for grading.`
                );
              } else {
                Alert.alert('Upload Error', res.message);
              }
            },
          },
        ]
      );
    } catch (e: any) {
      setIsUploading(false);
      Alert.alert('Picker Error', e?.message || 'Could not access file.');
    }
  };

  return (
    <View style={styles.card}>
      {/* Top Header: Course & Due Status */}
      <View style={styles.headerRow}>
        <View style={styles.courseBadge}>
          <Text style={styles.courseCode}>{assignment.courseCode}</Text>
        </View>
        <View style={[styles.dueBadge, { backgroundColor: `${dueBadgeColor}20`, borderColor: dueBadgeColor }]}>
          <Text style={[styles.dueBadgeText, { color: dueBadgeColor }]}>{dueBadgeText}</Text>
        </View>
      </View>

      {/* Assignment Title & Course */}
      <Text style={styles.title}>{assignment.title}</Text>
      <Text style={styles.courseName}>{assignment.courseName}</Text>
      <Text style={styles.description} numberOfLines={2}>
        {assignment.description}
      </Text>

      {/* Submission Status Box */}
      {assignment.status === 'SUBMITTED' ? (
        <View style={styles.verifiedBox}>
          <View style={styles.verifiedHeader}>
            <Text style={styles.verifiedIcon}>✅</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.verifiedTitle}>Submitted for Grading</Text>
              <Text style={styles.verifiedFileName} numberOfLines={1}>
                📄 {assignment.submittedFileName || 'Document.pdf'} ({assignment.submittedFileSize || 'Uploaded'})
              </Text>
              <Text style={styles.verifiedDate}>
                Submitted on {assignment.submissionDate ? new Date(assignment.submissionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Recently'}
              </Text>
            </View>
          </View>

          {assignment.grade && (
            <View style={styles.gradeBox}>
              <Text style={styles.gradeLabel}>Grade Awarded:</Text>
              <Text style={styles.gradeValue}>{assignment.grade}</Text>
            </View>
          )}
        </View>
      ) : null}

      {/* Action Buttons */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.uploadBtn}
          onPress={handlePickAndSubmit}
          disabled={isUploading}
          activeOpacity={0.7}
        >
          {isUploading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.uploadBtnText}>
              {assignment.status === 'SUBMITTED' ? '🔄 Replace Document' : '📎 Upload & Submit'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moodleLinkBtn}
          onPress={() => onOpenInMoodle(assignment.title, assignment.moodleUrl)}
          activeOpacity={0.7}
        >
          <Text style={styles.moodleLinkBtnText}>🌐 Open Moodle</Text>
        </TouchableOpacity>
      </View>
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
    letterSpacing: 0.5,
  },
  dueBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  dueBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  verifiedBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  verifiedHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  verifiedIcon: {
    fontSize: 18,
    marginTop: 2,
  },
  verifiedTitle: {
    color: '#34D399',
    fontSize: 13,
    fontWeight: '800',
  },
  verifiedFileName: {
    color: '#F8FAFC',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  verifiedDate: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  gradeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(16, 185, 129, 0.2)',
  },
  gradeLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  gradeValue: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  uploadBtn: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  moodleLinkBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodleLinkBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
});
