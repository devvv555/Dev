import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { CoursePlan, StudentCourseCaRecord } from '../types';
import { getCoursePlanForSubject } from '../data/coursePlanData';
import { CoursePlanService } from '../services/coursePlanService';

interface CoursePlanModalProps {
  visible: boolean;
  onClose: () => void;
  subjectCode: string;
  subjectName?: string;
  studentRollNo: string;
  allowSubjectSwitching?: boolean;
}

export const CoursePlanModal: React.FC<CoursePlanModalProps> = ({
  visible,
  onClose,
  subjectCode: initialCode,
  subjectName: initialName,
  studentRollNo,
  allowSubjectSwitching = true,
}) => {
  const [activeTab, setActiveTab] = useState<'ASSESSMENTS' | 'SESSIONS' | 'RULES'>('ASSESSMENTS');
  const [currentCode, setCurrentCode] = useState<string>(initialCode || '24GM14');
  const [currentName, setCurrentName] = useState<string>(initialName || 'Business Statistics');

  const [plan, setPlan] = useState<CoursePlan>(() =>
    getCoursePlanForSubject(initialCode || '24GM14', initialName)
  );
  const [caMarks, setCaMarks] = useState<Record<string, string>>({});
  const [targetGrade, setTargetGrade] = useState<'O' | 'A+' | 'A' | 'B+'>('A+');
  const [isSaving, setIsSaving] = useState(false);

  // Sync when prop changes
  useEffect(() => {
    if (initialCode) {
      setCurrentCode(initialCode);
      setCurrentName(initialName || '');
    }
  }, [initialCode, initialName]);

  // Load course plan and CA record when currentCode or studentRollNo changes
  useEffect(() => {
    const loadedPlan = getCoursePlanForSubject(currentCode, currentName);
    setPlan(loadedPlan);

    if (studentRollNo && currentCode) {
      CoursePlanService.getStudentCaRecord(studentRollNo, currentCode).then((record) => {
        if (record) {
          const strMarks: Record<string, string> = {};
          Object.entries(record.marks || {}).forEach(([k, v]) => {
            strMarks[k] = v.toString();
          });
          setCaMarks(strMarks);
          if (record.targetGrade) {
            setTargetGrade(record.targetGrade);
          }
        } else {
          setCaMarks({});
        }
      });
    }
  }, [currentCode, currentName, studentRollNo]);

  // Numeric marks object
  const numericMarks: Record<string, number> = {};
  Object.entries(caMarks).forEach(([k, v]) => {
    const num = parseFloat(v);
    if (!isNaN(num)) numericMarks[k] = num;
  });

  const caStats = CoursePlanService.calculateTotalCaScore(plan, numericMarks);
  const feTarget = CoursePlanService.calculateRequiredFeScore(caStats.obtainedTotal, targetGrade);

  const handleSaveMarks = async () => {
    setIsSaving(true);
    try {
      const record: StudentCourseCaRecord = {
        subjectCode: plan.subjectCode,
        marks: numericMarks,
        targetGrade,
        updatedAt: new Date().toISOString(),
      };
      await CoursePlanService.saveStudentCaRecord(studentRollNo, record);
      Alert.alert('CA Marks Saved', `Your continuous assessment marks for ${plan.subjectCode} have been saved.`);
    } catch {
      Alert.alert('Error', 'Could not save CA marks.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <View style={styles.subjectBadgeRow}>
                <View style={styles.codePill}>
                  <Text style={styles.codePillText}>{plan.subjectCode}</Text>
                </View>
                <View style={styles.modePill}>
                  <Text style={styles.modePillText}>{plan.mode}</Text>
                </View>
              </View>
              <Text style={styles.subjectTitle} numberOfLines={1}>
                {plan.subjectTitle}
              </Text>
              <Text style={styles.facultySub} numberOfLines={1}>
                {plan.faculty.join(', ')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Subject Switcher: Tap any subject to switch its course plan directly (Shown when browsing all courses) */}
          {allowSubjectSwitching && (
            <View style={styles.subjectSwitcherContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subjectSwitcherScroll}>
                {[
                  { code: '24GM14', label: 'BS (Stats)' },
                  { code: '24GM13', label: 'ADM (Accounting)' },
                  { code: '24GM16', label: 'SSA (Spreadsheet)' },
                  { code: '24GM11', label: 'MCOB (Mgmt & OB)' },
                  { code: '24GM12', label: 'EDM (Economics)' },
                  { code: '24GM15', label: 'MC (Comm)' },
                  { code: '24GM19', label: 'LA (Legal)' },
                  { code: '24GM18', label: 'SSM (Social)' },
                ].map((sub) => {
                  const isSelected = currentCode.toUpperCase() === sub.code.toUpperCase() ||
                    plan.subjectCode.toUpperCase() === sub.code.toUpperCase();
                  return (
                    <TouchableOpacity
                      key={sub.code}
                      onPress={() => {
                        setCurrentCode(sub.code);
                        setCurrentName('');
                      }}
                      style={[
                        styles.subjectSwitchPill,
                        isSelected && styles.subjectSwitchPillActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.subjectSwitchPillText,
                          isSelected && styles.subjectSwitchPillTextActive,
                        ]}
                      >
                        {sub.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Sub Navigation Tabs */}
          <View style={styles.tabBar}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'ASSESSMENTS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('ASSESSMENTS')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'ASSESSMENTS' && styles.tabBtnTextActive]}>
                CA Marks ({caStats.obtainedTotal}/50)
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'SESSIONS' && styles.tabBtnActive]}
              onPress={() => setActiveTab('SESSIONS')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'SESSIONS' && styles.tabBtnTextActive]}>
                30 Sessions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'RULES' && styles.tabBtnActive]}
              onPress={() => setActiveTab('RULES')}
            >
              <Text style={[styles.tabBtnText, activeTab === 'RULES' && styles.tabBtnTextActive]}>
                Rules & Books
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* TAB 1: ASSESSMENTS & TARGET CALCULATOR */}
            {activeTab === 'ASSESSMENTS' && (
              <View style={styles.section}>
                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryTopRow}>
                    <View>
                      <Text style={styles.summaryLabel}>TOTAL CA OBTAINED</Text>
                      <Text style={styles.summaryValue}>
                        {caStats.obtainedTotal} <Text style={styles.summaryMax}>/ {plan.caMaxMarks} M</Text>
                      </Text>
                    </View>
                    <View style={styles.pctBadge}>
                      <Text style={styles.pctBadgeText}>{caStats.percentage.toFixed(0)}%</Text>
                    </View>
                  </View>

                  {/* Target Grade Selector */}
                  <View style={styles.targetRow}>
                    <Text style={styles.targetLabel}>Target Grade:</Text>
                    <View style={styles.targetBtnsRow}>
                      {(['O', 'A+', 'A', 'B+'] as const).map((grade) => (
                        <TouchableOpacity
                          key={grade}
                          style={[
                            styles.gradeBtn,
                            targetGrade === grade && styles.gradeBtnActive,
                          ]}
                          onPress={() => setTargetGrade(grade)}
                        >
                          <Text
                            style={[
                              styles.gradeBtnText,
                              targetGrade === grade && styles.gradeBtnTextActive,
                            ]}
                          >
                            {grade}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  {/* Target Forecast Banner */}
                  <View
                    style={[
                      styles.targetBanner,
                      feTarget.isAchievable ? styles.targetBannerGreen : styles.targetBannerOrange,
                    ]}
                  >
                    <Text style={styles.targetBannerText}>{feTarget.statusText}</Text>
                  </View>
                </View>

                {/* Individual Assessment Cards */}
                <Text style={styles.sectionHeader}>Assessment Pattern (Total: 50 Marks)</Text>
                {plan.assessments.map((item, idx) => {
                  const isMidTerm = item.id.includes('mid') || item.title.toLowerCase().includes('mid term');
                  return (
                    <View key={item.id} style={styles.assessmentCard}>
                      <View style={styles.assessmentTopRow}>
                        <View style={{ flex: 1 }}>
                          <View style={styles.assessmentBadgeRow}>
                            <Text style={styles.itemNumber}>#{idx + 1}</Text>
                            {item.coTarget ? (
                              <View style={styles.coBadge}>
                                <Text style={styles.coBadgeText}>{item.coTarget}</Text>
                              </View>
                            ) : null}
                            <Text style={styles.assessmentDate}>{item.scheduledDate}</Text>
                          </View>
                          <Text style={styles.assessmentTitle}>{item.title}</Text>
                          <Text style={styles.assessmentScope}>Scope: {item.sessionsCovered}</Text>
                        </View>

                        {/* Marks Input Box */}
                        <View style={styles.marksInputBox}>
                          <TextInput
                            style={styles.marksTextInput}
                            keyboardType="numeric"
                            placeholder="0"
                            placeholderTextColor="#64748B"
                            maxLength={5}
                            value={caMarks[item.id] || ''}
                            onChangeText={(val) => {
                              setCaMarks((prev) => ({ ...prev, [item.id]: val }));
                            }}
                          />
                          <Text style={styles.maxMarksText}>/ {item.marksAllotted}</Text>
                        </View>
                      </View>

                      {/* 💡 Automatic 40 -> 20 Marks Converter for Mid Term Exam */}
                      {isMidTerm && (
                        <View style={styles.midTermConvertBox}>
                          <View style={styles.convertLeft}>
                            <Text style={styles.convertLabel}>WROTE FOR 40 MARKS?</Text>
                            <Text style={styles.convertSub}>Auto-converts to 20 marks weightage: (Score ÷ 40) × 20</Text>
                          </View>
                          <View style={styles.quickInputsRow}>
                            <TextInput
                              style={styles.rawInputBox}
                              keyboardType="numeric"
                              placeholder="e.g. 34"
                              placeholderTextColor="#64748B"
                              maxLength={4}
                              onChangeText={(rawVal) => {
                                const raw = parseFloat(rawVal);
                                if (!isNaN(raw) && raw >= 0) {
                                  // (raw / 40) * 20
                                  const converted = ((Math.min(raw, 40) / 40) * 20).toFixed(1);
                                  const finalVal = converted.endsWith('.0') ? converted.slice(0, -2) : converted;
                                  setCaMarks((prev) => ({ ...prev, [item.id]: finalVal }));
                                }
                              }}
                            />
                            <Text style={styles.rawMaxText}>/ 40</Text>
                          </View>
                        </View>
                      )}

                      {item.description ? (
                        <Text style={styles.assessmentDesc}>{item.description}</Text>
                      ) : null}
                    </View>
                  );
                })}

                <TouchableOpacity
                  style={[styles.saveBtn, isSaving && { opacity: 0.7 }]}
                  onPress={handleSaveMarks}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveBtnText}>
                    {isSaving ? 'Saving...' : 'Save CA Marks & Forecast'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* TAB 2: 30 SESSIONS ROADMAP */}
            {activeTab === 'SESSIONS' && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Session-Wise Syllabus Plan (30 Sessions)</Text>
                {plan.sessions.map((sess) => (
                  <View key={sess.sessionNumber} style={styles.sessionRow}>
                    <View style={styles.sessionNumCircle}>
                      <Text style={styles.sessionNumText}>{sess.sessionNumber}</Text>
                    </View>
                    <View style={styles.sessionDetails}>
                      <View style={styles.sessionMetaRow}>
                        <View style={styles.unitPill}>
                          <Text style={styles.unitPillText}>{sess.unit}</Text>
                        </View>
                        {sess.date ? (
                          <Text style={styles.sessionDate}>{sess.date}</Text>
                        ) : null}
                        {sess.requiresLaptop ? (
                          <View style={styles.laptopPill}>
                            <Text style={styles.laptopPillText}>{sess.software || 'Laptop'}</Text>
                          </View>
                        ) : null}
                        {sess.isExam ? (
                          <View style={styles.examPill}>
                            <Text style={styles.examPillText}>EXAM</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.sessionTopic}>{sess.topic}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* TAB 3: RULES & TEXTBOOKS */}
            {activeTab === 'RULES' && (
              <View style={styles.section}>
                <Text style={styles.sectionHeader}>Classroom Rules & Prerequisites</Text>
                <View style={styles.rulesCard}>
                  {plan.classroomRules.map((rule, idx) => (
                    <View key={idx} style={styles.ruleItem}>
                      <Text style={styles.ruleText}>{rule}</Text>
                    </View>
                  ))}
                </View>

                <Text style={[styles.sectionHeader, { marginTop: 16 }]}>Recommended Textbooks</Text>
                <View style={styles.booksCard}>
                  {plan.recommendedBooks.map((book, idx) => (
                    <View key={idx} style={styles.bookItem}>
                      <Text style={styles.bookBullet}>•</Text>
                      <Text style={styles.bookText}>{book}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '75%',
    borderWidth: 1,
    borderColor: '#334155',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    alignItems: 'flex-start',
  },
  subjectBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  codePill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codePillText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  modePill: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
  },
  modePillText: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '700',
  },
  subjectTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  facultySub: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#1E293B',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 15,
    fontWeight: '700',
  },
  subjectSwitcherContainer: {
    backgroundColor: '#0B1120',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingVertical: 8,
  },
  subjectSwitcherScroll: {
    paddingHorizontal: 12,
    gap: 6,
  },
  subjectSwitchPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  subjectSwitchPillActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  subjectSwitchPillText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  subjectSwitchPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingHorizontal: 12,
    paddingTop: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#38BDF8',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#38BDF8',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 20,
  },
  summaryCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  summaryValue: {
    color: '#F8FAFC',
    fontSize: 26,
    fontWeight: '800',
  },
  summaryMax: {
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },
  pctBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34D399',
  },
  pctBadgeText: {
    color: '#34D399',
    fontSize: 14,
    fontWeight: '800',
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    marginBottom: 10,
  },
  targetLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '700',
  },
  targetBtnsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  gradeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  gradeBtnActive: {
    backgroundColor: '#0284C7',
    borderColor: '#38BDF8',
  },
  gradeBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '800',
  },
  gradeBtnTextActive: {
    color: '#FFFFFF',
  },
  targetBanner: {
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  targetBannerGreen: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  targetBannerOrange: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.3)',
  },
  targetBannerText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeader: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
    letterSpacing: 0.3,
  },
  assessmentCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 10,
  },
  assessmentTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  assessmentBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  itemNumber: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
  },
  coBadge: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  coBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  assessmentDate: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  assessmentTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  assessmentScope: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  marksInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  marksTextInput: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    minWidth: 32,
    textAlign: 'center',
  },
  maxMarksText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 2,
  },
  assessmentDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 15,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  sessionRow: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'flex-start',
    gap: 10,
  },
  sessionNumCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionNumText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  sessionDetails: {
    flex: 1,
  },
  sessionMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  unitPill: {
    backgroundColor: '#334155',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  unitPillText: {
    color: '#E2E8F0',
    fontSize: 9.5,
    fontWeight: '700',
  },
  sessionDate: {
    color: '#38BDF8',
    fontSize: 10,
    fontWeight: '600',
  },
  laptopPill: {
    backgroundColor: 'rgba(168, 85, 247, 0.18)',
    borderWidth: 1,
    borderColor: '#A855F7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  laptopPillText: {
    color: '#D8B4FE',
    fontSize: 9.5,
    fontWeight: '700',
  },
  examPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.18)',
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  examPillText: {
    color: '#FCA5A5',
    fontSize: 9.5,
    fontWeight: '800',
  },
  sessionTopic: {
    color: '#F1F5F9',
    fontSize: 12,
    lineHeight: 16,
  },
  rulesCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  ruleItem: {
    paddingVertical: 2,
  },
  ruleText: {
    color: '#E2E8F0',
    fontSize: 12,
    lineHeight: 17,
  },
  booksCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 10,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bookBullet: {
    fontSize: 14,
  },
  bookText: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 11.5,
    lineHeight: 16,
  },
  midTermConvertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
    padding: 10,
    marginTop: 10,
  },
  convertLeft: {
    flex: 1,
    marginRight: 10,
  },
  convertLabel: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  convertSub: {
    color: '#94A3B8',
    fontSize: 10.5,
    marginTop: 2,
    lineHeight: 14,
  },
  quickInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#334155',
  },
  rawInputBox: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    width: 48,
    paddingVertical: 2,
  },
  rawMaxText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
});
