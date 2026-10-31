import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import { BusinessNewsService, NewsArticle } from '../services/businessNewsService';
import {
  CampusLifeFeaturesEngine,
  CanteenRushStatus,
  FacultyOfficeHourSlot,
  SyllabusVelocity,
  LibraryBook,
} from '../services/campusLifeFeaturesEngine';
import { KarenVoiceEngine, VOICE_PERSONAS, VoicePersonaId } from '../services/karenVoiceEngine';
import { Subject, TimetableSlot } from '../types';

interface StarkArsenalModalProps {
  visible: boolean;
  onClose: () => void;
  studentName: string;
  subjects: Subject[];
  timetable: TimetableSlot[];
  isSuitUnlocked: boolean;
  onOpenWhatIf?: () => void;
}

type ArsenalTab = 'NEWS' | 'CANTEEN' | 'SYLLABUS' | 'FACULTY' | 'LIBRARY' | 'VOICE';

export const StarkArsenalModal: React.FC<StarkArsenalModalProps> = ({
  visible,
  onClose,
  studentName,
  subjects,
  timetable,
  isSuitUnlocked,
  onOpenWhatIf,
}) => {
  const [activeTab, setActiveTab] = useState<ArsenalTab>('NEWS');
  const [newsHeadlines, setNewsHeadlines] = useState<NewsArticle[]>([]);
  const [canteenStatus, setCanteenStatus] = useState<CanteenRushStatus | null>(null);
  const [facultySlots, setFacultySlots] = useState<FacultyOfficeHourSlot[]>([]);
  const [syllabusList, setSyllabusList] = useState<SyllabusVelocity[]>([]);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [selectedPersonaId, setSelectedPersonaId] = useState<VoicePersonaId>('KAREN');

  useEffect(() => {
    if (visible) {
      setNewsHeadlines(BusinessNewsService.getLatestHeadlines());
      setCanteenStatus(CampusLifeFeaturesEngine.getCanteenRushStatus());
      setFacultySlots(CampusLifeFeaturesEngine.getFacultyOfficeSlots());
      setSyllabusList(CampusLifeFeaturesEngine.getSyllabusVelocitySummary());
      CampusLifeFeaturesEngine.getBorrowedLibraryBooks().then(setLibraryBooks);
      KarenVoiceEngine.getSelectedPersona().then(setSelectedPersonaId);
    }
  }, [visible]);

  const handleRenewBook = async (bookId: string) => {
    const res = await CampusLifeFeaturesEngine.renewBook(bookId);
    if (res.success) {
      Alert.alert('Renewed!', `Book renewed successfully. New due date: ${res.newDueDate}`);
      const updated = await CampusLifeFeaturesEngine.getBorrowedLibraryBooks();
      setLibraryBooks(updated);
    }
  };

  const handlePlayKarenBriefing = async () => {
    setIsSpeaking(true);
    await KarenVoiceEngine.speakMorningBriefing({
      studentName: studentName || 'Cadet',
      totalClassesToday: 4,
      firstClassCourse: 'MCOB',
      firstClassRoom: 'LH-101',
      firstClassTime: '08:30 AM',
      canteenStatus: canteenStatus?.statusMessage || 'Light queues',
    });
    setIsSpeaking(false);
  };

  const handleSelectPersona = async (personaId: VoicePersonaId) => {
    setSelectedPersonaId(personaId);
    await KarenVoiceEngine.setSelectedPersona(personaId);
    setIsSpeaking(true);
    await KarenVoiceEngine.previewPersona(personaId);
    setIsSpeaking(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={styles.title}>Stark Tactical Arsenal</Text>
                <View style={styles.activeTag}>
                  <Text style={styles.activeTagText}>576 MATRIX</Text>
                </View>
              </View>
              <Text style={styles.subtitle}>
                Academic intelligence, live news radar & campus companion systems
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.exitHeaderBtn} activeOpacity={0.8}>
              <Text style={styles.exitHeaderBtnText}>✕ Exit</Text>
            </TouchableOpacity>
          </View>

          {/* Navigation Pill Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {[
              { id: 'NEWS', label: 'Business News' },
              { id: 'CANTEEN', label: 'Canteen Radar (#004)' },
              { id: 'FACULTY', label: 'Faculty Booking (#005)' },
              { id: 'SYLLABUS', label: 'Syllabus Velocity (#006)' },
              { id: 'LIBRARY', label: 'Library Shield (#011)' },
              { id: 'VOICE', label: 'Karen Briefing (#025)' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as ArsenalTab)}
                style={[styles.tabPill, activeTab === tab.id && styles.tabPillActive]}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    activeTab === tab.id && styles.tabPillTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Tab Content */}
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            {/* TAB 1: BUSINESS NEWS HEADLINES */}
            {activeTab === 'NEWS' && (
              <View>
                <View style={styles.sectionHeaderBox}>
                  <Text style={styles.sectionHeading}>Live Business & Management Press</Text>
                  <Text style={styles.sectionDesc}>
                    Curated from The Hindu, The Hindu BusinessLine, Business Standard & Mint
                  </Text>
                </View>

                {newsHeadlines.map((item) => (
                  <View key={item.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={styles.sourceBadge}>
                        <Text style={styles.sourceBadgeText}>{item.source}</Text>
                      </View>
                      <Text style={styles.publishedTime}>{item.publishedAt}</Text>
                    </View>
                    <Text style={styles.articleTitle}>{item.title}</Text>
                    <Text style={styles.articleSummary}>{item.summary}</Text>
                    <View style={styles.takeawayBox}>
                      <Text style={styles.takeawayLabel}>MBA Takeaway:</Text>
                      <Text style={styles.takeawayText}>{item.mbaTakeaway}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 2: CANTEEN RADAR (#004) */}
            {activeTab === 'CANTEEN' && canteenStatus && (
              <View>
                <View style={styles.sectionHeaderBox}>
                  <Text style={styles.sectionHeading}>Canteen & Cafeteria Rush Radar (#004)</Text>
                  <Text style={styles.sectionDesc}>
                    Predictive queue tracking based on MBA lecture bell intervals
                  </Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.crowdStatusTitle}>Current Crowd Status</Text>
                    <View
                      style={[
                        styles.crowdBadge,
                        {
                          backgroundColor:
                            canteenStatus.currentCrowdLevel === 'PEAK'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : canteenStatus.currentCrowdLevel === 'LOW'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          borderColor:
                            canteenStatus.currentCrowdLevel === 'PEAK'
                              ? '#EF4444'
                              : canteenStatus.currentCrowdLevel === 'LOW'
                              ? '#10B981'
                              : '#F59E0B',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.crowdBadgeText,
                          {
                            color:
                              canteenStatus.currentCrowdLevel === 'PEAK'
                                ? '#F87171'
                                : canteenStatus.currentCrowdLevel === 'LOW'
                                ? '#34D399'
                                : '#FBBF24',
                          },
                        ]}
                      >
                        {canteenStatus.currentCrowdLevel} QUEUE ({canteenStatus.crowdPercentage}%)
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.canteenMsg}>{canteenStatus.statusMessage}</Text>

                  <View style={styles.infoGridRow}>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Optimal Visit Time</Text>
                      <Text style={styles.infoVal}>{canteenStatus.recommendedTime}</Text>
                    </View>
                    <View style={styles.infoCol}>
                      <Text style={styles.infoLabel}>Next Rush Window</Text>
                      <Text style={styles.infoVal}>{canteenStatus.nextRushHour}</Text>
                    </View>
                  </View>
                </View>
              </View>
            )}

            {/* TAB 3: FACULTY OFFICE HOURS (#005) */}
            {activeTab === 'FACULTY' && (
              <View>
                <View style={styles.sectionHeaderBox}>
                  <Text style={styles.sectionHeading}>Faculty Office Hours Booking (#005)</Text>
                  <Text style={styles.sectionDesc}>
                    Book 1-on-1 dispute or project doubt clearance with professors
                  </Text>
                </View>

                {facultySlots.map((fac) => (
                  <View key={fac.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View>
                        <Text style={styles.facName}>{fac.facultyName}</Text>
                        <Text style={styles.facSubject}>{fac.subjectName} ({fac.subjectCode})</Text>
                      </View>
                      <View style={styles.availBadge}>
                        <Text style={styles.availBadgeText}>AVAILABLE</Text>
                      </View>
                    </View>

                    <View style={styles.facDetailsRow}>
                      <Text style={styles.facDetailItem}>{fac.day}</Text>
                      <Text style={styles.facDetailItem}>{fac.timing}</Text>
                      <Text style={styles.facDetailItem}>Cabin: {fac.cabin}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.bookSlotBtn}
                      onPress={() =>
                        Alert.alert('Slot Reserved', `Office hours appointment requested with ${fac.facultyName} on ${fac.day} (${fac.timing}).`)
                      }
                    >
                      <Text style={styles.bookSlotBtnText}>Book Appointment →</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 4: SYLLABUS VELOCITY (#006) */}
            {activeTab === 'SYLLABUS' && (
              <View>
                <View style={styles.sectionHeaderBox}>
                  <Text style={styles.sectionHeading}>Batch Syllabus Velocity Tracker (#006)</Text>
                  <Text style={styles.sectionDesc}>
                    Tracks course syllabus completion speed towards 27 Nov cut-off
                  </Text>
                </View>

                {syllabusList.map((syl) => (
                  <View key={syl.subjectCode} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.sylCode}>{syl.subjectCode}</Text>
                        <Text style={styles.sylTitle}>{syl.subjectTitle}</Text>
                      </View>
                      <View
                        style={[
                          styles.velocityPill,
                          {
                            backgroundColor:
                              syl.velocityStatus === 'ON_TRACK'
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(245, 158, 11, 0.15)',
                            borderColor:
                              syl.velocityStatus === 'ON_TRACK' ? '#10B981' : '#F59E0B',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.velocityPillText,
                            {
                              color: syl.velocityStatus === 'ON_TRACK' ? '#34D399' : '#FBBF24',
                            },
                          ]}
                        >
                          {syl.velocityStatus}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarTrack}>
                      <View
                        style={[
                          styles.progressBarFill,
                          { width: `${Math.min(100, syl.completionPercentage)}%` },
                        ]}
                      />
                    </View>

                    <View style={styles.sylMetricsRow}>
                      <Text style={styles.sylMetric}>
                        Completed: <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>{syl.completedSessions}/{syl.totalPlannedSessions} sessions ({syl.completionPercentage}%)</Text>
                      </Text>
                      <Text style={styles.sylMetric}>
                        Required Pace: <Text style={{ color: '#38BDF8', fontWeight: '700' }}>{syl.expectedPacePerWeek} ses/wk</Text>
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 5: LIBRARY SHIELD (#011) */}
            {activeTab === 'LIBRARY' && (
              <View>
                <View style={styles.sectionHeaderBox}>
                  <Text style={styles.sectionHeading}>Library Overdue Shield (#011)</Text>
                  <Text style={styles.sectionDesc}>
                    Monitors borrowed books and prevents late fee penalties
                  </Text>
                </View>

                {libraryBooks.map((book) => (
                  <View key={book.id} style={styles.card}>
                    <View style={styles.cardTopRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.bookTitle}>{book.title}</Text>
                        <Text style={styles.bookAuthor}>By {book.author}</Text>
                      </View>
                      <View style={styles.daysDueBadge}>
                        <Text style={styles.daysDueBadgeText}>{book.daysRemaining} DAYS LEFT</Text>
                      </View>
                    </View>

                    <View style={styles.bookInfoRow}>
                      <Text style={styles.bookMeta}>Accession: {book.accessionNo}</Text>
                      <Text style={styles.bookMeta}>Due Date: {book.dueDate}</Text>
                      <Text style={styles.bookMeta}>Fine: ₹{book.fineAmountInr}</Text>
                    </View>

                    <TouchableOpacity
                      style={styles.renewBtn}
                      onPress={() => handleRenewBook(book.id)}
                    >
                      <Text style={styles.renewBtnText}>1-Click Renew (+14 Days)</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 6: AUDIO SUIT BRIEFING & VOICE SELECTOR (#025) */}
            {activeTab === 'VOICE' && (
              <View>
                <View style={styles.sectionHeaderBox}>
                  <Text style={styles.sectionHeading}>Audio Suit Briefing & Voice Persona (#025)</Text>
                  <Text style={styles.sectionDesc}>
                    Calibrate your AI voice persona and trigger autonomous morning schedule briefings
                  </Text>
                </View>

                {/* Persona Switcher Card */}
                <View style={styles.card}>
                  <Text style={styles.voiceTitle}>Select Voice Persona</Text>
                  <Text style={styles.voiceDesc}>
                    Choose the accent and tone that feels natural. Tap any persona to listen to an instant audio preview and calibrate your suit AI:
                  </Text>

                  <View style={styles.voicePersonaGrid}>
                    {VOICE_PERSONAS.map((persona) => {
                      const isSelected = selectedPersonaId === persona.id;
                      return (
                        <TouchableOpacity
                          key={persona.id}
                          style={[
                            styles.voicePersonaCard,
                            isSelected && styles.voicePersonaCardActive,
                          ]}
                          onPress={() => handleSelectPersona(persona.id)}
                          activeOpacity={0.7}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                            <Text style={[styles.voicePersonaName, isSelected && styles.voicePersonaNameActive]}>
                              {persona.name}
                            </Text>
                            {isSelected && (
                              <View style={styles.activePersonaBadge}>
                                <Text style={styles.activePersonaBadgeText}>ACTIVE</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.voicePersonaAccent}>{persona.accent}</Text>
                          <Text style={styles.voicePersonaDesc}>{persona.description}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Morning Briefing Trigger Card */}
                <View style={styles.card}>
                  <Text style={styles.voiceTitle}>Morning Intelligence Briefing</Text>
                  <Text style={styles.voiceDesc}>
                    Vocalizes your daily schedule, lecture rooms, first bell timing, and canteen traffic using your active persona.
                  </Text>

                  <TouchableOpacity
                    style={[styles.voiceSpeakBtn, isSpeaking && styles.voiceSpeakBtnActive]}
                    onPress={handlePlayKarenBriefing}
                    disabled={isSpeaking}
                  >
                    <Text style={styles.voiceSpeakBtnText}>
                      {isSpeaking ? 'AI Voice is speaking...' : 'Play Morning Audio Briefing'}
                    </Text>
                  </TouchableOpacity>

                  {isSpeaking && (
                    <TouchableOpacity
                      style={styles.voiceStopBtn}
                      onPress={() => {
                        KarenVoiceEngine.stopSpeaking();
                        setIsSpeaking(false);
                      }}
                    >
                      <Text style={styles.voiceStopBtnText}>Stop Audio</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Footer Exit Action */}
          <View style={styles.footerActionRow}>
            <TouchableOpacity onPress={onClose} style={styles.bottomExitBtn} activeOpacity={0.8}>
              <Text style={styles.bottomExitBtnText}>✕ Exit Arsenal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(11, 19, 43, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  container: {
    width: '100%',
    maxWidth: 640,
    maxHeight: '92%',
    backgroundColor: '#0B132B',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#2A3B5C',
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
      },
      default: {},
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1C2541',
    paddingBottom: 12,
    marginBottom: 10,
  },
  title: {
    color: '#F4E8C1',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#C5BA9D',
    fontSize: 11,
    marginTop: 2,
  },
  activeTag: {
    backgroundColor: 'rgba(244, 232, 193, 0.15)',
    borderColor: '#F4E8C1',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeTagText: {
    color: '#F4E8C1',
    fontSize: 9,
    fontWeight: '800',
  },
  exitHeaderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 232, 193, 0.12)',
    borderWidth: 1,
    borderColor: '#F4E8C1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitHeaderBtnText: {
    color: '#F4E8C1',
    fontSize: 13,
    fontWeight: '800',
  },
  footerActionRow: {
    borderTopWidth: 1,
    borderTopColor: '#2A3B5C',
    paddingTop: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  bottomExitBtn: {
    width: '100%',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#1C2541',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomExitBtnText: {
    color: '#F4E8C1',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '700',
  },
  tabsScroll: {
    maxHeight: 46,
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#1C2541',
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  tabPillActive: {
    backgroundColor: '#F4E8C1',
    borderColor: '#F4E8C1',
  },
  tabPillText: {
    color: '#8E9BB0',
    fontSize: 12,
    fontWeight: '700',
  },
  tabPillTextActive: {
    color: '#0B132B',
    fontWeight: '800',
  },
  contentScroll: {
    flex: 1,
  },
  sectionHeaderBox: {
    marginBottom: 12,
  },
  sectionHeading: {
    color: '#F4E8C1',
    fontSize: 15,
    fontWeight: '800',
  },
  sectionDesc: {
    color: '#C5BA9D',
    fontSize: 11,
    marginTop: 2,
  },
  card: {
    backgroundColor: '#1C2541',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  sourceBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sourceBadgeText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  publishedTime: {
    color: '#64748B',
    fontSize: 10,
  },
  articleTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 2,
  },
  articleSummary: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
  },
  takeawayBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  takeawayLabel: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '800',
  },
  takeawayText: {
    color: '#BAE6FD',
    fontSize: 11,
    marginTop: 2,
  },
  crowdStatusTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  crowdBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  crowdBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  canteenMsg: {
    color: '#E2E8F0',
    fontSize: 13,
    marginTop: 6,
    lineHeight: 18,
  },
  infoGridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  infoVal: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  facName: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
  },
  facSubject: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 1,
  },
  availBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  availBadgeText: {
    color: '#34D399',
    fontSize: 9,
    fontWeight: '800',
  },
  facDetailsRow: {
    marginTop: 8,
    gap: 3,
  },
  facDetailItem: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  bookSlotBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  bookSlotBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  sylCode: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  sylTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  velocityPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
  },
  velocityPillText: {
    fontSize: 10,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: '#0F172A',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
  },
  sylMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sylMetric: {
    color: '#94A3B8',
    fontSize: 11,
  },
  bookTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  bookAuthor: {
    color: '#94A3B8',
    fontSize: 11,
  },
  daysDueBadge: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderColor: '#38BDF8',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  daysDueBadgeText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
  },
  bookInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  bookMeta: {
    color: '#64748B',
    fontSize: 10,
  },
  renewBtn: {
    backgroundColor: '#10B981',
    borderRadius: 8,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 10,
  },
  renewBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  voiceTitle: {
    color: '#F4E8C1',
    fontSize: 15,
    fontWeight: '800',
  },
  voiceDesc: {
    color: '#C5BA9D',
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    marginBottom: 12,
  },
  voicePersonaGrid: {
    gap: 8,
    marginBottom: 4,
  },
  voicePersonaCard: {
    backgroundColor: '#0B132B',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#2A3B5C',
  },
  voicePersonaCardActive: {
    borderColor: '#F4E8C1',
    backgroundColor: 'rgba(244, 232, 193, 0.08)',
  },
  voicePersonaName: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '800',
  },
  voicePersonaNameActive: {
    color: '#F4E8C1',
  },
  activePersonaBadge: {
    backgroundColor: 'rgba(244, 232, 193, 0.15)',
    borderColor: '#F4E8C1',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  activePersonaBadgeText: {
    color: '#F4E8C1',
    fontSize: 9,
    fontWeight: '800',
  },
  voicePersonaAccent: {
    color: '#F4E8C1',
    fontSize: 10.5,
    fontWeight: '600',
    marginBottom: 2,
  },
  voicePersonaDesc: {
    color: '#8E9BB0',
    fontSize: 11,
    lineHeight: 15,
  },
  voiceSpeakBtn: {
    backgroundColor: '#F4E8C1',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  voiceSpeakBtnActive: {
    backgroundColor: '#10B981',
  },
  voiceSpeakBtnText: {
    color: '#0B132B',
    fontSize: 13,
    fontWeight: '800',
  },
  voiceStopBtn: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#0B132B',
    borderWidth: 1,
    borderColor: '#2A3B5C',
    alignItems: 'center',
  },
  voiceStopBtnText: {
    color: '#F4E8C1',
    fontSize: 11,
    fontWeight: '700',
  },
});
