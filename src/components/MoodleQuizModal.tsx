import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';

interface MoodleQuizModalProps {
  visible: boolean;
  title: string;
  url: string;
  rollNo: string;
  password?: string;
  onClose: () => void;
}

export const MoodleQuizModal: React.FC<MoodleQuizModalProps> = ({
  visible,
  title,
  url,
  rollNo,
  password = 'Welcome@123',
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeUrl, setActiveUrl] = useState(url);
  const [showUrlEditor, setShowUrlEditor] = useState(false);
  const [customInput, setCustomInput] = useState(url);

  const cleanRoll = rollNo ? rollNo.toUpperCase() : 'STUDENT';

  // Sync activeUrl when url prop changes
  React.useEffect(() => {
    setActiveUrl(url);
    setCustomInput(url);
  }, [url]);

  const handleOpenDirect = () => {
    if (typeof window !== 'undefined') {
      window.open(activeUrl, '_blank');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <View style={styles.navInfo}>
            <View style={styles.liveBadgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>MOODLE LMS ACCESS</Text>
            </View>
            <Text style={styles.navTitle} numberOfLines={1}>
              {title}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <Text style={styles.closeBtnText}>Done ✕</Text>
          </TouchableOpacity>
        </View>

        {/* Informational Guidance Banner */}
        <View style={styles.portalGuidanceBox}>
          <View style={styles.guidanceRow}>
            <Text style={styles.guidanceIcon}>ℹ️</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.guidanceTitle}>PSGIM Campus Network Note</Text>
              <Text style={styles.guidanceDesc}>
                Most college Moodle LMS portals (<Text style={{ fontWeight: '700', color: '#38BDF8' }}>lms.psgim.ac.in</Text>) block embedded iframes and may require PSG Campus Wi-Fi / VPN to load.
              </Text>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.primaryOpenBtn}
              onPress={handleOpenDirect}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryOpenBtnText}>Open Directly in New Tab ↗</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondarySettingsBtn}
              onPress={() => setShowUrlEditor(!showUrlEditor)}
              activeOpacity={0.8}
            >
              <Text style={styles.secondarySettingsBtnText}>
                {showUrlEditor ? 'Hide Link Editor' : '⚙️ Change LMS Link'}
              </Text>
            </TouchableOpacity>
          </View>

          {showUrlEditor && (
            <View style={styles.editorBox}>
              <Text style={styles.editorLabel}>Custom College LMS / Portal URL:</Text>
              <View style={styles.editorInputRow}>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e: any) => setCustomInput(e.target.value)}
                  placeholder="https://lms.psgim.ac.in..."
                  style={{
                    flex: 1,
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    border: '1px solid #475569',
                    borderRadius: 6,
                    padding: '8px 10px',
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <TouchableOpacity
                  style={styles.saveUrlBtn}
                  onPress={() => setActiveUrl(customInput)}
                >
                  <Text style={styles.saveUrlBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Web View vs Native WebView */}
        <View style={{ flex: 1, backgroundColor: '#0F172A', position: 'relative' }}>
          {Platform.OS === 'web' ? (
            <View style={styles.webFallbackContainer}>
              <View style={styles.webCardPrompt}>
                <View style={styles.webLockIconCircle}>
                  <Text style={styles.webLockIcon}>🌐</Text>
                </View>
                <Text style={styles.webPromptTitle}>Moodle LMS Direct Launch</Text>
                <Text style={styles.webPromptDesc}>
                  Moodle websites use browser security protocols (<Text style={{ color: '#38BDF8', fontFamily: 'monospace' }}>SAMEORIGIN</Text>) that intentionally prevent external apps from embedding their pages inside frames.
                </Text>

                <View style={styles.webLaunchBox}>
                  <Text style={styles.webLaunchTargetText} numberOfLines={1}>
                    🔗 {activeUrl}
                  </Text>
                  <TouchableOpacity
                    style={styles.bigLaunchBtn}
                    onPress={handleOpenDirect}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.bigLaunchBtnText}>Launch Moodle in New Window ↗</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.tipBox}>
                  <Text style={styles.tipTitle}>💡 Tip for Off-Campus Access:</Text>
                  <Text style={styles.tipText}>
                    If you are off-campus, ensure your device is connected to PSG Campus Wi-Fi or college VPN so <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>lms.psgim.ac.in</Text> can authenticate your student ID ({cleanRoll}).
                  </Text>
                </View>
              </View>
            </View>
          ) : (
            <WebView
              source={{ uri: activeUrl }}
              onLoadEnd={() => setLoading(false)}
              onLoadStart={() => setLoading(true)}
              style={styles.webView}
              javaScriptEnabled={true}
              domStorageEnabled={true}
            />
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  navInfo: {
    flex: 1,
    marginRight: 12,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  liveBadgeText: {
    color: '#34D399',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  closeBtn: {
    backgroundColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  closeBtnText: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
  },
  loadingContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 12,
  },
  portalGuidanceBox: {
    backgroundColor: '#1E293B',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#334155',
  },
  guidanceRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  guidanceIcon: {
    fontSize: 18,
    marginTop: 1,
  },
  guidanceTitle: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  guidanceDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 16,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  primaryOpenBtn: {
    flex: 1.5,
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryOpenBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  secondarySettingsBtn: {
    flex: 1,
    backgroundColor: '#334155',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondarySettingsBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
  },
  editorBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  editorLabel: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  editorInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  saveUrlBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  saveUrlBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webFallbackContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webCardPrompt: {
    backgroundColor: '#1E293B',
    borderRadius: 20,
    padding: 24,
    maxWidth: 500,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  webLockIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1.5,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  webLockIcon: {
    fontSize: 28,
  },
  webPromptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 8,
    textAlign: 'center',
  },
  webPromptDesc: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  webLaunchBox: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
    gap: 10,
  },
  webLaunchTargetText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  bigLaunchBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigLaunchBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  tipBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    borderRadius: 10,
    padding: 12,
    width: '100%',
    borderLeftWidth: 3,
    borderLeftColor: '#38BDF8',
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 15,
  },
});
