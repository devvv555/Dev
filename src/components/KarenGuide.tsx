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
    badge: 'STUDENT ONBOARDING',
    description:
      'Hello! I am Karen, your campus companion. I am here to guide you around the app so you never miss a class, fall below the 75% boundary, or lose track of deadlines.',
    tip: 'Your credentials remain strictly private and safe on this device.',
  },
  {
    title: 'Automatic Attendance Marker',
    badge: 'AUTONOMOUS ENGINE',
    description:
      'The real-time class tracker automatically detects your current lecture period, classroom, and faculty based on your section schedule. Mark attendance in 1 tap or let the app calculate your running attendance.',
    tip: 'Your exact "Safe Bunks" and "Classes to Recover" update in real-time.',
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
    title: 'Enhanced Suit Activated',
    badge: 'TACTICAL PROTOCOL UNLOCKED',
    description:
      'Congratulations on disengaging Training Wheels! Your interface has upgraded to Iron Man Crimson Red, Gold, White and Stealth Black. All advanced tactical intelligence modules are now online.',
    tip: 'Karen is standing by with automated schedule tracking and campus recon.',
  },
  {
    title: 'Automatic Attendance Marker',
    badge: 'AUTONOMOUS TRACKER',
    description:
      'The intelligent auto-class tracker monitors your real-time schedule slot-by-slot. It automatically identifies your current period, classroom, and faculty, marking and computing attendance without manual math.',
    tip: 'Check the Live Auto-Class Tracker card on your Dashboard anytime during lecture hours.',
  },
  {
    title: 'What-If Bunk & Exam Forecaster',
    badge: 'PREDICTIVE RECON',
    description:
      'Simulate your end-of-semester attendance down to the exact percentage before the cut-off date (27 Nov 2026). Test bunking scenarios across all courses to guarantee university exam hall ticket eligibility.',
    tip: 'Keep each subject at or above 75% to stay completely safe from condonation fees.',
  },
  {
    title: 'Live Business News Feed',
    badge: 'EXECUTIVE INTELLIGENCE',
    description:
      'Stay ahead with the curated real-time business press (The Hindu, BusinessLine, Business Standard). Each article features an executive MBA Takeaway designed for classroom discussions and interviews.',
    tip: 'Available inside Stark Arsenal under the News Radar tab.',
  },
  {
    title: 'Canteen Rush Radar (#004)',
    badge: 'CAMPUS LOGISTICS',
    description:
      'Monitor live cafeteria queues, seating capacity, and rush traffic in real time. Karen forecasts peak lunch hours and recommends optimal times to visit the cafeteria.',
    tip: 'Avoid peak congestion by checking live queue status before heading out.',
  },
  {
    title: 'Faculty Office Hours Booking (#005)',
    badge: 'ACADEMIC RADAR',
    description:
      'View faculty office timings, cabin locations, and free consultation slots. Reserve appointments with professors in 1 click for academic mentorship, project reviews, or doubts.',
    tip: 'Book consultation appointments ahead of time during designated faculty hours.',
  },
  {
    title: 'Syllabus Velocity Tracker (#006)',
    badge: 'CURRICULUM TELEMETRY',
    description:
      'Track real-time syllabus completion velocity across all 8 trimester courses. Compare classes conducted against the planned curriculum timeline to pace your exam preparation.',
    tip: 'Identifies which subjects are racing ahead or need self-study reinforcement.',
  },
  {
    title: 'Library Shield & 1-Click Renewal (#011)',
    badge: 'LIBRARY SAFEGUARD',
    description:
      'Track all borrowed books from the campus library, accession numbers, and due date countdowns. Avoid overdue fines with instant 1-click renewal that extends your borrowing window by 14 days.',
    tip: 'Renews books directly without needing to stand in the library circulation queue.',
  },
  {
    title: 'Voice Briefing & Calibration (#025)',
    badge: 'AUDIO COMPANION',
    description:
      'Select your preferred AI voice persona (Friday UK, Karen US, Jarvis Baritone, or Campus AI) and listen to personalized morning audio overviews of your schedule, rooms, and campus radar.',
    tip: 'Calibrate your preferred voice profile anytime under the Voice tab in Stark Arsenal.',
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
              <Text style={[styles.karenSub, isRed && { color: '#F4E8C1' }]}>
                {isRed ? 'Stark Suit AI Companion // Level 2' : 'Your Suit AI Assistant'}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, isRed && styles.closeBtnRed]}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Guarantee Banner */}
          <View style={[styles.privacyBanner, isRed && styles.privacyBannerRed]}>
            <Text style={[styles.privacyText, isRed && { color: '#F4E8C1' }]}>
              {isRed
                ? 'STARK PROTOCOL LEVEL 2: All enhanced capabilities online.'
                : 'Privacy Guarantee: Zero sensitive data or credentials are displayed or shared.'}
            </Text>
          </View>

          {/* Step Body */}
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View style={[styles.stepBadge, isRed && styles.stepBadgeRed]}>
              <Text style={[styles.stepBadgeText, isRed && { color: '#F4E8C1' }]}>
                {step.badge}
              </Text>
            </View>

            <Text style={styles.stepTitle}>
              {currentStepIndex === 0 && studentName ? `${studentName}: ${step.title}` : step.title}
            </Text>

            <Text style={styles.stepDescription}>{step.description}</Text>

            <View style={[styles.tipBox, isRed && styles.tipBoxRed]}>
              <Text style={[styles.tipLabel, isRed && { color: '#F4E8C1' }]}>PRO TIP</Text>
              <Text style={[styles.tipText, isRed && { color: '#F4E8C1' }]}>{step.tip}</Text>
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
                <Text style={[styles.nextBtnText, isRed && { color: '#0B132B', fontWeight: '800' }]}>
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
    backgroundColor: '#1A0404',
    borderColor: '#DC2626',
    borderWidth: 1.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  headerRed: {
    backgroundColor: '#260606',
    borderBottomColor: '#7F1D1D',
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
    backgroundColor: 'rgba(250, 204, 21, 0.2)',
    borderColor: '#FACC15',
    borderWidth: 1.5,
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
    backgroundColor: '#1C2541',
    borderColor: '#2A3B5C',
    borderWidth: 1,
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
    backgroundColor: 'rgba(244, 232, 193, 0.08)',
    borderBottomColor: 'rgba(244, 232, 193, 0.2)',
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
    backgroundColor: 'rgba(250, 204, 21, 0.15)',
    borderColor: '#FACC15',
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
    backgroundColor: '#0B0202',
    borderLeftColor: '#FACC15',
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
    backgroundColor: '#FACC15',
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
    backgroundColor: '#FACC15',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
