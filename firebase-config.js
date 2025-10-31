// Firebase Configuration
// You'll need to replace these with your actual Firebase project credentials
// Instructions: https://firebase.google.com/docs/web/setup

const firebaseConfig = {
  apiKey: "AIzaSyD00-6EWTN4RsskroJ8G0FOHZzbSIYTy4s",
  authDomain: "cirkle-careers.firebaseapp.com",
  databaseURL: "https://cirkle-careers-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "cirkle-careers",
  storageBucket: "cirkle-careers.firebasestorage.app",
  messagingSenderId: "738311922711",
  appId: "1:738311922711:web:de3770ccb242f993556852"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Database references
const jobsRef = database.ref('jobs');
const applicationsRef = database.ref('applications');
const processedRef = database.ref('processed');
const chatsRef = database.ref('chats');
