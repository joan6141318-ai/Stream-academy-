import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDjoByKIdETuYnz6K9ELoNemjzTTSyd3k8",
  authDomain: "streamers-academy-8c01d.firebaseapp.com",
  projectId: "streamers-academy-8c01d",
  storageBucket: "streamers-academy-8c01d.appspot.com",
  messagingSenderId: "412239740500",
  appId: "1:412239740500:web:9921c7cd94347b8e5fb7c1",
  measurementId: "G-TVJ1112RVJ"
};

// Singleton pattern: Ensure only one instance of Firebase App exists
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services with the specific app instance
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };