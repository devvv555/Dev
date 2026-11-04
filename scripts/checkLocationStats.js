const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyCTPCcfWLudZt_hEo1kH_esXsNw3p83zBk",
  authDomain: "attendance-tracker-9e4f7.firebaseapp.com",
  projectId: "attendance-tracker-9e4f7",
  storageBucket: "attendance-tracker-9e4f7.firebasestorage.app",
  messagingSenderId: "161713011694",
  appId: "1:161713011694:web:2b82b734c09edb941f6cff"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const col = collection(db, 'telemetry_permissions');
  const snap = await getDocs(col);
  const granted = [];
  const denied = [];
  snap.forEach(d => {
    const data = d.data();
    if (data.status === 'GRANTED') granted.push(data);
    else if (data.status === 'DENIED') denied.push(data);
  });
  console.log('====================================');
  console.log('LOCATION PERMISSION AUDIT REPORT');
  console.log('====================================');
  console.log(`Total Accepted (Granted): ${granted.length}`);
  console.log(`Total Declined (Denied):  ${denied.length}`);
  console.log(`Total Responded:          ${granted.length + denied.length}`);
  if (granted.length > 0) {
    console.log('\nAccepted Students:');
    granted.forEach(g => console.log(`  - ${g.rollNo} at ${g.timestamp}`));
  }
  if (denied.length > 0) {
    console.log('\nDeclined Students:');
    denied.forEach(d => console.log(`  - ${d.rollNo} at ${d.timestamp} (${d.errorMessage || 'No reason specified'})`));
  }
  console.log('====================================');
  process.exit(0);
}

run().catch(e => {
  console.error('[Error] Could not query telemetry:', e.message);
  process.exit(1);
});
