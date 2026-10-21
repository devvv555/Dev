import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Subject } from '../types';
import { PSGIM_COURSES } from '../data/psgimData';
import { OFFICIAL_COURSE_PLANS } from '../data/coursePlanData';

interface FacultySelectModalProps {
  visible: boolean;
  subject: Subject | null;
  onClose: () => void;
  onSaveFaculty: (subjectId: string, newFacultyName: string) => void;
}

export const FacultySelectModal: React.FC<FacultySelectModalProps> = ({
  visible,
  subject,
  onClose,
  onSaveFaculty,
}) => {
  const [customFaculty, setCustomFaculty] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  React.useEffect(() => {
    if (subject) {
      setSelectedFaculty(subject.faculty || '');
      setCustomFaculty('');
    }
  }, [subject?.id, subject?.faculty]);

  if (!subject) return null;

  // Gather all known faculty options for this course
  const cleanCode = subject.code.toUpperCase().replace(/\s+/g, '');
  const courseKey = Object.keys(PSGIM_COURSES).find(
    (k) => PSGIM_COURSES[k].code.toUpperCase() === cleanCode || k === cleanCode
  );

  const course = courseKey ? PSGIM_COURSES[courseKey] : null;
  const coursePlan = OFFICIAL_COURSE_PLANS[cleanCode] || (courseKey ? OFFICIAL_COURSE_PLANS[course?.code || ''] : null);

  const knownFacultySet = new Set<string>();
  if (course) {
    Object.values(course.faculty).forEach((f) => {
      if (f && f.trim()) knownFacultySet.add(f.trim());
    });
  }
  if (coursePlan && Array.isArray(coursePlan.faculty)) {
    coursePlan.faculty.forEach((f) => {
      if (f && f.trim()) knownFacultySet.add(f.trim());
    });
  }
  if (subject.faculty && subject.faculty.trim()) {
    knownFacultySet.add(subject.faculty.trim());
  }

  const knownFacultyList = Array.from(knownFacultySet);

  const handleSelect = (fac: string) => {
    setSelectedFaculty(fac);
    setCustomFaculty('');
  };

  const handleSave = () => {
    const finalFaculty = customFaculty.trim() || selectedFaculty || subject.faculty || '';
    if (finalFaculty) {
      onSaveFaculty(subject.id, finalFaculty);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <View style={styles.codeRow}>
                <View style={styles.codeBadge}>
                  <Text style={styles.codeBadgeText}>{subject.code}</Text>
                </View>
                <Text style={styles.headerSub}>Faculty Assignment</Text>
              </View>
              <Text style={styles.subjectName} numberOfLines={2}>
                {subject.name}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Current Faculty Banner */}
          <View style={styles.currentBox}>
            <Text style={styles.currentLabel}>CURRENTLY MENTIONED:</Text>
            <Text style={styles.currentValue}>
              👨‍🏫 {subject.faculty || 'No faculty assigned yet'}
            </Text>
          </View>

          <Text style={styles.instructionText}>
            Select the professor teaching your specific section, or enter their name below if cabins or faculty rotated:
          </Text>

          <ScrollView style={styles.facultyList} showsVerticalScrollIndicator={false}>
            {knownFacultyList.map((fac, idx) => {
              const isSelected =
                (selectedFaculty === fac && !customFaculty.trim()) ||
                (!selectedFaculty && !customFaculty.trim() && subject.faculty === fac);

              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.facultyOption, isSelected && styles.facultyOptionSelected]}
                  onPress={() => handleSelect(fac)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionRadio}>
                    <Text style={styles.radioIcon}>{isSelected ? '🔘' : '⚪'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.facultyNameText, isSelected && styles.facultyNameTextSelected]}>
                      {fac}
                    </Text>
                    {course && (
                      <Text style={styles.sectionHint}>
                        {Object.entries(course.faculty).find(([_, name]) => name === fac)
                          ? `Assigned to Section ${String.fromCharCode(64 + parseInt(Object.entries(course.faculty).find(([_, name]) => name === fac)?.[0] || '1', 10))}`
                          : 'Course Plan Faculty'}
                      </Text>
                    )}
                  </View>
                  {isSelected && <Text style={styles.checkMark}>✓</Text>}
                </TouchableOpacity>
              );
            })}

            {/* Custom Faculty Input */}
            <View style={styles.customInputBox}>
              <Text style={styles.customInputLabel}>Or enter different professor / cabin:</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. Dr. Faculty Name (Cabin 304)"
                placeholderTextColor="#64748B"
                value={customFaculty}
                onChangeText={(val) => {
                  setCustomFaculty(val);
                  if (val.trim()) setSelectedFaculty('');
                }}
              />
            </View>
          </ScrollView>

          {/* Actions */}
          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} activeOpacity={0.8}>
              <Text style={styles.saveBtnText}>Save Faculty ✅</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#0F172A',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 20,
    maxHeight: '85%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 12,
  },
  codeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  codeBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  codeBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  headerSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  subjectName: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  closeBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E293B',
    marginLeft: 8,
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  currentBox: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  currentLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  currentValue: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  instructionText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  facultyList: {
    maxHeight: 280,
  },
  facultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  facultyOptionSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0F2744',
  },
  optionRadio: {
    marginRight: 10,
  },
  radioIcon: {
    fontSize: 14,
  },
  facultyNameText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
  facultyNameTextSelected: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  sectionHint: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  checkMark: {
    color: '#38BDF8',
    fontSize: 16,
    fontWeight: '800',
    marginLeft: 8,
  },
  customInputBox: {
    marginTop: 8,
    marginBottom: 12,
  },
  customInputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#334155',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    paddingTop: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 2,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
