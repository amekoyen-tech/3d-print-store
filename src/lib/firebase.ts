import { initializeApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";
import { getAuth, Auth } from "firebase/auth";

// Your web app's Firebase configuration
// For Vite, use import.meta.env.VITE_FIREBASE_...
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "placeholder-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "placeholder-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "placeholder-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "placeholder-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "placeholder-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "placeholder-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

// Lazy initialization - Firebase SDK only initializes when first accessed
let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;
let authInstance: Auth | null = null;

// Initialize Firebase only when first needed
const initFirebase = (): FirebaseApp => {
  if (!appInstance) {
    appInstance = initializeApp(firebaseConfig);
    console.log('[Firebase] Initialized on demand');
  }
  return appInstance;
};

// Lazy getters - initialize on first access
export const getDB = (): Firestore => {
  if (!dbInstance) {
    const app = initFirebase();
    dbInstance = getFirestore(app);
  }
  return dbInstance;
};

export const getStorageInstance = (): FirebaseStorage => {
  if (!storageInstance) {
    const app = initFirebase();
    storageInstance = getStorage(app);
  }
  return storageInstance;
};

export const getAuthInstance = (): Auth => {
  if (!authInstance) {
    const app = initFirebase();
    authInstance = getAuth(app);
  }
  return authInstance;
};

// Backward compatible exports
// These are lazy-loaded via getter pattern
export const db: Firestore = new Proxy({} as Firestore, {
  get(_, prop) {
    return getDB()[prop as keyof Firestore];
  }
}) as Firestore;

export const storage: FirebaseStorage = new Proxy({} as FirebaseStorage, {
  get(_, prop) {
    return getStorageInstance()[prop as keyof FirebaseStorage];
  }
}) as FirebaseStorage;

export const auth: Auth = new Proxy({} as Auth, {
  get(_, prop) {
    return getAuthInstance()[prop as keyof Auth];
  }
}) as Auth;
