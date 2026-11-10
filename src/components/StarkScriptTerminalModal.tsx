import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Vibration,
} from 'react-native';
import { StarkScriptEngine, StarkAuditReport } from '../engines/starkScript/interpreter';

export interface StarkScriptTerminalModalProps {
  visible: boolean;
  onClose: () => void;
  studentRollNo?: string;
  isLightMode?: boolean;
}

const SAMPLE_SCRIPTS = {
  BARN_DOOR: `PROTOCOL Barn_Door_Classified

STUDENT "26AB12" IN BATCH "B" {
    POLICY TargetAttendance = 75%
    POLICY SecrecyLevel = 100%

    COURSE "24GM11" MCOB {
        ATTENDED: 29 HOURS
        CONDUCTED: 32 HOURS
        FACULTY: "Dr. Vijaya Vardhan Manchala"
    }

    COURSE "24GM14" BS {
        ATTENDED: 28 HOURS
        CONDUCTED: 30 HOURS
        FACULTY: "Dr. R. S. Sathyanarayanan"
    }

    EXECUTE ACADEMIC_AUDIT {
        EMIT TELEMETRY("Barn Door Protocol: Output stream clamped to Devdarshan V alone")
    }

    EVALUATE PLACEMENT_FIT "Deloitte" {
        REQUIRE "Financial Modeling"
        REQUIRE "Power BI & Analytics"
        REQUIRE "Structured Problem Solving"
    }
}`,

  BATCH_B_AUDIT: `PROTOCOL Stark_576

STUDENT "D26AB12" IN BATCH "B" {
    POLICY TargetAttendance = 75%

    COURSE "24GM11" MCOB {
        ATTENDED: 29 HOURS
        CONDUCTED: 32 HOURS
        FACULTY: "Dr. Vijaya Vardhan Manchala"
    }

    COURSE "24GM12" EDM {
        ATTENDED: 21 HOURS
        CONDUCTED: 30 HOURS
        FACULTY: "Dr. Aiswarya D Pillai"
    }

    COURSE "24GM13" ADM {
        ATTENDED: 26 HOURS
        CONDUCTED: 30 HOURS
        FACULTY: "Dr. D. Kavitha"
    }

    EXECUTE ACADEMIC_AUDIT {
        EMIT TELEMETRY("Stark Protocol: Realtime compliance scan engaged")
    }

    EVALUATE PLACEMENT_FIT "Deloitte" {
        REQUIRE "Financial Modeling"
        REQUIRE "Power BI & Analytics"
        REQUIRE "Structured Problem Solving"
    }
}`,

  DEBARMENT_PROBE: `PROTOCOL Debarment_Shield

STUDENT "D26AC04" IN BATCH "C" {
    POLICY TargetAttendance = 75%

    COURSE "24GM14" BS {
        ATTENDED: 14 HOURS
        CONDUCTED: 22 HOURS
        FACULTY: "Dr. J. Sekkizhar"
    }

    COURSE "24GM15" MC {
        ATTENDED: 24 HOURS
        CONDUCTED: 26 HOURS
        FACULTY: "Dr. Saradha"
    }

    EXECUTE ACADEMIC_AUDIT {
        EMIT TELEMETRY("Checking 65% Medical Exemption threshold")
    }
}`,

  CAMPUS_COMPLIANCE: `PROTOCOL Dean_Inspector

STUDENT "D26AA01" IN BATCH "A" {
    POLICY TargetAttendance = 75%

    COURSE "24GM16" SSA {
        ATTENDED: 28 HOURS
        CONDUCTED: 30 HOURS
        FACULTY: "Dr. S. Radhakrishnan"
    }

    COURSE "24GM19" LA {
        ATTENDED: 27 HOURS
        CONDUCTED: 30 HOURS
        FACULTY: "Dr. R. Indumathy"
    }

    EXECUTE ACADEMIC_AUDIT {
        EMIT TELEMETRY("Accreditation readiness score: 96.2%")
    }
}`
};

export const StarkScriptTerminalModal: React.FC<StarkScriptTerminalModalProps> = ({
  visible,
  onClose,
  studentRollNo = '',
  isLightMode = false,
}) => {
  const [code, setCode] = useState<string>(SAMPLE_SCRIPTS.BARN_DOOR);
  const [report, setReport] = useState<StarkAuditReport>(() =>
    StarkScriptEngine.execute(SAMPLE_SCRIPTS.BARN_DOOR, studentRollNo)
  );
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRun = () => {
    try {
      Vibration.vibrate(25);
    } catch {}
    setIsExecuting(true);
    setTimeout(() => {
      const res = StarkScriptEngine.execute(code, studentRollNo);
      setReport(res);
      setIsExecuting(false);
    }, 120);
  };

  const handleLoadSample = (sampleKey: keyof typeof SAMPLE_SCRIPTS) => {
    const snippet = SAMPLE_SCRIPTS[sampleKey];
    setCode(snippet);
    const res = StarkScriptEngine.execute(snippet, studentRollNo);
    setReport(res);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <View style={[styles.container, isLightMode && styles.containerLight]}>
        {/* Terminal Header */}
        <View style={[styles.header, isLightMode && styles.headerLight]}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={styles.blinkingDot} />
              <Text style={styles.terminalBadge}>STARKSCRIPT v1.0.4 DSL</Text>
              <Text style={{ fontSize: 10, color: '#9CA3AF' }}>AST Lexer • Realtime Runtime</Text>
            </View>
            <Text style={[styles.terminalTitle, isLightMode && { color: '#0F172A' }]}>
              StarkScript Interactive IDE & Terminal
            </Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>✕ Exit Terminal</Text>
          </TouchableOpacity>
        </View>

        {/* Preset Selector Chips */}
        <View style={styles.presetRow}>
          <Text style={styles.presetLabel}>Presets:</Text>
          <TouchableOpacity
            style={[styles.presetBtn, { borderColor: '#EAB308', backgroundColor: 'rgba(234, 179, 8, 0.15)' }]}
            onPress={() => handleLoadSample('BARN_DOOR')}
          >
            <Text style={[styles.presetBtnText, { color: '#FDE047', fontWeight: '900' }]}>🔒 Barn Door</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleLoadSample('BATCH_B_AUDIT')}
          >
            <Text style={styles.presetBtnText}>Batch B Audit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleLoadSample('DEBARMENT_PROBE')}
          >
            <Text style={styles.presetBtnText}>Debarment Probe</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.presetBtn}
            onPress={() => handleLoadSample('CAMPUS_COMPLIANCE')}
          >
            <Text style={styles.presetBtnText}>Dean Compliance</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollBody}>
          {/* Code Editor Box */}
          <View style={styles.editorContainer}>
            <View style={styles.editorToolbar}>
              <Text style={styles.editorToolbarTitle}>📜 program.stark</Text>
              <TouchableOpacity
                style={[styles.execBtn, isExecuting && { backgroundColor: '#F59E0B' }]}
                onPress={handleRun}
                disabled={isExecuting}
                activeOpacity={0.8}
              >
                <Text style={styles.execBtnText}>
                  {isExecuting ? '⚡ Compiling AST...' : '▶ EXECUTE (RUN)'}
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.codeInput}
              value={code}
              onChangeText={setCode}
              multiline
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>

          {/* Execution Output Console */}
          <View style={styles.consoleContainer}>
            <View style={styles.consoleHeader}>
              <Text style={styles.consoleTitle}>📟 EXECUTION OUTPUT & TELEMETRY</Text>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Text style={styles.execSpeedText}>
                  ⏱ {report.executionTimeMs} ms
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        report.status === 'AUDIT_SUCCESS'
                          ? '#10B981'
                          : report.status === 'CRITICAL_DEBARMENT_ALARM'
                          ? '#EF4444'
                          : '#F59E0B',
                    },
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{report.status}</Text>
                </View>
              </View>
            </View>

            {/* Output Meta Summary */}
            <View style={styles.consoleMetaRow}>
              <Text style={styles.consoleMetaText}>
                Protocol: <Text style={{ color: '#EAB308', fontWeight: '800' }}>{report.protocolName}</Text>
              </Text>
              <Text style={styles.consoleMetaText}>
                Student: <Text style={{ color: '#38BDF8', fontWeight: '800' }}>{report.studentRoll}</Text> (Batch {report.batch})
              </Text>
              <Text style={styles.consoleMetaText}>
                Overall: <Text style={{ color: report.overallPct >= 75 ? '#34D399' : '#F87171', fontWeight: '900' }}>{report.overallPct}%</Text>
              </Text>
            </View>

            {/* Emitted Telemetry Logs */}
            <View style={styles.logsBox}>
              {report.emittedMessages.map((msg, idx) => (
                <Text
                  key={idx}
                  style={[
                    styles.logLine,
                    msg.includes('ALARM') || msg.includes('COMPILE_ERROR')
                      ? { color: '#F87171' }
                      : msg.includes('CAREER_FIT')
                      ? { color: '#FDE047' }
                      : { color: '#A7F3D0' },
                  ]}
                >
                  {msg}
                </Text>
              ))}
            </View>

            {/* Parsed Course AST Breakdown */}
            {report.courses.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.astHeading}>EVALUATED COURSE NODES ({report.courses.length}):</Text>
                {report.courses.map((c) => (
                  <View key={c.code} style={styles.astCourseRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.astCourseName}>
                        {c.code} {c.name} — <Text style={{ color: '#94A3B8' }}>{c.faculty || 'Unassigned'}</Text>
                      </Text>
                      <Text style={styles.astCourseSub}>
                        Attended: {c.attended} / {c.conducted} hrs • {c.safeBunks > 0 ? `${c.safeBunks} safe skips` : `Needs ${c.neededFor75} classes to hit 75%`}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.astCoursePct,
                        { color: c.percentage >= 75 ? '#34D399' : '#F87171' },
                      ]}
                    >
                      {c.percentage}%
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  containerLight: {
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 45,
    paddingBottom: 12,
    backgroundColor: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  headerLight: {
    backgroundColor: '#111827',
    borderBottomColor: '#374151',
  },
  blinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  terminalBadge: {
    fontSize: 9,
    fontWeight: '900',
    color: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  terminalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#F9FAFB',
    marginTop: 2,
  },
  closeBtn: {
    backgroundColor: '#374151',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  closeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#F9FAFB',
  },
  presetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0B0F19',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  presetLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#94A3B8',
  },
  presetBtn: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#38BDF8',
  },
  scrollBody: {
    padding: 12,
    paddingBottom: 40,
  },
  editorContainer: {
    backgroundColor: '#0A0E17',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 12,
    overflow: 'hidden',
  },
  editorToolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#131B2E',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  editorToolbarTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#93C5FD',
    fontFamily: 'monospace',
  },
  execBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  execBtnText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000000',
  },
  codeInput: {
    color: '#F1F5F9',
    fontFamily: 'monospace',
    fontSize: 11,
    padding: 12,
    minHeight: 210,
    textAlignVertical: 'top',
    lineHeight: 18,
  },
  consoleContainer: {
    backgroundColor: '#030712',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1F2937',
    padding: 12,
  },
  consoleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
    paddingBottom: 6,
  },
  consoleTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EAB308',
    letterSpacing: 0.5,
  },
  execSpeedText: {
    fontSize: 10,
    color: '#94A3B8',
    fontFamily: 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#000000',
  },
  consoleMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
  },
  consoleMetaText: {
    fontSize: 10.5,
    color: '#E2E8F0',
  },
  logsBox: {
    backgroundColor: '#000000',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#111827',
  },
  logLine: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 16,
  },
  astHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginTop: 6,
    marginBottom: 4,
  },
  astCourseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
  },
  astCourseName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  astCourseSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  astCoursePct: {
    fontSize: 13,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
});
