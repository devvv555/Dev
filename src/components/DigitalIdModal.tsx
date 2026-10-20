import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PsgimService } from '../services/psgimService';
import { getMasterStudent } from '../data/psgimMasterStudents';

interface DigitalIdModalProps {
  visible: boolean;
  onClose: () => void;
  studentRollNo: string;
}

const BLOOD_GROUPS = ['O +ve', 'O -ve', 'A +ve', 'A -ve', 'B +ve', 'B -ve', 'AB +ve', 'AB -ve'];

export const DigitalIdModal: React.FC<DigitalIdModalProps> = ({
  visible,
  onClose,
  studentRollNo,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('O +ve');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [tempPhone, setTempPhone] = useState('');

  const cleanRoll = studentRollNo.toUpperCase().trim();
  const student = getMasterStudent(cleanRoll);
  const studentName = student ? student.name : cleanRoll;
  const profile = PsgimService.getStudentProfile(cleanRoll);

  // Load saved blood group & emergency phone (defaulting to student's verified college blood group)
  useEffect(() => {
    if (!cleanRoll) return;
    const loadSavedData = async () => {
      try {
        const savedBg = await AsyncStorage.getItem(`@student_blood_group_${cleanRoll}`);
        if (savedBg) {
          setBloodGroup(savedBg);
        } else if (student?.bloodGroup) {
          setBloodGroup(student.bloodGroup);
        }

        const savedPhone = await AsyncStorage.getItem(`@student_emergency_phone_${cleanRoll}`);
        if (savedPhone) {
          setEmergencyPhone(savedPhone);
          setTempPhone(savedPhone);
        }
      } catch (e) {
        console.warn('Error loading blood group data:', e);
      }
    };
    loadSavedData();
  }, [cleanRoll, visible, student?.bloodGroup]);

  const handleSelectBloodGroup = async (bg: string) => {
    setBloodGroup(bg);
    try {
      await AsyncStorage.setItem(`@student_blood_group_${cleanRoll}`, bg);
    } catch (e) {
      console.warn('Error saving blood group:', e);
    }
  };

  const handleSavePhone = async () => {
    const trimmed = tempPhone.trim();
    setEmergencyPhone(trimmed);
    try {
      await AsyncStorage.setItem(`@student_emergency_phone_${cleanRoll}`, trimmed);
    } catch (e) {
      console.warn('Error saving emergency phone:', e);
    }
  };

  // Official Code 128 barcode patterns (ISO/IEC 15417) - universal across all laser scanners and camera apps
  const CODE128_PATTERNS = [
    '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
    '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
    '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
    '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
    '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
    '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
    '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
    '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
    '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
    '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
    '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
  ];

  const generateCode128Modules = (text: string): number[] => {
    const raw = text.trim().toUpperCase() || '26AB12';
    const startB = 104; // Code 128 Set B
    const values: number[] = [startB];

    for (let i = 0; i < raw.length; i++) {
      values.push(raw.charCodeAt(i) - 32);
    }

    let checksum = startB;
    for (let i = 1; i < values.length; i++) {
      checksum += values[i] * i;
    }
    checksum %= 103;
    values.push(checksum);
    values.push(106); // Stop sequence

    const modules: number[] = [];
    // 10 modules Quiet Zone on the left
    for (let q = 0; q < 10; q++) modules.push(0);

    for (const val of values) {
      const pattern = CODE128_PATTERNS[val];
      if (!pattern) continue;
      for (let j = 0; j < pattern.length; j++) {
        const width = parseInt(pattern[j], 10);
        const isBar = j % 2 === 0;
        for (let w = 0; w < width; w++) {
          modules.push(isBar ? 1 : 0);
        }
      }
    }

    // 10 modules Quiet Zone on the right
    for (let q = 0; q < 10; q++) modules.push(0);

    return modules;
  };

  const barcodeModules = generateCode128Modules(cleanRoll || '26AB12');

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.topBar}>
            <Text style={styles.topBarTitle}>Digital Student Identification</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Mandatory User-Requested Disclaimer */}
          <View style={styles.disclaimerBox}>
            <View style={styles.disclaimerHeaderRow}>
              <Text style={styles.disclaimerIcon}>⚠️</Text>
              <Text style={styles.disclaimerTitle}>
                WAITING FOR COLLEGE APPROVAL • EMERGENCY USE ONLY
              </Text>
            </View>
            <Text style={styles.disclaimerText}>
              This digital student ID is strictly for emergency backup identification on campus and does{' '}
              <Text style={styles.boldRed}>NOT</Text> replace your official physical PSGIM RFID Smart ID card.
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* The Physical Card Replica */}
            <View style={styles.idCardContainer}>
              {/* Card Top Brand Strip */}
              <View style={styles.idCardTopBrand}>
                <View style={styles.psgLogoBox}>
                  <Text style={styles.psgLogoText}>🏛️</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.psgCollegeName}>PSG INSTITUTE OF MANAGEMENT</Text>
                  <Text style={styles.psgCollegeSub}>Coimbatore - 641 004 • Estd. 1994</Text>
                </View>
                <View style={styles.mbaPill}>
                  <Text style={styles.mbaPillText}>MBA</Text>
                </View>
              </View>

              {!isFlipped ? (
                /* Card Front Side */
                <View style={styles.cardFrontContent}>
                  <View style={styles.photoAndDetailsRow}>
                    {/* Student Avatar / Photo Box */}
                    <View style={styles.studentPhotoBox}>
                      <Text style={styles.studentPhotoInitial}>
                        {studentName ? studentName.charAt(0) : 'S'}
                      </Text>
                      <View style={styles.studentPhotoPill}>
                        <Text style={styles.studentPhotoPillText}>STUDENT</Text>
                      </View>
                    </View>

                    {/* Primary Info */}
                    <View style={styles.primaryInfoCol}>
                      <Text style={styles.studentNameLabel} numberOfLines={2}>
                        {studentName}
                      </Text>
                      <View style={styles.rollBadge}>
                        <Text style={styles.rollBadgeText}>{cleanRoll}</Text>
                      </View>
                      <Text style={styles.programText}>
                        Master of Business Administration
                      </Text>
                      <Text style={styles.subDetailText}>
                        {profile.section || 'Section B'} • {student?.batch ? `Batch ${student.batch}` : 'Batch B'}
                      </Text>
                    </View>
                  </View>

                  {/* Key Metadata Table */}
                  <View style={styles.metaTable}>
                    <View style={styles.metaCol}>
                      <Text style={styles.metaColLabel}>VALID THRU</Text>
                      <Text style={styles.metaColVal}>JUNE 2028</Text>
                    </View>
                    <View style={styles.metaDivider} />
                    <View style={styles.metaCol}>
                      <Text style={styles.metaColLabel}>SEMESTER</Text>
                      <Text style={styles.metaColVal}>I (First)</Text>
                    </View>
                    <View style={styles.metaDivider} />
                    {/* Interactive Blood Group Selector */}
                    <TouchableOpacity
                      style={[styles.metaCol, styles.metaColInteractive]}
                      onPress={() => setShowBloodPicker(true)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.bloodLabelRow}>
                        <Text style={styles.metaColLabel}>BLOOD GROUP</Text>
                        <Text style={styles.editPencilIcon}>✎</Text>
                      </View>
                      <Text style={[styles.metaColVal, styles.bloodGroupText]}>{bloodGroup}</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Genuine Scannable Code 39 Barcode */}
                  <View style={styles.barcodeBox}>
                    <View style={styles.barcodeLinesRow}>
                      {barcodeModules.map((isBlack, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.barcodeBar,
                            {
                              backgroundColor: isBlack ? '#000000' : '#FFFFFF',
                            },
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={styles.barcodeNumberText}>* {cleanRoll} *</Text>
                  </View>
                </View>
              ) : (
                /* Card Back Side (Emergency Contacts) */
                <View style={styles.cardBackContent}>
                  <Text style={styles.backTitle}>EMERGENCY & CAMPUS CONTACTS</Text>

                  <View style={styles.backRow}>
                    <Text style={styles.backLabel}>PSGIM Main Gate Security:</Text>
                    <Text style={styles.backVal}>0422-4304400</Text>
                  </View>

                  <View style={styles.backRow}>
                    <Text style={styles.backLabel}>PSG Hospitals Ambulance:</Text>
                    <Text style={[styles.backVal, { color: '#EF4444' }]}>0422-2570170</Text>
                  </View>

                  <View style={styles.backRow}>
                    <Text style={styles.backLabel}>Student Institutional Email:</Text>
                    <Text style={styles.backVal}>{profile.email || `${cleanRoll.toLowerCase()}@psgim.ac.in`}</Text>
                  </View>

                  <View style={styles.backRow}>
                    <Text style={styles.backLabel}>Campus Address:</Text>
                    <Text style={styles.backVal}>
                      Avinashi Road, Peelamedu, Coimbatore - 641 004
                    </Text>
                  </View>

                  {/* Personal Emergency Contact */}
                  <View style={styles.emergencyContactCard}>
                    <View style={styles.emergencyContactHeader}>
                      <Text style={styles.emergencyContactTitle}>🚨 Student Emergency Contact:</Text>
                      <TouchableOpacity
                        onPress={() => setShowBloodPicker(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.emergencyEditLink}>✎ Edit</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.emergencyPhoneDisplay}>
                      {emergencyPhone || 'Not set • Tap "Edit" to add guardian phone'}
                    </Text>
                  </View>

                  <View style={styles.backBottomNote}>
                    <Text style={styles.backBottomNoteText}>
                      If found on campus, please return to PSGIM Academic Office (Admin Block, 1st Floor).
                    </Text>
                  </View>
                </View>
              )}

              {/* Flip Button */}
              <TouchableOpacity
                style={styles.flipCardBtn}
                onPress={() => setIsFlipped(!isFlipped)}
                activeOpacity={0.8}
              >
                <Text style={styles.flipCardBtnText}>
                  🔄 {isFlipped ? 'View Card Front' : 'View Emergency Contacts (Back)'}
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.doneBtn} onPress={onClose} activeOpacity={0.8}>
              <Text style={styles.doneBtnText}>Close Digital ID</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Blood Group & Emergency Contact Picker Modal */}
          <Modal visible={showBloodPicker} animationType="slide" transparent>
            <View style={styles.pickerOverlay}>
              <View style={styles.pickerCard}>
                <View style={styles.pickerHeader}>
                  <Text style={styles.pickerTitle}>🩸 Select Your Blood Group</Text>
                  <TouchableOpacity onPress={() => setShowBloodPicker(false)}>
                    <Text style={styles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.pickerSubtitle}>
                  Studzone only registers Roll Number & Date of Birth. Select your real blood group to display on your Emergency Digital ID:
                </Text>

                {/* Blood Group Grid */}
                <View style={styles.bgGrid}>
                  {BLOOD_GROUPS.map((bg) => {
                    const isSelected = bloodGroup === bg;
                    return (
                      <TouchableOpacity
                        key={bg}
                        style={[styles.bgOption, isSelected && styles.bgOptionSelected]}
                        onPress={() => handleSelectBloodGroup(bg)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.bgOptionText, isSelected && styles.bgOptionTextSelected]}>
                          {bg}
                        </Text>
                        {isSelected && <Text style={styles.bgCheck}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Emergency Contact Phone Input */}
                <View style={styles.phoneInputGroup}>
                  <Text style={styles.phoneInputLabel}>Parent / Guardian Emergency Phone:</Text>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="e.g. +91 98765 43210"
                    placeholderTextColor="#64748B"
                    value={tempPhone}
                    onChangeText={setTempPhone}
                    keyboardType="phone-pad"
                  />
                </View>

                <TouchableOpacity
                  style={styles.savePickerBtn}
                  onPress={() => {
                    handleSavePhone();
                    setShowBloodPicker(false);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.savePickerBtnText}>Save to ID Card ✅</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    padding: 16,
    maxHeight: '92%',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    paddingBottom: 10,
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
    letterSpacing: 0.3,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#1E293B',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    padding: 10,
    marginBottom: 14,
  },
  disclaimerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  disclaimerIcon: {
    fontSize: 13,
  },
  disclaimerTitle: {
    color: '#F87171',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    color: '#FCA5A5',
    fontSize: 11,
    lineHeight: 16,
  },
  boldRed: {
    color: '#EF4444',
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  scrollContent: {
    paddingBottom: 10,
  },
  idCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#CBD5E1',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  idCardTopBrand: {
    backgroundColor: '#0F2744',
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#F59E0B',
  },
  psgLogoBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  psgLogoText: {
    fontSize: 18,
  },
  psgCollegeName: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  psgCollegeSub: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: '600',
  },
  mbaPill: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  mbaPillText: {
    color: '#0F172A',
    fontSize: 10,
    fontWeight: '900',
  },
  cardFrontContent: {
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  photoAndDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  studentPhotoBox: {
    width: 80,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#E2E8F0',
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  studentPhotoInitial: {
    fontSize: 34,
    fontWeight: '900',
    color: '#334155',
  },
  studentPhotoPill: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: '#0F2744',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  studentPhotoPillText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  primaryInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  studentNameLabel: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 19,
    marginBottom: 4,
  },
  rollBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  rollBadgeText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  programText: {
    color: '#475569',
    fontSize: 11,
    fontWeight: '700',
  },
  subDetailText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  metaTable: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 6,
    marginBottom: 12,
    alignItems: 'center',
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  metaColInteractive: {
    backgroundColor: '#E0F2FE',
    borderRadius: 6,
    paddingVertical: 2,
  },
  bloodLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  editPencilIcon: {
    fontSize: 9,
    color: '#0284C7',
    fontWeight: '900',
  },
  metaColLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  metaColVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  bloodGroupText: {
    color: '#0369A1',
    fontWeight: '900',
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  barcodeBox: {
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingBottom: 4,
    borderRadius: 6,
    marginTop: 6,
  },
  barcodeLinesRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 48,
    marginBottom: 4,
  },
  barcodeBar: {
    width: 2,
    height: '100%',
  },
  barcodeNumberText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 2,
  },
  cardBackContent: {
    padding: 14,
    backgroundColor: '#F8FAFC',
  },
  backTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#0F2744',
    letterSpacing: 0.5,
    marginBottom: 10,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 6,
  },
  backRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  backVal: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
  },
  emergencyContactCard: {
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  emergencyContactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 3,
  },
  emergencyContactTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#991B1B',
  },
  emergencyEditLink: {
    fontSize: 10,
    fontWeight: '800',
    color: '#DC2626',
  },
  emergencyPhoneDisplay: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7F1D1D',
  },
  backBottomNote: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
  },
  backBottomNoteText: {
    fontSize: 9,
    color: '#64748B',
    lineHeight: 13,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  flipCardBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 10,
    alignItems: 'center',
  },
  flipCardBtnText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '800',
  },
  doneBtn: {
    marginTop: 14,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  pickerCard: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  pickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  pickerSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    lineHeight: 18,
    marginBottom: 16,
  },
  bgGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  bgOption: {
    width: '23%',
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  bgOptionSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0F2744',
  },
  bgOptionText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '700',
  },
  bgOptionTextSelected: {
    color: '#38BDF8',
    fontWeight: '900',
  },
  bgCheck: {
    color: '#38BDF8',
    fontSize: 10,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  phoneInputGroup: {
    marginBottom: 16,
  },
  phoneInputLabel: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  phoneInput: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  savePickerBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  savePickerBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
