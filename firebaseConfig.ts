import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración con tus claves reales
const firebaseConfig = {
  apiKey: "AIzaSyDjoByKIdETuYnz6K9ELoNemjzTTSyd3k8",
  authDomain: "streamers-academy-8c01d.firebaseapp.com",
  projectId: "streamers-academy-8c01d",
  storageBucket: "streamers-academy-8c01d.firebasestorage.app",
  messagingSenderId: "412239740500",
  appId: "1:412239740500:web:9921c7cd94347b8e5fb7c1",
  measurementId: "G-TVJ1112RVJ"
};

// Inicializar la aplicación de Firebase
// Eliminamos Analytics para evitar bloqueos por AdBlockers que causan pantalla blanca
const app = initializeApp(firebaseConfig);

// Inicializar y exportar los servicios para usarlos en la app
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);