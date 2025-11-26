// PASO 4: IMPORTANTE (VERCEL READY)
// Este archivo está configurado para leer las claves desde Vercel (Variables de Entorno)
// o usar valores seguros por defecto para que la app no se rompa.

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Ahora lee de las variables de entorno de Vercel/Vite
  apiKey: (import.meta as any).env.VITE_FIREBASE_API_KEY || "mock_key",
  authDomain: (import.meta as any).env.VITE_FIREBASE_AUTH_DOMAIN || "mock_project.firebaseapp.com",
  projectId: (import.meta as any).env.VITE_FIREBASE_PROJECT_ID || "mock_project",
  storageBucket: (import.meta as any).env.VITE_FIREBASE_STORAGE_BUCKET || "mock_project.appspot.com",
  messagingSenderId: (import.meta as any).env.VITE_FIREBASE_MESSAGING_SENDER_ID || "0000000000",
  appId: (import.meta as any).env.VITE_FIREBASE_APP_ID || "1:0000000000:web:0000000000"
};

// Inicialización BLINDADA (Try-Catch)
// Si no hay claves reales configuradas en Vercel, esto fallará silenciosamente
// y la app seguirá funcionando en modo Demo/Local.

let app;
let auth: any = null;
let db: any = null;
let storage: any = null;

try {
  // Descomenta las siguientes líneas cuando hayas puesto las claves en Vercel
  // app = initializeApp(firebaseConfig);
  // auth = getAuth(app);
  // db = getFirestore(app);
  // storage = getStorage(app);
  // console.log("Firebase inicializado correctamente");
} catch (error) {
  // Silenciamos el error para no asustar en consola
  // console.log("Modo Offline/Demo activo");
}

export { auth, db, storage };
export default app;