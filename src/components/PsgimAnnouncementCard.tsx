import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { PsgimAnnouncement } from '../types';

interface PsgimAnnouncementCardProps {
  announcement: PsgimAnnouncement;
  onPress: () => void;
}

export const PsgimAnnouncementCard: React.FC<PsgimAnnouncementCardProps> = ({
  announcement,
  onPress,
}) => {
  const isUrgent = announcement.priority === 'urgent';
  const isImportant = announcement.priority === 'important';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.headerRow}>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{announcement.category.toUpperCase()}</Text>
        </View>

        {announcement.is_pinned === 1 && (
          <View style={styles.pinnedBadge}>
            <Text style={styles.pinnedText}>📌 PINNED</Text>
          </View>
        )}

        {(isUrgent || isImportant) && (
          <View
            style={[
              styles.priorityBadge,
              isUrgent ? styles.priorityUrgent : styles.priorityImportant,
            ]}
          >
            <Text
              style={[
                styles.priorityText,
                isUrgent ? styles.priorityUrgentText : styles.priorityImportantText,
              ]}
            >
              {isUrgent ? '🔥 URGENT' : '⭐ IMPORTANT'}
            </Text>
          </View>
        )}

        <Text style={styles.dateText}>
          {new Date(announcement.publish_at).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
          })}
        </Text>
      </View>

      <View style={styles.bodyRow}>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {announcement.title}
          </Text>

          {announcement.summary ? (
            <Text style={styles.summary} numberOfLines={2}>
              {announcement.summary}
            </Text>
          ) : null}

          {/* Schedule or Venue Badge if available */}
          {(announcement.eventDate || announcement.venue) && (
            <View style={styles.scheduleRow}>
              {announcement.eventDate && (
                <Text style={styles.scheduleText}>📅 {announcement.eventDate}</Text>
              )}
              {announcement.venue && (
                <Text style={styles.scheduleText} numberOfLines={1}>
                  📍 {announcement.venue}
                </Text>
              )}
            </View>
          )}

          <View style={styles.authorRow}>
            <Text style={styles.authorText}>👤 {announcement.created_by}</Text>
          </View>
        </View>

        {/* Thumbnail if attachment poster exists */}
        {announcement.attachmentUrl && (
          <TouchableOpacity
            style={styles.thumbnailContainer}
            onPress={onPress}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: announcement.attachmentUrl }}
              style={styles.thumbnail}
              resizeMode="cover"
            />
            <View style={styles.posterOverlay}>
              <Text style={styles.posterOverlayText}>POSTER ↗</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.readMoreText}>View Circular & Poster →</Text>
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
    backgroundColor: '#78350F',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pinnedText: {
    color: '#FDE68A',
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
