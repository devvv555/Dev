import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PsgimService } from '../services/psgimService';
import { getMasterStudent } from '../data/psgimMasterStudents';

interface DigitalIdModalProps {
  visible: boolean;
  onClose: () => void;
  studentRollNo: string;
}

export const DigitalIdModal: React.FC<DigitalIdModalProps> = ({
  visible,
  onClose,
  studentRollNo,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const cleanRoll = studentRollNo.toUpperCase().trim();
  const student = getMasterStudent(cleanRoll);
  const studentName = student ? student.name : cleanRoll;
  const profile = PsgimService.getStudentProfile(cleanRoll);

  // Generate stylized barcode lines from Roll No
  const barcodePattern = [
    3, 1, 2, 4, 1, 3, 2, 1, 4, 2, 1, 3, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4,
  ];

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
                    <View style={styles.metaCol}>
                      <Text style={styles.metaColLabel}>BLOOD GROUP</Text>
                      <Text style={styles.metaColVal}>O +ve</Text>
                    </View>
                  </View>

                  {/* Scannable Stylized Barcode */}
                  <View style={styles.barcodeBox}>
                    <View style={styles.barcodeLinesRow}>
                      {barcodePattern.map((width, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.barcodeBar,
                            { width, backgroundColor: idx % 2 === 0 ? '#0F172A' : '#334155' },
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
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#0F172A',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#334155',
    maxHeight: '90%',
    padding: 16,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  topBarTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },
  disclaimerBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  disclaimerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  disclaimerIcon: {
    fontSize: 13,
  },
  disclaimerTitle: {
    color: '#FCA5A5',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  disclaimerText: {
    color: '#CBD5E1',
    fontSize: 10.5,
    lineHeight: 15,
  },
  boldRed: {
    color: '#EF4444',
    fontWeight: '800',
  },
  scrollContent: {
    alignItems: 'center',
  },
  idCardContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#0284C7',
    marginBottom: 16,
  },
  idCardTopBrand: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 3,
    borderBottomColor: '#0284C7',
  },
  psgLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  psgLogoText: {
    fontSize: 16,
  },
  psgCollegeName: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  psgCollegeSub: {
    color: '#94A3B8',
    fontSize: 9,
  },
  mbaPill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  mbaPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cardFrontContent: {
    padding: 14,
  },
  photoAndDetailsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  studentPhotoBox: {
    width: 80,
    height: 95,
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  studentPhotoInitial: {
    fontSize: 34,
    fontWeight: '800',
    color: '#0F172A',
  },
  studentPhotoPill: {
    position: 'absolute',
    bottom: 4,
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  studentPhotoPillText: {
    color: '#FFFFFF',
    fontSize: 7.5,
    fontWeight: '800',
  },
  primaryInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  studentNameLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 19,
  },
  rollBadge: {
    backgroundColor: '#E0F2FE',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    marginBottom: 4,
  },
  rollBadgeText: {
    color: '#0369A1',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  programText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  subDetailText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  metaTable: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  metaCol: {
    flex: 1,
    alignItems: 'center',
  },
  metaColLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  metaColVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  barcodeBox: {
    alignItems: 'center',
    paddingTop: 4,
  },
  barcodeLinesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 38,
  },
  barcodeBar: {
    height: '100%',
    borderRadius: 1,
  },
  barcodeNumberText: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  cardBackContent: {
    padding: 16,
    minHeight: 180,
  },
  backTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingBottom: 4,
  },
  backRow: {
    marginBottom: 8,
  },
  backLabel: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },
  backVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  backBottomNote: {
    backgroundColor: '#F1F5F9',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  backBottomNoteText: {
    fontSize: 9,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 13,
  },
  flipCardBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  flipCardBtnText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  doneBtn: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    marginTop: 4,
  },
  doneBtnText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
});
