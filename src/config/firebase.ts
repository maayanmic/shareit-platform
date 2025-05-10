import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBsg88W9DkUexaGaAOKxA0aQKd4cKIThMg",
  authDomain: "shareit-454f0.firebaseapp.com",
  projectId: "shareit-454f0",
  storageBucket: "shareit-454f0.firebasestorage.app",
  messagingSenderId: "977516621506",
  appId: "1:977516621506:web:a612f8561cd1f7f5f2155b",
  measurementId: "G-F51CYRKTDG"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 