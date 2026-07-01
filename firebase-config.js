export const firebaseConfig = {
  apiKey: "AIzaSyCp4cqQEH9DZ9-Sjynpf4vTwNiM561824M",
  authDomain: "livros-b9b5e.firebaseapp.com",
  projectId: "livros-b9b5e",
  storageBucket: "livros-b9b5e.firebasestorage.app",
  messagingSenderId: "715620704508",
  appId: "1:715620704508:web:6a3118f87ff978090cf779",
  measurementId: "G-XRMQ2WVLLW",
};

export function hasFirebaseConfig() {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId);
}
