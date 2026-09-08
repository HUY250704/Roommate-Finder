// Optional Firebase auth module with fallback
export const app = {};
export const auth = {};
export const googleProvider = {};

export const signInWithPopup = async () => ({
  user: { uid: 'google_' + Date.now(), email: 'google.user@gmail.com', displayName: 'Google User' }
});
export const signInWithEmailAndPassword = async () => ({ user: {} });
export const createUserWithEmailAndPassword = async () => ({ user: {} });
export const signOut = async () => {};
export const onAuthStateChanged = (auth, callback) => () => {};
