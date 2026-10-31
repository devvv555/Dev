# UI Display & Profile Normalization Investigation (Requirement R2)

## 1. Executive Summary

This investigation surveys all user interface displays, screens, modals, headers, profile models, and storage references across the attendance-monitor application for the **College Roll Number Migration Project**.

The primary objective is to migrate student identification and display from legacy internal D-Roll numbers (e.g. `D26AB05`) to official College Roll Numbers (e.g. `26AB12`).

### Core Findings
1. **Devdarshan V Test Case**: Devdarshan V (Batch B) is currently registered in `src/data/psgimMasterStudents.ts` with legacy `dRollNo: "D26AB05"`, but with an incorrect `collegeRollNo: "26AB05"` instead of his official College Roll Number **`26AB12`**. In the true college directory (`tests/master_students.cjs` line 103 and `google-sheets-addon/Code.gs`), Devdarshan V is officially `collegeRollNo: "26AB12"`. Because of this mismatch, entering `26AB12` currently resolves to Mathumitha M (`D26AB12`), while entering `D26AB05` resolves to `26AB05`. Once `psgimMasterStudents.ts` is corrected, bidirectional normalization seamlessly maps `D26AB05` <-> `26AB12`.
2. **Missing Roll Number Displays on Screens**:
   - `App.tsx`: Header student badge currently only displays the label `Profile ▼` instead of the student's Roll Number.
   - `DashboardScreen.tsx`: The welcome card shows student name and batch (`Section B • MBA (2026-28)`), but omits the Roll Number even though `styles.welcomeRoll` is already defined in the stylesheet.
   - `TimetableScreen.tsx` & `CalendarScreen.tsx`: Do not receive `studentRollNo` in their props and do not display student identification in their headers.
3. **Leaked D-Roll Numbers in UI**:
   - `ReconcileScreen.tsx` line 943: The Moodle portal card displays `Moodle Username (D-Roll): D26AB05`. This directly violates the Acceptance Criteria: *"Studzone and Moodle proxy calls transparently bridge to D26AB05 without exposing D-Roll numbers in the UI"*.
   - `DigitalIdModal.tsx`: Uses raw input `studentRollNo` without ensuring it is normalized via `toNewRollNo()`. If passed a legacy D-Roll, it prints `D26AB05` on the card and barcode.
4. **Zero Emoji Policy Violations**: Over 60 emoji characters exist across `App.tsx`, `DashboardScreen.tsx`, `ReconcileScreen.tsx`, `CalendarScreen.tsx`, `DigitalIdModal.tsx`, `AttendanceDisputeModal.tsx`, `LmsAssignmentCard.tsx`, and `PsgimNoticeModal.tsx`. All must be replaced with plain ASCII or text labels.

---

## 2. Devdarshan V Test Case Investigation

### Current State
In `src/data/psgimMasterStudents.ts`:
- Line 81:
  ```ts
  "D26AB05": { dRollNo: "D26AB05", collegeRollNo: "26AB05", name: "DEVDARSHAN V", batch: "B" },
  ```
- Line 88:
  ```ts
  "D26AB12": { dRollNo: "D26AB12", collegeRollNo: "26AB12", name: "MATHUMITHA M", batch: "B" },
  ```

In `tests/master_students.cjs` (the authoritative circular roster):
- Line 103:
  ```ts
  "D26AB05": { dRollNo: "D26AB05", collegeRollNo: "26AB12", name: "DEVDARSHAN V", batch: "B", dob: "2005-12-13", dobPassword: "13DEC05", bloodGroup: "B +ve" },
  ```
- Line 110:
  ```ts
  "D26AB12": { dRollNo: "D26AB12", collegeRollNo: "26AB29", name: "MATHUMITHA M", batch: "B", dob: "2006-01-26", dobPassword: "26JAN06", bloodGroup: "A +ve" },
  ```

In `src/data/psgimData.ts`:
- `D26AB05` course batches (lines 1105-1118):
  - MCOB: `MCOB1`
  - ADM: `ADM2`
  - MC: `MC3`
  - SSM: `SSM2`
  - BS: `BS2`
  - EDM: `EDM1`
  - LA: `LA1`
  - SSA: `SSA3`
  - SPORTS: `SPORTS2`
- This matches Acceptance Criteria line 127:
  `getTimetableForStudent('26AB12')` returns the 19 weekly periods with correct classrooms (`LA1` -> `LH-101`, `MC3` -> `LH-401`, `SSA3` -> `LH-101`).

### Required Normalization Behavior
1. `toNewRollNo('D26AB05')` must return `'26AB12'`.
2. `toNewRollNo('26AB12')` must return `'26AB12'`.
3. `toOldRollNo('26AB12')` must return `'D26AB05'`.
4. `getMasterStudent('26AB12')` must return `{ dRollNo: "D26AB05", collegeRollNo: "26AB12", name: "DEVDARSHAN V", batch: "B" }`.
5. `PsgimService.getStudentProfile('26AB12')` must return:
   - `rollNo`: `"26AB12"`
   - `collegeRollNo`: `"26AB12"`
   - `dRollNo`: `"D26AB05"`
   - `name`: `"DEVDARSHAN V"`
   - `section`: `"Batch B"`
   - `email`: `"devdarshanv2005@gmail.com"`

---

## 3. Screen-by-Screen Investigation & Required UI Changes

### 3.1 App.tsx
- **File**: `App.tsx`
- **Current Observation**:
  - Line 67: `setActiveRollNo(officialRoll)` sets state, but line 770-776 displays:
    ```tsx
    <TouchableOpacity
      style={styles.studentBadge}
      onPress={() => setShowProfileMenu((prev) => !prev)}
      activeOpacity={0.7}
    >
      <Text style={styles.studentBadgeText} numberOfLines={1}>
        Profile {showProfileMenu ? '▲' : '▼'}
      </Text>
    </TouchableOpacity>
    ```
  - Lines 846-865: `TimetableScreen` and `CalendarScreen` are rendered without `studentRollNo` props:
    ```tsx
    {activeTab === 'TIMETABLE' && (
      <TimetableScreen
        subjects={subjects}
        timetable={timetable}
        ...
      />
    )}
    {activeTab === 'CALENDAR' && (
      <CalendarScreen
        subjects={subjects}
        timetable={timetable}
        ...
      />
    )}
    ```
- **Proposed Changes**:
  1. Header Student Badge (Line 774):
     ```tsx
     <Text style={styles.studentBadgeText} numberOfLines={1}>
       Roll No: {toNewRollNo(activeRollNo)} {showProfileMenu ? '▲' : '▼'}
     </Text>
     ```
  2. Pass `studentRollNo={activeRollNo}` and `studentName={studentName}` to `TimetableScreen` and `CalendarScreen`.
  3. Replace emojis in bottom tab navigation (lines 887, 898, 912, 923) with plain text or SVG icons.

---

### 3.2 DashboardScreen.tsx
- **File**: `src/screens/DashboardScreen.tsx`
- **Current Observation**:
  - Welcome Banner (lines 757-765):
    ```tsx
    <View style={styles.welcomeInfo}>
      <Text style={styles.welcomeGreeting}>Welcome,</Text>
      <Text style={styles.welcomeName} numberOfLines={1}>
        {studentName || 'Student'}
      </Text>
      <Text style={styles.welcomeSub}>
        {profile.section ? `${profile.section} • ` : ''}MBA (2026–28)
      </Text>
    </View>
    ```
  - Line 2281: `styles.welcomeRoll` is defined (`color: '#38BDF8', fontWeight: '700'`), but never used.
  - Line 1688: `<DigitalIdModal visible={showDigitalIdModal} onClose={...} studentRollNo={studentRollNo} />` passes `studentRollNo`.
- **Proposed Changes**:
  1. Welcome Card Sub-header (Lines 762-764):
     ```tsx
     <Text style={styles.welcomeSub}>
       <Text style={styles.welcomeRoll}>Roll No: {toNewRollNo(studentRollNo)}</Text>
       {profile.section ? ` • ${profile.section}` : ''} • MBA (2026–28)
     </Text>
     ```
  2. Student Badge / Avatar tap: Shows verified College Roll Number in a clean pill badge next to the section.
  3. Ensure all modal invocations normalize `studentRollNo` using `toNewRollNo(studentRollNo)`.
  4. Replace emoji icons across buttons and status banners (lines 1096, 1287, 1365, 1432, 1433, 1468, 1492, 1502, 1511, 1830-1882).

---

### 3.3 TimetableScreen.tsx
- **File**: `src/screens/TimetableScreen.tsx`
- **Current Observation**:
  - Lines 14-19: `TimetableScreenProps` does not accept `studentRollNo`.
  - Lines 77-82: Header only displays:
    ```tsx
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Weekly Period Index</Text>
      <Text style={styles.headerSubtitle}>
        Showing {selectedDay}'s schedule...
      </Text>
    </View>
    ```
- **Proposed Changes**:
  1. Add `studentRollNo?: string` to `TimetableScreenProps`:
     ```ts
     interface TimetableScreenProps {
       subjects: Subject[];
       timetable: TimetableSlot[];
       studentRollNo?: string;
       onAddSlot?: (slot: TimetableSlot) => void;
       onRefresh?: () => Promise<void> | void;
     }
     ```
  2. Prominently display College Roll Number in the header:
     ```tsx
     <View style={styles.header}>
       <View style={styles.headerTitleRow}>
         <Text style={styles.headerTitle}>Weekly Period Index</Text>
         {studentRollNo ? (
           <View style={styles.rollBadge}>
             <Text style={styles.rollBadgeText}>Roll No: {toNewRollNo(studentRollNo)}</Text>
           </View>
         ) : null}
       </View>
       <Text style={styles.headerSubtitle}>
         {studentRollNo ? `Roll No: ${toNewRollNo(studentRollNo)} • ` : ''}Showing {selectedDay}'s schedule{selectedDay === todayDay ? ' (Today)' : ''}. Hourly attendance alerts trigger at the end of each slot.
       </Text>
     </View>
     ```
  3. Add matching styles for `headerTitleRow`, `rollBadge`, `rollBadgeText`.

---

### 3.4 ReconcileScreen.tsx
- **File**: `src/screens/ReconcileScreen.tsx`
- **Current Observation**:
  - Lines 941-947:
    ```tsx
    <View style={styles.moodleCredsSummaryBox}>
      <View style={styles.moodleCredsRow}>
        <Text style={styles.moodleCredsLabel}>👤 Moodle Username (D-Roll):</Text>
        <Text style={[styles.moodleCredsValue, { color: '#38BDF8', fontWeight: '800' }]}>
          {LmsService.resolveMoodleUsername(activeRollNo)}
        </Text>
      </View>
    ```
    This prints `D26AB05` in large cyan text!
  - Lines 831-836: Header lacks student roll number.
  - Lines 1494-1503: Studzone extractor modal has placeholder `e.g. 24AA01`.
- **Proposed Changes**:
  1. Header Display: Add prominent `Roll No: {toNewRollNo(activeRollNo)}` badge in `ReconcileScreen.tsx` header.
  2. Moodle Card (Lines 943-946): Replace `👤 Moodle Username (D-Roll):` with:
     ```tsx
     <View style={styles.moodleCredsRow}>
       <Text style={styles.moodleCredsLabel}>Student Roll Number:</Text>
       <Text style={[styles.moodleCredsValue, { color: '#38BDF8', fontWeight: '800' }]}>
         Roll No: {toNewRollNo(activeRollNo)}
       </Text>
     </View>
     <View style={styles.moodleCredsRow}>
       <Text style={styles.moodleCredsLabel}>LMS Bridge Mode:</Text>
       <Text style={[styles.moodleCredsValue, { color: '#34D399', fontWeight: '700' }]}>
         Automatic Server Gateway
       </Text>
     </View>
     ```
  3. Studzone Card (Lines 886-890):
     Ensure `lastSyncInfo.rollNo` is displayed as `toNewRollNo(lastSyncInfo.rollNo)`.
  4. Studzone Modal (Line 1500):
     Set placeholder to `e.g. 26AB12`. Ensure `studzoneRollNo` state defaults to `toNewRollNo(activeRollNo)`.
  5. Remove all emojis in alerts, buttons, and headers.

---

### 3.5 CalendarScreen.tsx
- **File**: `src/screens/CalendarScreen.tsx`
- **Current Observation**:
  - Lines 22-27: `CalendarScreenProps` lacks `studentRollNo`.
  - Lines 143-151: Header has no student roll number display.
- **Proposed Changes**:
  1. Add `studentRollNo?: string` to `CalendarScreenProps`.
  2. In header:
     ```tsx
     <View style={styles.header}>
       <View style={styles.headerTitleRow}>
         <Text style={styles.headerTitle}>Academic Calendar 2026–27</Text>
         {studentRollNo ? (
           <View style={styles.rollBadge}>
             <Text style={styles.rollBadgeText}>Roll No: {toNewRollNo(studentRollNo)}</Text>
           </View>
         ) : null}
       </View>
       <Text style={styles.headerSubtitle}>
         {studentRollNo ? `Roll No: ${toNewRollNo(studentRollNo)} • ` : ''}Official PSGIM academic schedule, university exams, study holidays & term dates.
       </Text>
     </View>
     ```
  3. Replace emojis in `getTypeBadge` (lines 118-124: `🌴`, `📝`, `⛺`, `🎓`).

---

### 3.6 AdminDashboardScreen.tsx
- **File**: `src/screens/AdminDashboardScreen.tsx`
- **Current Observation**:
  - Line 1211: `<Text style={styles.studentCardRoll}>{st.rollNo}</Text>` renders raw database roll.
  - Line 1281: `Roll No: {st.rollNo} • Batch {st.batch}` in drilldown header.
  - Line 913: `<Text style={styles.fbRollNo}>({fb.studentRollNo})</Text>` in feedback list.
  - Line 1355: `Roll No: {replyingFeedback.studentRollNo} • Batch ...`
- **Proposed Changes**:
  1. Normalize student card roll display:
     ```tsx
     <Text style={styles.studentCardRoll}>{toNewRollNo(st.rollNo)}</Text>
     ```
  2. In individual drilldown modal (line 1281):
     ```tsx
     <Text style={styles.drilldownSub}>
       Roll No: {toNewRollNo(st.rollNo)} • Batch {st.batch}
     </Text>
     ```
  3. If secondary reference is useful for admin diagnostics, show subtle secondary line:
     ```tsx
     <Text style={styles.studentCardSubRoll}>Legacy ID: {toOldRollNo(st.rollNo)}</Text>
     ```
  4. Search filter (line 1025):
     ```ts
     toNewRollNo(rec.rollNo).toLowerCase().includes(query) ||
     toOldRollNo(rec.rollNo).toLowerCase().includes(query) ||
     rec.name.toLowerCase().includes(query)
     ```
     This allows admins to search either by `26AB12` or `D26AB05`.

---

### 3.7 DigitalIdModal.tsx
- **File**: `src/components/DigitalIdModal.tsx`
- **Current Observation**:
  - Line 34: `const cleanRoll = studentRollNo.toUpperCase().trim();`
  - Line 201: `<Text style={styles.rollBadgeText}>{cleanRoll}</Text>`
  - Line 253: `<Text style={styles.barcodeNumberText}>* {cleanRoll} *</Text>`
  - Line 136: `const barcodeModules = generateCode128Modules(cleanRoll || '26AB12');`
- **Proposed Changes**:
  1. Normalize input roll:
     ```tsx
     const officialRoll = toNewRollNo(studentRollNo);
     const student = getMasterStudent(officialRoll) || getMasterStudent(studentRollNo);
     const studentName = student ? student.name : officialRoll;
     const profile = PsgimService.getStudentProfile(officialRoll);
     ```
  2. ID Card Front:
     - Badge (Line 201):
       `<Text style={styles.rollBadgeText}>{officialRoll}</Text>`
     - Barcode Number (Line 253):
       `<Text style={styles.barcodeNumberText}>* {officialRoll} *</Text>`
     - Barcode Pattern Generator (Line 136):
       `const barcodeModules = generateCode128Modules(officialRoll || '26AB12');`
  3. ID Card Back:
     - Institutional Email (Line 273):
       `<Text style={styles.backVal}>{profile.email || `${officialRoll.toLowerCase()}@psgim.ac.in`}</Text>`
  4. Zero Emoji Policy:
     - Line 153: replace `⚠️` with `[!]`
     - Line 170: replace `🏛️` with `PSGIM`
     - Line 286: replace `🚨` with `Emergency:`
     - Line 314: replace `🔄` with `Flip:`
     - Line 329: replace `🩸` with `Blood Group:`
     - Line 380: replace `Save to ID Card ✅` with `Save to ID Card`

---

### 3.8 Other Components (Dispute, CoursePlan, Feedback, Scanner)
1. **AttendanceDisputeModal.tsx**:
   - Line 123: Subtitle displays `{report.studentName} ({toNewRollNo(report.rollNo)}) • {report.section}`.
   - `disputeReportService.ts` line 208: Summary text displays `Student: ${studentName} (${toNewRollNo(cleanRoll)})`.
   - Strip emojis in dossier templates (`⚠️`, `📋`, `✅`, `👤`, `🏫`, `📅`, `🕒`).
2. **CoursePlanModal.tsx**:
   - Header badge: Add `Roll No: {toNewRollNo(studentRollNo)}`.
   - Ensure `studentRollNo` passed to `CoursePlanService` works with College Roll Number.
3. **FeedbackModal.tsx**:
   - Update default `studentRollNo` prop from `'26AA04'` to `'26AB12'` (or omit default).
   - Display `toNewRollNo(studentRollNo)` in submission details.
4. **BarcodeScannerScreen.tsx**:
   - Fix section derivation logic:
     ```tsx
     const clean = toNewRollNo(rollNo);
     const section = clean.length >= 4 ? clean.slice(2, 4) : '';
     ```
     This correctly resolves `"AB"` from `"26AB12"` instead of incorrectly slicing `"B1"`.

---

## 4. Data Layer & Service Integration Requirements

### 4.1 Master Student Directory (`src/data/psgimMasterStudents.ts`)
- **Fix Devdarshan V Record**:
  Line 81 must be:
  ```ts
  "D26AB05": { dRollNo: "D26AB05", collegeRollNo: "26AB12", name: "DEVDARSHAN V", batch: "B", dob: "2005-12-13", dobPassword: "13DEC05", bloodGroup: "B +ve" },
  ```
- **Sync Full Circular Mapping**:
  Verify all 63 students in Batch B and all other batches match `tests/master_students.cjs`.
- **Bidirectional Index**:
  Ensure `STUDENTS_BY_NEW_ROLL` indexes all college roll numbers, and `toNewRollNo('D26AB05')` returns `'26AB12'`.

### 4.2 PsgimService (`src/services/psgimService.ts`)
- `getStudentProfile(rollNo)`:
  - Must return `rollNo: newRoll` (College Roll Number e.g. `26AB12`).
  - `collegeRollNo: newRoll`.
  - `dRollNo: master?.dRollNo || oldRoll`.
- `getStudentName(rollNo)`:
  - When called with `'26AB12'`, must return `'DEVDARSHAN V'`.

### 4.3 Storage Continuity (`src/services/storageService.ts`)
- `getPeriodRecords(rollNo)`:
  - If querying with College Roll Number (`26AB12`) and no records found, check fallback under `toOldRollNo(rollNo)` (`D26AB05`) and seamlessly migrate the key:
    ```ts
    const newKey = `${STORAGE_KEYS.PERIOD_RECORDS}${toNewRollNo(rollNo)}`;
    const oldKey = `${STORAGE_KEYS.PERIOD_RECORDS}${toOldRollNo(rollNo)}`;
    ```
- `getPeriodReminders` & `getSurplusAlerts`:
  - Apply similar fallback and bidirectional key migration.

---

## 5. Secondary Display & Label Specifications

To preserve backward compatibility for campus admins while guaranteeing a 100% College Roll Number UI for students:

| Surface | Primary Display (Prominent) | Secondary Display (Subtle / Internal) |
|---|---|---|
| **App Header** | `Roll No: 26AB12` (in student badge) | None |
| **Dashboard Welcome** | `Roll No: 26AB12` (bold cyan text in welcome card) | None |
| **Timetable Header** | `Roll No: 26AB12` (pill badge) | None |
| **Calendar Header** | `Roll No: 26AB12` (pill badge) | None |
| **Reconcile Studzone Card** | `Roll No: 26AB12` | None |
| **Reconcile Moodle Card** | `Student Roll Number: 26AB12` | `LMS Bridge: Connected (Auto-proxy)` |
| **Digital ID Front** | `26AB12` (Large badge & scannable barcode) | None |
| **Digital ID Back** | `26ab12@psgim.ac.in` (Institutional email) | None |
| **Admin Student Roster** | `26AB12` (Large student card title) | `Legacy: D26AB05` (small muted text) |
| **Dispute Dossier** | `Student: DEVDARSHAN V (26AB12)` | None |
| **Login Screen** | `Roll Number (e.g. 26AB12)` | Auto-translates `D26AB05` to `26AB12` |

---

## 6. Zero Emoji Policy Compliance Table

| File | Line(s) | Current Forbidden Content | Proposed Clean ASCII Replacement |
|---|---|---|---|
| `App.tsx` | 887 | `⚡ Hourly` | `Hourly` |
| `App.tsx` | 898 | `🗂️ Period Index` | `Period Index` |
| `App.tsx` | 912 | `🗓️ Calendar` | `Calendar` |
| `App.tsx` | 923 | `🌐 Portals` | `Portals` |
| `DashboardScreen.tsx` | 1096 | `🔒`, `✅`, `❌`, `⚪` | `[LOCKED]`, `ATTENDED`, `MISSED`, `FREE` |
| `DashboardScreen.tsx` | 1287 | `📚` | `[Moodle]` |
| `DashboardScreen.tsx` | 1365 | `📢` | `[Notices]` |
| `DashboardScreen.tsx` | 1432-1433 | `✅ Safe`, `⚠️ Shortage` | `Safe (>=75%)`, `Shortage (<75%)` |
| `DashboardScreen.tsx` | 1468 | `🔔` | `[Alert]` |
| `DashboardScreen.tsx` | 1492, 1502 | `✅ Attended`, `❌ Missed` | `Attended`, `Missed` |
| `DashboardScreen.tsx` | 1866, 1874 | `✅ I Attended`, `❌ I Missed` | `I Attended`, `I Missed` |
| `ReconcileScreen.tsx` | 448, 461 | `Studzone Sync Complete! 🚀` | `Studzone Sync Complete` |
| `ReconcileScreen.tsx` | 719 | `Moodle Credentials Saved ✅` | `Moodle Credentials Saved` |
| `ReconcileScreen.tsx` | 774 | `Register Number Required ⚠️` | `Register Number Required` |
| `ReconcileScreen.tsx` | 842 | `⚡` | `[Studzone]` |
| `ReconcileScreen.tsx` | 887 | `👤 Last Extracted by:` | `Last Extracted by:` |
| `ReconcileScreen.tsx` | 914 | `🌐 Connect & Extract Attendance` | `Connect & Extract Attendance` |
| `ReconcileScreen.tsx` | 922 | `📚` | `[Moodle]` |
| `ReconcileScreen.tsx` | 943 | `👤 Moodle Username (D-Roll):` | `Student Roll Number:` |
| `ReconcileScreen.tsx` | 949 | `🔑 Moodle Password:` | `Moodle Password:` |
| `ReconcileScreen.tsx` | 953 | `🔔 Phone Notifications:` | `Phone Notifications:` |
| `ReconcileScreen.tsx` | 955 | `📲 Active on Phone Tray` | `Active on Phone Tray` |
| `ReconcileScreen.tsx` | 959 | `🕒 Night Auto-Sync Window:` | `Night Auto-Sync Window:` |
| `ReconcileScreen.tsx` | 972 | `⚙️ Moodle Password` | `Moodle Password Settings` |
| `ReconcileScreen.tsx` | 984 | `🔄 Sync Moodle Deadlines` | `Sync Moodle Deadlines` |
| `ReconcileScreen.tsx` | 994 | `📢` | `[Connect]` |
| `ReconcileScreen.tsx` | 1020 | `⚠️ Register Number Not Configured` | `[Warning] Register Number Not Configured` |
| `ReconcileScreen.tsx` | 1038 | `🟢 Live & Connected` | `Live & Connected` |
| `ReconcileScreen.tsx` | 1060 | `🔄 Fetch Announcements` | `Fetch Announcements` |
| `ReconcileScreen.tsx` | 1068 | `💡` | `[Tip]` |
| `ReconcileScreen.tsx` | 1523 | `👁️`, `🙈` | `Show`, `Hide` |
| `ReconcileScreen.tsx` | 1539 | `⚠️ Caution:` | `Caution:` |
| `ReconcileScreen.tsx` | 1677 | `✅ Apply to All Subjects` | `Apply to All Subjects` |
| `DigitalIdModal.tsx` | 153 | `⚠️` | `[!]` |
| `DigitalIdModal.tsx` | 170 | `🏛️` | `PSGIM` |
| `DigitalIdModal.tsx` | 286 | `🚨 Student Emergency Contact:` | `Student Emergency Contact:` |
| `DigitalIdModal.tsx` | 314 | `🔄 {isFlipped ? ... : ...}` | `{isFlipped ? 'View Card Front' : 'View Emergency Contacts (Back)'}` |
| `DigitalIdModal.tsx` | 329 | `🩸 Select Your Blood Group` | `Select Your Blood Group` |
| `DigitalIdModal.tsx` | 380 | `Save to ID Card ✅` | `Save to ID Card` |
| `AttendanceDisputeModal.tsx` | 79 | `Dispute Dossier Copied! 📋✅` | `Dispute Dossier Copied` |
| `AttendanceDisputeModal.tsx` | 142 | `⚠️`, `✅` | `[!]`, `[OK]` |
| `AttendanceDisputeModal.tsx` | 280 | `✅ Copied to Clipboard!` | `Copied to Clipboard` |
| `AttendanceDisputeModal.tsx` | 289 | `📤 Share / Send` | `Share / Send` |
| `CalendarScreen.tsx` | 118-124 | `🌴 Holiday`, `📝 Exam`, `⛺ Event` | `Holiday`, `Exam`, `Event / Trip`, `Academic` |

---

## 7. Verification Method

1. **Devdarshan V Test Case Verification**:
   - Query `toNewRollNo('D26AB05')` -> Assert equals `'26AB12'`.
   - Query `toOldRollNo('26AB12')` -> Assert equals `'D26AB05'`.
   - Query `getMasterStudent('26AB12')` -> Assert `name === 'DEVDARSHAN V'`.
   - Query `getTimetableForStudent('26AB12')` -> Assert length === 19 and slots match `LA1`, `MC3`, `SSA3`.
2. **UI Screen Audit Verification**:
   - Check rendered text in `DashboardScreen.tsx`: Assert contains `"Roll No: 26AB12"`, assert does not contain `"D26AB05"`.
   - Check rendered text in `TimetableScreen.tsx`: Assert header contains `"Roll No: 26AB12"`.
   - Check rendered text in `CalendarScreen.tsx`: Assert header contains `"Roll No: 26AB12"`.
   - Check rendered text in `ReconcileScreen.tsx`: Assert Moodle card does NOT contain `"D26AB05"`, assert displays `"Roll No: 26AB12"`.
   - Check rendered text in `DigitalIdModal.tsx`: Assert barcode text is `"* 26AB12 *"`.
3. **Build & Quality Verification**:
   - Run `npx tsc --noEmit` -> Must exit with code 0.
   - Run `npm run build:pwa` -> Must complete with exit code 0.
   - Run automated emoji scanner script -> Must report 0 emojis across all updated files.
