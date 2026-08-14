import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Gunakan API Key dummy berformat valid agar Firebase tidak crash
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForLocalDev1234567890123",
  authDomain: "dummy-project.firebaseapp.com",
  projectId: "dummy-project",
  storageBucket: "dummy-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

// Inisialisasi aplikasi Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Ekspor instance Auth dan Firestore asli bawaan SDK Firebase
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;