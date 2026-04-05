import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // Ensure we're using a fresh provider instance
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      console.warn("Sign-in popup was closed before completion.");
    } else if (error.code === 'auth/cancelled-popup-request') {
      console.warn("Multiple popup requests detected.");
    } else {
      console.error("Error signing in with Google:", error.code, error.message);
    }
    throw error;
  }
};

export const logout = () => signOut(auth);
