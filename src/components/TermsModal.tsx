import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  visible,
  onClose,
  onAccept,
  showAcceptButton = false,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Terms of Service & Consent</Text>
            <Text style={styles.headerSubtitle}>
              Data privacy, academic advisory & terms of use agreement.
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Important Summary Pill */}
          <View style={styles.summaryBadge}>
            <Text style={styles.summaryBadgeText}>
              🔒 100% On-Device Storage • DPDP Act (2023) Compliant
            </Text>
          </View>

          {/* Section 1 */}
          <View style={styles.clauseCard}>
            <Text style={styles.clauseNum}>1. Identity & Student Directory Data</Text>
            <Text style={styles.clauseBody}>
              The app processes your official registered Name, College Roll Number, and assigned Academic Section solely to authenticate your profile, configure your timetable, and personalize your dashboard. Student directory details originate from student rosters shared with the cohort for academic coordination. Any student may request exclusion from the offline directory lookup at any time.
            </Text>
          </View>

          {/* Section 2 */}
          <View style={styles.clauseCard}>
            <Text style={styles.clauseNum}>2. Use of Name & Roll Number for Attendance Monitoring</Text>
            <Text style={styles.clauseBody}>
              Your name and roll number are used exclusively on this local device instance to calculate attendance percentages, safe bunk allowances, and medical claim concessions (65% / 75% target rules). Your attendance records are completely isolated and private to your phone; no other student or peer can access your logs.
            </Text>
          </View>

          {/* Section 3 */}
          <View style={styles.clauseCard}>
            <Text style={styles.clauseNum}>3. Timetable Schedules & Simulation Disclaimer</Text>
            <Text style={styles.clauseBody}>
              Weekly timetable schedules are integrated as an advisory tracker. The "Safe Bunk" counts and "Classes Needed to Reach 75%" are mathematical simulations based on user entries. Actual classroom changes, faculty substitutions, and surprise lecture announcements announced in college supersede this schedule.
            </Text>
          </View>

          {/* Section 4 */}
          <View style={styles.clauseCard}>
            <Text style={styles.clauseNum}>4. Academic Calendar & Pre-Accounted Holidays</Text>
            <Text style={styles.clauseBody}>
              The 2026–2027 Academic Calendar is provided for term planning and travel coordination. Official holidays are already pre-accounted for in the syllabus schedule and minimum lecture requirements. Government gazetted changes or official college notices supersede calendar entries.
            </Text>
          </View>

          {/* Section 5 */}
          <View style={styles.clauseCard}>
            <Text style={styles.clauseNum}>5. Notification & Alert Services</Text>
            <Text style={styles.clauseBody}>
              By enabling notifications, you consent to receiving: (a) automated weekday holiday alerts up to 7 days in advance (holidays falling on weekends are strictly excluded from notifications), and (b) hourly class completion logging prompts and vibration alerts. Notifications operate locally on your device; device battery savers or DND settings may affect delivery.
            </Text>
          </View>

          {/* Section 6 */}
          <View style={styles.clauseCard}>
            <Text style={styles.clauseNum}>6. Cloud Services, Telemetry & Future Sync</Text>
            <Text style={styles.clauseBody}>
              Currently, all data is stored 100% locally on your device (`AsyncStorage`). The app collects anonymous telemetry (feature visit frequency and optional student improvement feedback) solely to optimize performance and correct timetable errors. Any future cloud sync or multi-device backup feature will require explicit, separate opt-in consent. Your data will never be sold or shared with commercial advertisers.
            </Text>
          </View>

          {/* Section 7 */}
          <View style={[styles.clauseCard, styles.clauseHighlight]}>
            <Text style={styles.clauseNumHighlight}>
              7. Institutional Independence & College Administrator Non-Liability
            </Text>
            <Text style={styles.clauseBodyHighlight}>
              THIS APPLICATION IS AN INDEPENDENT, UNOFFICIAL STUDENT-BUILT PEER UTILITY. IT IS NOT AN OFFICIAL PRODUCT, APPLICATION, OR PORTAL OF THE COLLEGE, ITS TRUST, FACULTY, OR UNIVERSITY. IT HAS NOT BEEN SPONSORED, AUTHORIZED, OR ENDORSED BY THE COLLEGE ADMINISTRATION.
            </Text>
            <Text style={[styles.clauseBodyHighlight, { marginTop: 8 }]}>
              The official college ERP portal and faculty attendance registers remain the sole authoritative and legally binding records for examination eligibility. The developer accepts zero liability for any attendance shortages, exam debarment, fines, or disciplinary actions.
            </Text>
          </View>

          {showAcceptButton && onAccept && (
            <TouchableOpacity style={styles.acceptBtn} onPress={onAccept} activeOpacity={0.85}>
              <Text style={styles.acceptBtnText}>I Accept & Agree to Terms ✓</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.closeBottomBtn} onPress={onClose} activeOpacity={0.7}>
            <Text style={styles.closeBottomBtnText}>Close Document</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  headerTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    maxWidth: 260,
  },
  closeBtn: {
    backgroundColor: '#334155',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#CBD5E1',
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  summaryBadge: {
    backgroundColor: '#064E3B',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  summaryBadgeText: {
    color: '#A7F3D0',
    fontSize: 12,
    fontWeight: '700',
  },
  clauseCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  clauseHighlight: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
    borderWidth: 1.5,
  },
  clauseNum: {
    color: '#38BDF8',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  clauseNumHighlight: {
    color: '#F87171',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 6,
  },
  clauseBody: {
    color: '#CBD5E1',
    fontSize: 12.5,
    lineHeight: 18,
  },
  clauseBodyHighlight: {
    color: '#FECACA',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
  acceptBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  closeBottomBtn: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBottomBtnText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
});
