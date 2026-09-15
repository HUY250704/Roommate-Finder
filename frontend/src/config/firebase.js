import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.9.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAgUFKtfEtvesTSEB60pvfdX2jnvzcxHSs",
  authDomain: (import.meta.env.VITE_FIREBASE_PROJECT_ID || "roommate-finder-b3f9b") + ".firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "roommate-finder-b3f9b",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:627775114243:web:4b45d4f8022482b5fe9236"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Facebook Provider
const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');
facebookProvider.setCustomParameters({ display: 'popup' });

export { app, auth, googleProvider, facebookProvider, signInWithPopup };
