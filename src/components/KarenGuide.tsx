import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ThemeManager, AppThemeMode } from '../constants/theme';

export interface KarenGuideProps {
  visible: boolean;
  onClose: () => void;
  studentName?: string;
  isEnhancedSuit?: boolean;
  isLightMode?: boolean;
  onExtractPortal?: () => void;
}

interface GuideStep {
  title: string;
  badge: string;
  description: string;
  tip: string;
  actionButton?: {
    label: string;
    action: 'EXTRACT_PORTAL';
  };
}

const STANDARD_STEPS: GuideStep[] = [
  {
    title: 'Welcome to PSGIM Attendance Tracker',
    badge: 'FIRST-TIME SETUP',
    description:
      'Hello! I am Karen, your AI campus companion. Welcome to the official PSGIM Attendance & MBA Super-App. To get started, I will walk you through each feature step-by-step so you never miss a lecture, stay above 75%, and keep your attendance synchronized.',
    tip: 'Your student data is saved securely on this device with cloud backup.',
  },
  {
    title: 'Extract Official Portal Attendance',
    badge: 'CRITICAL FIRST STEP',
    description:
      'Before tracking live periods, sync your baseline official attendance from the PSG Tech Studzone / College Portal. Tap "Extract Attendance Now" to launch the extractor. Enter your DOB or portal password, and all your courses, held hours, and attended hours will load automatically!',
    tip: 'Tap the button below to jump straight to the Studzone Extractor in the Portals tab.',
    actionButton: {
      label: '⚡ Extract Attendance from Portal Now',
      action: 'EXTRACT_PORTAL',
    },
  },
  {
    title: 'Automatic Real-Time Period Marker',
    badge: 'DASHBOARD RADAR',
    description:
      'The real-time class tracker automatically detects your current lecture period, classroom (e.g. LH-101/LH-401), and faculty based on your section schedule. Mark "Present" or "Absent" in 1 tap, or let the app compute your real-time attendance.',
    tip: 'Your exact "Safe Bunks" and "Classes to Recover" update instantly.',
  },
  {
    title: 'What-If Simulator & Medical Vault (65%)',
    badge: 'EXAM SAFEGUARD',
    description:
      'Simulate future bunk scenarios up to exam cut-off dates to guarantee your university hall ticket eligibility. Plus, if you have medical certificates, register your claim in the Medical Concession Vault to lower your required threshold to 65%.',
    tip: 'Always keep each course above 75% to stay completely condonation-free.',
  },
  {
    title: 'Portals, Moodle & Campus Amenities',
    badge: 'FULL SUPER-APP ACCESS',
    description:
      'Access official circulars, Moodle assignment deadlines, live canteen rush radar, zero-queue print cost calculator, and 1-click library book renewals all inside the app tabs.',
    tip: 'Tap the Karen icon anytime on your Dashboard whenever you need a quick walkthrough!',
  },
];

const ENHANCED_SUIT_STEPS: GuideStep[] = [
  {
    title: 'Enhanced Suit Activated',
    badge: 'TACTICAL PROTOCOL UNLOCKED',
    description:
      'Congratulations on disengaging Training Wheels! Your interface has upgraded to Deep Midnight Navy, Surface Navy, and Muted Champagne. All advanced tactical intelligence modules are now online.',
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
    tip: 'Available directly in the 5th section under the Enhanced Hub tab.',
  },
  {
    title: 'Canteen & Xerox Radar',
    badge: 'COMING SOON',
    description:
      '[COMING SOON] Live queue rush radar across campus dining spots (Main IM Canteen, Campus Annex, Coffee Kiosk) with real-time peer GPS mesh and zero-queue Xerox print cost calculator.',
    tip: 'Coming soon! Automated sensor mesh & cafeteria queue integration in testing.',
  },
  {
    title: 'Faculty Office Hours Booking',
    badge: 'COMING SOON',
    description:
      '[COMING SOON] View faculty consultation cabins and reserve 1-on-1 office hour appointments directly in 1 click for academic mentorship, project reviews, or doubts.',
    tip: 'Coming soon! Synchronized with faculty trimester office schedules.',
  },
  {
    title: 'Syllabus Velocity Tracker',
    badge: 'COMING SOON',
    description:
      '[COMING SOON] Real-time syllabus completion velocity telemetry across all 8 trimester courses to compare classes conducted against planned curriculum targets.',
    tip: 'Coming soon! Trimester lecture milestone tracking will activate shortly.',
  },
  {
    title: 'Library Shield & 1-Click Renewal',
    badge: 'COMING SOON',
    description:
      '[COMING SOON] Track borrowed library volumes, accession barcodes, and return due countdowns with 1-click 14-day online extension to guarantee zero overdue fines.',
    tip: 'Coming soon! Campus library RFID circulation integration currently in progress.',
  },
  {
    title: '5th Navigation Section: Enhanced Hub',
    badge: 'TACTICAL NAVIGATION',
    description:
      'All campus recon modules—News, Canteen, Xerox, Faculty Booking, Syllabus Velocity, and Library Shield—are organized inside the 5th tab on your bottom navigation bar.',
    tip: 'Switch tabs anytime from the bottom bar or tap the Enhanced Suit Hub button on your Dashboard.',
  },
];

export const KarenGuide: React.FC<KarenGuideProps> = ({
  visible,
  onClose,
  studentName,
  isEnhancedSuit = false,
  isLightMode: isLightModeProp,
  onExtractPortal,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [themeMode, setThemeMode] = useState<AppThemeMode>(ThemeManager.getMode());

  useEffect(() => {
    ThemeManager.init().then(setThemeMode);
    const unsub = ThemeManager.subscribe(setThemeMode);
    return () => unsub();
  }, []);

  const isLightMode = isLightModeProp !== undefined ? isLightModeProp : themeMode === 'LIGHT';
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
      <View style={[styles.overlay, isLightMode && { backgroundColor: 'rgba(15, 23, 42, 0.45)' }]}>
        <View
          style={[
            styles.card,
            isLightMode && {
              backgroundColor: '#FFFFFF',
              borderColor: '#CBD5E1',
              shadowColor: '#64748B',
              shadowOpacity: 0.15,
              shadowOffset: { width: 0, height: 6 },
              shadowRadius: 16,
              elevation: 8,
            },
            isRed && !isLightMode && styles.cardRed,
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              isLightMode && {
                backgroundColor: '#FFFFFF',
                borderBottomColor: '#E2E8F0',
              },
              isRed && !isLightMode && styles.headerRed,
            ]}
          >
            <View
              style={[
                styles.karenAvatar,
                isLightMode && { backgroundColor: '#2B3990' },
                isRed && !isLightMode && styles.karenAvatarRed,
              ]}
            >
              <Text style={styles.karenAvatarText}>K</Text>
            </View>
            <View style={styles.headerTitles}>
              <Text style={[styles.karenTitle, isLightMode && { color: '#0F172A', fontWeight: '800' }]}>
                Karen Guide
              </Text>
              <Text
                style={[
                  styles.karenSub,
                  isLightMode && { color: '#2563EB', fontWeight: '700' },
                  isRed && !isLightMode && { color: '#10B981' },
                ]}
              >
                {isRed ? 'Stark Suit AI Companion // Level 2' : 'Your Suit AI Assistant'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.closeBtn,
                isLightMode && { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#E2E8F0' },
                isRed && !isLightMode && styles.closeBtnRed,
              ]}
            >
              <Text style={[styles.closeBtnText, isLightMode && { color: '#64748B' }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Privacy Guarantee Banner */}
          <View
            style={[
              styles.privacyBanner,
              isLightMode && {
                backgroundColor: '#EFF6FF',
                borderBottomColor: '#DBEAFE',
              },
              isRed && !isLightMode && styles.privacyBannerRed,
            ]}
          >
            <Text
              style={[
                styles.privacyText,
                isLightMode && { color: '#1E40AF', fontWeight: '700' },
                isRed && !isLightMode && { color: '#10B981' },
              ]}
            >
              {isRed
                ? 'STARK PROTOCOL LEVEL 2: All enhanced capabilities online.'
                : 'Privacy Guarantee: Zero sensitive data or credentials are displayed or shared.'}
            </Text>
          </View>

          {/* Step Body */}
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.stepBadge,
                isLightMode && {
                  backgroundColor: '#EFF6FF',
                  borderColor: '#93C5FD',
                },
                isRed && !isLightMode && styles.stepBadgeRed,
              ]}
            >
              <Text
                style={[
                  styles.stepBadgeText,
                  isLightMode && { color: '#1D4ED8', fontWeight: '800' },
                  isRed && !isLightMode && { color: '#10B981' },
                ]}
              >
                {step.badge}
              </Text>
            </View>

            <Text style={[styles.stepTitle, isLightMode && { color: '#0F172A', fontWeight: '900' }]}>
              {currentStepIndex === 0 && studentName ? `${studentName}: ${step.title}` : step.title}
            </Text>

            <Text style={[styles.stepDescription, isLightMode && { color: '#475569' }]}>
              {step.description}
            </Text>

            {step.actionButton && (
              <TouchableOpacity
                style={[
                  {
                    marginTop: 12,
                    marginBottom: 6,
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    borderRadius: 10,
                    backgroundColor: '#0284C7',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    shadowColor: '#0284C7',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.25,
                    shadowRadius: 8,
                    elevation: 4,
                  },
                  isEnhancedSuit && !isLightMode && { backgroundColor: '#10B981', shadowColor: '#10B981' },
                ]}
                activeOpacity={0.85}
                onPress={() => {
                  onClose();
                  if (onExtractPortal) {
                    onExtractPortal();
                  }
                }}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: '800',
                    letterSpacing: 0.3,
                  }}
                >
                  {step.actionButton.label}
                </Text>
              </TouchableOpacity>
            )}

            <View
              style={[
                styles.tipBox,
                isLightMode && {
                  backgroundColor: '#F8FAFC',
                  borderLeftColor: '#2563EB',
                  borderWidth: 1,
                  borderColor: '#E2E8F0',
                },
                isRed && !isLightMode && styles.tipBoxRed,
              ]}
            >
              <Text
                style={[
                  styles.tipLabel,
                  isLightMode && { color: '#2563EB', fontWeight: '800' },
                  isRed && !isLightMode && { color: '#10B981' },
                ]}
              >
                PRO TIP
              </Text>
              <Text
                style={[
                  styles.tipText,
                  isLightMode && { color: '#334155', fontWeight: '600' },
                  isRed && !isLightMode && { color: '#10B981' },
                ]}
              >
                {step.tip}
              </Text>
            </View>
          </ScrollView>

          {/* Stepper Dots & Navigation Footer */}
          <View
            style={[
              styles.footer,
              isLightMode && {
                backgroundColor: '#FFFFFF',
                borderTopColor: '#E2E8F0',
              },
            ]}
          >
            <View style={styles.dotsRow}>
              {steps.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    isLightMode && { backgroundColor: '#E2E8F0' },
                    idx === currentStepIndex &&
                      (isLightMode
                        ? { backgroundColor: '#2B3990', width: 20 }
                        : isRed
                        ? styles.dotActiveRed
                        : styles.dotActive),
                  ]}
                />
              ))}
            </View>

            <View style={styles.btnRow}>
              {currentStepIndex > 0 && (
                <TouchableOpacity
                  onPress={handlePrev}
                  style={[
                    styles.backBtn,
                    isLightMode && { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: '#CBD5E1' },
                  ]}
                >
                  <Text style={[styles.backBtnText, isLightMode && { color: '#475569', fontWeight: '700' }]}>
                    Back
                  </Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleNext}
                style={[
                  styles.nextBtn,
                  isLightMode && { backgroundColor: '#2B3990' },
                  isRed && !isLightMode && styles.nextBtnRed,
                ]}
              >
                <Text
                  style={[
                    styles.nextBtnText,
                    isRed && !isLightMode && { color: '#050505', fontWeight: '800' },
                  ]}
                >
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
    backgroundColor: '#121212',
    borderColor: '#262626',
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
    backgroundColor: '#050505',
    borderBottomColor: '#262626',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
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
    backgroundColor: '#121212',
    borderColor: '#262626',
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
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderBottomColor: 'rgba(16, 185, 129, 0.2)',
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
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
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
    backgroundColor: '#050505',
    borderLeftColor: '#10B981',
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
    backgroundColor: '#10B981',
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
    backgroundColor: '#10B981',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
