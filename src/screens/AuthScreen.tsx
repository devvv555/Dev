import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Easing,
} from 'react-native';
import { StudzoneService } from '../services/studzoneService';
import { PsgimService } from '../services/psgimService';
import { getMasterStudent, toNewRollNo } from '../data/psgimMasterStudents';
import { TermsModal } from '../components/TermsModal';
import { CORRECT_ADMIN_PIN } from './AdminDashboardScreen';

interface AuthScreenProps {
  onLoginSuccess: (rollNo: string) => void;
  onAdminLogin?: () => void;
}

type LoginStep = 'credentials' | 'verifying' | 'done';

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLoginSuccess, onAdminLogin }) => {
  const [rollNoInput, setRollNoInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loginStep, setLoginStep] = useState<LoginStep>('credentials');
  const [verifyingStatus, setVerifyingStatus] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Animated spinner angle
  const spinAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const spin = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 900,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    spin.start();
    return () => spin.stop();
  }, [spinAnim]);

  const spinInterpolated = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Load saved credentials
  useEffect(() => {
    StudzoneService.getSavedCredentials().then((saved) => {
      if (saved) {
        setRollNoInput(saved.rollNo || '');
        setPasswordInput(saved.dobPassword || '');
        setRememberMe(saved.remember);
      }
    });
  }, []);

  const handleLogin = async () => {
    setErrorMessage(null);

    const cleanRollNo = rollNoInput.trim().toUpperCase().replace(/\s+/g, '');
    const rawPassword = passwordInput.trim();

    // ── Hidden Admin Door ──
    if (cleanRollNo.toLowerCase() === 'admin') {
      if (rawPassword === CORRECT_ADMIN_PIN) {
        if (onAdminLogin) onAdminLogin();
        return;
      } else {
        setErrorMessage('Invalid credentials.');
        return;
      }
    }

    if (!cleanRollNo) {
      setErrorMessage('Please enter your Roll Number (e.g. 26AA01).');
      return;
    }

    if (!rawPassword) {
      setErrorMessage('Please enter your Studzone Password (Date of Birth in DDMMMYY format).');
      return;
    }

    if (!hasAcceptedTerms) {
      setErrorMessage('Please read and agree to the Terms of Service before continuing.');
      return;
    }

    // ── Start Studzone Verification ──
    setLoginStep('verifying');
    setVerifyingStatus('Connecting to PSG Studzone portal...');

    setTimeout(() => setVerifyingStatus('Authenticating your credentials...'), 800);
    setTimeout(() => setVerifyingStatus('Verifying with the college server...'), 1800);

    const result = await StudzoneService.verifyLogin(cleanRollNo, rawPassword);

    if (!result.success) {
      setLoginStep('credentials');
      setErrorMessage(result.error || 'Login failed. Please try again.');
      return;
    }

    // ── Login successful ──
    // Save credentials if rememberMe
    await StudzoneService.saveCredentials({
      rollNo: cleanRollNo,
      dobPassword: rawPassword,
      remember: rememberMe,
    });

    // Resolve to our internal roll format
    const officialRoll = toNewRollNo(cleanRollNo) || cleanRollNo;
    setLoginStep('done');
    onLoginSuccess(officialRoll);
  };

  const isLoading = loginStep === 'verifying';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── College Header ── */}
        <View style={styles.header}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoText}>🏛️</Text>
          </View>
          <Text style={styles.collegeName}>Attendance Monitor</Text>
          <Text style={styles.collegeSub}>PSG College of Technology</Text>
          <View style={styles.badgePill}>
            <Text style={styles.badgePillText}>I MBA • Batch 2026–28</Text>
          </View>
        </View>

        {/* ── Login Card ── */}
        <View style={styles.card}>
          {/* Portal badge */}
          <View style={styles.portalBadge}>
            <Text style={styles.portalBadgeIcon}>⚡</Text>
            <Text style={styles.portalBadgeText}>Powered by PSG Studzone Portal</Text>
          </View>

          <Text style={styles.cardTitle}>Student Sign In</Text>
          <Text style={styles.cardSubtitle}>
            Use your official <Text style={styles.highlight}>Studzone credentials</Text> to log in.
          </Text>

          {/* Error message */}
          {errorMessage && !isLoading && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          )}

          {/* ── Verifying overlay ── */}
          {isLoading ? (
            <View style={styles.verifyingBox}>
              <Animated.Text
                style={[styles.verifyingSpinner, { transform: [{ rotate: spinInterpolated }] }]}
              >
                ◌
              </Animated.Text>
              <Text style={styles.verifyingTitle}>Verifying with Studzone…</Text>
              <Text style={styles.verifyingStatus}>{verifyingStatus}</Text>
              <View style={styles.verifyingHint}>
                <Text style={styles.verifyingHintText}>
                  🔒 Your credentials are sent directly to the official college portal and never stored on our servers.
                </Text>
              </View>
            </View>
          ) : (
            <>
              {/* Roll Number */}
              <Text style={styles.inputLabel}>ROLL NUMBER</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g. 26AA01"
                placeholderTextColor="#475569"
                value={rollNoInput}
                onChangeText={(t) => {
                  setRollNoInput(t.toUpperCase());
                  setErrorMessage(null);
                }}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="next"
                editable={!isLoading}
              />

              {/* Password (DOB) */}
              <Text style={styles.inputLabel}>STUDZONE PASSWORD (DATE OF BIRTH)</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="e.g. 13AUG05"
                  placeholderTextColor="#475569"
                  value={passwordInput}
                  onChangeText={(t) => {
                    setPasswordInput(t.toUpperCase());
                    setErrorMessage(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="characters"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.showHideBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  <Text style={styles.showHideText}>{showPassword ? '🙈 Hide' : '👁️ Show'}</Text>
                </TouchableOpacity>
              </View>

              {/* DOB Hint */}
              <View style={styles.hintBox}>
                <Text style={styles.hintTitle}>💡 Password Format</Text>
                <Text style={styles.hintBody}>
                  Your Studzone password is your <Text style={styles.highlight}>Date of Birth</Text> in{' '}
                  <Text style={styles.highlight}>DDMMMYY</Text> format.{'\n'}
                  Example: <Text style={styles.highlight}>13AUG05</Text> = 13th August 2005
                </Text>
              </View>

              {/* Warning */}
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  ⚠️ <Text style={styles.highlight}>Caution:</Text> 5 consecutive wrong attempts will lock your Studzone account.
                </Text>
              </View>

              {/* Remember me */}
              <TouchableOpacity
                style={styles.rememberRow}
                onPress={() => setRememberMe(!rememberMe)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxActive]}>
                  {rememberMe && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.rememberLabel}>Remember me on this device</Text>
              </TouchableOpacity>

              {/* Terms */}
              <TouchableOpacity
                style={styles.termsRow}
                onPress={() => setHasAcceptedTerms(!hasAcceptedTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, hasAcceptedTerms && styles.checkboxActive]}>
                  {hasAcceptedTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.termsLabel}>
                  I agree to the{' '}
                  <Text
                    style={styles.termsLink}
                    onPress={() => setShowTermsModal(true)}
                  >
                    Terms of Service & Data Consent
                  </Text>
                </Text>
              </TouchableOpacity>

              {/* Sign In Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!hasAcceptedTerms || isLoading) && styles.submitBtnDisabled,
                ]}
                onPress={handleLogin}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.submitBtnText}>Sign In with Studzone</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* ── Footer ── */}
        <View style={styles.footer}>
          <Text style={styles.footerLine}>
            🔒 Private & Confidential
          </Text>
          <Text style={styles.footerSub}>
            Your credentials are verified directly against the official PSG Studzone portal. We never store your password.
          </Text>
        </View>
      </ScrollView>

      {/* Legal Terms Modal */}
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
    padding: 22,
    justifyContent: 'center',
    minHeight: '100%',
  },
  // ── Header ──
  header: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#38BDF8',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logoText: {
    fontSize: 36,
  },
  collegeName: {
    color: '#F8FAFC',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  collegeSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'center',
  },
  badgePill: {
    backgroundColor: '#0C4A6E',
    borderColor: '#0284C7',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 16,
    marginTop: 10,
  },
  badgePillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  // ── Card ──
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  portalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(2, 132, 199, 0.12)',
    borderColor: '#0284C7',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginBottom: 14,
  },
  portalBadgeIcon: {
    fontSize: 13,
  },
  portalBadgeText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    color: '#F8FAFC',
    fontSize: 21,
    fontWeight: '800',
    marginBottom: 4,
  },
  cardSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 18,
  },
  highlight: {
    color: '#38BDF8',
    fontWeight: '700',
  },
  // ── Error ──
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 12.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  // ── Verifying state ──
  verifyingBox: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 10,
  },
  verifyingSpinner: {
    fontSize: 44,
    color: '#38BDF8',
    marginBottom: 4,
  },
  verifyingTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
  },
  verifyingStatus: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  },
  verifyingHint: {
    marginTop: 12,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  verifyingHintText: {
    color: '#94A3B8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  // ── Inputs ──
  inputLabel: {
    color: '#64748B',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
    marginTop: 2,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 11,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderWidth: 1.5,
    borderColor: '#334155',
    borderRadius: 11,
    marginBottom: 14,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: '#F1F5F9',
    fontSize: 16,
    fontWeight: '600',
  },
  showHideBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  showHideText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  // ── Hint & Warning ──
  hintBox: {
    backgroundColor: 'rgba(56, 189, 248, 0.07)',
    borderColor: 'rgba(56, 189, 248, 0.25)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  hintTitle: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  hintBody: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 17,
  },
  warningBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.07)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  warningText: {
    color: '#FCA5A5',
    fontSize: 11.5,
    lineHeight: 16,
  },
  // ── Checkboxes ──
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 18,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F172A',
    marginTop: 1,
    flexShrink: 0,
  },
  checkboxActive: {
    backgroundColor: '#2563EB',
    borderColor: '#3B82F6',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  rememberLabel: {
    color: '#CBD5E1',
    fontSize: 13,
  },
  termsLabel: {
    flex: 1,
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 17,
  },
  termsLink: {
    color: '#38BDF8',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  // ── Submit ──
  submitBtn: {
    backgroundColor: '#0284C7',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#334155',
    opacity: 0.6,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // ── Footer ──
  footer: {
    alignItems: 'center',
    marginTop: 24,
    gap: 4,
  },
  footerLine: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
  },
  footerSub: {
    color: '#334155',
    fontSize: 10.5,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 10,
  },
});
