import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../config/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        setProfile(userDoc.exists() ? userDoc.data() : null);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      refreshProfile: async () => {
        if (!auth.currentUser) {
          return;
        }

        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        setProfile(userDoc.exists() ? userDoc.data() : null);
      },
      register: async ({ name, email, password }) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);

        await setDoc(doc(db, "users", result.user.uid), {
          uid: result.user.uid,
          name,
          email,
          createdAt: serverTimestamp(),
        });
      },
      updateProfile: async (payload) => {
        if (!auth.currentUser) {
          return;
        }

        await setDoc(doc(db, "users", auth.currentUser.uid), payload, { merge: true });
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        setProfile(userDoc.exists() ? userDoc.data() : null);
      },
      login: (email, password) => signInWithEmailAndPassword(auth, email, password),
      logout: () => signOut(auth),
    }),
    [loading, profile, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
