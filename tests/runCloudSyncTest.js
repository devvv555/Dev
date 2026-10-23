const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, getDoc, collection, getDocs, deleteDoc } = require('firebase/firestore');

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

async function runCloudSyncTest() {
  console.log('--- STARTING ATTENDANCE CLOUD SYNC LIVE RUN TEST ---');
  const testRollNo = '26AA04'; // Akash Vardhaman / Devdarshan test
  const testSlotKey = `TEST_${Date.now()}_period_1`;

  // 1. Test Syncing Period Attendance Record
  console.log('\n[Step 1] Uploading period attendance record to Cloud Firestore...');
  const periodData = {
    periodKey: testSlotKey,
    date: new Date().toISOString().split('T')[0],
    slotId: 'slot_test_01',
    subjectId: '24GM11',
    status: 'attended',
    hours: 1,
    recordedAt: Date.now(),
    cloudSyncedAt: new Date().toISOString(),
    lockedUntilPortalUpdate: true,
  };

  const periodDocRef = doc(db, 'students', testRollNo, 'periods', testSlotKey);
  await setDoc(periodDocRef, periodData, { merge: true });
  console.log('-> Period attendance uploaded successfully!');

  // 2. Test Reading Period Attendance Back from Cloud
  console.log('\n[Step 2] Verifying upload by reading it back from Cloud Firestore...');
  const verifyPeriodSnap = await getDoc(periodDocRef);
  if (verifyPeriodSnap.exists()) {
    const data = verifyPeriodSnap.data();
    console.log('-> Verified cloud data:', JSON.stringify(data, null, 2));
    console.log(`-> Status: ${data.status.toUpperCase()} | Locked: ${data.lockedUntilPortalUpdate}`);
  } else {
    throw new Error('Verification failed: Document does not exist in Cloud Firestore!');
  }

  // 3. Test Syncing Aggregate Attendance Subjects
  console.log('\n[Step 3] Uploading subjects aggregate attendance to attendance collection...');
  const testSubjects = [
    {
      id: '24GM11',
      name: 'Management & Organisational Behaviour',
      code: '24GM11',
      attended: 30,
      total: 34,
      officialAttended: 28,
      officialTotal: 32,
      lastOfficialUpdate: new Date().toLocaleDateString(),
    }
  ];

  const attendanceDocRef = doc(db, 'attendance', testRollNo);
  await setDoc(attendanceDocRef, {
    rollNo: testRollNo,
    subjects: testSubjects,
    syncedAt: new Date().toISOString(),
    testRun: true,
  }, { merge: true });
  console.log('-> Subjects attendance aggregate uploaded successfully!');

  // 4. Test Reading Aggregate Attendance Back
  console.log('\n[Step 4] Verifying aggregate subjects attendance in Cloud Firestore...');
  const verifySubjectsSnap = await getDoc(attendanceDocRef);
  if (verifySubjectsSnap.exists()) {
    const data = verifySubjectsSnap.data();
    console.log('-> Cloud Attendance Document verified for roll number:', data.rollNo);
    console.log(`-> Subjects count: ${data.subjects.length} | Attended: ${data.subjects[0].attended}/${data.subjects[0].total}`);
  } else {
    throw new Error('Verification failed for aggregate attendance!');
  }

  // 5. Test Global Sync Notification Broadcast Document
  console.log('\n[Step 5] Testing real-time global attendance update broadcast document...');
  const globalRef = doc(db, 'system_updates', 'latest_attendance_sync');
  await setDoc(globalRef, {
    updatedByRollNo: testRollNo,
    updatedByName: 'Devdarshan / Akash',
    subjectsCount: 1,
    portalUpdatedDate: new Date().toLocaleDateString(),
    updatedAt: new Date().toISOString(),
    timestamp: Date.now(),
    isLiveTest: true,
  }, { merge: true });
  console.log('-> Global attendance sync signal successfully broadcast to cloud!');

  // 6. Clean up temporary test period record
  console.log('\n[Step 6] Cleaning up test period record...');
  await deleteDoc(periodDocRef);
  console.log('-> Cleaned up test record.');

  console.log('\n=============================================');
  console.log('ALL CLOUD ATTENDANCE SYNC TESTS PASSED (100%)');
  console.log('=============================================');
  process.exit(0);
}

runCloudSyncTest().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
