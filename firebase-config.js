// Firebase Configuration
// You'll need to replace these with your actual Firebase project credentials
// Instructions: https://firebase.google.com/docs/web/setup

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  databaseURL: "https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Database references
const jobsRef = database.ref('jobs');
const applicationsRef = database.ref('applications');
const processedRef = database.ref('processed');
const chatsRef = database.ref('chats');
