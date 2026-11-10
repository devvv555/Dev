import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Subject } from '../types';
import {
  PlacementMatcherService,
  CAMPUS_COMPANIES,
  MatchAnalysisResult,
  CampusJobDrive,
} from '../services/placementMatcherService';
import {
  AcademicRiskForecasterService,
  AcademicRiskSummary,
} from '../services/academicRiskForecasterService';
import {
  StealthUltrasonicEngine,
  STEALTH_ULTRASONIC_FREQ,
} from '../engines/starkProtocol/stealthUltrasonicEngine';

export interface Mark85CopilotModalProps {
  visible: boolean;
  onClose: () => void;
  subjects: Subject[];
  studentName?: string;
  studentRollNo?: string;
  isLightMode?: boolean;
}

type CopilotTab = 'RISK_RADAR' | 'CAREER_FIT' | 'HACKATHON_DEMO';

export const Mark85CopilotModal: React.FC<Mark85CopilotModalProps> = ({
  visible,
  onClose,
  subjects,
  studentName = 'Student',
  studentRollNo = '',
  isLightMode = false,
}) => {
  const [activeTab, setActiveTab] = useState<CopilotTab>('RISK_RADAR');

  // Hackathon Live Pitch State
  const [ultrasoundTransmitting, setUltrasoundTransmitting] = useState<boolean>(false);
  const [ultrasoundListening, setUltrasoundListening] = useState<boolean>(false);
  const [demoQuorumStatus, setDemoQuorumStatus] = useState<string>('Standby - Ready for Hackathon Pitch');
  const [demoHeardFrequency, setDemoHeardFrequency] = useState<number | null>(null);
  const [demoAttendanceMarked, setDemoAttendanceMarked] = useState<boolean>(false);

  // Career Fit State
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(CAMPUS_COMPANIES[0].id);
  const [specialization, setSpecialization] = useState<string>('Finance & Analytics');
  const [profileSkillsText, setProfileSkillsText] = useState<string>(
    'Financial Statement Analysis, Ratio Analysis, Excel, DCF valuation, Business Presentation, Problem Solving'
  );
  const [analysisResult, setAnalysisResult] = useState<MatchAnalysisResult | null>(() =>
    PlacementMatcherService.evaluateStudentProfile(
      CAMPUS_COMPANIES[0].id,
      'Financial Statement Analysis, Ratio Analysis, Excel, DCF valuation, Business Presentation, Problem Solving',
      'Finance & Analytics'
    )
  );

  // Risk Radar State
  const riskSummary: AcademicRiskSummary = AcademicRiskForecasterService.forecastAcademicRisk(subjects);

  const handleRunMatch = (companyId: string) => {
    setSelectedCompanyId(companyId);
    const res = PlacementMatcherService.evaluateStudentProfile(
      companyId,
      profileSkillsText,
      specialization
    );
    setAnalysisResult(res);
  };

  const selectedCompany: CampusJobDrive =
    CAMPUS_COMPANIES.find((c) => c.id === selectedCompanyId) || CAMPUS_COMPANIES[0];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, isLightMode && styles.containerLight]}>
        {/* Header Bar */}
        <View style={[styles.header, isLightMode && styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.headerBadge}>MARK 85 UPGRADE</Text>
              <Text style={[styles.headerSub, isLightMode && { color: '#64748B' }]}>
                B-School Copilot
              </Text>
            </View>
            <Text style={[styles.headerTitle, isLightMode && styles.headerTitleLight]}>
              PSGIM One • AI Copilot
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'RISK_RADAR' && styles.tabBtnActive,
              activeTab === 'RISK_RADAR' && { borderColor: '#EF4444' },
            ]}
            onPress={() => setActiveTab('RISK_RADAR')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'RISK_RADAR' && styles.tabBtnTextActive,
                activeTab === 'RISK_RADAR' && { color: '#F87171' },
              ]}
            >
              🛡️ Debarment Risk Radar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'CAREER_FIT' && styles.tabBtnActive,
              activeTab === 'CAREER_FIT' && { borderColor: '#EAB308' },
            ]}
            onPress={() => setActiveTab('CAREER_FIT')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'CAREER_FIT' && styles.tabBtnTextActive,
                activeTab === 'CAREER_FIT' && { color: '#FBBF24' },
              ]}
            >
              💼 Career Fit AI
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabBtn,
              activeTab === 'HACKATHON_DEMO' && styles.tabBtnActive,
              activeTab === 'HACKATHON_DEMO' && { borderColor: '#10B981' },
            ]}
            onPress={() => setActiveTab('HACKATHON_DEMO')}
          >
            <Text
              style={[
                styles.tabBtnText,
                activeTab === 'HACKATHON_DEMO' && styles.tabBtnTextActive,
                activeTab === 'HACKATHON_DEMO' && { color: '#34D399' },
              ]}
            >
              ⚡ Live Hackathon Demo
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* TAB 1: ACADEMIC RISK & DEBARMENT FORECASTER */}
          {activeTab === 'RISK_RADAR' && (
            <View>
              {/* Executive Summary Card */}
              <View style={[styles.card, { borderColor: '#EF4444', borderWidth: 1.5 }]}>
                <View style={styles.cardHeaderRow}>
                  <View>
                    <Text style={[styles.cardTitle, isLightMode && { color: '#0F172A' }]}>
                      3-Week Predictive Attendance Health
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      Algorithmic velocity projection vs 75% university debarment cutoff
                    </Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: riskSummary.overallHealthScore >= 80 ? '#10B981' : riskSummary.overallHealthScore >= 60 ? '#F59E0B' : '#EF4444' }]}>
                    <Text style={styles.scoreBadgeText}>{riskSummary.overallHealthScore}%</Text>
                    <Text style={styles.scoreBadgeSub}>Health</Text>
                  </View>
                </View>

                {/* Urgency Headline */}
                <View style={[styles.noticeBanner, { borderColor: riskSummary.criticalCount > 0 ? '#EF4444' : '#10B981', backgroundColor: riskSummary.criticalCount > 0 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)' }]}>
                  <Text style={[styles.noticeBannerText, { color: riskSummary.criticalCount > 0 ? '#F87171' : '#34D399' }]}>
                    {riskSummary.urgencyHeadline}
                  </Text>
                </View>

                {/* Tally Metrics */}
                <View style={styles.metricsRow}>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: '#EF4444' }]}>{riskSummary.criticalCount}</Text>
                    <Text style={styles.metricLabel}>Debarment Risk</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: '#F59E0B' }]}>{riskSummary.borderlineCount}</Text>
                    <Text style={styles.metricLabel}>Borderline (74-78%)</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: '#10B981' }]}>{riskSummary.safeCount}</Text>
                    <Text style={styles.metricLabel}>Safe Buffer</Text>
                  </View>
                </View>
              </View>

              {/* Subject Breakdown List */}
              <Text style={[styles.sectionHeading, isLightMode && { color: '#0F172A' }]}>
                Course-by-Course Prescriptions ({riskSummary.subjectAssessments.length} Subjects)
              </Text>

              {riskSummary.subjectAssessments.map((subj) => (
                <View
                  key={subj.code}
                  style={[
                    styles.courseCard,
                    isLightMode && styles.courseCardLight,
                    subj.riskTier === 'CRITICAL_DEBARMENT_RISK' && { borderColor: '#EF4444', borderWidth: 1.5 },
                    subj.riskTier === 'BORDERLINE_WATCH' && { borderColor: '#F59E0B', borderWidth: 1.2 },
                  ]}
                >
                  <View style={styles.courseHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.courseCode, isLightMode && { color: '#0284C7' }]}>{subj.code}</Text>
                      <Text style={[styles.courseName, isLightMode && { color: '#0F172A' }]}>{subj.name}</Text>
                    </View>
                    <View style={[styles.statusPill, { backgroundColor: subj.riskTier === 'CRITICAL_DEBARMENT_RISK' ? 'rgba(239,68,68,0.2)' : subj.riskTier === 'BORDERLINE_WATCH' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)' }]}>
                      <Text style={[styles.statusPillText, { color: subj.riskTier === 'CRITICAL_DEBARMENT_RISK' ? '#F87171' : subj.riskTier === 'BORDERLINE_WATCH' ? '#FBBF24' : '#34D399' }]}>
                        {subj.currentPercentage}%
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.prescriptionText, { color: subj.riskTier === 'CRITICAL_DEBARMENT_RISK' ? '#F87171' : subj.riskTier === 'BORDERLINE_WATCH' ? '#FBBF24' : '#94A3B8' }]}>
                    📌 {subj.statusMessage}
                  </Text>

                  {/* Future Projection Bar */}
                  <View style={styles.projectionRow}>
                    <View style={styles.projectionCol}>
                      <Text style={styles.projectionLabel}>Conducted / Attended</Text>
                      <Text style={styles.projectionVal}>
                        {subj.attendedHours} / {subj.totalConductedHours} hrs
                      </Text>
                    </View>
                    <View style={styles.projectionCol}>
                      <Text style={styles.projectionLabel}>Max Possible End %</Text>
                      <Text style={[styles.projectionVal, { color: '#10B981' }]}>
                        {subj.projectedEndPercentageIfAllAttended}%
                      </Text>
                    </View>
                    <View style={styles.projectionCol}>
                      <Text style={styles.projectionLabel}>If 1 Bunk / Wk</Text>
                      <Text style={[styles.projectionVal, { color: subj.projectedEndPercentageIfOneBunkPerWeek < 75 ? '#EF4444' : '#F59E0B' }]}>
                        {subj.projectedEndPercentageIfOneBunkPerWeek}%
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* TAB 2: PLACEMENT & RESUME FIT MATCHER */}
          {activeTab === 'CAREER_FIT' && (
            <View>
              {/* Target Company Selectors */}
              <Text style={[styles.sectionHeading, isLightMode && { color: '#0F172A' }]}>
                Select Campus Placement Drive:
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companyChipsRow}>
                {CAMPUS_COMPANIES.map((comp) => (
                  <TouchableOpacity
                    key={comp.id}
                    style={[
                      styles.companyChip,
                      selectedCompanyId === comp.id && styles.companyChipActive,
                    ]}
                    onPress={() => handleRunMatch(comp.id)}
                  >
                    <Text
                      style={[
                        styles.companyChipText,
                        selectedCompanyId === comp.id && styles.companyChipTextActive,
                      ]}
                    >
                      {comp.companyName}
                    </Text>
                    <Text style={styles.companyChipSub}>{comp.packageLpa}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Selected Role Card */}
              <View style={[styles.card, { borderColor: '#EAB308', borderWidth: 1.5 }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.companyHeaderTitle, isLightMode && { color: '#0F172A' }]}>
                      {selectedCompany.companyName} • {selectedCompany.role}
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      Domain: {selectedCompany.domain} | CTC: {selectedCompany.packageLpa}
                    </Text>
                  </View>
                  {analysisResult && (
                    <View style={[styles.scoreBadge, { backgroundColor: analysisResult.matchScore >= 80 ? '#10B981' : analysisResult.matchScore >= 60 ? '#F59E0B' : '#EF4444' }]}>
                      <Text style={styles.scoreBadgeText}>{analysisResult.matchScore}%</Text>
                      <Text style={styles.scoreBadgeSub}>Fit Score</Text>
                    </View>
                  )}
                </View>

                {/* Profile Editor Preview */}
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Your Target Specialization & Key CV Points:</Text>
                  <TextInput
                    style={[styles.textInput, isLightMode && styles.textInputLight]}
                    value={profileSkillsText}
                    onChangeText={setProfileSkillsText}
                    multiline
                    placeholder="Enter MBA skills, tools (Power BI, Excel, DCF), certifications..."
                  />
                  <TouchableOpacity
                    style={styles.recalcBtn}
                    onPress={() => handleRunMatch(selectedCompanyId)}
                  >
                    <Text style={styles.recalcBtnText}>⚡ Recalculate Semantic Match</Text>
                  </TouchableOpacity>
                </View>

                {/* Analysis Breakdown */}
                {analysisResult && (
                  <View style={styles.analysisBox}>
                    <Text style={styles.analysisTitle}>
                      Verdict: {analysisResult.verdict === 'STRONG_CANDIDATE' ? '🟢 Strong Candidate for Interview Shortlist' : analysisResult.verdict === 'COMPETITIVE_WITH_PREP' ? '🟡 Competitive (Preparation Recommended)' : '🔴 Substantial Skill Gap'}
                    </Text>

                    {/* Matched Skills */}
                    <Text style={styles.subHeading}>Matched Competencies:</Text>
                    <View style={styles.chipGrid}>
                      {analysisResult.matchedSkills.map((sk, idx) => (
                        <View key={idx} style={[styles.skillChip, { borderColor: '#10B981', backgroundColor: 'rgba(16,185,129,0.15)' }]}>
                          <Text style={{ fontSize: 10, fontWeight: '700', color: '#34D399' }}>✓ {sk}</Text>
                        </View>
                      ))}
                    </View>

                    {/* Missing Skills */}
                    {analysisResult.missingSkills.length > 0 && (
                      <>
                        <Text style={[styles.subHeading, { marginTop: 8 }]}>Missing Skills to Address:</Text>
                        <View style={styles.chipGrid}>
                          {analysisResult.missingSkills.map((sk, idx) => (
                            <View key={idx} style={[styles.skillChip, { borderColor: '#EF4444', backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                              <Text style={{ fontSize: 10, fontWeight: '700', color: '#F87171' }}>✗ {sk}</Text>
                            </View>
                          ))}
                        </View>
                      </>
                    )}

                    {/* Preparation Recommendations */}
                    <Text style={[styles.subHeading, { marginTop: 10 }]}>Actionable 48-Hour Prep Plan:</Text>
                    {analysisResult.recommendedPreparation.map((prep, idx) => (
                      <Text key={idx} style={styles.prepItemText}>
                        👉 {prep}
                      </Text>
                    ))}

                    {/* Sample Interview Questions */}
                    <Text style={[styles.subHeading, { marginTop: 10 }]}>Mock Technical / Case Questions:</Text>
                    {analysisResult.mockQuestions.map((q, idx) => (
                      <View key={idx} style={styles.questionCard}>
                        <Text style={styles.questionText}>Q{idx + 1}: "{q}"</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          )}

          {/* TAB 3: HACKATHON LIVE PITCH & ULTRASOUND TEST BENCH */}
          {activeTab === 'HACKATHON_DEMO' && (
            <View>
              {/* Pitch Card */}
              <View style={[styles.card, { borderColor: '#10B981', borderWidth: 1.5 }]}>
                <View style={styles.cardHeaderRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, isLightMode && { color: '#0F172A' }]}>
                      🎙️ Decentralized Ultrasound Quorum
                    </Text>
                    <Text style={styles.cardSubtitle}>
                      Peer-to-Peer 19.1 kHz Anti-Proxy Verification (Zero Teacher Required)
                    </Text>
                  </View>
                  <View style={[styles.scoreBadge, { backgroundColor: '#10B981' }]}>
                    <Text style={styles.scoreBadgeText}>ACTIVE</Text>
                    <Text style={styles.scoreBadgeSub}>19.1 kHz</Text>
                  </View>
                </View>

                {/* Pitch Formula Box */}
                <View style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: '#10B981', borderWidth: 1, borderRadius: 8, padding: 10, marginTop: 12 }}>
                  <Text style={{ color: '#34D399', fontSize: 11.5, fontWeight: '800', marginBottom: 4 }}>
                    🏆 How to Pitch This to Judges:
                  </Text>
                  <Text style={{ color: '#E2E8F0', fontSize: 11, lineHeight: 16 }}>
                    "Teachers don't need to do anything. 5 students inside campus geofence emit an inaudible 19.1 kHz sine chime. The other 55 phones in the lecture hall listen via microphone and auto-mark attendance with zero manual clicks. If someone skips class and stays in the hostel, the ultrasound cannot penetrate concrete walls, stopping proxy attendance permanently."
                  </Text>
                </View>
              </View>

              {/* Interactive Ultrasound Live Controls */}
              <View style={[styles.card, isLightMode && { backgroundColor: '#FFFFFF', borderColor: '#E2E8F0' }]}>
                <Text style={[styles.sectionHeading, isLightMode && { color: '#0F172A' }]}>
                  Live Hardware Demo Controls:
                </Text>

                {/* Status Box */}
                <View style={{ backgroundColor: '#0B0F19', borderColor: '#334155', borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 14 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase' }}>
                    Quorum Telemetry
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '900', color: demoAttendanceMarked ? '#34D399' : '#38BDF8', marginTop: 3 }}>
                    {demoQuorumStatus}
                  </Text>
                  {demoHeardFrequency ? (
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#FBBF24', marginTop: 4 }}>
                      📡 Detected Acoustic Peak: {demoHeardFrequency} Hz (Target: {STEALTH_ULTRASONIC_FREQ} Hz)
                    </Text>
                  ) : null}
                </View>

                {/* Action Buttons Row */}
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  {/* Transmitter Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: ultrasoundTransmitting ? '#DC2626' : '#2563EB',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={() => {
                      if (ultrasoundTransmitting) {
                        setUltrasoundTransmitting(false);
                        setDemoQuorumStatus('Transmitter Stopped');
                      } else {
                        setUltrasoundTransmitting(true);
                        setDemoQuorumStatus('🔊 Transmitting inaudible 19.1 kHz beacon for 30s...');
                        const handle = StealthUltrasonicEngine.startSilentBeacon(30);
                        setTimeout(() => {
                          setUltrasoundTransmitting(false);
                          setDemoQuorumStatus('Beacon transmission completed');
                        }, 30000);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12 }}>
                      {ultrasoundTransmitting ? '⏹️ Stop Emitting' : '🔊 Emit Ultrasound (Seed)'}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9.5, marginTop: 2 }}>
                      {ultrasoundTransmitting ? 'Pure 19.1 kHz Active' : 'Act as 1 of 5 Seeds'}
                    </Text>
                  </TouchableOpacity>

                  {/* Receiver / Listener Button */}
                  <TouchableOpacity
                    style={{
                      flex: 1,
                      backgroundColor: ultrasoundListening ? '#F59E0B' : '#059669',
                      paddingVertical: 12,
                      paddingHorizontal: 8,
                      borderRadius: 8,
                      alignItems: 'center',
                    }}
                    onPress={async () => {
                      setUltrasoundListening(true);
                      setDemoQuorumStatus('🎙️ Listening for classroom seeds via Web Audio FFT...');
                      try {
                        const heard = await StealthUltrasonicEngine.listenForClassroomSeeds(2200);
                        setUltrasoundListening(false);
                        if (heard) {
                          setDemoHeardFrequency(STEALTH_ULTRASONIC_FREQ);
                          setDemoAttendanceMarked(true);
                          setDemoQuorumStatus('✅ Acoustic Match Confirmed! Attendance Auto-Recorded.');
                        } else {
                          setDemoQuorumStatus('❌ No ultrasound detected in room. (Must be near seed phone)');
                        }
                      } catch (err: any) {
                        setUltrasoundListening(false);
                        setDemoQuorumStatus(`Microphone error: ${err?.message || 'Access blocked'}`);
                      }
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12 }}>
                      {ultrasoundListening ? '⏳ Analyzing FFT...' : '🎙️ Listen & Auto-Mark'}
                    </Text>
                    <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 9.5, marginTop: 2 }}>
                      {ultrasoundListening ? 'Scanning 18-20 kHz' : 'Act as Peer in Room'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Instant Judge Showcase Reset Button */}
                <TouchableOpacity
                  style={{
                    backgroundColor: isLightMode ? '#F1F5F9' : '#1F2937',
                    borderWidth: 1,
                    borderColor: '#374151',
                    paddingVertical: 8,
                    borderRadius: 6,
                    alignItems: 'center',
                  }}
                  onPress={() => {
                    setDemoAttendanceMarked(false);
                    setDemoHeardFrequency(null);
                    setDemoQuorumStatus('Demo Reset - Ready for Next Judge Showcase');
                  }}
                >
                  <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: '700' }}>
                    🔄 Reset Demo for Next Judge
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 3 Pillars Summary for Judges */}
              <View style={[styles.card, { borderColor: '#3B82F6', borderWidth: 1 }]}>
                <Text style={[styles.sectionHeading, { color: '#60A5FA' }]}>
                  PSGIM One • 3-Pillar Hackathon Architecture:
                </Text>
                <View style={{ gap: 8, marginTop: 4 }}>
                  <Text style={{ color: '#E2E8F0', fontSize: 11, lineHeight: 16 }}>
                    <Text style={{ fontWeight: '800', color: '#F87171' }}>1. Academic Health Radar: </Text>
                    3-week predictive modeling to eliminate debarment surprises before exam week.
                  </Text>
                  <Text style={{ color: '#E2E8F0', fontSize: 11, lineHeight: 16 }}>
                    <Text style={{ fontWeight: '800', color: '#FBBF24' }}>2. Career Fit AI: </Text>
                    Semantic match scoring for top campus recruiters (Deloitte, Federal Bank, Goldman Sachs, Amazon).
                  </Text>
                  <Text style={{ color: '#E2E8F0', fontSize: 11, lineHeight: 16 }}>
                    <Text style={{ fontWeight: '800', color: '#34D399' }}>3. Ultrasound Quorum: </Text>
                    Physical presence verified at the speed of sound without teacher hardware or manual roll call.
                  </Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  containerLight: {
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 14,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerLight: {
    backgroundColor: '#FFFFFF',
    borderBottomColor: '#E2E8F0',
  },
  headerBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  headerSub: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F9FAFB',
    marginTop: 2,
  },
  headerTitleLight: {
    color: '#0F172A',
  },
  closeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#374151',
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#F9FAFB',
    fontWeight: '800',
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#0F172A',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#1E293B',
  },
  tabBtnActive: {
    backgroundColor: '#0B0F19',
  },
  tabBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  tabBtnTextActive: {
    fontWeight: '900',
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  cardSubtitle: {
    fontSize: 10.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  scoreBadge: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  scoreBadgeText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreBadgeSub: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  noticeBanner: {
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    marginVertical: 10,
  },
  noticeBannerText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  metricVal: {
    fontSize: 18,
    fontWeight: '900',
  },
  metricLabel: {
    fontSize: 9.5,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 8,
    marginTop: 4,
  },
  courseCard: {
    backgroundColor: '#111827',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  courseCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  courseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  courseCode: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
  },
  courseName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '900',
  },
  prescriptionText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 8,
  },
  projectionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 6,
    padding: 8,
  },
  projectionCol: {
    alignItems: 'center',
  },
  projectionLabel: {
    fontSize: 9,
    color: '#9CA3AF',
  },
  projectionVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F9FAFB',
    marginTop: 2,
  },
  companyChipsRow: {
    marginBottom: 12,
  },
  companyChip: {
    backgroundColor: '#1E293B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  companyChipActive: {
    borderColor: '#EAB308',
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
  },
  companyChipText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#94A3B8',
  },
  companyChipTextActive: {
    color: '#FDE047',
  },
  companyChipSub: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 2,
  },
  companyHeaderTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  inputContainer: {
    marginTop: 10,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#0B0F19',
    borderRadius: 8,
    padding: 10,
    color: '#F9FAFB',
    fontSize: 11,
    borderWidth: 1,
    borderColor: '#334155',
    minHeight: 55,
  },
  textInputLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
    color: '#0F172A',
  },
  recalcBtn: {
    backgroundColor: '#EAB308',
    borderRadius: 6,
    paddingVertical: 7,
    alignItems: 'center',
    marginTop: 6,
  },
  recalcBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  analysisBox: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  analysisTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#F9FAFB',
    marginBottom: 6,
  },
  subHeading: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 4,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  skillChip: {
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  prepItemText: {
    fontSize: 10.5,
    color: '#CBD5E1',
    lineHeight: 16,
    marginBottom: 4,
  },
  questionCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 6,
    padding: 6,
    marginBottom: 4,
  },
  questionText: {
    fontSize: 10,
    color: '#93C5FD',
    fontStyle: 'italic',
  },
});
