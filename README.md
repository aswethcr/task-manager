# Task Manager

A minimal, clean, and distraction-free Task Management web application built with React, Vite, Firebase Authentication (Google Sign-In), and Cloud Firestore.

- **Live URL**: `https://<YOUR-FIREBASE-PROJECT-ID>.web.app` *(Placeholder - deploy using steps below)*

---

## 1. What the App Does

- **Google Sign-In & Sign-Out**: Secure authentication with Google popup flow.
- **Task Creation**: Add tasks with titles up to 100 characters.
- **Task Tracking**: View tasks ordered newest-first with timestamps and status badges.
- **Status Updates**: Quickly switch task statuses between `Planned`, `In Progress`, and `Complete` with immediate visual updates.
- **Private Data Storage**: Each user's tasks are stored securely in Firestore and strictly isolated to their Google account.

---

## 2. How to Access and Use It

1. Open the application URL in any modern browser.
2. Sign in with your Google account.
3. In the input box at the top, type your task description (up to 100 characters) and click **Add Task** (or press Enter).
4. Update a task's status at any time by selecting `Planned`, `In Progress`, or `Complete` from the dropdown selector on the task item.
5. Sign out when finished by clicking the **Sign Out** button in the header.

---

## 3. Login Instructions

- Click the **Sign in with Google** button on the home screen.
- When Firebase credentials are provided in `.env`, Google's authentication popup will prompt you to select your account.
- When running locally before configuring Firebase (with placeholder keys in `.env`), the app automatically provides a seamless test session so you can test all task features immediately without blocker.
- Once authenticated, you will be redirected to your personal task list.
- If logged out, the dashboard is protected and redirects back to the login screen.

---

## 4. Assumptions Made

- **Task Fields**: Each task record stores `title` (required, trimmed, max 100 characters), `createdAt` (server timestamp), `status` (string enum), and `userId` (Firebase Auth UID).
- **Default Status**: Newly created tasks automatically default to `Planned`.
- **User Isolation**: Users can view and modify only tasks where `userId == auth.uid`.
- **Sorting**: Tasks are sorted newest first using the `createdAt` timestamp.
- **Form Validation**: Empty or whitespace-only task titles are blocked, character limits are tracked in real-time, and double-submissions are disabled while saving.
- **Security**: Cloud Firestore rules strictly enforce authentication and ownership on document read, create, and update operations.

---

## 5. Known Limitations

- **No Delete or Title Editing**: By design, task deletion and editing task titles are out of scope.
- **No Due Dates or Priorities**: Tasks only support status tracking (`Planned`, `In Progress`, `Complete`).
- **No Offline Mode**: Requires an active internet connection to authenticate and communicate with Cloud Firestore.
- **No Real-Time Collaboration**: Task lists are strictly private per user; tasks cannot be shared with other users.

---

## 6. Important Notes & Warnings

- **Keep `.env` Secret**: Never commit `.env` or share your Firebase API keys and secrets publicly.
- **Google Account Required**: An active Google account is mandatory to access the application.
- **Account-Bound Data**: Your tasks are permanently tied to your specific Google Account UID. Logging in with a different account will display a separate, empty task list.

---

## 7. Setup & Deployment Instructions

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)
- A Google Firebase account (free tier / Spark plan)

### Step 1: Clone & Install Dependencies
```bash
git clone <repository-url>
cd Kovai.co
npm install
```

### Step 2: Set Up Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Under **Build > Authentication**, enable the **Google** sign-in provider.
3. Under **Build > Firestore Database**, click **Create database** (start in production or test mode).
4. Deploy the security rules from `firestore.rules` under Firestore **Rules** tab.
5. In **Project Settings > General**, under *Your apps*, register a new **Web app** (`</>`).
6. Copy the Firebase configuration object keys.

### Step 3: Configure Environment Variables
Create a `.env` file in the project root (or copy `.env.example`):
```bash
cp .env.example .env
```
Populate `.env` with your Firebase web app keys:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 4: Run Locally
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### Step 5: Build & Deploy

#### Option A: Firebase Hosting
1. Install Firebase CLI globally (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and initialize:
   ```bash
   firebase login
   firebase use --add <your-firebase-project-id>
   ```
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

#### Option B: Vercel
1. Install Vercel CLI or import the repository in the Vercel Dashboard.
2. Set the build command to `npm run build` and output directory to `dist`.
3. Add the `VITE_FIREBASE_*` environment variables in your Vercel Project Settings.
4. Run `vercel --prod` to deploy.

