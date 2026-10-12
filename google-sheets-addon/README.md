# 📊 Google Sheets Attendance Uploader & Sync Add-on

A subproject for the **Attendance Monitor** app that allows faculty and teachers to mark student attendance directly in **Google Sheets** and immediately upload it into the app via Firebase Firestore.

---

## 🚀 Key Features

- **Direct In-Sheet Marking**: Teachers can take attendance using standard letters (`P` / `A` / `OD` / `C`) or checkboxes (`TRUE`/`FALSE`).
- **One-Click Upload**: Custom menu **`📱 Attendance Monitor > Upload Current Sheet to App`**.
- **Two Flexible Attendance Modes**:
  1. **Hourly / Period Attendance**: Marks individual subject slots for students with timestamps and verification tags (`markedBy: 'teacher_google_sheet'`).
  2. **Cumulative Subject Totals**: Syncs official cumulative attendance (`Attended Classes` and `Total Classes`) for reconciliation.
- **Built-in Roster Templates**: One-click generation of pre-filled student rosters for **Batch A**, **Batch B**, **Batch C**, and **Batch D** (PSGIM MBA 2026-28 cohort).
- **Offline & Conflict Safe**: App students automatically receive the teacher's upload during app launch and pull-to-refresh.

---

## 📁 Subproject Contents

| File | Purpose |
| :--- | :--- |
| [`Code.gs`](file:///c:/Users/DELL/OneDrive/Documents/attendance-monitor/google-sheets-addon/Code.gs) | Main Google Apps Script code to paste into Google Sheets editor. |
| [`appsscript.json`](file:///c:/Users/DELL/OneDrive/Documents/attendance-monitor/google-sheets-addon/appsscript.json) | Script manifest with OAuth scopes and timezone configuration. |
| [`template_daily_attendance.csv`](file:///c:/Users/DELL/OneDrive/Documents/attendance-monitor/google-sheets-addon/template_daily_attendance.csv) | Sample CSV template for daily/period attendance marking. |
| [`template_subject_totals.csv`](file:///c:/Users/DELL/OneDrive/Documents/attendance-monitor/google-sheets-addon/template_subject_totals.csv) | Sample CSV template for cumulative subject totals. |

---

## 🛠️ Step-by-Step Teacher Setup (Takes 2 Minutes)

### Step 1: Open Google Sheets
1. Create a new Google Sheet or open an existing one at [sheets.google.com](https://sheets.google.com).
2. Go to the top menu bar and click **Extensions** > **Apps Script**.

### Step 2: Paste the Script Code
1. In the Apps Script editor, open the file named `Code.gs`.
2. Delete any boilerplate code inside it, and paste the entire contents of [`Code.gs`](file:///c:/Users/DELL/OneDrive/Documents/attendance-monitor/google-sheets-addon/Code.gs).
3. *(Optional)* Click **Project Settings** (gear icon) on the left > check **"Show 'appsscript.json' manifest file in editor"** > replace `appsscript.json` with [`appsscript.json`](file:///c:/Users/DELL/OneDrive/Documents/attendance-monitor/google-sheets-addon/appsscript.json).
4. Click the **Save** icon (floppy disk) or press `Ctrl + S`.

### Step 3: Refresh the Spreadsheet
1. Switch back to your Google Sheet tab and **refresh the browser page** (`F5`).
2. Within 3 seconds, a new top-level menu named **`📱 Attendance Monitor`** will appear in your menu bar!

---

## 📝 How to Use

### Mode 1: Daily / Period Attendance
1. Click **`📱 Attendance Monitor` > `Generate Batch Roster Template` > `Batch A`** (or your chosen batch).
2. A new formatted sheet is created with student Roll Numbers and Names.
3. Mark attendance in the **Status (P/A/OD)** column:
   - `P` or `Present` or `1` → Present (`attended`)
   - `A` or `Absent` or `0` → Absent / Bunked (`bunked`)
   - `OD` → On Duty (`attended`)
   - `C` → Class Cancelled (`cancelled`)
4. Click **`📱 Attendance Monitor` > `Upload Current Sheet to App`**.
5. Done! The records are sent directly to Firestore. When students open their app, their attendance updates live!

### Mode 2: Official Subject Totals (Reconciliation)
If faculty want to push updated cumulative class numbers (e.g. at the end of the month):
1. In Google Sheets, set up columns:
   `Roll No` | `Student Name` | `Subject Code` | `Attended Classes` | `Total Classes`
2. Enter the numbers (e.g., Attended: `32`, Total: `36`).
3. Click **`📱 Attendance Monitor` > `Upload Current Sheet to App`**.
4. The app automatically recognizes this as cumulative data and updates the student's official attendance percentage.

---

## 🔒 Security & Firestore Rules

The add-on communicates securely using the Firebase Web API with the app's Firestore instance (`attendance-tracker-9e4f7`). 

If you want to configure or change the Firebase project, click:
**`📱 Attendance Monitor` > `Configure Firebase Settings`** or **`Test Firebase Connection`**.
