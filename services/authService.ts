import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import { UserProfile } from "../types";

// --- CONFIGURATION ---
const firebaseConfig = {
  apiKey: "AIzaSyBOg9hgWOkQNBD5cddr60fCFftpK5e58GE",
  authDomain: "kanad---your-ai-research-buddy.firebaseapp.com",
  projectId: "kanad---your-ai-research-buddy",
  storageBucket: "kanad---your-ai-research-buddy.firebasestorage.app",
  messagingSenderId: "301865420020",
  appId: "1:301865420020:web:3e7cba1ca9c39c0fff4aa1",
  measurementId: "G-0C5JT09ZJC"
};

// Initialize Firebase safely using Compat API
// We check firebase.apps.length to prevent re-initialization in React StrictMode/HMR
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
// Get the auth instance (uses the default app initialized above)
const auth = firebase.auth();

// State Management
let currentUser: UserProfile | null = null;
const subscribers: ((user: UserProfile | null) => void)[] = [];

const notifySubscribers = () => {
  subscribers.forEach(cb => cb(currentUser));
};

// --- PUBLIC API ---

export const signInWithGoogle = async (): Promise<UserProfile> => {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await auth.signInWithPopup(provider);
    if (!result.user) throw new Error("No user returned from Google Sign In");
    return mapUser(result.user);
  } catch (error: any) {
    console.error("Google Sign In Error", error);
    // Rethrow to let the UI handle the specific error code
    throw error;
  }
};

export const signInWithGithub = async (): Promise<UserProfile> => {
  try {
    const provider = new firebase.auth.GithubAuthProvider();
    const result = await auth.signInWithPopup(provider);
    if (!result.user) throw new Error("No user returned from GitHub Sign In");
    return mapUser(result.user);
  } catch (error: any) {
    console.error("GitHub Sign In Error", error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    await auth.signOut();
    currentUser = null;
    notifySubscribers();
  } catch (error) {
    console.error("Sign Out Error", error);
  }
};

export const subscribeToAuthChanges = (callback: (user: UserProfile | null) => void) => {
  subscribers.push(callback);
  
  // Check Firebase Auth State
  const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
          currentUser = mapUser(user);
      } else {
          currentUser = null;
      }
      notifySubscribers();
  });
  
  // Return current state immediately
  callback(currentUser);

  return () => {
      const idx = subscribers.indexOf(callback);
      if (idx > -1) subscribers.splice(idx, 1);
      unsubscribe();
  };
};

// Helper
const mapUser = (user: firebase.User): UserProfile => ({
  uid: user.uid,
  displayName: user.displayName,
  email: user.email,
  photoURL: user.photoURL
});
