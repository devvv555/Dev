import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  Share,
} from 'react-native';
import { PsgimAnnouncement } from '../types';

interface PsgimNoticeModalProps {
  visible: boolean;
  announcement: PsgimAnnouncement | null;
  onClose: () => void;
}

export const PsgimNoticeModal: React.FC<PsgimNoticeModalProps> = ({
  visible,
  announcement,
  onClose,
}) => {
  if (!announcement) return null;

  const handleShare = async () => {
    try {
      let shareMsg = `📢 ${announcement.title}\n`;
      if (announcement.eventDate) shareMsg += `📅 Date: ${announcement.eventDate}\n`;
      if (announcement.eventTime) shareMsg += `⏰ Time: ${announcement.eventTime}\n`;
      if (announcement.venue) shareMsg += `📍 Venue: ${announcement.venue}\n`;
      if (announcement.summary) shareMsg += `\n${announcement.summary}\n`;
      shareMsg += `\nPublished by ${announcement.created_by} • PSGIM Connect`;
      await Share.share({ message: shareMsg });
    } catch {}
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backBtnText}>← Close</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerCategory}>{announcement.category.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
            <Text style={styles.shareBtnText}>Share ↗</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Badges Row */}
          <View style={styles.badgeRow}>
            {announcement.is_pinned === 1 && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedText}>📌 PINNED NOTICE</Text>
              </View>
            )}
            <View
              style={[
                styles.priorityBadge,
                announcement.priority === 'urgent' && styles.priorityUrgent,
                announcement.priority === 'important' && styles.priorityImportant,
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  announcement.priority === 'urgent' && styles.priorityUrgentText,
                  announcement.priority === 'important' && styles.priorityImportantText,
                ]}
              >
                {announcement.priority.toUpperCase()}
              </Text>
            </View>
            <Text style={styles.publishDateText}>
              {new Date(announcement.publish_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>{announcement.title}</Text>

          {/* Publisher Pill */}
          <View style={styles.publisherRow}>
            <View style={styles.publisherAvatar}>
              <Text style={styles.publisherAvatarText}>
                {announcement.created_by.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.publisherName}>{announcement.created_by}</Text>
              <Text style={styles.publisherRole}>Official PSGIM Circular</Text>
            </View>
          </View>

          {/* Event Metadata Card if available */}
          {(announcement.eventDate || announcement.venue || announcement.eventTime) && (
            <View style={styles.eventCard}>
              <Text style={styles.eventCardHeader}>🗓️ EVENT SCHEDULE & VENUE</Text>
              {announcement.eventDate && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Date:</Text>
                  <Text style={styles.metaValue}>{announcement.eventDate}</Text>
                </View>
              )}
              {announcement.eventTime && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Time:</Text>
                  <Text style={styles.metaValue}>{announcement.eventTime}</Text>
                </View>
              )}
              {announcement.venue && (
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Venue:</Text>
                  <Text style={styles.metaValue}>{announcement.venue}</Text>
                </View>
              )}
            </View>
          )}

          {/* Attached Poster / Circular Image */}
          {announcement.attachmentUrl && (
            <View style={styles.attachmentSection}>
              <Text style={styles.attachmentHeader}>🖼️ OFFICIAL CIRCULAR POSTER</Text>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: announcement.attachmentUrl }}
                  style={styles.attachmentImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}

          {/* Summary / Content */}
          <View style={styles.contentSection}>
            <Text style={styles.sectionHeading}>Details</Text>
            <Text style={styles.bodyText}>
              {announcement.content || announcement.summary || 'No further description provided.'}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  backBtnText: {
    color: '#38BDF8',
    fontSize: 15,
    fontWeight: '700',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerCategory: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  shareBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  shareBtnText: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pinnedBadge: {
    backgroundColor: '#78350F',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pinnedText: {
    color: '#FDE68A',
    fontSize: 10,
    fontWeight: '800',
  },
  priorityBadge: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  priorityUrgent: {
    backgroundColor: '#7F1D1D',
    borderColor: '#EF4444',
  },
  priorityImportant: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  priorityText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
  },
  priorityUrgentText: {
    color: '#FCA5A5',
  },
  priorityImportantText: {
    color: '#93C5FD',
  },
  publishDateText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 16,
  },
  publisherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  publisherAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  publisherAvatarText: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
  },
  publisherName: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  publisherRole: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  eventCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#38BDF8',
    marginBottom: 16,
    gap: 6,
  },
  eventCardHeader: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    color: '#94A3B8',
    fontSize: 13,
    width: 70,
    fontWeight: '600',
  },
  metaValue: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  attachmentSection: {
    marginBottom: 20,
  },
  attachmentHeader: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  imageContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
  },
  attachmentImage: {
    width: '100%',
    height: 380,
    backgroundColor: '#0F172A',
  },
  contentSection: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionHeading: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  bodyText: {
    color: '#CBD5E1',
    fontSize: 14,
    lineHeight: 22,
  },
});
