import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA_B0nbiiN2sB-ik2_2rlQrrdfyRqXC5uw",
  authDomain: "pallaviecomerce.firebaseapp.com",
  projectId: "pallaviecomerce",
  storageBucket: "pallaviecomerce.firebasestorage.app",
  messagingSenderId: "91952784780",
  appId: "1:91952784780:web:e4dd618b47e90eb6e5a2a9",
  measurementId: "G-8280VGHWSK",
};

export const app: FirebaseApp = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

/**
 * Analytics is optional: initialisation failures (unsupported browsers,
 * blocked scripts, development environments) must never break the app.
 * Resolves to `null` when analytics is unavailable.
 */
export const analytics: Promise<Analytics | null> = (async () => {
  if (typeof window === "undefined") return null;
  try {
    if (!(await isSupported())) return null;
    return getAnalytics(app);
  } catch {
    return null;
  }
})();
