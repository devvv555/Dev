import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { ThemeManager, AppThemeMode } from '../constants/theme';
import { Subject, TimetableSlot } from '../types';
import { KarenAiService, ChatMessage } from '../services/karenAiService';

export interface KarenGuideProps {
  visible: boolean;
  onClose: () => void;
  studentName?: string;
  studentRollNo?: string;
  subjects?: Subject[];
  timetable?: TimetableSlot[];
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
    badge: 'GEO-FENCING & MAC VERIFIED',
    description:
      'The autonomous marker uses campus geo-fencing (LH beacon perimeter) and Wi-Fi MAC address handshake telemetry to triangulate your active lecture hall (e.g. LH-101/LH-401). It verifies scheduled periods and marks your attendance in 1 tap without manual guesswork.',
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
    badge: 'GEO-FENCE & MAC VERIFIED',
    description:
      'Autonomous telemetry engine synchronizing campus micro-geofencing, AP MAC address / BSSID verification, and schedule slot-by-slot tracking. Automatically identifies active lecture halls, validates period presence, and computes live attendance margins.',
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
      '[COMING SOON] Track lecture progression across 30 planned trimesters sessions against midterm and model exam milestones to identify syllabus velocity gaps before CA tests.',
    tip: 'Coming soon! Connected with Moodle course delivery milestones.',
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
  studentRollNo = '',
  subjects = [],
  timetable = [],
  isEnhancedSuit = false,
  isLightMode: isLightModeProp,
  onExtractPortal,
}) => {
  const [activeTab, setActiveTab] = useState<'CHAT' | 'WALKTHROUGH'>('CHAT');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [themeMode, setThemeMode] = useState<AppThemeMode>(ThemeManager.getMode());

  // Karen Live AI Chat State (Google Gemini Flash)
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    ThemeManager.init().then(setThemeMode);
    const unsub = ThemeManager.subscribe(setThemeMode);
    return () => unsub();
  }, []);

  // Initialize Karen welcoming message
  useEffect(() => {
    if (visible && messages.length === 0) {
      const welcome: ChatMessage = {
        id: 'msg_welcome',
        sender: 'karen',
        text: `Hello ${studentName || 'there'}! I am Karen, your AI campus companion powered by Google Gemini. All your live attendance, professors, and timetable periods are loaded.\n\nAsk me anything! For example: "Can I bunk EDM tomorrow?", "Who is teaching MCOB?", or "How many classes do I need to recover?"`,
        timestamp: Date.now(),
        chips: [
          'Can I bunk EDM?',
          'Who is my MCOB faculty?',
          'What is my safest subject?',
          'Explain the 65% medical rule',
        ],
      };
      setMessages([welcome]);
    }
  }, [visible, studentName]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isTyping) return;

    setInputMessage('');
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const reply = await KarenAiService.sendMessage({
      message: text,
      studentName: studentName || 'Student',
      rollNo: studentRollNo,
      subjects,
      timetable,
      history: messages.map((m) => ({ sender: m.sender, text: m.text })),
    });

    const karenMsg: ChatMessage = {
      id: `msg_k_${Date.now()}`,
      sender: 'karen',
      text: reply,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, karenMsg]);
    setIsTyping(false);

    setTimeout(() => {
      chatScrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

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
      <KeyboardAvoidingView
        style={[styles.overlay, isLightMode && { backgroundColor: 'rgba(15, 23, 42, 0.45)' }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
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
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={[styles.karenTitle, isLightMode && { color: '#0F172A', fontWeight: '800' }]}>
                  Karen AI
                </Text>
                <View style={styles.geminiBadge}>
                  <Text style={styles.geminiBadgeText}>✨ GEMINI FLASH</Text>
                </View>
              </View>
              <Text
                style={[
                  styles.karenSub,
                  isLightMode && { color: '#2563EB', fontWeight: '700' },
                  isRed && !isLightMode && { color: '#10B981' },
                ]}
              >
                {isRed ? 'Stark Suit AI Companion // Level 2' : 'Your Campus AI Advisor'}
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

          {/* Mode Switcher: AI Chat vs Walkthrough Guide */}
          <View style={[styles.tabBar, isLightMode && { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' }]}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'CHAT' && (isLightMode ? styles.tabBtnActiveLight : styles.tabBtnActive)]}
              onPress={() => setActiveTab('CHAT')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'CHAT' && (isLightMode ? styles.tabBtnTextActiveLight : styles.tabBtnTextActive),
                ]}
              >
                💬 Karen AI Chat
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'WALKTHROUGH' && (isLightMode ? styles.tabBtnActiveLight : styles.tabBtnActive)]}
              onPress={() => setActiveTab('WALKTHROUGH')}
            >
              <Text
                style={[
                  styles.tabBtnText,
                  activeTab === 'WALKTHROUGH' && (isLightMode ? styles.tabBtnTextActiveLight : styles.tabBtnTextActive),
                ]}
              >
                📖 App Walkthrough
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: KAREN AI LIVE CHAT */}
          {activeTab === 'CHAT' ? (
            <View style={{ flex: 1 }}>
              <ScrollView
                ref={chatScrollRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <View key={msg.id} style={{ marginBottom: 12 }}>
                      <View
                        style={[
                          styles.chatBubble,
                          isUser ? styles.chatBubbleUser : styles.chatBubbleKaren,
                          isLightMode && (isUser ? styles.chatBubbleUserLight : styles.chatBubbleKarenLight),
                        ]}
                      >
                        <Text
                          style={[
                            styles.chatMessageText,
                            isLightMode && (isUser ? { color: '#FFFFFF' } : { color: '#0F172A' }),
                          ]}
                        >
                          {msg.text}
                        </Text>
                      </View>

                      {/* Quick Prompt Chips */}
                      {msg.chips && msg.chips.length > 0 && (
                        <View style={styles.chipsRow}>
                          {msg.chips.map((chip, idx) => (
                            <TouchableOpacity
                              key={idx}
                              style={[
                                styles.chipBtn,
                                isLightMode && { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' },
                              ]}
                              onPress={() => handleSendMessage(chip)}
                            >
                              <Text style={[styles.chipText, isLightMode && { color: '#1D4ED8' }]}>{chip}</Text>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  );
                })}

                {isTyping && (
                  <View style={[styles.chatBubble, styles.chatBubbleKaren, isLightMode && styles.chatBubbleKarenLight, { flexDirection: 'row', gap: 6, alignItems: 'center' }]}>
                    <ActivityIndicator size="small" color="#38BDF8" />
                    <Text style={{ fontSize: 12, color: '#94A3B8' }}>Karen is calculating with Gemini...</Text>
                  </View>
                )}
              </ScrollView>

              {/* Chat Input Bar */}
              <View style={[styles.inputBar, isLightMode && styles.inputBarLight]}>
                <TextInput
                  style={[styles.chatTextInput, isLightMode && styles.chatTextInputLight]}
                  placeholder="Ask Karen (e.g. Can I bunk EDM tomorrow?)"
                  placeholderTextColor="#64748B"
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  onSubmitEditing={() => handleSendMessage()}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={[styles.sendBtn, !inputMessage.trim() && { opacity: 0.5 }]}
                  onPress={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                >
                  <Text style={styles.sendBtnText}>➤</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* TAB 2: STEPPER WALKTHROUGH */
            <View style={{ flex: 1 }}>
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
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 480,
    height: 580,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#334155',
    overflow: 'hidden',
  },
  cardRed: {
    borderColor: '#262626',
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  headerRed: {
    backgroundColor: '#050505',
    borderBottomColor: '#262626',
  },
  karenAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  karenAvatarRed: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  karenAvatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  headerTitles: {
    flex: 1,
  },
  karenTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  geminiBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  geminiBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '900',
  },
  karenSub: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnRed: {
    backgroundColor: '#1F2937',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },

  // Tab switcher
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
    padding: 6,
    gap: 6,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  tabBtnActiveLight: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#2B3990',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  tabBtnTextActiveLight: {
    color: '#2B3990',
    fontWeight: '800',
  },

  // Chat styles
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    padding: 14,
  },
  chatBubble: {
    maxWidth: '85%',
    padding: 12,
    borderRadius: 14,
  },
  chatBubbleKaren: {
    alignSelf: 'flex-start',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderTopLeftRadius: 4,
  },
  chatBubbleKarenLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: '#0284C7',
    borderTopRightRadius: 4,
  },
  chatBubbleUserLight: {
    backgroundColor: '#2B3990',
  },
  chatMessageText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#F8FAFC',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chipBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#38BDF8',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    gap: 8,
  },
  inputBarLight: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
  },
  chatTextInput: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  chatTextInputLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    color: '#0F172A',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },

  // Stepper body
  body: {
    padding: 18,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#0C4A6E',
    borderWidth: 1,
    borderColor: '#0284C7',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
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
    letterSpacing: 0.5,
  },
  stepTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 8,
  },
  stepDescription: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  tipBox: {
    backgroundColor: '#0F172A',
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
  },
  tipBoxRed: {
    borderLeftColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  tipLabel: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  tipText: {
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#334155',
  },
  dotActive: {
    backgroundColor: '#38BDF8',
    width: 16,
  },
  dotActiveRed: {
    backgroundColor: '#10B981',
    width: 16,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  backBtnText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
  },
  nextBtn: {
    paddingHorizontal: 18,
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
