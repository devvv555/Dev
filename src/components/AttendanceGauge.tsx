import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AttendanceMetrics } from '../types';

interface AttendanceGaugeProps {
  metrics: AttendanceMetrics;
  compact?: boolean;
  isEnhancedSuit?: boolean;
  isLightMode?: boolean;
}

export const AttendanceGauge: React.FC<AttendanceGaugeProps> = ({
  metrics,
  compact = false,
  isEnhancedSuit = false,
  isLightMode = false,
}) => {
  const { percentage, effectiveTarget, isMedicalClaimActive, status } = metrics;
  
  // Clamped percentage for visual bar (0 - 100)
  const clampedPct = Math.min(100, Math.max(0, percentage));

  // Determine bar color (Mint Green / Emerald #10B981 for Safe, matching the screenshot)
  const getBarColor = () => {
    if (status === 'SAFE_STANDARD') return isLightMode ? '#34D399' : '#10B981';
    if (status === 'SAFE_MEDICAL') return '#06B6D4';  // Cyan / Medical safe
    return '#EF4444'; // Red
  };

  const barColor = getBarColor();

  return (
    <View style={styles.container}>
      {/* Percentage Row */}
      <View style={styles.headerRow}>
        <View style={styles.percentGroup}>
          <Text
            style={[
              styles.percentText,
              { color: isLightMode ? '#0F172A' : barColor },
              compact && styles.compactPercent,
            ]}
          >
            {percentage.toFixed(1)}%
          </Text>
        </View>

        <Text
          style={[
            styles.targetIndicatorText,
            isLightMode && { color: '#64748B', fontWeight: '600' },
            isEnhancedSuit && !isLightMode && { color: '#10B981' },
          ]}
        >
          Target: 75%
        </Text>
      </View>

      {/* The Gauge Track */}
      <View
        style={[
          styles.trackContainer,
          isLightMode && { backgroundColor: '#E2E8F0' },
          isEnhancedSuit && !isLightMode && { backgroundColor: '#050505' },
        ]}
      >
        {/* Fill Bar */}
        <View 
          style={[
            styles.fillBar, 
            { width: `${clampedPct}%`, backgroundColor: barColor }
          ]} 
        />

        {/* 75% Standard Line Marker */}
        <View style={[styles.marker, { left: '75%' }]}>
          <View
            style={[
              styles.markerLine,
              { backgroundColor: isLightMode ? '#10B981' : isEnhancedSuit ? '#10B981' : '#FBBF24' },
            ]}
          />
          {!compact && (
            <Text
              style={[
                styles.markerLabel,
                { color: isLightMode ? '#10B981' : isEnhancedSuit ? '#10B981' : '#FBBF24' },
              ]}
            >
              75%
            </Text>
          )}
        </View>
      </View>

      {/* Markers Legend (if not compact) */}
      {!compact && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[
                styles.legendDot,
                { backgroundColor: isLightMode ? '#10B981' : isEnhancedSuit ? '#10B981' : '#FBBF24' },
              ]}
            />
            <Text
              style={[
                styles.legendText,
                isLightMode && { color: '#64748B', fontWeight: '600' },
                isEnhancedSuit && !isLightMode && { color: '#9CA3AF' },
              ]}
            >
              75% Standard Minimum Safe Line
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 6,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 6,
  },
  percentGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  percentText: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  compactPercent: {
    fontSize: 20,
  },
  medicalPill: {
    backgroundColor: '#0C4A6E',
    borderColor: '#0284C7',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  medicalPillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  targetIndicatorText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
  },
  trackContainer: {
    height: 12,
    backgroundColor: '#1E293B',
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
    marginVertical: 4,
  },
  fillBar: {
    height: '100%',
    borderRadius: 6,
  },
  marker: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    marginLeft: -1,
    zIndex: 10,
  },
  markerLine: {
    width: 2,
    height: '100%',
    opacity: 0.9,
  },
  markerLabel: {
    position: 'absolute',
    top: 14,
    fontSize: 9,
    fontWeight: '700',
    width: 30,
    marginLeft: -12,
    textAlign: 'center',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 14,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '500',
  },
});
