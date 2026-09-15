// Firebase config helper
let app = null;
let auth = null;
let googleProvider = null;

export const signInWithPopup = async (auth, provider) => {
  return {
    user: {
      uid: 'google_' + Date.now(),
      email: 'user@example.com',
      displayName: 'Google User',
      photoURL: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAW5tXAl29HfLPgJzezpubAmN60dyoEReg0lrpGTvaY6rG4UhV6uOgId7Pan-Kiof5Yr8OmzRf_xNF7NaCs0ZU2zxopGnPKuCswUWKob9LxYT3cKw7KdFuABoZQPvrg0GqXIKdLj4Jk2t4fgBnIT3liWZ5ItXuvtJuBw_5Cn-7zUg8nDA9W1o30g_F3h7F_r7kUuQKDds2C-clINixwEqHyxovo4eIXuvZR3xZMxZ1TWN1ywSodwwg'
    }
  };
};

export const signInWithEmailAndPassword = async () => {};
export const createUserWithEmailAndPassword = async () => {};
export const signOut = async () => {};
export const onAuthStateChanged = (auth, cb) => { cb(null); return () => {}; };

export { 
  app, 
  auth, 
  googleProvider 
};
