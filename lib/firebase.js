// Firebase Client SDK initialization for B'Smart Dresses
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA50xkvifdEavhi3RgXCRjyOcHDdipKN3Q",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "bsmart-auth.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "bsmart-auth",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "bsmart-auth.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "279315045177",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:279315045177:web:367bccb12908c7956e26e8",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-B0H69TGPL5",
};

// Singleton pattern to prevent duplicate app initialization during Fast Refresh
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Auth instance
export const auth = getAuth(app);

// Google Auth Provider setup
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Analytics (safely loaded only in browser environment)
let analytics = null;
if (typeof window !== "undefined") {
  import("firebase/analytics")
    .then(({ getAnalytics, isSupported }) => {
      isSupported().then((yes) => {
        if (yes) analytics = getAnalytics(app);
      });
    })
    .catch(() => {});
}

export { app, analytics };
export default app;
