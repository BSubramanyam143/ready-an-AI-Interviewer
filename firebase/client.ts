// Import the functions you need from the SDKs you need
import { initializeApp,getApp,getApps } from "firebase/app";
 import {getAuth} from "firebase/auth"
 import { getFirestore } from "firebase/firestore";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDowyQyoUNZ2-c9bnJNl6ZkRdgeOK5UprU",
  authDomain: "ai-interview-87e50.firebaseapp.com",
  projectId: "ai-interview-87e50",
  storageBucket: "ai-interview-87e50.firebasestorage.app",
  messagingSenderId: "376328814583",
  appId: "1:376328814583:web:917560bb3e49453f6778f2",
  measurementId: "G-W25WYKPJVG"
};

// Initialize Firebase
const app =!getApps.length? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app)
export const db = getFirestore(app)
