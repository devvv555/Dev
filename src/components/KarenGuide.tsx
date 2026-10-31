import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

export interface KarenGuideProps {
  visible: boolean;
  onClose: () => void;
  studentName?: string;
  isEnhancedSuit?: boolean;
}

interface GuideStep {
  title: string;
  badge: string;
  description: string;
  tip: string;
}

const STANDARD_STEPS: GuideStep[] = [
  {
    title: 'Welcome to PSGIM Attendance',
    badge: 'SUIT ONBOARDING',
    description:
      'Hello! I am Karen, your suit companion. I am here to guide you around the app so you never miss a class, fall below the 75% boundary, or lose track of deadlines.',
    tip: 'Your credentials remain strictly private and safe on this device.',
  },
  {
    title: 'Hourly Attendance & Safe Bunks',
    badge: 'ATTENDANCE ENGINE',
    description:
      'Tap any class period in the timetable or class tracker to mark yourself Present or Absent. The app computes your exact "Safe Bunks" or "Classes to Recover" in real-time.',
    tip: 'Keep your target above 75% to stay out of the condonation zone!',
  },
  {
    title: 'Medical Concession Vault (65%)',
    badge: 'SPECIAL CONCESSION',
    description:
      'If you have medical leaves with a valid doctor\'s certificate, register your claim in the Medical Vault. Your required safety threshold adjusts down to 65%.',
    tip: 'Always keep your medical certificates handy for administrative verification.',
  },
  {
    title: 'ERP Reconcile & Digital ID',
    badge: 'SYSTEM INTEGRATION',
    description:
      'Reconcile your recorded hours with official portal updates anytime. Plus, access your Emergency Digital Student ID with a quick barcode scan if you forget your physical badge.',
    tip: 'I am always available whenever you need quick help!',
  },
];

const ENHANCED_SUIT_STEPS: GuideStep[] = [
  {
    title: 'Enhanced Suit Activated!',
    badge: 'STARK PROTOCOL UNLOCKED',
    description:
      'Congratulations on disengaging the Training Wheels Protocol! Your interface has upgraded to Iron Man Red & Gold. All 576 tactical capabilities are now online.',
    tip: 'Karen will now provide advanced automated telemetry and sensor analysis.',
  },
  {
    title: 'What-If Bunk & Exam Forecaster',
    badge: 'PREDICTIVE RECON',
    description:
      'Simulate your end-of-semester attendance down to the exact percentage on November 27. Test bunking scenarios across all 8 courses to confirm exam hall ticket eligibility.',
    tip: 'Keep each subject above 75% to avoid condonation applications.',
  },
  {
    title: '3D Barometric Altitude Clamping',
    badge: 'VERTICAL FLOOR RADAR',
    description:
      'Altitude blindness is eliminated! The app measures barometric elevation to distinguish between LH-101 (Floor 1, ~414m) and LH-401 (Floor 4, ~427.5m) even though they share the exact same GPS coordinates.',
    tip: 'Your phone barometer confirms you are on the actual lecture floor.',
  },
  {
    title: 'Ultrasonic Room Acoustic Radar',
    badge: 'CONCRETE-SEALED VERIFICATION',
    description:
      'Inaudible 18.5 kHz near-ultrasonic acoustic chimes authenticate classroom presence. Sound waves cannot penetrate concrete floor slabs, providing 100% room isolation.',
    tip: 'Zero student setup required—operates automatically over the air.',
  },
  {
    title: 'CrowdMesh Peer Consensus',
    badge: 'DECENTRALIZED P2P MESH',
    description:
      'When you check in, the app cross-verifies with other classmates checked into the same room. A quorum of 2+ peers confirms you are physically sitting together.',
    tip: 'Works seamlessly on both iOS Safari and Android Chrome PWAs.',
  },
  {
    title: 'Stark Tactical Arsenal',
    badge: 'CAMPUS INTELLIGENCE',
    description:
      'Access the live Business Press (The Hindu, BusinessLine, Business Standard), Canteen Rush Radar (#004), Faculty Office Hours Booking (#005), Syllabus Velocity (#006), and Library Shield (#011).',
    tip: 'Tap "Stark Arsenal" anytime on your Dashboard to launch.',
  },
];

export const KarenGuide: React.FC<KarenGuideProps> = ({
  visible,
  onClose,
  studentName,
  isEnhancedSuit = false,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const steps = isEnhancedSuit ? ENHANCED_SUIT_STEPS : STANDARD_STEPS;
  const step = steps[currentStepIndex] || steps[0];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setCurrentStepIndex(0);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  };

  const isRed = isEnhancedSuit;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.card, isRed && styles.cardRed]}>
          {/* Header */}
          <View style={[styles.header, isRed && styles.headerRed]}>
            <View style={[styles.karenAvatar, isRed && styles.karenAvatarRed]}>
              <Text style={styles.karenAvatarText}>K</Text>
            </View>
            <View style={styles.headerTitles}>
              <Text style={styles.karenTitle}>Karen Guide</Text>
              <Text style={[styles.karenSub, isRed && { color: '#FCA5A5' }]}>
                {isRed ? 'Stark Suit AI Companion // Level 2' : 'Your Suit AI Assistant'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, isRed && styles.closeBtnRed]}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Guarantee Banner */}
          <View style={[styles.privacyBanner, isRed && styles.privacyBannerRed]}>
            <Text style={[styles.privacyText, isRed && { color: '#FECACA' }]}>
              {isRed
                ? 'STARK PROTOCOL LEVEL 2: All enhanced capabilities online.'
                : 'Privacy Guarantee: Zero sensitive data or credentials are displayed or shared.'}
            </Text>
          </View>

          {/* Step Body */}
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={[styles.stepBadge, isRed && styles.stepBadgeRed]}>
              <Text style={[styles.stepBadgeText, isRed && { color: '#F87171' }]}>
                {step.badge}
              </Text>
            </View>

            <Text style={styles.stepTitle}>
              {currentStepIndex === 0 && studentName ? `${studentName}: ${step.title}` : step.title}
            </Text>

            <Text style={styles.stepDescription}>{step.description}</Text>

            <View style={[styles.tipBox, isRed && styles.tipBoxRed]}>
              <Text style={[styles.tipLabel, isRed && { color: '#EF4444' }]}>PRO TIP</Text>
              <Text style={[styles.tipText, isRed && { color: '#FEE2E2' }]}>{step.tip}</Text>
            </View>
          </ScrollView>

          {/* Stepper Dots & Navigation Footer */}
          <View style={styles.footer}>
            <View style={styles.dotsRow}>
              {steps.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    idx === currentStepIndex && (isRed ? styles.dotActiveRed : styles.dotActive),
                  ]}
                />
              ))}
            </View>

            <View style={styles.btnRow}>
              {currentStepIndex > 0 && (
                <TouchableOpacity onPress={handlePrev} style={styles.backBtn}>
                  <Text style={styles.backBtnText}>Back</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleNext}
                style={[styles.nextBtn, isRed && styles.nextBtnRed]}
              >
                <Text style={styles.nextBtnText}>
                  {currentStepIndex === steps.length - 1 ? 'Got it!' : 'Next'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '90%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    overflow: 'hidden',
  },
  cardRed: {
    backgroundColor: '#1A0505',
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0B132B',
  },
  headerRed: {
    backgroundColor: '#2D0A0A',
    borderBottomColor: '#450A0A',
  },
  karenAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0284C7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  karenAvatarRed: {
    backgroundColor: '#DC2626',
  },
  karenAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  headerTitles: {
    flex: 1,
    marginLeft: 12,
  },
  karenTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
  },
  karenSub: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  closeBtnRed: {
    backgroundColor: '#450A0A',
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontSize: 16,
    fontWeight: '700',
  },
  privacyBanner: {
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(56, 189, 248, 0.15)',
  },
  privacyBannerRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderBottomColor: 'rgba(239, 68, 68, 0.25)',
  },
  privacyText: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    padding: 20,
  },
  stepBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#0284C7',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  stepBadgeRed: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderColor: '#DC2626',
  },
  stepBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  stepTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  stepDescription: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  tipBox: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  tipBoxRed: {
    backgroundColor: '#260B0B',
    borderLeftColor: '#EF4444',
  },
  tipLabel: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  tipText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: '#38BDF8',
    width: 20,
  },
  dotActiveRed: {
    backgroundColor: '#EF4444',
    width: 20,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  backBtnText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  nextBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0284C7',
  },
  nextBtnRed: {
    backgroundColor: '#DC2626',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
