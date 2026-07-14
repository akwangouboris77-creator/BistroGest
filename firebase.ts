import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  projectId: "tranquil-rarity-zt3g1",
  appId: "1:143911472262:web:8400127137b482941a5507",
  apiKey: "AIzaSyCf_nlpVpYttLqJWKkRG-4CmGTI_-1eJDY",
  authDomain: "tranquil-rarity-zt3g1.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-bistrogestgabon-137e5e90-9d0f-4e51-a79d-f489468c6590",
  storageBucket: "tranquil-rarity-zt3g1.firebasestorage.app",
  messagingSenderId: "143911472262",
  measurementId: "",
  oAuthClientId: "143911472262-7k5hjkvn8lf9rcsm5ras9k4qh692sm7i.apps.googleusercontent.com"
};

const app = initializeApp(firebaseConfig);

// If there's a custom database ID, pass it to getFirestore
const firestore = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

const auth = getAuth(app);

export { app, firestore as db, auth };
