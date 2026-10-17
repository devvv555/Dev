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
  const [loading, setLoading] = useState(true);

  // Injected JavaScript to automatically fill login credentials if redirected to login page
  const autoLoginScript = `
    (function() {
      try {
        var userField = document.getElementById('username');
        var passField = document.getElementById('password');
        var btn = document.getElementById('loginbtn') || document.querySelector('button[type="submit"]');
        if (userField && passField && btn && !userField.value) {
          userField.value = '${rollNo}';
          passField.value = '${password}';
          btn.click();
        }
      } catch(e) {}
    })();
    true;
  `;

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Top Navigation Bar */}
        <View style={styles.navBar}>
          <View style={styles.navInfo}>
            <View style={styles.liveBadgeRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBadgeText}>MOODLE LMS BYPASS</Text>
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

        {/* Loading Spinner */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#38BDF8" />
            <Text style={styles.loadingText}>Bypassing login and loading Moodle test...</Text>
          </View>
        )}

        {/* Direct Moodle In-App Browser */}
        <WebView
          source={{ uri: url }}
          injectedJavaScript={autoLoginScript}
          onLoadEnd={() => setLoading(false)}
          onLoadStart={() => setLoading(true)}
          style={styles.webView}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          scalesPageToFit={true}
          sharedCookiesEnabled={true}
        />
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
  webView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
});
