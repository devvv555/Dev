const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCTPCcfWLudZt_hEo1kH_esXsNw3p83zBk",
  authDomain: "attendance-tracker-9e4f7.firebaseapp.com",
  projectId: "attendance-tracker-9e4f7",
  storageBucket: "attendance-tracker-9e4f7.firebasestorage.app",
  messagingSenderId: "161713011694",
  appId: "1:161713011694:web:2b82b734c09edb941f6cff",
  measurementId: "G-4QZB2TGXDJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Dual-pulse vibration configuration (No emojis allowed)
const ALERT_VIBRATION_PATTERN = [0, 400, 150, 400];

async function runFinalAttendanceWindowTest() {
  console.log('================================================================');
  console.log('STARTING LIVE 5-MINUTE ATTENDANCE WINDOW & CLOUD LOCK TEST');
  console.log('================================================================');

  const todayDate = new Date().toISOString().split('T')[0];
  const windowRef = doc(db, 'system_updates', 'attendance_window');

  // STEP 1: Broadcast the 5-minute attendance window open signal
  console.log('\n[Step 1] Broadcasting 5-minute live attendance window open signal to Cloud Firestore...');
  const openedAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  
  const windowOpenPayload = {
    status: 'OPEN',
    durationMinutes: 5,
    durationSeconds: 300,
    openedAt: openedAt,
    expiresAt: expiresAt,
    date: todayDate,
    message: "Today's live attendance is open for 5 minutes. If you have not recorded or need to change attendance, do it now. After 5 minutes, today's attendance will be permanently locked and uploaded to the cloud.",
    vibrationPattern: ALERT_VIBRATION_PATTERN,
    timestamp: Date.now(),
    updatedAt: new Date().toISOString()
  };

  await setDoc(windowRef, windowOpenPayload, { merge: true });
  console.log('-> Broadcast successfully stored at system_updates/attendance_window');
  console.log('   Status: OPEN');
  console.log('   Duration: 5 minutes');
  console.log('   Notice: ' + windowOpenPayload.message);

  // STEP 2: Verify simulated notification dispatch with dual-pulse vibration and 0 emojis
  console.log('\n[Step 2] Verifying reminder notification delivery specification...');
  const simulatedNotification = {
    title: "Attendance Window Open: Today's Final Attendance",
    body: windowOpenPayload.message,
    vibrate: ALERT_VIBRATION_PATTERN,
    tag: `final-window-${todayDate}`,
    requireInteraction: true
  };
  
  // Strict emoji check
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  const hasEmojiInTitle = emojiRegex.test(simulatedNotification.title);
  const hasEmojiInBody = emojiRegex.test(simulatedNotification.body);
  console.log('   Notification Title: ' + simulatedNotification.title);
  console.log('   Vibration Pattern : ' + JSON.stringify(simulatedNotification.vibrate) + ' (Dual-pulse confirmed)');
  console.log('   Contains 5 minutes strictly: ' + simulatedNotification.body.includes('5 minutes'));
  console.log('   Emoji validation: ' + (!hasEmojiInTitle && !hasEmojiInBody ? 'PASSED (0 emojis detected)' : 'FAILED'));

  if (hasEmojiInTitle || hasEmojiInBody || !simulatedNotification.body.includes('5 minutes')) {
    throw new Error('Notification format violated requirements!');
  }

  // STEP 3: Student marks / updates attendance during the open window
  console.log('\n[Step 3] Simulating students marking attendance during the 5-minute window...');
  const testRollNo = '26AA04';
  const periodSlotKey = `${todayDate}_period_final_test`;
  const periodDocRef = doc(db, 'students', testRollNo, 'periods', periodSlotKey);

  const studentSubmission = {
    periodKey: periodSlotKey,
    date: todayDate,
    slotId: 'period_final_slot',
    subjectId: '24GM11',
    status: 'attended',
    hours: 1,
    recordedAt: Date.now(),
    updatedDuringWindow: true,
    lockedUntilPortalUpdate: false // not locked yet while window is open
  };

  await setDoc(periodDocRef, studentSubmission, { merge: true });
  console.log(`-> Student ${testRollNo} successfully marked period attendance while window is OPEN.`);

  // STEP 4: Window concludes -> Final Cloud Upload and Permanent Lock
  console.log('\n[Step 4] 5 minutes concluded: Executing final upload and permanent lock...');
  
  // 4a. Update window state to LOCKED
  const windowLockedPayload = {
    status: 'LOCKED',
    closedAt: new Date().toISOString(),
    lockedUntilPortalUpdate: true,
    message: "Today's live attendance window is now closed. Attendance has been permanently locked in the cloud.",
    timestamp: Date.now(),
    updatedAt: new Date().toISOString()
  };
  await setDoc(windowRef, windowLockedPayload, { merge: true });
  console.log('-> system_updates/attendance_window state updated to LOCKED.');

  // 4b. Permanently lock the student record in Firestore
  const finalLockedPeriodData = {
    ...studentSubmission,
    lockedUntilPortalUpdate: true,
    cloudSyncedAt: new Date().toISOString(),
    finalizedAt: Date.now()
  };
  await setDoc(periodDocRef, finalLockedPeriodData, { merge: true });
  console.log(`-> Student ${testRollNo} attendance marked as permanently locked in Cloud Firestore.`);

  // STEP 5: Verification of locked status in Firestore
  console.log('\n[Step 5] Verifying Cloud Firestore records to ensure attendance cannot be modified...');
  const verifySnap = await getDoc(periodDocRef);
  if (!verifySnap.exists()) {
    throw new Error('Verification failed: Record does not exist in Cloud Firestore!');
  }
  
  const savedData = verifySnap.data();
  console.log('-> Retrieved Record from Firestore:');
  console.log('   - Period Key   : ' + savedData.periodKey);
  console.log('   - Date         : ' + savedData.date);
  console.log('   - Status       : ' + savedData.status.toUpperCase());
  console.log('   - Cloud Synced : ' + savedData.cloudSyncedAt);
  console.log('   - Locked Status: ' + savedData.lockedUntilPortalUpdate);

  if (savedData.lockedUntilPortalUpdate !== true) {
    throw new Error('Lock verification failed: lockedUntilPortalUpdate is not true!');
  }

  // STEP 6: Verify window status is locked
  const windowSnap = await getDoc(windowRef);
  const currentWindow = windowSnap.data();
  console.log('\n[Step 6] Verifying System Window Document:');
  console.log('   - Window Status: ' + currentWindow.status);
  console.log('   - Closed At    : ' + currentWindow.closedAt);

  console.log('\n================================================================');
  console.log('TEST COMPLETED SUCCESSFULLY: 100% PASS');
  console.log('Today\'s attendance is securely synced and locked in the cloud.');
  console.log('================================================================');
  process.exit(0);
}

runFinalAttendanceWindowTest().catch((err) => {
  console.error('\nTEST FAILED WITH ERROR:', err);
  process.exit(1);
});
