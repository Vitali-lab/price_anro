import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3gNTS4DssEO-25fsnxj5vEg83oDZSpwI",
  authDomain: "vitali-20776.firebaseapp.com",
  projectId: "vitali-20776",
  storageBucket: "vitali-20776.firebasestorage.app",
  messagingSenderId: "783601385835",
  appId: "1:783601385835:web:65feb5d02182f358630c2e",
  measurementId: "G-3YB6NJJDX9",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
