// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

import { signInWithPopup } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";
import { OAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    YOUR_FIREBASE_CONFIG_HERE
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const auth = getAuth(app);
export default app;

// Initialize Firebase Auth provider
const googleProvider = new GoogleAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// whenever a user interacts with the provider, we force them to select an account
googleProvider.setCustomParameters({
    prompt: "select_account "
});
export const signInWithGooglePopup = () => signInWithPopup(auth, googleProvider);

microsoftProvider.setCustomParameters({
    // Force re-consent.
    prompt: 'consent',
});

export const signInWithMicrosoftPopup = () => signInWithPopup(auth, microsoftProvider);
