import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { Subject, MedicalClaimRecord, TimetableSlot, PeriodAttendanceRecord, DayOfWeek } from '../types';

interface MedicalVaultScreenProps {
  subjects: Subject[];
  timetable: TimetableSlot[];
  medicalClaims: MedicalClaimRecord[];
  periodRecords?: Record<string, PeriodAttendanceRecord>;
  onToggleMedicalClaim: (id: string) => void;
  onAddMedicalClaim: (claim: MedicalClaimRecord) => void;
  onUpdateClaimStatus: (claimId: string) => void;
  onAutoApplyMedicalClaims: (subjectIds: string[]) => void;
}

export const MedicalVaultScreen: React.FC<MedicalVaultScreenProps> = ({
  subjects,
  timetable,
  medicalClaims,
  periodRecords = {},
  onToggleMedicalClaim,
  onAddMedicalClaim,
  onUpdateClaimStatus,
  onAutoApplyMedicalClaims,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [reason, setReason] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [clinic, setClinic] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Mode: Choose by Absence Date vs Choose by Subject directly
  const [applyMode, setApplyMode] = useState<'DATE' | 'SUBJECT'>('DATE');

  // Absence date selection for smart timetable lookup
  const [absenceDate, setAbsenceDate] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
  });

  // Calendar picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState<'from' | 'to' | 'absence'>('from');
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth()); // 0-indexed

  const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

  /** Build array of {day, isCurrentMonth} for the calendar grid */
  const getCalendarGrid = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const grid: Array<{ day: number; active: boolean }> = [];
    for (let i = 0; i < firstDay; i++) grid.push({ day: 0, active: false });
    for (let d = 1; d <= daysInMonth; d++) grid.push({ day: d, active: true });
    return grid;
  };

  const openDatePicker = (target: 'from' | 'to' | 'absence') => {
    setDatePickerTarget(target);
    // Start at the already-selected date's month if available
    const existing = target === 'from' ? fromDate : target === 'to' ? toDate : absenceDate;
    if (existing) {
      const d = new Date(existing);
      if (!isNaN(d.getTime())) { setPickerYear(d.getFullYear()); setPickerMonth(d.getMonth()); }
    }
    setShowDatePicker(true);
  };

  const selectDay = (day: number) => {
    const mm = String(pickerMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const selected = `${pickerYear}-${mm}-${dd}`;
    if (datePickerTarget === 'from') setFromDate(selected);
    else if (datePickerTarget === 'to') setToDate(selected);
    else setAbsenceDate(selected);
    setShowDatePicker(false);
  };

  const prevMonth = () => {
    if (pickerMonth === 0) { setPickerMonth(11); setPickerYear(y => y - 1); }
    else setPickerMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (pickerMonth === 11) { setPickerMonth(0); setPickerYear(y => y + 1); }
    else setPickerMonth(m => m + 1);
  };

  /** Format YYYY-MM-DD to "DD MMM YYYY" for display */
  const formatDisplay = (dateStr: string) => {
    if (!dateStr) return 'Tap to select';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${String(d.getDate()).padStart(2,'0')} ${MONTH_NAMES[d.getMonth()].slice(0,3)} ${d.getFullYear()}`;
  };

  /** Returns set of day-of-week names covered by the date range */
  const getDaysInRange = (from: string, to: string): Set<string> => {
    const days = new Set<string>();
    const DAY_NAMES = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    try {
      const start = new Date(from);
      const end = new Date(to);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return days;
      const cur = new Date(start);
      while (cur <= end) {
        const name = DAY_NAMES[cur.getDay()];
        if (name !== 'Sunday') days.add(name);
        cur.setDate(cur.getDate() + 1);
      }
    } catch {}
    return days;
  };

  /** Map date string YYYY-MM-DD to DayOfWeek */
  const getDayOfWeekForDate = (dateStr: string): DayOfWeek | null => {
    try {
      const parts = dateStr.split('-').map(Number);
      if (parts.length !== 3) return null;
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      if (isNaN(d.getTime())) return null;
      const dayNames: (DayOfWeek | null)[] = [
        null, // Sunday
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
      ];
      return dayNames[d.getDay()];
    } catch {
      return null;
    }
  };

  const absenceDayOfWeek = getDayOfWeekForDate(absenceDate);
  const absenceDaySlots = absenceDayOfWeek
    ? timetable.filter((s) => s.day === absenceDayOfWeek)
    : [];

  const absenceSubjectSlotsMap = new Map<string, TimetableSlot[]>();
  absenceDaySlots.forEach((slot) => {
    const list = absenceSubjectSlotsMap.get(slot.subjectId) || [];
    list.push(slot);
    absenceSubjectSlotsMap.set(slot.subjectId, list);
  });

  const absenceSubjectIds = Array.from(absenceSubjectSlotsMap.keys());
  const absenceSubjects = absenceSubjectIds
    .map((id) => subjects.find((s) => s.id === id))
    .filter((s): s is Subject => Boolean(s));

  const setQuickDate = (daysAgo: number) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setAbsenceDate(`${d.getFullYear()}-${mm}-${dd}`);
  };

  const recordedAbsentDates = [
    ...new Set(
      Object.values(periodRecords || {})
        .filter((r) => r.status === 'bunked')
        .map((r) => r.date)
    ),
  ].sort().reverse().slice(0, 5);

  const handleApplyAllForDate = () => {
    if (absenceSubjectIds.length === 0) {
      Alert.alert(
        'No Classes',
        `No lectures found in timetable for ${formatDisplay(absenceDate)} (${absenceDayOfWeek || 'Holiday'}).`
      );
      return;
    }

    onAutoApplyMedicalClaims(absenceSubjectIds);

    const alreadyLogged = medicalClaims.some(
      (c) => c.fromDate === absenceDate && c.toDate === absenceDate
    );
    if (!alreadyLogged) {
      const names = absenceSubjects.map((s) => s.code || s.name).join(', ');
      const newClaim: MedicalClaimRecord = {
        id: `med_${Date.now()}`,
        subjectId: absenceSubjectIds.join(','),
        fromDate: absenceDate,
        toDate: absenceDate,
        reason: `Medical Leave on ${absenceDate} (${names})`,
        doctorName: 'Medical Attendant',
        hospitalOrClinic: 'Health Center',
        status: 'SUBMITTED',
        createdAt: new Date().toISOString().split('T')[0],
        certificateNote: `Applied 65% concession for ${absenceDayOfWeek}'s classes (${names}).`,
      };
      onAddMedicalClaim(newClaim);
    }

    Alert.alert(
      'Medical Concession Applied! 🏥',
      `65% relaxation auto-applied to ${absenceSubjects.length} subject(s) held on ${formatDisplay(absenceDate)}:\n${absenceSubjects.map((s) => `• ${s.name}`).join('\n')}`
    );
  };

  const handleSaveClaim = () => {
    if (!reason || !doctorName) {
      Alert.alert('Missing Details', 'Please enter reason for illness and doctor name.');
      return;
    }
    if (!fromDate || !toDate) {
      Alert.alert('Missing Dates', 'Please enter the from and to dates of your leave.');
      return;
    }

    // Auto-detect which subjects have classes on the leave days
    const leaveDays = getDaysInRange(fromDate, toDate);
    const affectedSubjectIds = [
      ...new Set(
        timetable
          .filter((slot) => leaveDays.has(slot.day))
          .map((slot) => slot.subjectId)
      ),
    ];

    const newClaim: MedicalClaimRecord = {
      id: `med_${Date.now()}`,
      subjectId: affectedSubjectIds.length > 0 ? affectedSubjectIds.join(',') : 'ALL',
      fromDate,
      toDate,
      reason,
      doctorName,
      hospitalOrClinic: clinic || 'General Hospital',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().split('T')[0],
      certificateNote: 'Medical Certificate verified by doctor.',
    };

    onAddMedicalClaim(newClaim);

    // Auto-apply 65% threshold to all affected subjects
    if (affectedSubjectIds.length > 0) {
      onAutoApplyMedicalClaims(affectedSubjectIds);
    }

    setShowModal(false);
    setReason('');
    setDoctorName('');
    setClinic('');
    setFromDate('');
    setToDate('');

    const subjectNames = affectedSubjectIds
      .map((id) => subjects.find((s) => s.id === id)?.name ?? id)
      .join(', ');

    Alert.alert(
      'Medical Claim Submitted! 🏥',
      affectedSubjectIds.length > 0
        ? `65% threshold auto-applied to:\n${subjectNames}`
        : '65% condonation threshold has been applied.'
    );
  };

  const activeClaimsCount = subjects.filter((s) => s.hasMedicalClaim).length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Regulation Policy Header */}
      <View style={styles.policyCard}>
        <View style={styles.policyHeader}>
          <Text style={styles.policyIcon}>🏥</Text>
          <View style={styles.policyTitleArea}>
            <Text style={styles.policyTitle}>Medical Concession Policy</Text>
            <Text style={styles.policyCode}>Regulation Clause 14.2 (Attendance Condonation)</Text>
          </View>
        </View>
        <Text style={styles.policyDesc}>
          Students with valid, registered medical claims are granted an attendance relaxation from{' '}
          <Text style={styles.highlightText}>75% standard</Text> down to{' '}
          <Text style={styles.highlightMedText}>65% medical minimum</Text>.
        </Text>
        <View style={styles.policyStatsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>65%</Text>
            <Text style={styles.statLabel}>Medical Target</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>75%</Text>
            <Text style={styles.statLabel}>Standard Target</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>{activeClaimsCount}</Text>
            <Text style={styles.statLabel}>Subjects Claimed</Text>
          </View>
        </View>
      </View>

      {/* Subject Concession Toggle Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Apply Medical Claim Per Subject</Text>
        <Text style={styles.sectionSubtitle}>
          Choose by date of absence to auto-detect classes, or choose subjects directly.
        </Text>

        {/* Mode Selector */}
        <View style={styles.modeSelectorRow}>
          <TouchableOpacity
            style={[styles.modeTab, applyMode === 'DATE' && styles.modeTabActive]}
            onPress={() => setApplyMode('DATE')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeTabText, applyMode === 'DATE' && styles.modeTabTextActive]}>
              📅 By Absence Date
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeTab, applyMode === 'SUBJECT' && styles.modeTabActive]}
            onPress={() => setApplyMode('SUBJECT')}
            activeOpacity={0.7}
          >
            <Text style={[styles.modeTabText, applyMode === 'SUBJECT' && styles.modeTabTextActive]}>
              📚 By Subject Directly
            </Text>
          </TouchableOpacity>
        </View>

        {applyMode === 'DATE' ? (
          <View style={styles.dateModeContainer}>
            {/* Date Selection Box */}
            <View style={styles.dateSelectorBox}>
              <View style={styles.dateSelectorHeader}>
                <Text style={styles.dateSelectorLabel}>Select Absence Date:</Text>
                <TouchableOpacity
                  style={styles.pickDateBtn}
                  onPress={() => openDatePicker('absence')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.pickDateBtnText}>📅 {formatDisplay(absenceDate)}</Text>
                </TouchableOpacity>
              </View>

              {/* Quick Preset Buttons */}
              <View style={styles.quickPresetsRow}>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setQuickDate(0)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>Today</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => setQuickDate(1)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>Yesterday</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.presetChip}
                  onPress={() => openDatePicker('absence')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.presetChipText}>Choose Date...</Text>
                </TouchableOpacity>
              </View>

              {/* Recorded Absences if any */}
              {recordedAbsentDates.length > 0 && (
                <View style={styles.recordedAbsencesBox}>
                  <Text style={styles.recordedAbsencesLabel}>Past Recorded Absence Dates:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recordedPillsScroll}>
                    {recordedAbsentDates.map((dStr) => (
                      <TouchableOpacity
                        key={dStr}
                        style={[styles.recordedPill, absenceDate === dStr && styles.recordedPillActive]}
                        onPress={() => setAbsenceDate(dStr)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.recordedPillText, absenceDate === dStr && styles.recordedPillTextActive]}>
                          {formatDisplay(dStr)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Resolved Day & Subject Summary */}
            <View style={styles.resolvedDateHeader}>
              <Text style={styles.resolvedDayTitle}>
                {absenceDayOfWeek ? `${absenceDayOfWeek}'s Scheduled Classes` : 'No Classes Scheduled'}
              </Text>
              <Text style={styles.resolvedDaySub}>
                {absenceSubjects.length > 0
                  ? `${absenceSubjects.length} class slot(s) mapped from your timetable`
                  : absenceDayOfWeek === null
                  ? 'Sundays are official non-instructional days'
                  : 'No lectures scheduled in timetable for this day'}
              </Text>
            </View>

            {absenceSubjects.length > 0 ? (
              <>
                <TouchableOpacity
                  style={styles.applyAllDateBtn}
                  onPress={handleApplyAllForDate}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyAllDateBtnText}>
                    🏥 Apply 65% Concession to All {absenceSubjects.length} Classes on This Date
                  </Text>
                </TouchableOpacity>

                <View style={styles.toggleList}>
                  {absenceSubjects.map((sub) => {
                    const pct = sub.total === 0 ? 100 : (sub.attended / sub.total) * 100;
                    const slots = absenceSubjectSlotsMap.get(sub.id) || [];
                    const timeStrings = slots.map((s) => `${s.startTime}-${s.endTime}`).join(', ');
                    const room = slots[0]?.room || sub.room;

                    return (
                      <View key={sub.id} style={styles.toggleCard}>
                        <View style={styles.toggleInfo}>
                          <View style={styles.subCodeRow}>
                            <Text style={styles.subCodeBadge}>{sub.code || 'GEN'}</Text>
                            {room && <Text style={styles.subRoomBadge}>📍 {room}</Text>}
                            <Text style={styles.subTimeText}>⏰ {timeStrings}</Text>
                          </View>
                          <Text style={styles.toggleSubjectName}>{sub.name}</Text>
                          <Text style={styles.toggleSubjectStats}>
                            Current: {pct.toFixed(1)}% ({sub.attended}/{sub.total})
                          </Text>
                        </View>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          style={[
                            styles.toggleSwitch,
                            sub.hasMedicalClaim ? styles.toggleSwitchActive : styles.toggleSwitchInactive,
                          ]}
                          onPress={() => onToggleMedicalClaim(sub.id)}
                        >
                          <Text style={styles.toggleSwitchIcon}>🏥</Text>
                          <Text
                            style={[
                              styles.toggleSwitchText,
                              sub.hasMedicalClaim ? styles.toggleSwitchTextActive : styles.toggleSwitchTextInactive,
                            ]}
                          >
                            {sub.hasMedicalClaim ? '65% Active' : '75% Normal'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  No classes found for {formatDisplay(absenceDate)}.
                </Text>
                <Text style={styles.emptySubHint}>
                  Tap "Select Absence Date" above or switch to "By Subject Directly" to choose manually.
                </Text>
              </View>
            )}
          </View>
        ) : (
          <View style={styles.toggleList}>
            {subjects.map((sub) => {
              const pct = sub.total === 0 ? 100 : (sub.attended / sub.total) * 100;
              return (
                <View key={sub.id} style={styles.toggleCard}>
                  <View style={styles.toggleInfo}>
                    <Text style={styles.toggleSubjectName}>{sub.name}</Text>
                    <Text style={styles.toggleSubjectStats}>
                      Current: {pct.toFixed(1)}% ({sub.attended}/{sub.total})
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={[
                      styles.toggleSwitch,
                      sub.hasMedicalClaim ? styles.toggleSwitchActive : styles.toggleSwitchInactive,
                    ]}
                    onPress={() => onToggleMedicalClaim(sub.id)}
                  >
                    <Text style={styles.toggleSwitchIcon}>🏥</Text>
                    <Text
                      style={[
                        styles.toggleSwitchText,
                        sub.hasMedicalClaim ? styles.toggleSwitchTextActive : styles.toggleSwitchTextInactive,
                      ]}
                    >
                      {sub.hasMedicalClaim ? '65% Active' : '75% Normal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Medical Certificates Vault */}
      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Medical Certificates & Records</Text>
          <TouchableOpacity
            style={styles.addClaimBtn}
            onPress={() => setShowModal(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.addClaimBtnText}>+ New Claim</Text>
          </TouchableOpacity>
        </View>

        {medicalClaims.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No medical claims filed yet.</Text>
          </View>
        ) : (
          medicalClaims.map((claim) => (
            <View key={claim.id} style={styles.claimCard}>
              <View style={styles.claimTopRow}>
                <View>
                  <Text style={styles.claimReason}>{claim.reason}</Text>
                  <Text style={styles.claimDates}>
                    📅 {claim.fromDate} to {claim.toDate}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => onUpdateClaimStatus(claim.id)}
                  activeOpacity={0.7}
                  style={[
                    styles.statusBadge,
                    claim.status === 'APPROVED'
                      ? styles.statusApproved
                      : claim.status === 'DRAFT'
                      ? styles.statusDraft
                      : styles.statusSubmitted,
                  ]}
                >
                  <Text style={[
                    styles.statusBadgeText,
                    claim.status === 'APPROVED'
                      ? styles.statusApprovedText
                      : claim.status === 'DRAFT'
                      ? styles.statusDraftText
                      : styles.statusSubmittedText,
                  ]}>
                    {claim.status === 'APPROVED' ? '✅ APPROVED' : claim.status === 'DRAFT' ? '📝 DRAFT' : '🕐 SUBMITTED'}
                  </Text>
                  <Text style={styles.statusTapHint}>✏️ tap to update</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.doctorRow}>
                <Text style={styles.doctorLabel}>Certified By:</Text>
                <Text style={styles.doctorValue}>{claim.doctorName}</Text>
              </View>

              {claim.hospitalOrClinic && (
                <Text style={styles.clinicValue}>🏥 {claim.hospitalOrClinic}</Text>
              )}

              {claim.certificateNote && (
                <View style={styles.noteBox}>
                  <Text style={styles.noteText}>"{claim.certificateNote}"</Text>
                </View>
              )}
            </View>
          ))
        )}
      </View>

      {/* Modal for adding new claim */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>File Medical Claim</Text>
            <Text style={styles.modalSubtitle}>
              Lowers mandatory attendance threshold to 65% for the selected subject.
            </Text>

            <Text style={styles.inputLabel}>Reason / Illness</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Viral Fever, Typhoid, Fractured Arm"
              placeholderTextColor="#64748B"
              value={reason}
              onChangeText={setReason}
            />

            <Text style={styles.inputLabel}>Doctor / Practitioner Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Dr. A. K. Verma, MD"
              placeholderTextColor="#64748B"
              value={doctorName}
              onChangeText={setDoctorName}
            />

            <Text style={styles.inputLabel}>Clinic or Hospital</Text>
            <TextInput
              style={styles.textInput}
              placeholder="e.g. Apex Health Center"
              placeholderTextColor="#64748B"
              value={clinic}
              onChangeText={setClinic}
            />

            {/* Date Picker Buttons */}
            <View style={styles.dateInputsRow}>
              <View style={styles.dateInputCol}>
                <Text style={styles.inputLabel}>📅 From Date</Text>
                <TouchableOpacity
                  style={[styles.datePickerBtn, fromDate ? styles.datePickerBtnSelected : null]}
                  onPress={() => openDatePicker('from')}
                  activeOpacity={0.7}
                >
                  <Text style={fromDate ? styles.datePickerBtnTextSelected : styles.datePickerBtnTextPlaceholder}>
                    {formatDisplay(fromDate)}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.dateInputCol}>
                <Text style={styles.inputLabel}>📅 To Date</Text>
                <TouchableOpacity
                  style={[styles.datePickerBtn, toDate ? styles.datePickerBtnSelected : null]}
                  onPress={() => openDatePicker('to')}
                  activeOpacity={0.7}
                >
                  <Text style={toDate ? styles.datePickerBtnTextSelected : styles.datePickerBtnTextPlaceholder}>
                    {formatDisplay(toDate)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSaveClaim}
              >
                <Text style={styles.modalSubmitText}>Submit Claim (Apply 65%)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendar Date Picker Modal */}
      <Modal visible={showDatePicker} animationType="fade" transparent>
        <View style={styles.calOverlay}>
          <View style={styles.calCard}>
            {/* Header */}
            <Text style={styles.calTitle}>
              {datePickerTarget === 'from'
                ? '📅 Select From Date'
                : datePickerTarget === 'to'
                ? '📅 Select To Date'
                : '📅 Select Absence Date'}
            </Text>

            {/* Month Navigator */}
            <View style={styles.calNavRow}>
              <TouchableOpacity onPress={prevMonth} style={styles.calNavBtn}>
                <Text style={styles.calNavArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.calMonthLabel}>
                {MONTH_NAMES[pickerMonth]} {pickerYear}
              </Text>
              <TouchableOpacity onPress={nextMonth} style={styles.calNavBtn}>
                <Text style={styles.calNavArrow}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Day labels */}
            <View style={styles.calDayLabelRow}>
              {DAY_LABELS.map((l) => (
                <Text key={l} style={styles.calDayLabel}>{l}</Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.calGrid}>
              {getCalendarGrid(pickerYear, pickerMonth).map((cell, idx) => {
                const mm = String(pickerMonth + 1).padStart(2, '0');
                const dd = String(cell.day).padStart(2, '0');
                const dateStr = `${pickerYear}-${mm}-${dd}`;
                const isFrom = dateStr === fromDate;
                const isTo = dateStr === toDate;
                const inRange = fromDate && toDate && dateStr > fromDate && dateStr < toDate;
                return (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.calDayCell,
                      !cell.active && styles.calDayCellEmpty,
                      isFrom || isTo ? styles.calDayCellSelected : null,
                      inRange ? styles.calDayCellInRange : null,
                    ]}
                    onPress={() => cell.active && selectDay(cell.day)}
                    activeOpacity={cell.active ? 0.7 : 1}
                  >
                    {cell.active ? (
                      <Text style={[
                        styles.calDayText,
                        isFrom || isTo ? styles.calDayTextSelected : null,
                        inRange ? styles.calDayTextInRange : null,
                      ]}>
                        {cell.day}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.calCancelBtn}
              onPress={() => setShowDatePicker(false)}
            >
              <Text style={styles.calCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  policyCard: {
    backgroundColor: '#082F49', // Cyan 950
    borderColor: '#0284C7',
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
  },
  policyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  policyIcon: {
    fontSize: 28,
  },
  policyTitleArea: {
    flex: 1,
  },
  policyTitle: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '800',
  },
  policyCode: {
    color: '#BAE6FD',
    fontSize: 11,
    fontWeight: '600',
  },
  policyDesc: {
    color: '#E0F2FE',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  highlightText: {
    color: '#FBBF24',
    fontWeight: '700',
  },
  highlightMedText: {
    color: '#38BDF8',
    fontWeight: '800',
  },
  policyStatsRow: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 8,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#0C4A6E',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statNumber: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: '#7DD3FC',
    fontSize: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#F8FAFC',
    fontSize: 17,
    fontWeight: '700',
  },
  sectionSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 10,
  },
  addClaimBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addClaimBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  toggleList: {
    gap: 8,
  },
  toggleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleSubjectName: {
    color: '#F1F5F9',
    fontSize: 14,
    fontWeight: '700',
  },
  toggleSubjectStats: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  toggleSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  toggleSwitchActive: {
    backgroundColor: 'rgba(6, 182, 212, 0.2)',
    borderColor: '#06B6D4',
  },
  toggleSwitchInactive: {
    backgroundColor: 'rgba(100, 116, 139, 0.1)',
    borderColor: '#475569',
  },
  toggleSwitchIcon: {
    fontSize: 12,
  },
  toggleSwitchText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toggleSwitchTextActive: {
    color: '#38BDF8',
  },
  toggleSwitchTextInactive: {
    color: '#94A3B8',
  },
  claimCard: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  claimTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  claimReason: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '700',
  },
  claimDates: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 80,
  },
  statusApproved: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusSubmitted: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  statusDraft: {
    backgroundColor: 'rgba(100, 116, 139, 0.15)',
    borderWidth: 1,
    borderColor: '#64748B',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  statusApprovedText: {
    color: '#34D399',
  },
  statusSubmittedText: {
    color: '#60A5FA',
  },
  statusDraftText: {
    color: '#94A3B8',
  },
  statusTapHint: {
    color: '#38BDF8',
    fontSize: 9,
    marginTop: 2,
    fontWeight: '600',
  },
  doctorRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 2,
  },
  doctorLabel: {
    color: '#64748B',
    fontSize: 12,
  },
  doctorValue: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
  },
  clinicValue: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
  },
  noteBox: {
    backgroundColor: '#0F172A',
    padding: 8,
    borderRadius: 6,
    marginTop: 4,
  },
  noteText: {
    color: '#94A3B8',
    fontSize: 11,
    fontStyle: 'italic',
  },
  emptyCard: {
    padding: 20,
    backgroundColor: '#1E293B',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modalTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#94A3B8',
    fontSize: 12,
    marginVertical: 6,
  },
  inputLabel: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    color: '#FFFFFF',
    fontSize: 14,
  },
  dateInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateInputCol: {
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#0284C7',
    alignItems: 'center',
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // ── Date picker button styles ──────────────────────────
  datePickerBtn: {
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
  },
  datePickerBtnSelected: {
    borderColor: '#0284C7',
    backgroundColor: 'rgba(2, 132, 199, 0.1)',
  },
  datePickerBtnTextPlaceholder: {
    color: '#64748B',
    fontSize: 12,
  },
  datePickerBtnTextSelected: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },

  // ── Calendar modal styles ──────────────────────────────
  calOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  calCard: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    borderWidth: 1,
    borderColor: '#334155',
  },
  calTitle: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  calNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calNavBtn: {
    padding: 6,
    backgroundColor: '#0F172A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    width: 36,
    alignItems: 'center',
  },
  calNavArrow: {
    color: '#38BDF8',
    fontSize: 22,
    fontWeight: '700',
  },
  calMonthLabel: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '700',
  },
  calDayLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 4,
  },
  calDayLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    width: 36,
    textAlign: 'center',
  },
  calGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calDayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  calDayCellEmpty: {
    opacity: 0,
  },
  calDayCellSelected: {
    backgroundColor: '#0284C7',
    borderRadius: 20,
  },
  calDayCellInRange: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    borderRadius: 0,
  },
  calDayText: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '500',
  },
  calDayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  calDayTextInRange: {
    color: '#38BDF8',
  },
  calCancelBtn: {
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#334155',
    borderRadius: 8,
    alignItems: 'center',
  },
  calCancelText: {
    color: '#CBD5E1',
    fontWeight: '600',
  },
  modeSelectorRow: {
    flexDirection: 'row',
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 4,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  modeTabActive: {
    backgroundColor: '#0284C7',
  },
  modeTabText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
  },
  dateModeContainer: {
    gap: 12,
  },
  dateSelectorBox: {
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  dateSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dateSelectorLabel: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '700',
  },
  pickDateBtn: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284C7',
  },
  pickDateBtnText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
  },
  quickPresetsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  presetChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  presetChipText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  recordedAbsencesBox: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  recordedAbsencesLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  recordedPillsScroll: {
    flexDirection: 'row',
  },
  recordedPill: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.4)',
  },
  recordedPillActive: {
    backgroundColor: '#EF4444',
    borderColor: '#F87171',
  },
  recordedPillText: {
    color: '#FCA5A5',
    fontSize: 11,
    fontWeight: '700',
  },
  recordedPillTextActive: {
    color: '#FFFFFF',
  },
  resolvedDateHeader: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
  },
  resolvedDayTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '700',
  },
  resolvedDaySub: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
  },
  applyAllDateBtn: {
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 4,
  },
  applyAllDateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  subCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  subCodeBadge: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '700',
  },
  subRoomBadge: {
    color: '#94A3B8',
    fontSize: 10,
    backgroundColor: '#0F172A',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subTimeText: {
    color: '#64748B',
    fontSize: 10,
  },
  emptySubHint: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
});

