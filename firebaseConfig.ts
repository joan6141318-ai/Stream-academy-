// PASO 4: IMPORTANTE
// 1. Instala firebase en tu terminal: npm install firebase
// 2. Ve a la consola de Firebase > Configuración del proyecto > General > Tus apps
// 3. Copia los valores y pégalos abajo en las comillas vacías.

// import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

const firebaseConfig = {
  // Reemplaza estos textos con los que te da Google:
  apiKey: "PEGA_AQUI_TU_API_KEY",
  authDomain: "PEGA_AQUI_TU_PROJECT_ID.firebaseapp.com",
  projectId: "PEGA_AQUI_TU_PROJECT_ID",
  storageBucket: "PEGA_AQUI_TU_PROJECT_ID.appspot.com",
  messagingSenderId: "PEGA_AQUI_TU_MESSAGING_ID",
  appId: "PEGA_AQUI_TU_APP_ID"
};

// Inicializamos Firebase
// NOTA: Se ha comentado la inicialización para evitar errores de pantalla blanca
// hasta que el usuario coloque las claves reales.
// const app = initializeApp(firebaseConfig);

// Exportamos objetos simulados (null) para que la app no se rompa al importar
export const auth = null as any;
export const db = null as any;
export const storage = null as any;

export default null;