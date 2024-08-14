import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from 'firebase/firestore'
import {getStorage} from 'firebase/storage'

const firebaseConfig = {
  apiKey: "AIzaSyDVReNso1rGcljfWYwqq1TgYP__RRTFrlQ",
  authDomain: "hablearn-4ac6a.firebaseapp.com",
  projectId: "hablearn-4ac6a",
  storageBucket: "hablearn-4ac6a.appspot.com",
  messagingSenderId: "89759728931",
  appId: "1:89759728931:web:8d436a8b57610fc66df896",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
const db = getFirestore(app)
export {db}
export {storage}
