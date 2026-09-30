import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyCTPCcfWLudZt_hEo1kH_esXsNw3p83zBk",
  authDomain: "attendance-tracker-9e4f7.firebaseapp.com",
  projectId: "attendance-tracker-9e4f7",
  storageBucket: "attendance-tracker-9e4f7.firebasestorage.app",
  messagingSenderId: "161713011694",
  appId: "1:161713011694:web:2b82b734c09edb941f6cff",
  measurementId: "G-4QZB2TGXDJ"
};

// Initialize Firebase App (prevent re-initializing if already active)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore
const db = getFirestore(app);

export { app, db };
