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
import { toNewRollNo, getStudentByAnyRoll, STUDENTS_BY_NEW_ROLL } from '../data/psgimMasterStudents';

interface AuthScreenProps {
  onLoginSuccess: (rollNo: string) => void;
}

const DEFAULT_PASSWORD = 'Welcomepsgim@123';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess }) => {
  const [rollNoInput, setRollNoInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = () => {
    setErrorMessage(null);
    const cleanRoll = rollNoInput.trim().toUpperCase();

    if (!cleanRoll) {
      setErrorMessage('Please enter your Roll Number.');
      return;
    }

    // Direct students to their new roll number if they type an old internal ID (D26...)
    if (cleanRoll.startsWith('D26')) {
      const mapped = getStudentByAnyRoll(cleanRoll);
      const newRoll = mapped?.collegeRollNo;
      setErrorMessage(
        newRoll
          ? `Your username is your new roll number: "${newRoll}". Please sign in with ${newRoll}.`
          : 'Please enter your new official Roll Number (e.g. 26AA04). Old internal roll numbers are discontinued.'
      );
      return;
    }

    // Verify student exists in official new roll number registry
    const student = STUDENTS_BY_NEW_ROLL[cleanRoll] || PsgimService.getStudent(cleanRoll);
    if (!student) {
      setErrorMessage(`Roll Number "${cleanRoll}" is not registered in the PSGIM Batch 2026–28 roster.`);
      return;
    }

    if (!passwordInput) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (passwordInput !== DEFAULT_PASSWORD) {
      setErrorMessage('Incorrect password. Please enter your valid credentials.');
      return;
    }

    // Success! Always use the official new roll number
    const officialRoll = toNewRollNo(cleanRoll);
    onLoginSuccess(officialRoll);
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
          <Text style={styles.collegeName}>PSG Institute of Management</Text>
          <Text style={styles.collegeSub}>PSG College of Technology</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>I MBA (Batch 2026–28) Portal</Text>
          </View>
        </View>

        {/* Login Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Student Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Log in to view your personal dynamic attendance and hourly timetable.
          </Text>

          {errorMessage && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* Roll Number Input */}
          <Text style={styles.inputLabel}>USERNAME (NEW ROLL NUMBER)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g. 26AA04, 26AB33, 26AC09"
            placeholderTextColor="#64748B"
            value={rollNoInput}
            onChangeText={(text) => {
              setRollNoInput(text);
              setErrorMessage(null);
            }}
            autoCapitalize="characters"
            autoCorrect={false}
          />

          {/* Password Input */}
          <Text style={styles.inputLabel}>PASSWORD</Text>
          <View style={styles.passwordWrapper}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Enter password"
              placeholderTextColor="#64748B"
              value={passwordInput}
              onChangeText={(text) => {
                setPasswordInput(text);
                setErrorMessage(null);
              }}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={styles.showHideBtn}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={styles.showHideText}>{showPassword ? 'Hide' : 'Show'}</Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={styles.submitBtn}
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
});
