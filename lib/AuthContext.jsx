"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  signInWithGoogle: async () => {},
  sendPasswordReset: async () => {},
  logout: async () => {},
  updateUserProfile: async () => {},
  clearError: () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearError = () => setError(null);

  // Sync token with Edge Middleware session cookie
  const syncSessionCookie = async (currentUser) => {
    try {
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        // Also set client cookie for instant middleware read without delay
        if (typeof document !== "undefined") {
          document.cookie = `bsmart_session=${idToken}; path=/; max-age=604800; SameSite=Lax`;
        }
      } else {
        await fetch("/api/auth/session", { method: "DELETE" });
        if (typeof document !== "undefined") {
          document.cookie = "bsmart_session=; path=/; max-age=0; SameSite=Lax";
        }
      }
    } catch (err) {
      console.warn("Session sync warning:", err);
    }
  };

  useEffect(() => {
    // Listen for token updates (including refresh and initial load)
    const unsubscribe = onIdTokenChanged(auth, async (currentUser) => {
      setUser(currentUser);
      await syncSessionCookie(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Format friendly Firebase error messages
  const formatAuthError = (err) => {
    const code = err?.code || "";
    switch (code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return "Invalid email or password. Please check your credentials.";
      case "auth/email-already-in-use":
        return "An account with this email already exists. Try signing in.";
      case "auth/weak-password":
        return "Password must be at least 6 characters long.";
      case "auth/invalid-email":
        return "Please enter a valid email address.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      case "auth/popup-blocked":
        return "Sign-in popup was blocked by your browser. Please allow popups.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";
      case "auth/network-request-failed":
        return "Network connection error. Please verify your internet.";
      default:
        return err?.message || "An unexpected authentication error occurred.";
    }
  };

  const signInWithEmail = async (email, password) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      await syncSessionCookie(cred.user);
      return cred.user;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signUpWithEmail = async (email, password, displayName) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      if (displayName?.trim()) {
        await updateProfile(cred.user, { displayName: displayName.trim() });
      }
      await syncSessionCookie(cred.user);
      setUser({ ...cred.user, displayName: displayName?.trim() || cred.user.displayName });
      return cred.user;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      await syncSessionCookie(cred.user);
      return cred.user;
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const sendPasswordReset = async (email) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
      await syncSessionCookie(null);
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const updateUserProfile = async (updates) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, updates);
      setUser({ ...auth.currentUser });
    } catch (err) {
      const msg = formatAuthError(err);
      setError(msg);
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        sendPasswordReset,
        logout,
        updateUserProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
