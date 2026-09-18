import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Subject, TimetableSlot } from '../types';
import { PsgimService } from '../services/psgimService';

interface BarcodeScannerScreenProps {
  subjects: Subject[];
  currentSlot?: TimetableSlot;
  onStudentScanned: (rollNumber: string, subjectId: string) => void;
}

interface ScannedRecord {
  rollNo: string;
  timestamp: string;
  subjectName: string;
  status: 'PRESENT';
  assignedBatch?: string;
  section?: string;
}

export const BarcodeScannerScreen: React.FC<BarcodeScannerScreenProps> = ({
  subjects,
  currentSlot,
  onStudentScanned,
}) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scannedSession, setScannedSession] = useState<ScannedRecord[]>([]);
  const [lastScannedRoll, setLastScannedRoll] = useState<string | null>(null);
  const [isScanningActive, setIsScanningActive] = useState<boolean>(true);
  const [manualRollInput, setManualRollInput] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(
    currentSlot?.subjectId || subjects[0]?.id || ''
  );

  const activeSubject = subjects.find((s) => s.id === selectedSubjectId) || subjects[0];

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (!isScanningActive) return;
    const cleanRollNo = data.trim().toUpperCase();

    // Check duplicate in current session
    if (scannedSession.some((r) => r.rollNo === cleanRollNo)) {
      setLastScannedRoll(`${cleanRollNo} (Already Scanned!)`);
      return;
    }

    // Process scan
    recordAttendance(cleanRollNo);

    // Pause briefly to prevent duplicate rapid triggers
    setIsScanningActive(false);
    setTimeout(() => setIsScanningActive(true), 2000);
  };

  const recordAttendance = (rollNo: string) => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const student = PsgimService.getStudent(rollNo);
    const courseCodeShort = activeSubject?.code ? activeSubject.code.replace('24GM1', '') : '';
    // Find course key from subject name or code
    const studentBatch = student?.batches ? Object.values(student.batches).find(b => activeSubject?.batch && b === activeSubject.batch) || Object.values(student.batches)[0] : undefined;

    const newRecord: ScannedRecord = {
      rollNo,
      timestamp: timeStr,
      subjectName: activeSubject?.name || 'Class',
      status: 'PRESENT',
      assignedBatch: studentBatch,
      section: rollNo.slice(3, 5), // e.g. "AA", "AB"
    };

    setScannedSession((prev) => [newRecord, ...prev]);
    setLastScannedRoll(student ? `${rollNo} (Sec ${newRecord.section})` : rollNo);
    if (activeSubject) {
      onStudentScanned(rollNo, activeSubject.id);
    }
  };

  const handleManualSubmit = () => {
    if (!manualRollInput.trim()) return;
    const roll = manualRollInput.trim().toUpperCase();
    if (scannedSession.some((r) => r.rollNo === roll)) {
      Alert.alert('Duplicate', `${roll} is already marked present.`);
      return;
    }
    recordAttendance(roll);
    setManualRollInput('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header & Active Class Info */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ID Card Barcode Scanner</Text>
        <Text style={styles.headerSubtitle}>
          Scan student ID card barcodes to record attendance by Roll Number.
        </Text>
      </View>

      {/* Target Subject Selector */}
      <View style={styles.subjectSelectorCard}>
        <Text style={styles.selectorLabel}>RECORDING ATTENDANCE FOR:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectPills}>
          {subjects.map((sub) => (
            <TouchableOpacity
              key={sub.id}
              style={[
                styles.subjectPill,
                selectedSubjectId === sub.id && styles.subjectPillActive,
              ]}
              onPress={() => setSelectedSubjectId(sub.id)}
            >
              <Text
                style={[
                  styles.subjectPillText,
                  selectedSubjectId === sub.id && styles.subjectPillTextActive,
                ]}
              >
                {sub.code} ({sub.name.slice(0, 14)}...)
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Camera Viewfinder Area */}
      <View style={styles.cameraContainer}>
        {Platform.OS === 'web' ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionIcon}>💻</Text>
            <Text style={styles.permissionTitle}>Laptop Web Mode</Text>
            <Text style={styles.permissionDesc}>
              Camera scanner is active on mobile. On your laptop, use the Roll Number box below to test attendance recording!
            </Text>
          </View>
        ) : !permission?.granted ? (
          <View style={styles.permissionBox}>
            <Text style={styles.permissionIcon}>📷</Text>
            <Text style={styles.permissionTitle}>Camera Permission Required</Text>
            <Text style={styles.permissionDesc}>
              Allow camera access to read barcodes on college ID cards.
            </Text>
            <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
              <Text style={styles.grantBtnText}>Grant Camera Access</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.viewfinderWrapper}>
            <CameraView
              style={styles.camera}
              facing="back"
              barcodeScannerSettings={{
                barcodeTypes: ['code128', 'code39', 'qr', 'ean13', 'upc_a'],
              }}
              onBarcodeScanned={isScanningActive ? handleBarcodeScanned : undefined}
            />

            {/* Target Reticle Overlay */}
            <View style={styles.reticleOverlay}>
              <View style={styles.reticleBox}>
                <View style={styles.laserLine} />
              </View>
              <Text style={styles.reticleHint}>
                Align ID Card Barcode Inside the Box
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Instant Scan Feedback Banner */}
      {lastScannedRoll && (
        <View style={styles.scanSuccessBanner}>
          <Text style={styles.scanSuccessIcon}>✅</Text>
          <View>
            <Text style={styles.scanSuccessRoll}>{lastScannedRoll}</Text>
            <Text style={styles.scanSuccessSub}>
              Marked Present for {activeSubject?.name}
            </Text>
          </View>
        </View>
      )}

      {/* Scratched Barcode Fallback (Manual Input) */}
      <View style={styles.manualCard}>
        <Text style={styles.manualTitle}>Card Scratched or Damaged?</Text>
        <View style={styles.manualInputRow}>
          <TextInput
            style={styles.manualInput}
            placeholder="Type Roll No (e.g. 21CS042)"
            placeholderTextColor="#64748B"
            value={manualRollInput}
            onChangeText={setManualRollInput}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.manualAddBtn} onPress={handleManualSubmit}>
            <Text style={styles.manualAddText}>Add</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Scanned Roll Numbers List */}
      <View style={styles.logSection}>
        <View style={styles.logSectionHeader}>
          <Text style={styles.logSectionTitle}>
            Session Roll Call ({scannedSession.length} Present)
          </Text>
          {scannedSession.length > 0 && (
            <TouchableOpacity onPress={() => setScannedSession([])}>
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>

        {scannedSession.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No ID cards scanned in this session yet.</Text>
          </View>
        ) : (
          scannedSession.map((rec, index) => (
            <View key={`${rec.rollNo}-${index}`} style={styles.recordItem}>
              <View style={styles.recordLeft}>
                <Text style={styles.recordIndex}>#{scannedSession.length - index}</Text>
                <Text style={styles.recordRoll}>{rec.rollNo}</Text>
              </View>
              <View style={styles.recordRight}>
                <Text style={styles.recordTime}>{rec.timestamp}</Text>
                <View style={styles.presentPill}>
                  <Text style={styles.presentPillText}>PRESENT</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  subjectSelectorCard: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  selectorLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  subjectPills: {
    flexDirection: 'row',
  },
  subjectPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  subjectPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  subjectPillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  subjectPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  cameraContainer: {
    height: 240,
    backgroundColor: '#020617',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 14,
  },
  permissionBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  permissionTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  permissionDesc: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 6,
  },
  grantBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 6,
  },
  grantBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  viewfinderWrapper: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  reticleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reticleBox: {
    width: '75%',
    height: 100,
    borderWidth: 2,
    borderColor: '#38BDF8',
    borderRadius: 8,
    justifyContent: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.05)',
  },
  laserLine: {
    height: 2,
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  reticleHint: {
    color: '#E2E8F0',
    fontSize: 11,
    fontWeight: '600',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 8,
  },
  scanSuccessBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 14,
  },
  scanSuccessIcon: {
    fontSize: 24,
  },
  scanSuccessRoll: {
    color: '#34D399',
    fontSize: 16,
    fontWeight: '800',
  },
  scanSuccessSub: {
    color: '#A7F3D0',
    fontSize: 11,
  },
  manualCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  manualTitle: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  manualInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  manualInput: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  manualAddBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  manualAddText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
  },
  logSection: {
    marginTop: 4,
  },
  logSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logSectionTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  clearText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 10,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  recordLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  recordIndex: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  recordRoll: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },
  recordRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recordTime: {
    color: '#94A3B8',
    fontSize: 11,
  },
  presentPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  presentPillText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
  },
  emptyCard: {
    padding: 16,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 12,
  },
});
