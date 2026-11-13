# Task Manager

A minimal task management web app. Users sign in with Google, create tasks, view their task list, and update each task's status (Planned, In Progress, Complete).

- **Live app:** https://task-manager-frxe.vercel.app
- **Source code:** https://github.com/aswethcr/task-manager

## Tech Stack

- React + Vite
- Firebase Authentication (Google Sign-In)
- Cloud Firestore (database)
- Vercel (hosting)

---

## 1. How to Access and Use the App

1. Open the live URL above in any modern browser (Chrome, Edge, Firefox, Safari).
2. Sign in with your Google account (see Login Instructions).
3. **Create a task:** type a title in the input box and click **Add Task**. New tasks start as **Planned**.
4. **View tasks:** your tasks appear in a list, newest first. Each task shows its title and a colored status badge.
5. **Update status:** use the dropdown on a task to switch between **Planned**, **In Progress** and **Complete**. The change saves automatically.
6. **Sign out:** click the logout button next to your name in the header.

## 2. Login Instructions

1. On the landing page, click **Sign in with Google**.
2. Choose your Google account in the popup and approve access.
3. You are taken to your task dashboard. Your name and profile picture appear in the header.

**Troubleshooting login**

- If nothing happens, check that your browser is not blocking popups for this site.
- If you see an unauthorized domain error, the site's domain has not been added to Firebase Authorized Domains (see Setup).

## 3. Important Assumptions

The requirements left some details open. These decisions were made:

| Gap in requirements | Decision |
|---|---|
| Who can see which tasks? | Each user sees **only their own tasks**. Enforced in the UI query and by Firestore security rules. |
| Task fields | `title`, `status`, `createdAt`, `userId`. No description, due date or priority (out of scope). |
| Default status | New tasks are always **Planned**. |
| Title rules | Required, trimmed, maximum 100 characters. Empty or whitespace-only titles are rejected. |
| Ordering | Newest tasks first. |
| How is status changed? | A dropdown on each task. Any status can move to any other status (no forced order). |
| Duplicate submissions | The add button is disabled while a task is saving to prevent double entries. |
| Logged-out users | Redirected to the login screen. |
| Feedback to the user | Loading state, empty state ("No tasks yet") and friendly error messages are shown. |
| Missing Firebase config | If no Firebase keys are found, the app runs in a **local dev mode** for development only. The deployed app uses real Firebase. |

## 4. Known Limitations

- Tasks cannot be deleted, and titles cannot be edited after creation (kept out of scope on purpose).
- No offline mode. An internet connection is required.
- No sharing or collaboration. Tasks are private to each Google account.
- Google is the only sign-in method.
- No search, filter, pagination, due dates or priorities.
- Not tested on very old browsers.

## 5. Important Notes and Warnings

- A **Google account is required** to use the app.
- Your tasks are tied to the Google account you sign in with. Signing in with a different account shows a different (empty) list.
- Do not share your `.env` file or commit it to GitHub. It is listed in `.gitignore`.
- Do not enter sensitive or confidential information in task titles.
- Firebase web config values are not secret by themselves, but access to data is protected by the Firestore security rules in `firestore.rules`. Do not loosen these rules.

## 6. Setup Instructions

### Prerequisites

- Node.js (LTS) and npm
- A Google account
- A free Firebase project

### Steps

1. **Clone and install**
   ```bash
   git clone https://github.com/aswethcr/task-manager.git
   cd task-manager
   npm install
   ```

2. **Create a Firebase project** at https://console.firebase.google.com (Analytics is not needed).

3. **Enable Google sign-in:** Authentication, then Sign-in method, then Google, then Enable and choose a support email, then Save.

4. **Create Firestore:** Firestore Database, then Create database, then choose a region and Production mode.

5. **Publish security rules:** open the Rules tab, paste the contents of `firestore.rules` from this repo, and click Publish.

6. **Register a web app:** Project settings, then Your apps, then the web icon (`</>`). Copy the config values.

7. **Create your `.env` file:** copy `.env.example` to `.env` and fill it in:
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
   No quotes and no spaces around `=`.

8. **Run locally**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173. Restart the dev server any time you change `.env`.

### Deploy to Vercel

1. Push the repo to GitHub (make sure `.env` is not included).
2. On https://vercel.com, choose Add New, then Project, and import the repo. Framework preset: **Vite** (build `npm run build`, output `dist`).
3. Add the six `VITE_FIREBASE_*` variables in Environment Variables, then Deploy.
4. In Firebase, go to Authentication, then Settings, then Authorized domains, and add your Vercel domain (for example `task-manager-frxe.vercel.app`, without `https://`). Without this, Google login fails on the live site.

## Project Structure

```
src/                 React app source (App.jsx, firebase.js, index.css)
firestore.rules      Firestore security rules (per-user access)
.env.example         Template for environment variables
AI_USAGE.md          Summary of AI tool usage
```
