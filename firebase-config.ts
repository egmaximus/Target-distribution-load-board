import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// IMPORTANT: Replace with your app's Firebase project configuration.
// To find this, go to your Firebase project, click the gear icon (Project settings),
// and under the "General" tab, scroll down to "Your apps".
// Click on the "</>" icon for web apps to find your config object.
// See: https://firebase.google.com/docs/web/setup#available-libraries
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firestore and Auth instances
export const db = getFirestore(app);
export const auth = getAuth(app);