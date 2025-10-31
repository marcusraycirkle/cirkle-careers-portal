# Firebase Setup Guide

## 🔥 Setting Up Firebase for Cirkle Careers Portal

Your careers portal now uses **Firebase Realtime Database** to store all data in the cloud, making job listings and applications visible to everyone!

### Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"**
3. Enter project name: `cirkle-careers` (or your choice)
4. Disable Google Analytics (not needed) or enable it
5. Click **"Create project"**

### Step 2: Set Up Realtime Database

1. In your Firebase project, go to **"Build" → "Realtime Database"**
2. Click **"Create Database"**
3. Choose a location (e.g., `us-central1`)
4. Start in **"Test mode"** for now (we'll secure it later)
5. Click **"Enable"**

### Step 3: Get Your Firebase Config

1. In Firebase Console, click the **Settings gear icon** → **"Project settings"**
2. Scroll down to **"Your apps"** section
3. Click the **Web icon** `</>` to add a web app
4. Register app name: `Cirkle Careers Portal`
5. Copy the `firebaseConfig` object that appears

### Step 4: Update firebase-config.js

1. Open `firebase-config.js` in your project
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com"
};
```

### Step 5: Test It!

1. Save all files
2. Open your website
3. Try creating a job listing as an employer
4. Open the website in a different browser or device
5. You should see the same job listings! 🎉

### Step 6: Secure Your Database (Important!)

Once everything works, secure your database:

1. Go to Firebase Console → Realtime Database → **Rules** tab
2. Replace the rules with:

```json
{
  "rules": {
    "jobs": {
      ".read": true,
      ".write": true
    },
    "applications": {
      ".read": true,
      ".write": true
    },
    "processed": {
      ".read": true,
      ".write": true
    },
    "chats": {
      ".read": true,
      ".write": true
    }
  }
}
```

3. Click **"Publish"**

### What's Now Stored in Firebase:

✅ **Jobs** - All job listings from all employers  
✅ **Applications** - All candidate applications  
✅ **Processed** - Hired/rejected applications  
✅ **Chats** - Conversation threads between employers and candidates  

### Benefits:

🌍 **Global Access** - Everyone sees the same data in real-time  
☁️ **Cloud Storage** - No more localStorage limitations  
🔄 **Auto-Sync** - Changes appear instantly for all users  
💾 **Persistent** - Data doesn't disappear when clearing browser  

### Troubleshooting:

**"Firebase not defined" error?**
- Make sure you've updated `firebase-config.js` with your actual config
- Check that the Firebase SDK scripts are loading in `index.html`

**Data not saving?**
- Check Firebase Console → Realtime Database to see if data appears
- Check browser console for any error messages
- Make sure database rules allow read/write access

**Still seeing old localStorage data?**
- Clear your browser's localStorage
- Or use the "Reset All Data" button in the employer dashboard

### Need Help?

Contact the developer or check Firebase documentation:
https://firebase.google.com/docs/database/web/start

---

**Made with ❤️ for Cirkle Development Group**
