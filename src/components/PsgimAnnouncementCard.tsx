import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Platform } from 'react-native';
import { PsgimAnnouncement } from '../types';
import { ThemeManager } from '../constants/theme';

interface PsgimAnnouncementCardProps {
  announcement: PsgimAnnouncement;
  onPress: () => void;
  isEnhancedSuit?: boolean;
  isLightMode?: boolean;
}

export const PsgimAnnouncementCard: React.FC<PsgimAnnouncementCardProps> = ({
  announcement,
  onPress,
  isEnhancedSuit = false,
  isLightMode: isLightModeProp,
}) => {
  const isLightMode = isLightModeProp !== undefined ? isLightModeProp : ThemeManager.getMode() === 'LIGHT';
  const isUrgent = announcement.priority === 'urgent';
  const isImportant = announcement.priority === 'important';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isLightMode
          ? {
              backgroundColor: '#FFFFFF',
              borderColor: '#CBD5E1',
              borderWidth: 1,
              ...Platform.select({
                web: {
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                },
                default: {},
              }),
            }
          : isEnhancedSuit && {
              backgroundColor: '#050505',
              borderColor: '#262626',
              borderWidth: 1.5,
            }
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.headerRow}>
        <View style={[
          styles.categoryBadge,
          isLightMode
            ? { backgroundColor: '#EEF2FF', borderColor: '#C7D2FE' }
            : isEnhancedSuit && { backgroundColor: 'rgba(16, 185, 129, 0.15)', borderColor: '#10B981' }
        ]}>
          <Text style={[styles.categoryBadgeText, isLightMode ? { color: '#2B3990', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]}>{announcement.category.toUpperCase()}</Text>
        </View>

        {announcement.is_pinned === 1 && (
          <View style={[
            styles.pinnedBadge,
            isLightMode
              ? { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }
              : isEnhancedSuit && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' }
          ]}>
            <Text style={[styles.pinnedText, isLightMode ? { color: '#475569' } : isEnhancedSuit && { color: '#10B981' }]}>[PINNED]</Text>
          </View>
        )}

        {(isUrgent || isImportant) && (
          <View
            style={[
              styles.priorityBadge,
              isUrgent ? styles.priorityUrgent : styles.priorityImportant,
              isLightMode && isImportant && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
              isLightMode && isUrgent && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
              isEnhancedSuit && isUrgent && { backgroundColor: 'rgba(239, 68, 68, 0.25)', borderColor: '#EF4444' },
              isEnhancedSuit && isImportant && { backgroundColor: 'rgba(16, 185, 129, 0.2)', borderColor: '#10B981' },
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                isUrgent ? styles.priorityUrgentText : styles.priorityImportantText,
                isLightMode && isImportant && { color: '#B45309' },
                isLightMode && isUrgent && { color: '#DC2626' },
                isEnhancedSuit && isImportant && { color: '#10B981' }
              ]}
            >
              {isUrgent ? 'URGENT' : 'IMPORTANT'}
            </Text>
          </View>
        )}

        <Text style={[styles.dateText, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]}>
          {new Date(announcement.publish_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, isLightMode ? { color: '#0F172A', fontWeight: '800' } : isEnhancedSuit && { color: '#10B981' }]} numberOfLines={2}>
            {announcement.title}
          </Text>

          {announcement.summary ? (
            <Text style={[styles.summary, isLightMode ? { color: '#475569' } : isEnhancedSuit && { color: '#9CA3AF' }]} numberOfLines={2}>
              {announcement.summary}
            </Text>
          ) : null}

          {/* Schedule or Venue Badge if available */}
          {(announcement.eventDate || announcement.venue) && (
            <View style={styles.scheduleRow}>
              {announcement.eventDate && (
                <Text style={[styles.scheduleText, isLightMode ? { color: '#2B3990', fontWeight: '600' } : isEnhancedSuit && { color: '#10B981' }]}>Date: {announcement.eventDate}</Text>
              )}
              {announcement.venue && (
                <Text style={[styles.scheduleText, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#9CA3AF' }]} numberOfLines={1}>
                  Venue: {announcement.venue}
                </Text>
              )}
            </View>
          )}

          <View style={styles.authorRow}>
            <Text style={[styles.authorText, isLightMode ? { color: '#64748B' } : isEnhancedSuit && { color: '#8E9BB0' }]}>By: {announcement.created_by}</Text>
          </View>
        </View>

        {/* Thumbnail if attachment poster exists */}
        {announcement.attachmentUrl && (
          <TouchableOpacity
            style={[
              styles.thumbnailContainer,
              isLightMode && { backgroundColor: '#F8FAFC', borderColor: '#CBD5E1' }
            ]}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: announcement.attachmentUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={[
              styles.posterOverlay,
              isLightMode && { backgroundColor: 'rgba(43, 57, 144, 0.88)' }
            ]}>
              <Text style={[styles.posterOverlayText, isLightMode && { color: '#FFFFFF' }]}>POSTER ↗</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={[styles.footerRow, isLightMode && { borderTopColor: '#E2E8F0' }]}>
        <Text style={[styles.readMoreText, isLightMode && { color: '#2B3990', fontWeight: '700' }]}>View Circular & Poster →</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: '#0F172A',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinnedBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pinnedText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
  },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
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
    fontSize: 9,
    fontWeight: '800',
  },
  priorityUrgentText: {
    color: '#FCA5A5',
  },
  priorityImportantText: {
    color: '#93C5FD',
  },
  dateText: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 'auto',
    fontWeight: '600',
  },
  bodyRow: {
    flexDirection: 'row',
    gap: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 4,
  },
  summary: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 6,
  },
  scheduleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  scheduleText: {
    color: '#A5B4FC',
    fontSize: 11,
    fontWeight: '600',
  },
  authorRow: {
    marginTop: 4,
  },
  authorText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  thumbnailContainer: {
    width: 68,
    height: 84,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  posterOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingVertical: 1,
    alignItems: 'center',
  },
  posterOverlayText: {
    color: '#38BDF8',
    fontSize: 8,
    fontWeight: '800',
  },
  footerRow: {
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    marginTop: 10,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readMoreText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
});
