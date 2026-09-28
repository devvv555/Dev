import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { PsgimService } from '../services/psgimService';
import {
  toNewRollNo,
  getStudentByAnyRoll,
  getStudentByName,
  STUDENTS_BY_NEW_ROLL,
} from '../data/psgimMasterStudents';
import { TermsModal } from '../components/TermsModal';

interface AuthScreenProps {
  onLoginSuccess: (rollNo: string) => void;
}

const DEFAULT_PASSWORD = 'Welcomepsgim@123';
const BACKUP_PASSWORD = 'Welcome@123';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [usernameInput, setUsernameInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState<boolean>(false);
  const [showTermsModal, setShowTermsModal] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = () => {
    setErrorMessage(null);
    const cleanUsername = usernameInput.trim();
    const cleanPassword = passwordInput.trim().toUpperCase();

    if (!cleanUsername) {
      setErrorMessage('Please enter your Name as Username.');
      return;
    }

    if (!cleanPassword) {
      setErrorMessage('Please enter your Roll Number as Password.');
      return;
    }

    if (!hasAcceptedTerms) {
      setErrorMessage('Please review and check "I agree to Terms & Conditions" to continue.');
      return;
    }

    // Look up student by registered Name (supports exact, prefix, or roll number fallback)
    const student = getStudentByName(cleanUsername);

    if (!student) {
      setErrorMessage(`Student "${cleanUsername}" is not found in the Batch 2026–28 roster. Please check the spelling of your name.`);
      return;
    }

    // Check if the password matches student's official roll number (e.g. 26AA04 or D26AA01)
    const officialRoll = student.collegeRollNo.toUpperCase();
    const legacyRoll = student.dRollNo.toUpperCase();
    const rawInput = passwordInput.trim();

    const isPasswordValid =
      cleanPassword === officialRoll ||
      cleanPassword === legacyRoll ||
      cleanPassword === officialRoll.replace(/^D/, '') ||
      rawInput === DEFAULT_PASSWORD ||
      rawInput === BACKUP_PASSWORD;

    if (!isPasswordValid) {
      setErrorMessage('Incorrect password. Your password is your official Roll Number (e.g. 26AA04).');
      return;
    }

    // Success! Always use the official roll number
    onLoginSuccess(student.collegeRollNo);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* College Header */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <Text style={styles.collegeName}>Attendance Monitor</Text>
          <Text style={styles.collegeSub}>Student Attendance & Timetable Portal</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>I MBA (Batch 2026–28) Portal</Text>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Log in using your registered Name as username and your Roll Number as password.
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* Username (Name) Input */}
          <Text style={styles.inputLabel}>USERNAME (YOUR NAME)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. Akash Vardhaman, Mithun K"
            placeholderTextColor="#64748B"
            value={usernameInput}
            onChangeText={(text) => {
              setUsernameInput(text);
              setErrorMessage(null);
            }}
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Password (Roll Number) Input */}
          <Text style={styles.inputLabel}>PASSWORD (YOUR ROLL NUMBER)</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="e.g. 26AA04"
              placeholderTextColor="#64748B"
              value={passwordInput}
              onChangeText={(text) => {
                setPasswordInput(text);
                setErrorMessage(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.showHideBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {/* Helper tip */}
          <View style={styles.tipBox}>
            <Text style={styles.tipText}>
              💡 Tip: Username is your full name. Password is your official roll number (e.g. 26AA04).
            </Text>
          </View>

          {/* Mandatory Terms & Data Consent Checkbox */}
          <View style={styles.consentRow}>
            <TouchableOpacity
              style={[styles.consentCheckbox, hasAcceptedTerms && styles.consentCheckboxActive]}
              onPress={() => setHasAcceptedTerms(!hasAcceptedTerms)}
              activeOpacity={0.8}
            >
              {hasAcceptedTerms && <Text style={styles.consentCheckmark}>✓</Text>}
            </TouchableOpacity>
            <View style={styles.consentTextCol}>
              <Text style={styles.consentText}>
                I have read and agree to the{' '}
                <Text
                  style={styles.consentLink}
                  onPress={() => setShowTermsModal(true)}
                >
                  Terms of Service & Data Consent Agreement
                </Text>
              </Text>
            </View>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.submitBtn, !hasAcceptedTerms && styles.submitBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Security Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            🔒 Private & Confidential • Only your attendance is visible upon login.
          </Text>
        </View>
      </ScrollView>

      {/* Full 7-Clause Legal Terms Modal */}
      <TermsModal
        visible={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={() => {
          setHasAcceptedTerms(true);
          setShowTermsModal(false);
        }}
        showAcceptButton={true}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  scrollContent: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 32,
  },
  collegeName: {
    color: '#F8FAFC',
    fontSize: 21,
    fontWeight: '800',
    textAlign: 'center',
  },
  collegeSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  badgePill: {
    backgroundColor: '#0C4A6E',
    borderColor: '#0284C7',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 14,
    marginTop: 10,
  },
  badgePillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  inputLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 10,
    marginBottom: 12,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  showHideBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  showHideText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  footer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
  },
  tipBox: {
    backgroundColor: '#0F172A',
    borderColor: '#334155',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  tipText: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  consentCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
  },
  consentCheckboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  consentCheckmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  consentTextCol: {
    flex: 1,
  },
  consentText: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
  },
  consentLink: {
    color: '#38BDF8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  submitBtnDisabled: {
    opacity: 0.5,
    backgroundColor: '#334155',
  },
});
