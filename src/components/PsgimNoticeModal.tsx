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
  Linking,
} from 'react-native';
import { PsgimAnnouncement } from '../types';
import { ThemeManager } from '../constants/theme';

interface PsgimNoticeModalProps {
  visible: boolean;
  announcement: PsgimAnnouncement | null;
  onClose: () => void;
  isLightMode?: boolean;
}

export const PsgimNoticeModal: React.FC<PsgimNoticeModalProps> = ({
  visible,
  announcement,
  onClose,
  isLightMode: isLightModeProp,
}) => {
  if (!announcement) return null;

  const isLightMode = isLightModeProp !== undefined ? isLightModeProp : ThemeManager.getMode() === 'LIGHT';

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
      <SafeAreaView style={[styles.safeArea, isLightMode && { backgroundColor: '#F8FAFC' }]}>
        {/* Navigation Bar */}
        <View style={[styles.navBar, isLightMode && { backgroundColor: '#FFFFFF', borderBottomColor: '#E2E8F0' }]}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={[styles.backBtnText, isLightMode && { color: '#2B3990', fontWeight: '800' }]}>← Close</Text>
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={[styles.headerCategory, isLightMode && { color: '#64748B' }]}>{announcement.category.toUpperCase()}</Text>
          </View>
          <TouchableOpacity onPress={handleShare} style={styles.shareBtn} activeOpacity={0.7}>
            <Text style={[styles.shareBtnText, isLightMode && { color: '#2B3990', fontWeight: '700' }]}>Share ↗</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Badges Row */}
          <View style={styles.badgeRow}>
            {announcement.is_pinned === 1 && (
              <View style={[
                styles.pinnedBadge,
                isLightMode && { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }
              ]}>
                <Text style={[styles.pinnedText, isLightMode && { color: '#475569' }]}>📌 PINNED NOTICE</Text>
              </View>
            )}
            <View
              style={[
                styles.priorityBadge,
                announcement.priority === 'urgent' && styles.priorityUrgent,
                announcement.priority === 'important' && styles.priorityImportant,
                isLightMode && announcement.priority === 'urgent' && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
                isLightMode && announcement.priority === 'important' && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
              ]}
            >
              <Text
                style={[
                  styles.priorityText,
                  announcement.priority === 'urgent' && styles.priorityUrgentText,
                  announcement.priority === 'important' && styles.priorityImportantText,
                  isLightMode && announcement.priority === 'urgent' && { color: '#DC2626' },
                  isLightMode && announcement.priority === 'important' && { color: '#B45309' },
                ]}
              >
                {announcement.priority.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.publishDateText, isLightMode && { color: '#64748B' }]}>
              {new Date(announcement.publish_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, isLightMode && { color: '#0F172A', fontWeight: '900' }]}>{announcement.title}</Text>

          {/* Publisher Pill */}
          <View style={[styles.publisherRow, isLightMode && { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
            <View style={[styles.publisherAvatar, isLightMode && { backgroundColor: '#EEF2FF', borderColor: '#CBD5E1' }]}>
              <Text style={[styles.publisherAvatarText, isLightMode && { color: '#2B3990' }]}>
                {announcement.created_by.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={[styles.publisherName, isLightMode && { color: '#0F172A', fontWeight: '800' }]}>{announcement.created_by}</Text>
              <Text style={[styles.publisherRole, isLightMode && { color: '#64748B' }]}>Official PSGIM Circular</Text>
            </View>
          </View>

          {/* Event Metadata Card if available */}
          {(announcement.eventDate || announcement.venue || announcement.eventTime) && (
            <View style={[styles.eventCard, isLightMode && { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
              <Text style={[styles.eventCardHeader, isLightMode && { color: '#2B3990', fontWeight: '800' }]}>🗓️ EVENT SCHEDULE & VENUE</Text>
              {announcement.eventDate && (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, isLightMode && { color: '#64748B' }]}>Date:</Text>
                  <Text style={[styles.metaValue, isLightMode && { color: '#0F172A', fontWeight: '700' }]}>{announcement.eventDate}</Text>
                </View>
              )}
              {announcement.eventTime && (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, isLightMode && { color: '#64748B' }]}>Time:</Text>
                  <Text style={[styles.metaValue, isLightMode && { color: '#0F172A', fontWeight: '700' }]}>{announcement.eventTime}</Text>
                </View>
              )}
              {announcement.venue && (
                <View style={styles.metaRow}>
                  <Text style={[styles.metaLabel, isLightMode && { color: '#64748B' }]}>Venue:</Text>
                  <Text style={[styles.metaValue, isLightMode && { color: '#0F172A', fontWeight: '700' }]}>{announcement.venue}</Text>
                </View>
              )}
            </View>
          )}

          {/* Attached Poster / Circular Image */}
          {announcement.attachmentUrl && (
            <View style={styles.attachmentSection}>
              <Text style={[styles.attachmentHeader, isLightMode && { color: '#0F172A', fontWeight: '800' }]}>🖼️ OFFICIAL CIRCULAR POSTER</Text>
              <View style={[styles.imageContainer, isLightMode && { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
                <Image
                  source={{ uri: announcement.attachmentUrl }}
                  style={[styles.attachmentImage, isLightMode && { backgroundColor: '#F8FAFC' }]}
                  resizeMode="contain"
                />
              </View>
            </View>
          )}

          {/* Summary / Content */}
          <View style={[styles.contentSection, isLightMode && { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
            <Text style={[styles.sectionHeading, isLightMode && { color: '#0F172A', fontWeight: '800' }]}>Details</Text>
            <Text style={[styles.bodyText, isLightMode && { color: '#334155' }]}>
              {announcement.content || announcement.summary || 'No further description provided.'}
            </Text>

            {/* Optional Call to Action URL */}
            {announcement.actionUrl && (
              <View style={[styles.actionCard, isLightMode && { borderTopColor: '#E2E8F0' }]}>
                <TouchableOpacity
                  style={[styles.actionButton, isLightMode && { backgroundColor: '#2B3990' }]}
                  onPress={() => {
                    if (announcement.actionUrl) {
                      Linking.openURL(announcement.actionUrl).catch(() => {});
                    }
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionButtonText}>
                    {announcement.actionLabel || '🌐 Open Link'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.shareFriendButton, isLightMode && { backgroundColor: '#059669', borderColor: '#10B981' }]}
                  onPress={handleShare}
                  activeOpacity={0.85}
                >
                  <Text style={styles.shareFriendButtonText}>
                    📲 Share with Friends / WhatsApp
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  pinnedText: {
    color: '#38BDF8',
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
    fontSize: 12,
    marginLeft: 'auto',
    fontWeight: '600',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 14,
  },
  publisherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  actionCard: {
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  shareFriendButton: {
    backgroundColor: '#10B981',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  shareFriendButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
