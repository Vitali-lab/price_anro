import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD3gNTS4DssEO-25fsnxj5vEg83oDZSpwI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vitali-20776.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vitali-20776",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vitali-20776.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "783601385835",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:783601385835:web:65feb5d02182f358630c2e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-3YB6NJJDX9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
